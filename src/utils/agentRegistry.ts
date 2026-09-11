import { AgentOption } from '../types';

export const DEFAULT_AGENTS: AgentOption[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (Padrão)',
    badge: 'Gratuito • Recomendado',
    provider: 'Google AI Studio',
    modelKey: 'gemini-2.5-flash',
    category: 'vision',
    description: 'Extração multimodal ágil com OCR de alta velocidade. Ideal para fotos com boa nitidez e conferência rápida de tabelas de frotas.',
    iconName: 'zap',
    isFree: true,
    hasVision: true,
    specialty: 'Leitura ultrarrápida de fotos, tabelas e manuscritos nítidos',
    version: '2.5.0',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro (Caligrafia Complexa)',
    badge: 'Gratuito • Alta Precisão',
    provider: 'Google AI Studio',
    modelKey: 'gemini-2.5-pro',
    category: 'vision',
    description: 'Capacidade avançada de raciocínio visual. Decifra manuscritos apagados, traços desgastados de caneta, números borrados e fotos com sombras.',
    iconName: 'brain',
    isFree: true,
    hasVision: true,
    specialty: 'Máxima precisão em caligrafias difíceis, canetas gastas e folhas dobradas',
    version: '2.5.0',
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite (Leve & Econômico)',
    badge: 'Gratuito • Ultrarrápido',
    provider: 'Google AI Studio',
    modelKey: 'gemini-2.5-flash-lite',
    category: 'vision',
    description: 'Processamento instantâneo com menor consumo de recursos. Perfeito para conexões lentas ou lote extenso de documentos bem legíveis.',
    iconName: 'feather',
    isFree: true,
    hasVision: true,
    specialty: 'Extração ultra veloz e de baixo consumo de largura de banda',
    version: '2.5.0',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1 / V3 (Auditor Lógico de Odômetro)',
    badge: 'Raciocínio & Auditoria de Frotas',
    provider: 'DeepSeek AI (Compatível)',
    modelKey: 'deepseek-r1',
    category: 'auditor',
    description: 'Agente especialista em raciocínio matemático e auditoria de transporte. Analisa a continuidade do odômetro dia a dia, detecta pulos de KM e valida médias.',
    iconName: 'shield',
    isFree: true,
    hasVision: false,
    specialty: 'Auditoria matemática profunda, conferência de odômetro e detecção de pulos de KM',
    version: 'R1/V3',
  },
  {
    id: 'agente-frota-especialista',
    name: 'Agente Especialista em Logística e CLT / ANTT',
    badge: 'Gratuito • Regras de Transporte',
    provider: 'Motor Especialista Integrado',
    modelKey: 'agente-frota-especialista',
    category: 'rules',
    description: 'Agente programado com as regras operacionais de diários de bordo agrícolas e rodoviários: validação de turnos (T1/T2/ADM), entregas de EPIs e trajetos em fazendas.',
    iconName: 'truck',
    isFree: true,
    hasVision: false,
    specialty: 'Validação de jornadas de motorista, turnos de trabalho e anotações operacionais',
    version: '2026.1',
  },
  {
    id: 'qwen-2.5-vl',
    name: 'Qwen 2.5-VL 72B (Visão Multimodal Aberta)',
    badge: 'Open-Weights • OCR Avançado',
    provider: 'Alibaba Cloud / OpenSource',
    modelKey: 'qwen-2.5-vl-72b-instruct',
    category: 'vision',
    description: 'Modelo de visão multimodal com excelente reconhecimento de tabelas densas, caracteres pequenos e documentos digitalizados em baixa resolução.',
    iconName: 'bot',
    isFree: true,
    hasVision: true,
    specialty: 'Leitura de tabelas densas e OCR de documentos digitalizados',
    version: '2.5.0',
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet (Raciocínio Híbrido & OCR)',
    badge: 'Híbrido • Alta Complexidade',
    provider: 'Anthropic AI (Compatível)',
    modelKey: 'claude-3-7-sonnet-20250219',
    category: 'vision',
    description: 'Combina raciocínio híbrido estendido com visão de altíssima definição para inspecionar campos rasurados e anotações marginais em cadernos de bordo.',
    iconName: 'cpu',
    isFree: false,
    hasVision: true,
    specialty: 'Raciocínio visual estendido para folhas com rasuras ou anotações complexas',
    version: '3.7.0',
  },
];

