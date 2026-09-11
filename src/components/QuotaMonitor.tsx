import React, { useState, useEffect } from 'react';
import {
  Activity,
  BarChart3,
  Cpu,
  Clock,
  Sparkles,
  Zap,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  ExternalLink,
  Info,
  Layers,
  HelpCircle,
} from 'lucide-react';
import {
  calculateUsageStats,
  clearUsageHistory,
  PROVIDER_QUOTAS,
  UsageRecord,
  ProviderConsumptionStats,
} from '../utils/usageTracker';

interface QuotaMonitorProps {
  onClose?: () => void;
}

export function QuotaMonitor({ onClose }: QuotaMonitorProps) {
  const [stats, setStats] = useState(() => calculateUsageStats());
  const [activeTab, setActiveTab] = useState<'google' | 'deepseek' | 'history' | 'quotas'>('google');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const refreshData = () => {
    setStats(calculateUsageStats());
  };

  useEffect(() => {
    const handleUpdate = () => refreshData();
    window.addEventListener('ai_usage_updated', handleUpdate);
    const interval = setInterval(refreshData, 5000);
    return () => {
      window.removeEventListener('ai_usage_updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const { googleAiStudio, deepSeek, allHistory, todayCallsCount } = stats;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4 bg-stone-50/50 dark:bg-stone-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Monitor de Consumo e Cotas de IA
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Tempo Real
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Acompanhamento de requisições, limites de taxa por minuto (RPM) e diários (RPD) no Google AI Studio e DeepSeek.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700 transition"
            title="Atualizar estatísticas agora"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar</span>
          </button>

          <a
            href="https://aistudio.google.com/app/plan_information"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-200 dark:border-blue-800 transition"
          >
            <span>Painel Oficial AI Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-stone-200 dark:border-stone-800 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('google')}
          className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'google'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Google AI Studio (Gemini)</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-stone-100 dark:bg-stone-800 font-mono text-stone-600 dark:text-stone-400">
            {googleAiStudio.totalCallsToday} hoje
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('deepseek')}
          className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'deepseek'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Cpu className="w-4 h-4 text-emerald-500" />
          <span>DeepSeek AI (Auditoria)</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-stone-100 dark:bg-stone-800 font-mono text-stone-600 dark:text-stone-400">
            {deepSeek.totalCallsToday} hoje
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Clock className="w-4 h-4 text-stone-400" />
          <span>Histórico de Chamadas</span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-stone-100 dark:bg-stone-800 font-mono text-stone-600 dark:text-stone-400">
            {allHistory.length} total
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quotas')}
          className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'quotas'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Info className="w-4 h-4 text-stone-400" />
          <span>Tabela de Limites Oficiais</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* TAB 1: GOOGLE AI STUDIO */}
        {activeTab === 'google' && (
          <div className="space-y-6">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Consumo Hoje */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/30 space-y-1">
                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs">
                  <span>Requisições Hoje (RPD)</span>
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono">
                  {googleAiStudio.totalCallsToday}{' '}
                  <span className="text-xs font-normal text-stone-500 font-sans">
                    / {googleAiStudio.rpdLimit.toLocaleString('pt-BR')} limite diário
                  </span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all duration-500 ${
                      googleAiStudio.percentRpd > 85
                        ? 'bg-red-500'
                        : googleAiStudio.percentRpd > 60
                        ? 'bg-amber-500'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.max(googleAiStudio.percentRpd, 2)}%` }}
                  />
                </div>
                <div className="text-[11px] text-stone-500 flex justify-between pt-1">
                  <span>Consumo da Cota</span>
                  <span className="font-bold font-mono text-stone-700 dark:text-stone-300">
                    {googleAiStudio.percentRpd}%
                  </span>
                </div>
              </div>

              {/* Card 2: Janela de Minuto (RPM) */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/30 space-y-1">
                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs">
                  <span>Velocidade Atual (RPM)</span>
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono">
                  {googleAiStudio.totalCallsMinute}{' '}
                  <span className="text-xs font-normal text-stone-500 font-sans">
                    / {googleAiStudio.rpmLimit} req/min
                  </span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full transition-all duration-500 ${
                      googleAiStudio.percentRpm > 85
                        ? 'bg-red-500'
                        : googleAiStudio.percentRpm > 60
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(googleAiStudio.percentRpm, 2)}%` }}
                  />
                </div>
                <div className="text-[11px] text-stone-500 flex justify-between pt-1">
                  <span>Janela de 60 segundos</span>
                  <span className="font-bold font-mono text-stone-700 dark:text-stone-300">
                    {googleAiStudio.percentRpm}% ocupado
                  </span>
                </div>
              </div>

              {/* Card 3: Taxa de Sucesso */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/30 space-y-1">
                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs">
                  <span>Taxa de Sucesso</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono">
                  {googleAiStudio.successRate}%
                </div>
                <p className="text-[11px] text-stone-500 pt-3">
                  Respostas concluídas sem erros de cota 429 ou sobrecarga 503.
                </p>
              </div>

              {/* Card 4: Tokens Estimados */}
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/30 space-y-1">
                <div className="flex items-center justify-between text-stone-500 dark:text-stone-400 text-xs">
                  <span>Tokens Processados Hoje</span>
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono">
                  ~{googleAiStudio.totalTokensToday.toLocaleString('pt-BR')}
                </div>
                <p className="text-[11px] text-stone-500 pt-3">
                  Aprox. 258 tokens por foto/página + saída estruturada JSON.
                </p>
              </div>
            </div>

            {/* Breakdown per Gemini Model */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Consumo Separado por Modelo do Google AI Studio</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Gemini 2.5 Flash */}
                {renderModelCard(
                  'Gemini 2.5 Flash',
                  'Padrão • Recomendado',
                  googleAiStudio.models['gemini-2.5-flash'],
                  'Cota Free Tier: 1.500 req/dia • 15 req/min. Ideal para processamento contínuo de lotes.'
                )}

                {/* Gemini 2.5 Pro */}
                {renderModelCard(
                  'Gemini 2.5 Pro',
                  'Alta Precisão • Caligrafia',
                  googleAiStudio.models['gemini-2.5-pro'],
                  'Cota Free Tier: 50 req/dia • 2 req/min. Use para documentos com rasuras ou letras difíceis.'
                )}

                {/* Gemini 2.5 Flash-Lite */}
                {renderModelCard(
                  'Gemini 2.5 Flash-Lite',
                  'Leve & Econômico',
                  googleAiStudio.models['gemini-2.5-flash-lite'],
                  'Cota Free Tier: 1.500 req/dia • 30 req/min. Ideal para lotes extensos e conexões lentas.'
                )}
              </div>
            </div>

            {/* Practical Advice Banner */}
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-900 dark:text-blue-200 space-y-1">
                <p className="font-semibold">
                  Como funciona a cota gratuita (Free Tier) do Google AI Studio?
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  No plano gratuito do Google AI Studio, a cota de <strong>1.500 requisições diárias</strong> é reiniciada todos os dias à meia-noite (horário do Pacífico / ~04h no horário de Brasília). Se você atingir o limite diário ou o limite de 15 chamadas por minuto, o sistema avisará e você poderá alternar entre os modelos ou aguardar o ciclo de renovação automática.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DEEPSEEK */}
        {activeTab === 'deepseek' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/30 space-y-1">
                <div className="flex items-center justify-between text-stone-500 text-xs">
                  <span>Auditorias de Odômetro Hoje</span>
                  <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono">
                  {deepSeek.totalCallsToday}{' '}
                  <span className="text-xs font-normal text-stone-500">/ 500 chamadas</span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.max(deepSeek.percentRpd, 2)}%` }}
                  />
                </div>
                <div className="text-[11px] text-stone-500 flex justify-between pt-1">
                  <span>Uso diário estimado</span>
                  <span className="font-bold font-mono text-stone-700 dark:text-stone-300">
                    {deepSeek.percentRpd}%
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/30 space-y-1">
                <div className="flex items-center justify-between text-stone-500 text-xs">
                  <span>Taxa por Minuto (RPM)</span>
                  <Activity className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="text-2xl font-black text-stone-900 dark:text-stone-100 font-mono">
                  {deepSeek.totalCallsMinute}{' '}
                  <span className="text-xs font-normal text-stone-500">/ 60 req/min</span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.max(deepSeek.percentRpm, 2)}%` }}
                  />
                </div>
                <div className="text-[11px] text-stone-500 flex justify-between pt-1">
                  <span>Janela de 1 minuto</span>
                  <span className="font-bold font-mono text-stone-700 dark:text-stone-300">
                    {deepSeek.percentRpm}%
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/40 dark:bg-stone-800/30 space-y-1">
                <div className="flex items-center justify-between text-stone-500 text-xs">
                  <span>Modo de Operação</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-base font-bold text-stone-900 dark:text-stone-100 pt-1">
                  Híbrido Inteligente
                </div>
                <p className="text-[11px] text-stone-500 pt-2">
                  Se a chave `DEEPSEEK_API_KEY` estiver cadastrada, usa a API em nuvem; se não estiver, roda o motor lógico de conformidade instantaneamente sem custos.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-800/20">
              <h4 className="text-xs font-bold text-stone-800 dark:text-stone-200 mb-2">
                Comparativo de Custos do DeepSeek R1 / V3
              </h4>
              <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                O DeepSeek R1 possui um dos menores custos por token do mercado (~US$ 0,55 por milhão de tokens de entrada e ~US$ 2,19 por milhão de saída). Uma auditoria completa de folha de frota consome em média 800 tokens, custando menos de <strong>R$ 0,008 por documento</strong>.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: HISTÓRICO RECENTE */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Mostrando os últimos {allHistory.length} registros salvos localmente
              </span>
              {allHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Limpar Histórico</span>
                </button>
              )}
            </div>

            {showClearConfirm && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center justify-between text-xs">
                <span className="text-red-800 dark:text-red-200 font-medium">
                  Tem certeza que deseja zerar os contadores locais?
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      clearUsageHistory();
                      refreshData();
                      setShowClearConfirm(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition"
                  >
                    Sim, zerar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {allHistory.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-xl space-y-2">
                <Activity className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-600" />
                <p className="text-xs text-stone-500">
                  Nenhuma chamada realizada ainda nesta sessão. O consumo será registrado automaticamente aqui quando você processar fotos ou documentos.
                </p>
              </div>
            ) : (
              <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-800">
                      <tr>
                        <th className="py-2.5 px-3">Horário</th>
                        <th className="py-2.5 px-3">Provedor</th>
                        <th className="py-2.5 px-3">Modelo</th>
                        <th className="py-2.5 px-3">Operação</th>
                        <th className="py-2.5 px-3">Documento</th>
                        <th className="py-2.5 px-3">Tokens Est.</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 dark:divide-stone-800 font-mono text-[11px]">
                      {allHistory.slice(0, 50).map((r) => (
                        <tr key={r.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                          <td className="py-2 px-3 text-stone-500 whitespace-nowrap">
                            {new Date(r.timestamp).toLocaleTimeString('pt-BR')}
                          </td>
                          <td className="py-2 px-3 font-sans font-medium text-stone-800 dark:text-stone-200">
                            {r.provider}
                          </td>
                          <td className="py-2 px-3 text-blue-600 dark:text-blue-400">
                            {r.modelKey || r.agentId}
                          </td>
                          <td className="py-2 px-3 font-sans text-stone-600 dark:text-stone-300">
                            {r.type === 'extract'
                              ? 'Extração'
                              : r.type === 're-extract'
                              ? 'Releitura'
                              : 'Auditoria'}
                          </td>
                          <td className="py-2 px-3 font-sans text-stone-500 truncate max-w-[150px]">
                            {r.fileName || 'documento'}
                          </td>
                          <td className="py-2 px-3 text-stone-600 dark:text-stone-400">
                            {(r.estimatedTokensInput + r.estimatedTokensOutput).toLocaleString('pt-BR')}
                          </td>
                          <td className="py-2 px-3 font-sans">
                            {r.status === 'success' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3 h-3" /> Sucesso
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-500 font-medium">
                                <AlertTriangle className="w-3 h-3" /> Erro
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TABELA OFICIAL DE LIMITES */}
        {activeTab === 'quotas' && (
          <div className="space-y-4">
            <div className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Consulte abaixo os limites oficiais de taxa gratuitos (Free Tier) oferecidos pelo Google AI Studio e compatíveis para a sua chave de API:
            </div>

            <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-200 font-bold border-b border-stone-200 dark:border-stone-800">
                  <tr>
                    <th className="py-3 px-4">Modelo</th>
                    <th className="py-3 px-4">RPD (Req. por Dia)</th>
                    <th className="py-3 px-4">RPM (Req. por Minuto)</th>
                    <th className="py-3 px-4">TPM (Tokens/Min)</th>
                    <th className="py-3 px-4">Plano</th>
                    <th className="py-3 px-4">Melhor uso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  <tr className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                      Gemini 2.5 Flash
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      1.500 req/dia
                    </td>
                    <td className="py-3 px-4 font-mono">15 req/min</td>
                    <td className="py-3 px-4 font-mono text-stone-500">1.000.000</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        100% Gratuito
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                      Ideal para conferência diária rápida de dezenas de veículos
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                      Gemini 2.5 Pro
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-amber-600 dark:text-amber-400">
                      50 req/dia
                    </td>
                    <td className="py-3 px-4 font-mono">2 req/min</td>
                    <td className="py-3 px-4 font-mono text-stone-500">32.000</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        100% Gratuito
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                      Fotos difíceis, sombras pesadas e caligrafia manuscrita confusa
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                      Gemini 2.5 Flash-Lite
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-blue-600 dark:text-blue-400">
                      1.500 req/dia
                    </td>
                    <td className="py-3 px-4 font-mono">30 req/min</td>
                    <td className="py-3 px-4 font-mono text-stone-500">1.000.000</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        100% Gratuito
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                      Processamento ultra veloz para conexões lentas ou fotos nítidas
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                    <td className="py-3 px-4 font-bold text-stone-900 dark:text-stone-100">
                      DeepSeek R1 / V3
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-stone-600 dark:text-stone-400">
                      Até 500+ req/dia
                    </td>
                    <td className="py-3 px-4 font-mono">60 req/min</td>
                    <td className="py-3 px-4 font-mono text-stone-500">100.000</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        Pago / Crédito inicial
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                      Auditoria de continuidade de odômetro e matemática de frota
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderModelCard(
  title: string,
  badge: string,
  modelData: {
    callsToday: number;
    callsTotal: number;
    rpdLimit: number;
    rpmLimit: number;
    percentRpd: number;
    status: 'safe' | 'warning' | 'danger';
  } = { callsToday: 0, callsTotal: 0, rpdLimit: 1500, rpmLimit: 15, percentRpd: 0, status: 'safe' },
  description: string
) {
  return (
    <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/40 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">{title}</h4>
          <span className="text-[10px] text-stone-500">{badge}</span>
        </div>
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
            modelData.percentRpd > 85
              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
              : modelData.percentRpd > 60
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
          }`}
        >
          {modelData.percentRpd}% da cota
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-stone-500">Chamadas hoje:</span>
          <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
            {modelData.callsToday} / {modelData.rpdLimit}
          </span>
        </div>

        <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              modelData.percentRpd > 85
                ? 'bg-red-500'
                : modelData.percentRpd > 60
                ? 'bg-amber-500'
                : 'bg-blue-600'
            }`}
            style={{ width: `${Math.max(modelData.percentRpd, 2)}%` }}
          />
        </div>
      </div>

      <p className="text-[11px] text-stone-500 leading-tight">{description}</p>
    </div>
  );
}
