import { useState, FormEvent } from 'react';
import { X, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';

interface CorrectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  onApplyCorrection: (instruction: string) => Promise<void>;
  isReReading: boolean;
}

export function CorrectionModal({
  isOpen,
  onClose,
  fileName,
  onApplyCorrection,
  isReReading,
}: CorrectionModalProps) {
  const [instruction, setInstruction] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickPresets = [
    'Na Frota 46, o KM final veio dentro do KM inicial - mover odômetros para KM Final e recalcular',
    'Recuperar KM Final zerado e conectar odômetros contínuos',
    'Extrair todos os KMs de todos os dias da folha (colunas esquerda e direita)',
    'Releia atentamente o odômetro final na linha 3',
    'A frota do dia 03 na verdade é CAM-108',
    'Recalcular KM produtivo de todos os registros',
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!instruction.trim()) {
      setErrorMessage('Por favor, informe quais campos ou linhas devem ser relidos ou corrigidos.');
      return;
    }
    setErrorMessage(null);
    try {
      await onApplyCorrection(instruction.trim());
      setInstruction('');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao reprocessar documento');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Passo 4: Releitura e Correção
              </h3>
              <p className="text-xs text-stone-500 truncate max-w-sm">Arquivo: {fileName}</p>
            </div>
          </div>

          <button
            type="button"
            disabled={isReReading}
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2">
              Descreva as correções necessárias ou indique o que reler:
            </label>
            <textarea
              rows={4}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Exemplo: 'Na linha 3, o KM final correto escrito à mão é 8.995 e não 8.920. A fazenda é Santa Maria.'"
              className="w-full text-xs p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition"
              disabled={isReReading}
            />
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1.5">
              Sugestões rápidas de instrução:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInstruction(preset)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition text-left"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Info footer */}
          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 flex items-start gap-2 text-xs text-blue-800 dark:text-blue-300">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              O Agente reanalisará a imagem original do documento cruzando com seus apontamentos, atualizará a estrutura JSON e regenerará a tabela de validação.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isReReading}
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isReReading || !instruction.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-md"
            >
              {isReReading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Relendo Documento com IA...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Executar Releitura & Correção
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