export const PRESET_AGENT_TEMPLATES: Partial<AgentOption>[] = [
  {
    name: 'Gemini 3.0 Experimental (Próxima Geração)',
    badge: 'Google AI • Futuro',
    provider: 'Google AI Studio',
    modelKey: 'gemini-3.0-experimental',
    category: 'vision',
    description: 'Versão de testes da nova geração Gemini com arquitetura multimodal nativa de ponta a ponta.',
    iconName: 'sparkles',
    isFree: true,
    hasVision: true,
    specialty: 'Processamento ultra-avançado de imagens e documentos manuscritos',
    version: '3.0.0-exp',
  },
  {
    name: 'DeepSeek V3 (Linguagem & Extração de Texto)',
    badge: 'DeepSeek • Raciocínio Rápido',
    provider: 'DeepSeek AI',
    modelKey: 'deepseek-chat',
    category: 'auditor',
    description: 'Modelo de 671B parâmetros com ativação esparsa de especialistas, ultra veloz para conferência de consistência.',
    iconName: 'shield',
    isFree: true,
    hasVision: false,
    specialty: 'Auditoria rápida de lógica de dados e regras de transporte',
    version: 'V3',
  },
  {
    name: 'OpenAI GPT-4o Mini (Visão Eficiente)',
    badge: 'OpenAI • Multimodal',
    provider: 'OpenAI (Compatível)',
    modelKey: 'gpt-4o-mini',
    category: 'vision',
    description: 'Modelo compacto multimodal da OpenAI com suporte a fotos de diários de bordo e notas de abastecimento.',
    iconName: 'bot',
    isFree: false,
    hasVision: true,
    specialty: 'Visão e extração de tabelas e recibos',
    version: '4o-mini',
  },
  {
    name: 'Ollama Llama 3.2 Vision (Servidor Local Privado)',
    badge: '100% Local • Offline',
    provider: 'Ollama Local Host',
    modelKey: 'llama3.2-vision:latest',
    category: 'vision',
    description: 'Executado diretamente no seu servidor ou máquina local via Ollama, garantindo sigilo absoluto dos documentos.',
    iconName: 'cpu',
    isFree: true,
    hasVision: true,
    specialty: 'Privacidade total e execução sem envio de dados para a nuvem',
    version: '3.2.0-local',
  },
];

const STORAGE_KEY = 'registered_ai_agents_v2';

export function getRegisteredAgents(): AgentOption[] {
  if (typeof window === 'undefined') return DEFAULT_AGENTS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_AGENTS));
      return DEFAULT_AGENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Erro ao carregar agentes registrados do localStorage:', err);
  }

  return DEFAULT_AGENTS;
}

export function saveRegisteredAgents(agents: AgentOption[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  } catch (err) {
    console.error('Erro ao salvar agentes no localStorage:', err);
  }
}

export function addAgentToRegistry(agent: Omit<AgentOption, 'id'> & { id?: string }): AgentOption[] {
  const current = getRegisteredAgents();
  const id = agent.id || `custom-agent-${Date.now()}`;
  const newAgent: AgentOption = {
    ...agent,
    id,
    isCustom: true,
  };

  // Prevent duplicate IDs
  const filtered = current.filter((a) => a.id !== id);
  const updated = [...filtered, newAgent];
  saveRegisteredAgents(updated);
  return updated;
}

export function removeAgentFromRegistry(id: string): AgentOption[] {
  const current = getRegisteredAgents();
  const updated = current.filter((a) => a.id !== id);
  saveRegisteredAgents(updated);
  return updated;
}

export function resetAgentRegistryToDefault(): AgentOption[] {
  saveRegisteredAgents(DEFAULT_AGENTS);
  return DEFAULT_AGENTS;
}

export function exportAgentsToJson(): string {
  const agents = getRegisteredAgents();
  return JSON.stringify(agents, null, 2);
}

export function importAgentsFromJson(jsonStr: string): { success: boolean; count?: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      return { success: false, error: 'O formato do arquivo deve ser uma lista (array) de agentes JSON.' };
    }
    // Basic validation
    const validAgents: AgentOption[] = parsed.filter(
      (a: any) => typeof a === 'object' && a !== null && typeof a.name === 'string' && typeof a.modelKey === 'string'
    );
    if (validAgents.length === 0) {
      return { success: false, error: 'Nenhum agente válido encontrado no arquivo JSON.' };
    }

    // Merge existing and new by id
    const current = getRegisteredAgents();
    const map = new Map<string, AgentOption>();
    current.forEach((a) => map.set(a.id, a));
    validAgents.forEach((a) => map.set(a.id || `imported-${Date.now()}-${Math.random()}`, a));

    const merged = Array.from(map.values());
    saveRegisteredAgents(merged);
    return { success: true, count: validAgents.length };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao processar JSON de agentes.' };
  }
}
