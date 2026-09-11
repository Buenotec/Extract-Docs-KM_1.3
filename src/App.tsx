/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import {
  FileText,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  Info,
  HelpCircle,
  Activity,
} from 'lucide-react';
import { ExtractionResult, UploadedFileItem, StepState } from './types';
import { WorkflowSteps } from './components/WorkflowSteps';
import { DocumentUploader } from './components/DocumentUploader';
import { ValidationTable } from './components/ValidationTable';
import { CorrectionModal } from './components/CorrectionModal';
import { ExportSection } from './components/ExportSection';
import { DocumentViewer } from './components/DocumentViewer';
import { SAMPLE_DOCUMENTS } from './data/sampleDocuments';
import { AgentSelector } from './components/AgentSelector';
import { AVAILABLE_AGENTS } from './data/availableAgents';
import { ThemeToggle } from './components/ThemeToggle';
import { QuickHelpModal } from './components/QuickHelpModal';
import { QuotaMonitor } from './components/QuotaMonitor';
import { postApiJson } from './utils/apiClient';
import { optimizeFileForExtraction } from './utils/imageOptimizer';
import { logAiUsage } from './utils/usageTracker';

export default function App() {
  const [currentStep, setCurrentStep] = useState<StepState>(1);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('gemini-2.5-flash');
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<ExtractionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReReading, setIsReReading] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [viewingFile, setViewingFile] = useState<UploadedFileItem | null>(null);
  const [showQuickHelp, setShowQuickHelp] = useState(false);
  const [alertNotification, setAlertNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const exportSectionRef = useRef<HTMLDivElement>(null);
  const validationSectionRef = useRef<HTMLDivElement>(null);

  // Load predefined sample document
  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_DOCUMENTS.find((s) => s.id === sampleId);
    if (!sample) return;

    const dataUrl = sample.createDataUrl();
    const sampleFileItem: UploadedFileItem = {
      id: `sample-${Date.now()}`,
      name: sample.fileName,
      type: sample.mimeType,
      size: 420 * 1024,
      previewUrl: dataUrl,
      base64: dataUrl,
      status: 'completed',
      result: sample.mockResult,
    };

    setFiles([sampleFileItem]);
    setActiveFileId(sampleFileItem.id);
    setActiveResult(sample.mockResult);
    setIsValidated(false);
    setCurrentStep(3);

    setAlertNotification({
      type: 'info',
      message: `Documento ${sample.fileName} carregado com sucesso. Tabela e visualizador comparativo prontos para conferência.`,
    });
  };

  // Process all files with server-side Gemini API
  const handleProcessFiles = async (customInstructions: string) => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setAlertNotification(null);
    setCurrentStep(2);

    try {
      const updatedFiles = [...files];

      for (let i = 0; i < updatedFiles.length; i++) {
        const file = updatedFiles[i];
        file.status = 'processing';
        file.errorMessage = undefined;
        setFiles([...updatedFiles]);

        // Ensure we have valid and optimized base64 data for the file
        let base64Data = file.base64;
        let mimeType = file.type || 'image/png';

        if (file.fileObject) {
          try {
            const optimized = await optimizeFileForExtraction(file.fileObject);
            base64Data = optimized.base64;
            mimeType = optimized.mimeType;
            file.base64 = base64Data;
            file.type = mimeType;
          } catch (optErr) {
            console.warn('Fallback leitura direta base64:', optErr);
          }
        }

        if (!base64Data) {
          file.status = 'error';
          file.errorMessage = 'Arquivo sem dados legíveis para envio à IA.';
          throw new Error(`Não foi possível carregar os dados visuais do arquivo "${file.name}".`);
        }

        const data = await postApiJson<{ success: boolean; data: ExtractionResult }>('/api/extract', {
          fileData: base64Data,
          mimeType,
          fileName: file.name,
          customInstructions,
          agentId: selectedAgentId,
        });

        if (data && data.success && data.data) {
          const rawResult: ExtractionResult = data.data;

          // Log AI usage for Google AI Studio or chosen agent
          logAiUsage({
            agentId: selectedAgentId,
            provider: selectedAgentId.startsWith('gemini') ? 'Google AI Studio' : 'Outro',
            modelKey: selectedAgentId,
            type: 'extract',
            fileName: file.name,
            estimatedTokensInput: 258 + (file.size > 200000 ? 500 : 200),
            estimatedTokensOutput: 750,
            status: 'success',
          });

          // Assign stable client-side IDs to records
          const recordsWithIds = (rawResult.registros || []).map((r, rIdx) => ({
            ...r,
            id: r.id || `rec-${file.id}-${rIdx + 1}`,
          }));

          const formattedResult: ExtractionResult = {
            ...rawResult,
            registros: recordsWithIds,
          };

          file.status = 'completed';
          file.result = formattedResult;

          if (i === 0) {
            setActiveFileId(file.id);
            setActiveResult(formattedResult);
          }
        } else {
          logAiUsage({
            agentId: selectedAgentId,
            provider: selectedAgentId.startsWith('gemini') ? 'Google AI Studio' : 'Outro',
            modelKey: selectedAgentId,
            type: 'extract',
            fileName: file.name,
            estimatedTokensInput: 258,
            estimatedTokensOutput: 50,
            status: 'error',
          });
          file.status = 'error';
          const errMsg = (data as any)?.error || `A IA não conseguiu ler os dados do documento "${file.name}".`;
          file.errorMessage = errMsg;
          throw new Error(errMsg);
        }
      }

      setFiles([...updatedFiles]);
      setIsValidated(false);
      setCurrentStep(3);

      setAlertNotification({
        type: 'success',
        message: 'Extração concluída com sucesso! Os dados estruturados da sua nova folha estão prontos para conferência.',
      });
    } catch (error: any) {
      console.error('Error processing files:', error);
      setIsValidated(false);
      setCurrentStep(1);

      const cleanMsg = error?.message || 'Verifique se o documento está legível e tente novamente.';

      const isDemandSpike =
        cleanMsg.includes('503') ||
        cleanMsg.includes('demanda') ||
        cleanMsg.includes('high demand') ||
        cleanMsg.includes('UNAVAILABLE');

      setAlertNotification({
        type: 'error',
        message: isDemandSpike
          ? 'Os servidores de IA estão com alta demanda temporária (503). O sistema já tenta modelos alternativos. Por favor, aguarde alguns segundos e clique novamente em "Extrair e Estruturar Dados".'
          : `Falha na extração: ${cleanMsg}`,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 4: AI Re-reading & Correction
  const handleApplyCorrection = async (userCorrection: string) => {
    if (!activeResult) return;

    setIsReReading(true);
    setAlertNotification(null);

    try {
      const activeFile = files.find((f) => f.id === activeFileId);

      const data = await postApiJson<{ success: boolean; data: ExtractionResult }>('/api/re-extract', {
        fileData: activeFile?.base64 || activeFile?.previewUrl,
        mimeType: activeFile?.type || 'image/png',
        fileName: activeResult.documento.nome_arquivo,
        currentData: activeResult,
        userCorrection,
        agentId: selectedAgentId,
      });

      if (data && data.success && data.data) {
        const rawResult: ExtractionResult = data.data;

        logAiUsage({
          agentId: selectedAgentId,
          provider: selectedAgentId.startsWith('gemini') ? 'Google AI Studio' : 'Outro',
          modelKey: selectedAgentId,
          type: 're-extract',
          fileName: activeResult.documento.nome_arquivo,
          estimatedTokensInput: 450,
          estimatedTokensOutput: 700,
          status: 'success',
        });

        const recordsWithIds = (rawResult.registros || []).map((r, rIdx) => ({
          ...r,
          id: r.id || `rec-corrected-${rIdx + 1}`,
          _edited: true,
        }));

        const updated: ExtractionResult = {
          ...rawResult,
          registros: recordsWithIds,
        };

        setActiveResult(updated);
        setIsValidated(false);
        setCurrentStep(3);

        setAlertNotification({
          type: 'success',
          message: 'Releitura aplicada! A tabela foi atualizada com as correções solicitadas. Por favor valide novamente.',
        });
      } else {
        logAiUsage({
          agentId: selectedAgentId,
          provider: selectedAgentId.startsWith('gemini') ? 'Google AI Studio' : 'Outro',
          modelKey: selectedAgentId,
          type: 're-extract',
          fileName: activeResult.documento.nome_arquivo,
          estimatedTokensInput: 300,
          estimatedTokensOutput: 50,
          status: 'error',
        });
        throw new Error((data as any)?.error || 'Não foi possível reprocessar a correção');
      }
    } catch (err: any) {
      console.warn('Re-read fallback:', err);
      // Apply manual note in table if server call failed
      const updated = {
        ...activeResult,
        registros: activeResult.registros.map((r, idx) =>
          idx === 0 ? { ...r, observacoes: `Corrigido: ${userCorrection}`, _edited: true } : r
        ),
      };
      setActiveResult(updated);
      setAlertNotification({
        type: 'info',
        message: 'Ajuste anotado na tabela. Revise os campos necessários.',
      });
    } finally {
      setIsReReading(false);
    }
  };

  // Step 3 Confirmation -> Unlocks Step 5
  const handleConfirmValidation = () => {
    setIsValidated(true);
    setCurrentStep(5);
    setAlertNotification({
      type: 'success',
      message: 'Dados validados com sucesso! A exportação em CSV (Excel Brasil com BOM UTF-8) está liberada.',
    });

    setTimeout(() => {
      exportSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSelectFileTab = (fileId: string) => {
    setActiveFileId(fileId);
    const targetFile = files.find((f) => f.id === fileId);
    if (targetFile && targetFile.result) {
      setActiveResult(targetFile.result);
      setIsValidated(false);
    }
  };

  const activeFile = files.find((f) => f.id === activeFileId);

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col antialiased">
      {/* Top Main Navigation Header */}
      <header className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-30 shadow-xs">
        <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-stone-900 dark:text-stone-100">
                Extração de Docs-KM
              </h1>
              <p className="text-xs text-stone-500 flex items-center gap-1.5">
                <span>Leitura Multimodal & Manuscritos</span>
                <span>•</span>
                <span>Tabela Interativa de Validação</span>
                <span>•</span>
                <span>Exportação CSV (Excel Brasil - ;)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark & Light Theme Switcher */}
            <ThemeToggle />

            {/* Quota & AI Consumption Monitor Tab Button */}
            <button
              type="button"
              id="header-quota-monitor-button"
              onClick={() => setCurrentStep(6)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition shadow-2xs ${
                currentStep === 6
                  ? 'bg-blue-600 text-white border-blue-700'
                  : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700'
              }`}
              title="Aba de Monitoramento de Cotas e Consumo (Google AI Studio & Outros)"
            >
              <Activity className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="hidden sm:inline">Cotas & Consumo IA</span>
            </button>

            {/* Quick Help Guide Button */}
            <button
              type="button"
              id="header-help-button"
              onClick={() => setShowQuickHelp(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-semibold transition shadow-2xs"
              title="Ajuda Rápida & Dicas de Uso do Sistema"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="hidden md:inline">Ajuda & Dicas</span>
            </button>

            {/* Agent Selector Compact Button */}
            <AgentSelector
              compact
              selectedAgentId={selectedAgentId}
              onSelectAgent={setSelectedAgentId}
              onOpenQuotaMonitor={() => setCurrentStep(6)}
            />
          </div>
        </div>
      </header>

      {/* Mandatory Workflow Steps Indicator */}
      <WorkflowSteps
        currentStep={currentStep}
        hasFiles={files.length > 0}
        hasExtractedData={!!activeResult}
        isValidated={isValidated}
        onSelectStep={(step) => {
          setCurrentStep(step);
          if (step === 3 && validationSectionRef.current) {
            validationSectionRef.current.scrollIntoView({ behavior: 'smooth' });
          }
          if (step === 5 && exportSectionRef.current) {
            exportSectionRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Alert Notification Toast */}
      {alertNotification && (
        <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div
            className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between gap-3 shadow-xs border ${
              alertNotification.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : alertNotification.type === 'error'
                ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200'
                : 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {alertNotification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
              )}
              <span>{alertNotification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setAlertNotification(null)}
              className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs px-2 py-0.5"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* SECTION 1: Receber e Ler o(s) arquivo(s) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                1
              </span>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Passo 1: Receber e Ler Arquivo(s)
              </h2>
            </div>
            {files.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-stone-500">
                  {files.length} arquivo(s) registrado(s)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFiles([]);
                    setActiveFileId(null);
                    setActiveResult(null);
                    setIsValidated(false);
                    setCurrentStep(1);
                    setAlertNotification({
                      type: 'info',
                      message: 'Lista limpa. Você pode agora enviar uma nova folha para análise.',
                    });
                  }}
                  className="text-xs text-stone-500 hover:text-red-500 underline transition"
                >
                  Limpar e subir nova folha
                </button>
              </div>
            )}
          </div>

          <DocumentUploader
            files={files}
            onFilesChange={(newFiles) => {
              setFiles(newFiles);
              if (newFiles.length === 0) {
                setActiveFileId(null);
                setActiveResult(null);
                setIsValidated(false);
                setCurrentStep(1);
              } else {
                // If there are newly added pending files, prioritize the new upload and clear any old table
                const pendingFiles = newFiles.filter((f) => f.status === 'pending');
                if (pendingFiles.length > 0) {
                  const newest = pendingFiles[pendingFiles.length - 1];
                  setActiveFileId(newest.id);
                  setActiveResult(null); // Clear previous table so user is ready to extract the new sheet
                  setIsValidated(false);
                  setCurrentStep(1);
                } else if (!activeFileId || !newFiles.some((f) => f.id === activeFileId)) {
                  setActiveFileId(newFiles[0].id);
                  setActiveResult(newFiles[0].result || null);
                }
              }
            }}
            onProcessFiles={handleProcessFiles}
            isProcessing={isProcessing}
            onViewOriginal={(file) => setViewingFile(file)}
            onLoadSample={handleLoadSample}
            selectedAgentId={selectedAgentId}
            onSelectAgent={setSelectedAgentId}
            onOpenQuotaMonitor={() => setCurrentStep(6)}
          />
        </section>

        {/* Multi-File Tab Bar (if multiple files extracted) */}
        {files.length > 1 && (
          <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 overflow-x-auto">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider shrink-0 mr-2">
              Alternar Documento:
            </span>
            {files.map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => handleSelectFileTab(file.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                  activeFileId === file.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:bg-stone-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="truncate max-w-[140px]">{file.name}</span>
                {file.result && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
              </button>
            ))}
          </div>
        )}

        {/* SECTION 2 & 3: Extrair, Estruturar & Exibir para Validação */}
        {activeResult && (
          <section ref={validationSectionRef} className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                  3
                </span>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Passo 3: Exibir para Validação (Tabela de Registros)
                </h2>
              </div>
              <span className="text-xs text-stone-500">
                JSON Schema gerado conforme especificação do Passo 2
              </span>
            </div>

            <ValidationTable
              result={activeResult}
              activeFile={activeFile}
              onUpdateResult={(updated) => {
                setActiveResult(updated);
                // Also update the result in files state
                if (activeFileId) {
                  setFiles((prev) =>
                    prev.map((f) => (f.id === activeFileId ? { ...f, result: updated } : f))
                  );
                }
              }}
              isValidated={isValidated}
              onConfirmValidation={handleConfirmValidation}
              onRequestReRead={() => setIsCorrectionModalOpen(true)}
              onViewOriginal={() => activeFile && setViewingFile(activeFile)}
              selectedAgentId={selectedAgentId}
              onSelectAgent={setSelectedAgentId}
            />
          </section>
        )}

        {/* SECTION 5: Exportação (CSV Excel com separador ; e BOM UTF-8) */}
        {activeResult && (
          <section ref={exportSectionRef} className="space-y-3 pt-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                5
              </span>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Passo 5: Exportação (CSV / Excel)
              </h2>
            </div>

            <ExportSection
              result={activeResult}
              isValidated={isValidated}
              onScrollToValidation={() => {
                validationSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />
          </section>
        )}

        {/* SECTION 6: Monitoramento de Cotas e Consumo de IA */}
        {currentStep === 6 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                  6
                </span>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Monitor de Cotas & Consumo de IA
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(activeResult ? 3 : 1)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                ← Voltar para o fluxo de documentos
              </button>
            </div>

            <QuotaMonitor onClose={() => setCurrentStep(activeResult ? 3 : 1)} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-6 text-center text-xs text-stone-500">
        <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p className="font-medium text-stone-600 dark:text-stone-400">
            Agente de Extração e Validação de Documentos
          </p>
          <p>
            Compatibilidade total com Excel Brasileiro: Arquivos CSV codificados em <strong>UTF-8 com BOM</strong> e delimitados por <strong>ponto e vírgula (;)</strong>.
          </p>
        </div>
      </footer>

      {/* Step 4 AI Correction Modal */}
      {activeResult && (
        <CorrectionModal
          isOpen={isCorrectionModalOpen}
          onClose={() => setIsCorrectionModalOpen(false)}
          fileName={activeResult.documento.nome_arquivo}
          onApplyCorrection={handleApplyCorrection}
          isReReading={isReReading}
        />
      )}

      {/* High-res Document Viewer Modal */}
      {viewingFile && (
        <DocumentViewer
          isOpen={!!viewingFile}
          onClose={() => setViewingFile(null)}
          fileName={viewingFile.name}
          previewUrl={viewingFile.previewUrl}
          mimeType={viewingFile.type}
        />
      )}

      {/* Quick Help & Best Practices Modal */}
      <QuickHelpModal
        isOpen={showQuickHelp}
        onClose={() => setShowQuickHelp(false)}
      />
    </div>
  );
}
