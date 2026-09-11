import { CheckCircle2, ChevronRight, FileText, Cpu, CheckSquare, RefreshCw, FileSpreadsheet, Activity } from 'lucide-react';
import { StepState } from '../types';

interface WorkflowStepsProps {
  currentStep: StepState;
  hasFiles: boolean;
  hasExtractedData: boolean;
  isValidated: boolean;
  onSelectStep: (step: StepState) => void;
}

export function WorkflowSteps({
  currentStep,
  hasFiles,
  hasExtractedData,
  isValidated,
  onSelectStep,
}: WorkflowStepsProps) {
  const steps = [
    {
      id: 1 as StepState,
      label: '1. Receber e Ler',
      desc: 'Anexos & Multimodal',
      icon: FileText,
      isCompleted: hasFiles,
      isAvailable: true,
    },
    {
      id: 2 as StepState,
      label: '2. Extrair & Estruturar',
      desc: 'JSON Schema Padronizado',
      icon: Cpu,
      isCompleted: hasExtractedData,
      isAvailable: hasFiles,
    },
    {
      id: 3 as StepState,
      label: '3. Exibir p/ Validação',
      desc: 'Tabela & Markdown',
      icon: CheckSquare,
      isCompleted: isValidated,
      isAvailable: hasExtractedData,
    },
    {
      id: 4 as StepState,
      label: '4. Releitura & Ajustes',
      desc: 'Correções Manuais ou IA',
      icon: RefreshCw,
      isCompleted: false,
      isAvailable: hasExtractedData,
    },
    {
      id: 5 as StepState,
      label: '5. Exportação',
      desc: 'CSV Excel (;) com BOM',
      icon: FileSpreadsheet,
      isCompleted: isValidated,
      isAvailable: isValidated,
    },
    {
      id: 6 as StepState,
      label: '6. Cotas & Consumo IA',
      desc: 'Google AI Studio & DeepSeek',
      icon: Activity,
      isCompleted: false,
      isAvailable: true,
    },
  ];

  return (
    <div className="w-full bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shadow-xs">
      <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 py-1">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isClickable = s.isAvailable;

            return (
              <div key={s.id} className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => onSelectStep(s.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-xs'
                      : isClickable
                      ? 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                      : 'opacity-45 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                      s.isCompleted
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {s.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>

                  <div>
                    <p className="text-xs font-bold leading-tight">{s.label}</p>
                    <p className="text-[10px] text-stone-500 hidden md:block">{s.desc}</p>
                  </div>
                </button>

                {idx < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-stone-300 dark:text-stone-700 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
