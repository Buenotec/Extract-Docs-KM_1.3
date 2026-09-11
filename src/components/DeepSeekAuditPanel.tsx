import { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
  Layers,
  Wrench,
} from 'lucide-react';
import { ExtractionResult, AuditReport, AuditAnomaly } from '../types';
import { postApiJson } from '../utils/apiClient';
import { logAiUsage } from '../utils/usageTracker';

interface DeepSeekAuditPanelProps {
  result: ExtractionResult;
  onApplyCorrection?: (updatedResult: ExtractionResult) => void;
}

export function DeepSeekAuditPanel({
  result,
  onApplyCorrection,
}: DeepSeekAuditPanelProps) {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const runDeepSeekAudit = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await postApiJson<{ success: boolean; report: AuditReport }>('/api/audit-deepseek', {
        registros: result.registros,
        documento: result.documento,
      });

      if (data && data.success && data.report) {
        setReport(data.report);
        logAiUsage({
          agentId: 'deepseek-r1',
          provider: 'DeepSeek AI',
          modelKey: 'deepseek-r1',
          type: 'audit',
          fileName: result.documento?.nome_arquivo || 'auditoria_frota',
          estimatedTokensInput: 650,
          estimatedTokensOutput: 350,
          status: 'success',
        });
      } else {
        logAiUsage({
          agentId: 'deepseek-r1',
          provider: 'DeepSeek AI',
          modelKey: 'deepseek-r1',
          type: 'audit',
          fileName: result.documento?.nome_arquivo || 'auditoria_frota',
          estimatedTokensInput: 400,
          estimatedTokensOutput: 50,
          status: 'error',
        });
        throw new Error((data as any)?.error || 'Falha ao executar auditoria');
      }
    } catch (err: any) {
      console.error('Erro na auditoria DeepSeek:', err);
      setErrorMessage(err.message || 'Não foi possível conectar ao agente auditor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixAnomaly = (anomaly: AuditAnomaly) => {
    if (!onApplyCorrection || !anomaly.dia) return;

    // Apply auto-fix for km_produtivo calculation diff
    if (anomaly.tipo === 'calculo') {
      const updatedRegistros = result.registros.map((item) => {
        if (item.dia === anomaly.dia) {
          const ini = typeof item.km_inicial === 'number' ? item.km_inicial : null;
          const fim = typeof item.km_final === 'number' ? item.km_final : null;
          if (ini !== null && fim !== null) {
            const realProd = fim - ini;
            return {
              ...item,
              km_produtivo: realProd >= 0 ? realProd : 0,
              _edited: true,
            };
          }
        }
        return item;
      });

      const totalKm = updatedRegistros.reduce(
        (sum, r) => sum + (typeof r.km_produtivo === 'number' ? r.km_produtivo : 0),
        0
      );

      onApplyCorrection({
        ...result,
        registros: updatedRegistros,
        resumo: {
          ...result.resumo,
          total_km_produtivo: totalKm,
        },
      });

      // Update report to remove fixed anomaly
      if (report) {
        setReport({
          ...report,
          anomalias: report.anomalias.filter((a) => a.id !== anomaly.id),
          scoreConformidade: Math.min(100, report.scoreConformidade + 10),
        });
      }
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-xs">
      {/* Header Bar */}
      <div className="p-4 bg-stone-50/80 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                Auditoria Lógica de Odômetro (DeepSeek R1 / Agente de Frotas)
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                Verificador Inteligente
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Analisa progressão matemática dos odômetros, turnos e coerência dos registros
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runDeepSeekAudit}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Auditando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{report ? 'Reauditar Tabela' : 'Auditar com DeepSeek'}</span>
              </>
            )}
          </button>

          {report && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition"
              title="Expandir/Recolher"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Initial Callout if audit hasn't been run yet */}
      {!report && !isLoading && (
        <div className="p-4 text-xs text-stone-600 dark:text-stone-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              Clique em <strong>Auditar com DeepSeek</strong> para que o agente de raciocínio lógico confira se a quilometragem final de cada dia bate exatamente com a inicial do dia seguinte, identificando qualquer pulo ou inversão.
            </span>
          </div>
          <button
            type="button"
            onClick={runDeepSeekAudit}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
          >
            Executar Agora →
          </button>
        </div>
      )}

      {/* Audit Report Content */}
      {report && isExpanded && (
        <div className="p-4 space-y-4">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Score Metric */}
            <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                Score de Conformidade
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-black ${
                    (report.scoreConformidade ?? 100) >= 85
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : (report.scoreConformidade ?? 100) >= 60
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {report.scoreConformidade ?? 100}%
                </span>
                <span className="text-xs text-stone-500">
                  {report.statusGeral === 'conforme'
                    ? 'Conforme'
                    : report.statusGeral === 'atencao'
                    ? 'Atenção'
                    : 'Irregular'}
                </span>
              </div>
            </div>

            {/* Total KM */}
            <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                KM Total Auditado
              </span>
              <span className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono">
                {(typeof report.kmTotalAuditado === 'number'
                  ? report.kmTotalAuditado
                  : Number(report.kmTotalAuditado) || 0
                ).toLocaleString('pt-BR')}{' '}
                km
              </span>
            </div>

            {/* Total Records */}
            <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                Dias / Linhas Analisadas
              </span>
              <span className="text-2xl font-black text-stone-900 dark:text-stone-100">
                {report.diasCobertos ?? 0} dias
              </span>
            </div>

            {/* Agent Engine */}
            <div className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                Motor da Auditoria
              </span>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 block line-clamp-1">
                {report.agenteUtilizado}
              </span>
              <span className="text-[10px] text-stone-400">{report.dataAuditoria}</span>
            </div>
          </div>

          {/* Detailed Summary Text */}
          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
            <strong>Parecer Técnico:</strong> {report.parecerResumido}
          </div>

          {/* Anomalies and Observations List */}
          <div>
            <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 mb-2 flex items-center justify-between">
              <span>Apontamentos e Validação de Odômetro ({report.anomalias.length})</span>
              {report.anomalias.length === 0 && (
                <span className="text-emerald-600 text-xs font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% de coerência
                </span>
              )}
            </h4>

            {report.anomalias.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Todos os odômetros estão sequenciais e a soma de quilometragem produtiva está matematicamente exata.
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {report.anomalias.map((anomalia) => {
                  const isHigh = anomalia.severidade === 'alta';
                  const isMedium = anomalia.severidade === 'media';
                  return (
                    <div
                      key={anomalia.id}
                      className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isHigh
                          ? 'border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-200'
                          : isMedium
                          ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200'
                          : 'border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span className="mt-0.5">
                          {isHigh ? (
                            <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
                          ) : isMedium ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          ) : (
                            <Info className="w-4 h-4 text-blue-600 shrink-0" />
                          )}
                        </span>
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            <span>{anomalia.mensagem}</span>
                            <span
                              className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono ${
                                isHigh
                                  ? 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200'
                                  : isMedium
                                  ? 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                                  : 'bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                              }`}
                            >
                              {anomalia.tipo}
                            </span>
                          </div>
                          {anomalia.sugestao && (
                            <p className="text-[11px] opacity-80 mt-0.5">
                              <strong>Orientação:</strong> {anomalia.sugestao}
                            </p>
                          )}
                        </div>
                      </div>

                      {anomalia.tipo === 'calculo' && onApplyCorrection && (
                        <button
                          type="button"
                          onClick={() => handleFixAnomaly(anomalia)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-800 dark:text-stone-200 hover:bg-stone-100 shadow-2xs shrink-0 self-start sm:self-auto"
                        >
                          <Wrench className="w-3.5 h-3.5 text-blue-600" />
                          <span>Corrigir Cálculo</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
