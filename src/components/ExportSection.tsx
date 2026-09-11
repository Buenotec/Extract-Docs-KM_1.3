import { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  Lock,
  FileCode,
  CheckCircle2,
  Sparkles,
  ClipboardCheck,
} from 'lucide-react';
import { ExtractionResult } from '../types';
import { generateBrazilianCsv, downloadCsvFile } from '../utils/csvExport';
import { copyTableToExcelClipboard } from '../utils/excelClipboard';

interface ExportSectionProps {
  result: ExtractionResult;
  isValidated: boolean;
  onScrollToValidation: () => void;
}

export function ExportSection({
  result,
  isValidated,
  onScrollToValidation,
}: ExportSectionProps) {
  const [copied, setCopied] = useState(false);
  const [copiedExcel, setCopiedExcel] = useState(false);

  const csvContent = generateBrazilianCsv(result);

  const handleCopyExcel = async () => {
    const success = await copyTableToExcelClipboard(result, { includeHeaders: true });
    if (success) {
      setCopiedExcel(true);
      setTimeout(() => setCopiedExcel(false), 3000);
    }
  };

  const handleCopyCsv = () => {
    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCsv = () => {
    downloadCsvFile(csvContent, result.documento.nome_arquivo);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(result, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = result.documento.nome_arquivo.replace(/\.[^/.]+$/, '');
    link.download = `${cleanName}_schema.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isValidated) {
    return (
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-200 dark:bg-stone-800 text-stone-500 mb-3">
          <Lock className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-stone-800 dark:text-stone-200">
          Passo 5: Exportação Bloqueada
        </h4>
        <p className="mt-1 text-xs text-stone-500 max-w-md mx-auto">
          Conforme a regra do fluxo de trabalho, a geração do arquivo CSV/Excel é liberada estritamente após a confirmação e validação dos dados na tabela acima.
        </p>
        <button
          type="button"
          onClick={onScrollToValidation}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 transition shadow-xs"
        >
          Ir para Passo 3 e Validar Dados
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border-2 border-emerald-400 dark:border-emerald-600 bg-white dark:bg-stone-900 p-6 shadow-lg">
      {/* Ready Banner with the exact prompt phrasing */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Passo 5: Exportação Concluída
            </span>
            <span className="text-xs text-stone-500">Padrão Excel Brasil (UTF-8 com BOM)</span>
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-1">
            Arquivo pronto. Clique para baixar ou copie o conteúdo abaixo.
          </h3>
        </div>

        {/* Download & Copy Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyExcel}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md ${
              copiedExcel
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title="Copia todos os dados em formato de grade com tabulações, ideal para colar diretamente no Excel com Ctrl+V"
          >
            {copiedExcel ? (
              <>
                <ClipboardCheck className="w-4 h-4 text-emerald-200" />
                <span>Copiado! Cole no Excel (Ctrl+V)</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Copiar para o Excel (Ctrl+V)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 text-xs font-bold transition border border-stone-200 dark:border-stone-700 shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Baixar CSV (;)
          </button>

          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-xs font-semibold transition border border-stone-200 dark:border-stone-700"
            title="Baixar em JSON"
          >
            <FileCode className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>

      {/* Code Block with Copy option */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Conteúdo do Arquivo CSV (Separador ; e BOM UTF-8)
          </span>

          <button
            type="button"
            onClick={handleCopyCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 transition shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-bold">Conteúdo Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copiar Conteúdo CSV
              </>
            )}
          </button>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-stone-300 dark:border-stone-800 bg-stone-950">
          <pre className="p-4 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-72 select-all">
            {csvContent}
          </pre>
        </div>
      </div>
    </div>
  );
}
