import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Play,
  Trash2,
  Eye,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { UploadedFileItem } from '../types';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';
import { AgentSelector } from './AgentSelector';

interface DocumentUploaderProps {
  files: UploadedFileItem[];
  onFilesChange: (files: UploadedFileItem[]) => void;
  onProcessFiles: (customInstructions: string) => void;
  isProcessing: boolean;
  onViewOriginal: (file: UploadedFileItem) => void;
  onLoadSample: (sampleId: string) => void;
  selectedAgentId: string;
  onSelectAgent: (agentId: string) => void;
  onOpenQuotaMonitor?: () => void;
}

export function DocumentUploader({
  files,
  onFilesChange,
  onProcessFiles,
  isProcessing,
  onViewOriginal,
  onLoadSample,
  selectedAgentId,
  onSelectAgent,
  onOpenQuotaMonitor,
}: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    let hasPdfOver50 = false;
    let totalSize = 0;
    const fileArray = Array.from(fileList);

    const newItems: UploadedFileItem[] = [];

    for (const file of fileArray) {
      totalSize += file.size;
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (isPdf && file.size > 50 * 1024 * 1024) {
        hasPdfOver50 = true;
      }

      const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const previewUrl = file.type.startsWith('image/') || isPdf ? URL.createObjectURL(file) : undefined;

      let base64Data: string | undefined;
      try {
        base64Data = await readFileAsBase64(file);
      } catch (err) {
        console.error('Erro ao ler base64 do arquivo:', file.name, err);
      }

      const item: UploadedFileItem = {
        id,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        previewUrl,
        base64: base64Data,
        fileObject: file,
        status: 'pending',
      };

      newItems.push(item);
    }

    if (hasPdfOver50 || totalSize > 100 * 1024 * 1024) {
      setSizeWarning(
        'Atenção: Arquivo detectado > 50MB (ou lote > 100MB). Para arquivos desse porte, recomenda-se pré-upload via Google AI Studio Files API.'
      );
    } else {
      setSizeWarning(null);
    }

    // Se a lista atual só continha o arquivo de exemplo/demonstração, substitua diretamente pelos arquivos reais
    const isOnlySample = files.length === 1 && files[0].id.startsWith('frota-045');
    const updatedList = isOnlySample ? newItems : [...files, ...newItems];

    onFilesChange(updatedList);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all text-center ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[1.005]'
            : 'border-stone-300 hover:border-stone-400 bg-stone-50/50 dark:border-stone-700 dark:bg-stone-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,.tiff,.tif"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 mb-3 shadow-xs">
          <UploadCloud className="h-7 w-7" />
        </div>

        <h3 className="text-base font-semibold text-stone-800 dark:text-stone-100">
          Clique ou arraste documentos aqui para extração
        </h3>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 max-w-lg mx-auto">
          Suporta <span className="font-medium text-stone-700 dark:text-stone-300">PDF, JPEG, PNG, TIFF, WebP</span>.
          Lê textos manuscritos, tabelas de controle de frotas, carimbos e formulários.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-200/70 dark:bg-stone-800 px-2.5 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Multimodal Nativo Gemini 3.8 Flash
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-200/70 dark:bg-stone-800 px-2.5 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Múltiplos Arquivos
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-200/70 dark:bg-stone-800 px-2.5 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Leitura de Manuscritos
          </span>
        </div>
      </div>

      {/* Warning if over size */}
      {sizeWarning && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Limite de Tamanho</p>
            <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">{sizeWarning}</p>
          </div>
        </div>
      )}

      {/* Sample Documents Row */}
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/60 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              Ou teste instantaneamente com um documento de referência:
            </span>
          </div>
          <span className="text-xs text-stone-400">1 clique para simular o fluxo</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <div
              key={sample.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-stone-200 dark:border-stone-800 hover:border-blue-400 dark:hover:border-blue-500 bg-stone-50/50 dark:bg-stone-800/40 transition group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {sample.title}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-medium">
                    {sample.badge}
                  </span>
                </div>
                <p className="text-xs text-stone-500 truncate mt-0.5">{sample.description}</p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLoadSample(sample.id);
                }}
                className="shrink-0 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-xs"
              >
                Carregar Exemplo
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
              Arquivos Recebidos ({files.length})
            </h4>
            <button
              type="button"
              onClick={() => onFilesChange([])}
              className="text-xs text-red-500 hover:text-red-700 hover:underline"
            >
              Limpar lista
            </button>
          </div>

          <div className="divide-y divide-stone-200 dark:divide-stone-800 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900/70 overflow-hidden shadow-xs">
            {files.map((file) => {
              const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
              return (
                <div key={file.id} className="flex items-center justify-between p-3.5 hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {isPdf ? <FileText className="h-5 w-5 text-red-500" /> : <ImageIcon className="h-5 w-5 text-emerald-500" />}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-800 dark:text-stone-100 truncate max-w-xs sm:max-w-md">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-stone-400">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span className="uppercase">{file.type.split('/')[1] || 'DOC'}</span>
                        {file.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Lido com sucesso
                          </span>
                        )}
                        {file.status === 'processing' && (
                          <span className="text-blue-600 dark:text-blue-400 animate-pulse font-medium">
                            Analisando com IA...
                          </span>
                        )}
                        {file.status === 'error' && (
                          <span className="text-red-500 font-medium">{file.errorMessage || 'Falha na leitura'}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {file.previewUrl && (
                      <button
                        type="button"
                        onClick={() => onViewOriginal(file)}
                        className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition"
                        title="Ver Documento Original"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Agent Selection Section */}
          <div className="pt-2">
            <AgentSelector
              selectedAgentId={selectedAgentId}
              onSelectAgent={onSelectAgent}
              onOpenQuotaMonitor={onOpenQuotaMonitor}
            />
          </div>

          {/* Optional instructions */}
          <div className="pt-2">
            <details className="group text-xs text-stone-500">
              <summary className="cursor-pointer font-medium hover:text-stone-700 dark:hover:text-stone-300 flex items-center gap-1 select-none">
                <Info className="w-3.5 h-3.5" />
                Instruções específicas para esta extração (opcional)
              </summary>
              <div className="mt-2">
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Ex: 'Prestar atenção na caligrafia do motorista João', 'Considerar apenas registros da Fazenda Santa Maria', etc."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[11px] text-stone-400">Sugestões rápidas:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomInstructions((prev) =>
                        prev
                          ? `${prev}. Ler minuciosamente todos os KMs de ambas as colunas (dias 1 ao 31).`
                          : 'Ler minuciosamente todos os KMs de ambas as colunas (dias 1 ao 31).'
                      )
                    }
                    className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-stone-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-stone-800 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 text-stone-600 dark:text-stone-300 transition border border-stone-200 dark:border-stone-700"
                  >
                    + Puxar todos os KMs (2 Colunas: Dias 1 a 31)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomInstructions((prev) =>
                        prev
                          ? `${prev}. Conectar odômetro contínuo e calcular KM produtivo em todas as linhas.`
                          : 'Conectar odômetro contínuo e calcular KM produtivo em todas as linhas.'
                      )
                    }
                    className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-stone-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-stone-800 dark:hover:bg-blue-950/50 dark:hover:text-blue-300 text-stone-600 dark:text-stone-300 transition border border-stone-200 dark:border-stone-700"
                  >
                    + Odômetro Contínuo
                  </button>
                </div>
              </div>
            </details>
          </div>

          {/* Process Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              disabled={isProcessing || files.length === 0}
              onClick={() => onProcessFiles(customInstructions)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm px-6 py-2.5 shadow-md transition"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando Leitura Multimodal...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Extrair e Estruturar Dados ({files.length})
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
