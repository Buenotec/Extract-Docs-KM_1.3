import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  BrainCircuit,
  Feather,
  ShieldCheck,
  Truck,
  Check,
  ChevronDown,
  Info,
  Sparkles,
  Eye,
  EyeOff,
  Plus,
  Bot,
  Cpu,
  Trash2,
  RotateCcw,
  SlidersHorizontal,
  ExternalLink,
  Activity,
} from 'lucide-react';
import { AgentOption } from '../types';
import {
  getRegisteredAgents,
  addAgentToRegistry,
  removeAgentFromRegistry,
  resetAgentRegistryToDefault,
} from '../utils/agentRegistry';
import { AddAgentModal } from './AddAgentModal';
import { PROVIDER_QUOTAS, calculateUsageStats } from '../utils/usageTracker';

interface AgentSelectorProps {
  selectedAgentId: string;
  onSelectAgent: (agentId: string) => void;
  compact?: boolean;
  onOpenQuotaMonitor?: () => void;
}

export function AgentSelector({
  selectedAgentId,
  onSelectAgent,
  compact = false,
  onOpenQuotaMonitor,
}: AgentSelectorProps) {
  const [agents, setAgents] = useState<AgentOption[]>(() => getRegisteredAgents());
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Iniciar por padrão com o Seletor de Agentes & Tecnologias de IA oculto
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [usageStats, setUsageStats] = useState(() => calculateUsageStats());

  useEffect(() => {
    const handleUpdate = () => setUsageStats(calculateUsageStats());
    window.addEventListener('ai_usage_updated', handleUpdate);
    return () => window.removeEventListener('ai_usage_updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('agent_selector_expanded');
      } catch (e) {}
    }
  }, []);

  // Sync with registry updates
  const reloadAgents = () => {
    setAgents(getRegisteredAgents());
  };

  const handleAddNewAgent = (newAgent: AgentOption) => {
    const updated = addAgentToRegistry(newAgent);
    setAgents(updated);
    onSelectAgent(newAgent.id);
    setFeedbackToast(`Agente "${newAgent.name}" adicionado e ativado com sucesso!`);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const handleRemoveAgent = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Deseja remover o modelo personalizado "${name}" da lista?`)) {
      const updated = removeAgentFromRegistry(id);
      setAgents(updated);
      if (selectedAgentId === id && updated.length > 0) {
        onSelectAgent(updated[0].id);
      }
      setFeedbackToast(`Agente "${name}" removido.`);
      setTimeout(() => setFeedbackToast(null), 3000);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Deseja restaurar o catálogo oficial padrão de agentes e tecnologias de IA?')) {
      const updated = resetAgentRegistryToDefault();
      setAgents(updated);
      onSelectAgent(updated[0].id);
      setFeedbackToast('Catálogo padrão de agentes restaurado com sucesso!');
      setTimeout(() => setFeedbackToast(null), 3000);
    }
  };

  const currentAgent = useMemo(() => {
    return agents.find((a) => a.id === selectedAgentId) || agents[0] || {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      badge: 'Padrão',
      provider: 'Google AI Studio',
      modelKey: 'gemini-2.5-flash',
      category: 'vision',
      description: '',
      iconName: 'zap',
      isFree: true,
      hasVision: true,
      specialty: '',
    };
  }, [agents, selectedAgentId]);

  const getAgentIcon = (iconName: string, className: string = 'w-4 h-4') => {
    switch (iconName) {
      case 'zap':
        return <Zap className={className} />;
      case 'brain':
        return <BrainCircuit className={className} />;
      case 'feather':
        return <Feather className={className} />;
      case 'shield':
        return <ShieldCheck className={className} />;
      case 'truck':
        return <Truck className={className} />;
      case 'bot':
        return <Bot className={className} />;
      case 'cpu':
        return <Cpu className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  // Filtered list by category
  const filteredAgents = useMemo(() => {
    if (activeCategory === 'all') return agents;
    if (activeCategory === 'google') return agents.filter((a) => a.provider.toLowerCase().includes('google'));
    if (activeCategory === 'deepseek') return agents.filter((a) => a.provider.toLowerCase().includes('deepseek') || a.modelKey.includes('deepseek'));
    if (activeCategory === 'vision') return agents.filter((a) => a.hasVision);
    if (activeCategory === 'auditor') return agents.filter((a) => a.category === 'auditor');
    if (activeCategory === 'custom') return agents.filter((a) => a.isCustom);
    return agents;
  }, [agents, activeCategory]);

  // Compact version for topbars and small toolbars
  if (compact) {
    return (
      <>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpenDropdown(!isOpenDropdown)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-800 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-700 transition shadow-2xs"
            title="Alterar agente de IA ou adicionar novas tecnologias"
          >
            <span className="text-blue-600 dark:text-blue-400">
              {getAgentIcon(currentAgent.iconName, 'w-3.5 h-3.5')}
            </span>
            <span className="max-w-[130px] truncate sm:max-w-none">{currentAgent.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          </button>

          {isOpenDropdown && (
            <div className="absolute right-0 top-full mt-2 w-84 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl p-2 z-40 text-xs animate-fadeIn">
              <div className="px-2 py-1.5 text-[11px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <span>Agente Ativo de IA</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {agents.length} tecnologias
                </span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1 mt-1.5 pr-0.5">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => {
                      onSelectAgent(agent.id);
                      setIsOpenDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl transition flex items-start justify-between gap-2 ${
                      agent.id === selectedAgentId
                        ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-blue-600 dark:text-blue-400">
                        {getAgentIcon(agent.iconName, 'w-4 h-4')}
                      </span>
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <span className="line-clamp-1">{agent.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-normal shrink-0">
                            {agent.badge.split('•')[0].trim()}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                          {agent.provider} • {agent.specialty}
                        </p>
                      </div>
                    </div>
                    {agent.id === selectedAgentId && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                ))}
              </div>

              {/* Quick Add Button in Dropdown Footer */}
              <div className="pt-2 mt-1 border-t border-stone-100 dark:border-stone-800 flex flex-col gap-1.5">
                {onOpenQuotaMonitor && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpenDropdown(false);
                      onOpenQuotaMonitor();
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 font-bold text-xs transition border border-amber-200 dark:border-amber-800"
                  >
                    <Activity className="w-3.5 h-3.5 text-amber-600" />
                    <span>Verificar Cotas & Consumo IA</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsOpenDropdown(false);
                    setIsAddModalOpen(true);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Nova Tecnologia / Modelo</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <AddAgentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddAgent={handleAddNewAgent}
        />
      </>
    );
  }

  // Collapsed Minimal View with clear button to re-display
  if (!isExpanded) {
    return (
      <>
        <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-900/80 p-3 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shrink-0">
              {getAgentIcon(currentAgent.iconName, 'w-4 h-4')}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                  Agente Ativo: {currentAgent.name}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold shrink-0">
                  {currentAgent.badge.split('•')[0].trim()}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 truncate mt-0.5">
                {currentAgent.specialty}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {onOpenQuotaMonitor && (
              <button
                type="button"
                onClick={onOpenQuotaMonitor}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-xs font-semibold transition"
                title="Abrir monitor de cotas e consumo de IA em tempo real"
              >
                <Activity className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden md:inline">Cotas & Consumo</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 text-xs font-semibold transition"
              title="Cadastrar novo modelo ou tecnologia de IA"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>+ Novo Agente</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-stone-100 dark:hover:bg-stone-700 transition shadow-2xs"
              title={`Exibir catálogo com ${agents.length} modelos de IA disponíveis`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Exibir Seletor ({agents.length})</span>
            </button>
          </div>
        </div>

        <AddAgentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddAgent={handleAddNewAgent}
        />
      </>
    );
  }

  // Expanded View with Category Tabs and "+ Adicionar Tecnologia"
  return (
    <>
      <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 p-4 shadow-2xs transition">
        {feedbackToast && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center justify-between animate-fadeIn">
            <span>{feedbackToast}</span>
            <button
              type="button"
              onClick={() => setFeedbackToast(null)}
              className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  Seletor de Agentes & Tecnologias de IA
                </h4>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold">
                  {agents.length} modelos
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Alterne ou adicione novos modelos de visão e raciocínio conforme o avanço das tecnologias
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {onOpenQuotaMonitor && (
              <button
                type="button"
                onClick={onOpenQuotaMonitor}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 transition"
                title="Abrir monitor detalhado de cotas e consumo em tempo real"
              >
                <Activity className="w-3.5 h-3.5 text-amber-600" />
                <span>Cotas & Consumo</span>
              </button>
            )}

            {/* Add New Technology / Model Button */}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition shadow-2xs"
              title="Adicionar nova tecnologia, modelo ou provedor de IA"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Adicionar Tecnologia</span>
            </button>

            {/* Reset to Defaults if customized */}
            <button
              type="button"
              onClick={handleResetDefaults}
              className="p-1.5 rounded-xl text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 transition"
              title="Restaurar catálogo oficial padrão de agentes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Hide Button */}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 transition shadow-2xs"
              title="Ocultar o seletor de agentes"
            >
              <EyeOff className="w-3.5 h-3.5 text-stone-500" />
              <span>Ocultar</span>
            </button>
          </div>
        </div>

        {/* Technology Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3 pb-2 border-b border-stone-200/80 dark:border-stone-800 text-xs">
          <span className="text-stone-400 text-[11px] font-medium mr-1">Filtrar por:</span>
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
            }`}
          >
            Todos ({agents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('google')}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition ${
              activeCategory === 'google'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
            }`}
          >
            Google AI Studio ({agents.filter((a) => a.provider.toLowerCase().includes('google')).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('deepseek')}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition ${
              activeCategory === 'deepseek'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
            }`}
          >
            DeepSeek & Raciocínio ({agents.filter((a) => a.provider.toLowerCase().includes('deepseek') || a.modelKey.includes('deepseek')).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('vision')}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition ${
              activeCategory === 'vision'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
            }`}
          >
            Visão / OCR ({agents.filter((a) => a.hasVision).length})
          </button>
          {agents.some((a) => a.isCustom) && (
            <button
              type="button"
              onClick={() => setActiveCategory('custom')}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition ${
                activeCategory === 'custom'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
              }`}
            >
              Personalizados ({agents.filter((a) => a.isCustom).length})
            </button>
          )}
        </div>

        {/* Dynamic Model Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {filteredAgents.map((agent) => {
            const isSelected = agent.id === selectedAgentId;
            return (
              <div
                key={agent.id}
                onClick={() => onSelectAgent(agent.id)}
                className={`relative cursor-pointer rounded-xl p-3 border transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-white dark:bg-stone-900 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/40 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-white dark:hover:bg-stone-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1 rounded-md ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {getAgentIcon(agent.iconName, 'w-3.5 h-3.5')}
                      </span>
                      <span className="font-bold text-xs text-stone-900 dark:text-stone-100 line-clamp-1">
                        {agent.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {agent.isCustom && (
                        <button
                          type="button"
                          onClick={(e) => handleRemoveAgent(e, agent.id, agent.name)}
                          className="p-1 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition"
                          title="Remover este agente personalizado"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      {isSelected && (
                        <span className="h-4 w-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                      {agent.badge}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {agent.provider}
                    </span>
                    {agent.version && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 font-mono">
                        v{agent.version}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 leading-relaxed">
                    {agent.description}
                  </p>

                  {/* Quota consumption indicator bar */}
                  {(() => {
                    const quota = PROVIDER_QUOTAS[agent.id] || PROVIDER_QUOTAS[agent.modelKey];
                    const isGoogle = agent.provider.toLowerCase().includes('google') || agent.id.startsWith('gemini');
                    const modelStats = isGoogle
                      ? usageStats.googleAiStudio.models[agent.id] || { callsToday: 0, rpdLimit: quota?.rpd || 1500, percentRpd: 0 }
                      : usageStats.deepSeek.models[agent.id] || { callsToday: 0, rpdLimit: quota?.rpd || 500, percentRpd: 0 };

                    const pct = modelStats.percentRpd || 0;
                    return (
                      <div className="mt-2 pt-1.5 border-t border-stone-100 dark:border-stone-800/80 space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-stone-500">
                          <span className="flex items-center gap-1 font-mono">
                            <Activity className="w-2.5 h-2.5 text-blue-500" />
                            <span>{modelStats.callsToday} / {modelStats.rpdLimit} req</span>
                          </span>
                          <span className={`font-mono font-bold ${pct > 80 ? 'text-red-500' : 'text-stone-600 dark:text-stone-400'}`}>
                            {pct}% cota
                          </span>
                        </div>
                        <div className="w-full bg-stone-200 dark:bg-stone-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.max(pct, 1)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 text-[10px] text-stone-500 flex items-center justify-between">
                  <span>{agent.hasVision ? '📷 Visão Multimodal' : '⚙️ Raciocínio Lógico'}</span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {isSelected ? 'Ativo' : 'Selecionar'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Agent Quick Info Bar */}
        <div className="mt-3 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span className="text-[11px] truncate">
              <strong>Agente Ativo:</strong> {currentAgent.name} — {currentAgent.specialty}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0 self-start sm:self-auto"
          >
            Ocultar este seletor ↑
          </button>
        </div>
      </div>

      <AddAgentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAgent={handleAddNewAgent}
      />
    </>
  );
}
