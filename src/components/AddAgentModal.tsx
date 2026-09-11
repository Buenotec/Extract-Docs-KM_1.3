import React, { useState } from 'react';
import {
  X,
  Plus,
  Sparkles,
  Bot,
  Zap,
  Brain,
  Shield,
  Truck,
  Cpu,
  Feather,
  Check,
  Globe,
  Sliders,
} from 'lucide-react';
import { AgentOption } from '../types';
import { PRESET_AGENT_TEMPLATES } from '../utils/agentRegistry';

interface AddAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAgent: (agent: AgentOption) => void;
}

export function AddAgentModal({ isOpen, onClose, onAddAgent }: AddAgentModalProps) {
  const [formData, setFormData] = useState<Partial<AgentOption>>({
    name: '',
    provider: 'Google AI Studio',
    modelKey: '',
    badge: 'Gratuito • Novo Modelo',
    category: 'vision',
    description: '',
    specialty: '',
    iconName: 'bot',
    isFree: true,
    hasVision: true,
    version: '1.0.0',
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: Partial<AgentOption>) => {
    setFormData((prev) => ({
      ...prev,
      ...preset,
      badge: preset.badge || 'Novo Modelo',
    }));
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      setValidationError('Por favor, informe o nome do agente.');
      return;
    }

    if (!formData.modelKey?.trim()) {
      setValidationError('Por favor, informe o identificador técnico do modelo (ex: gemini-3.0, deepseek-v3).');
      return;
    }

    const newAgent: AgentOption = {
      id: `agent-${Date.now()}`,
      name: formData.name.trim(),
      provider: formData.provider?.trim() || 'Personalizado',
      modelKey: formData.modelKey.trim(),
      badge: formData.badge?.trim() || 'Personalizado',
      category: formData.category || 'vision',
      description: formData.description?.trim() || `Modelo de IA configurado para processamento multimodal e de odômetro.`,
      specialty: formData.specialty?.trim() || `Extração e auditoria especializada`,
      iconName: formData.iconName || 'bot',
      isFree: Boolean(formData.isFree),
      hasVision: Boolean(formData.hasVision),
      version: formData.version?.trim() || '1.0.0',
      isCustom: true,
    };

    onAddAgent(newAgent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 text-stone-900 dark:text-stone-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
              <Plus className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Adicionar Nova Tecnologia ou Agente de IA
              </h3>
              <p className="text-xs text-stone-500">
                Cadastre novos modelos conforme forem lançados (Gemini, DeepSeek, Claude, Llama, Ollama, etc.)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets Section */}
        <div className="my-4 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60">
          <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-blue-900 dark:text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Preenchimento Rápido com Tecnologias Populares:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_AGENT_TEMPLATES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold text-stone-700 dark:text-stone-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition shadow-2xs"
              >
                + {preset.name?.split('(')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 font-semibold">
            {validationError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Nome do Agente / Modelo *
              </label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Gemini 3.0 Pro, DeepSeek V3..."
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Provedor / Criador
              </label>
              <input
                type="text"
                value={formData.provider || ''}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="Ex: Google AI Studio, DeepSeek AI, OpenAI, Ollama Local..."
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Identificador do Modelo (Model Key) *
              </label>
              <input
                type="text"
                required
                value={formData.modelKey || ''}
                onChange={(e) => setFormData({ ...formData, modelKey: e.target.value })}
                placeholder="Ex: gemini-3.0-flash, deepseek-r1"
                className="w-full px-3 py-2 font-mono rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Etiqueta / Badge
              </label>
              <input
                type="text"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="Ex: Gratuito • Alta Precisão"
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Versão do Modelo
              </label>
              <input
                type="text"
                value={formData.version || ''}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="Ex: 3.0.0, 2026.1"
                className="w-full px-3 py-2 font-mono rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Categoria de Operação
              </label>
              <select
                value={formData.category || 'vision'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="vision">Visão Multimodal / OCR de Fotos & Documentos</option>
                <option value="auditor">Auditor Lógico & Matemático de Odômetro</option>
                <option value="rules">Regras de Logística, Turnos & CLT/ANTT</option>
                <option value="custom">Personalizado / Genérico</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Ícone do Agente
              </label>
              <select
                value={formData.iconName || 'bot'}
                onChange={(e) => setFormData({ ...formData, iconName: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="bot">Robô Inteligente (Bot)</option>
                <option value="zap">Raio de Alta Velocidade (Zap)</option>
                <option value="brain">Cérebro / Raciocínio Profundo (Brain)</option>
                <option value="shield">Escudo de Auditoria & Conformidade (Shield)</option>
                <option value="truck">Caminhão / Frotas & Transporte (Truck)</option>
                <option value="cpu">Processador / Computação Avançada (Cpu)</option>
                <option value="sparkles">Brilho / Modelo Experimental (Sparkles)</option>
                <option value="feather">Pena / Ultraleve (Feather)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 py-2 border-y border-stone-100 dark:border-stone-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasVision}
                onChange={(e) => setFormData({ ...formData, hasVision: e.target.checked })}
                className="rounded border-stone-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                Suporta Leitura Visual / Imagens (Visão Multimodal)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFree}
                onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                Modelo Gratuito
              </span>
            </label>
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Especialidade Principal (Linha Curta)
            </label>
            <input
              type="text"
              value={formData.specialty || ''}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              placeholder="Ex: Leitura de manuscritos apagados e tabelas com rasura"
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Descrição Detalhada do Modelo
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descreva quando utilizar esta tecnologia no fluxo de extração de frotas..."
              className="w-full px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>Salvar e Habilitar Agente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
