/**
 * Sistema de monitoramento local de consumo e cotas de IA (Google AI Studio & Outros Provedores)
 * Armazena contagem de requisições, tokens estimados, chamadas por dia/minuto
 * e compara com os limites conhecidos do plano Free e Pay-as-you-go do Google AI Studio e DeepSeek.
 */

export interface UsageRecord {
  id: string;
  timestamp: number;
  agentId: string;
  provider: 'Google AI Studio' | 'DeepSeek AI' | 'Outro';
  modelKey: string;
  type: 'extract' | 're-extract' | 'audit';
  fileName?: string;
  estimatedTokensInput: number;
  estimatedTokensOutput: number;
  status: 'success' | 'error';
}

export interface QuotaLimit {
  rpm: number; // Requests per minute
  rpd: number; // Requests per day
  tpm: number; // Tokens per minute
  isFreeTier: boolean;
  name: string;
  resetCycle: 'daily_midnight' | 'monthly';
  costPer1kPromptUSD?: number;
  costPer1kOutputUSD?: number;
}

// Limites oficiais conhecidos da cota Gratuita (Free Tier) do Google AI Studio & Provedores
export const PROVIDER_QUOTAS: Record<string, QuotaLimit> = {
  'gemini-2.5-flash': {
    name: 'Gemini 2.5 Flash',
    rpm: 15, // 15 RPM no Free Tier
    rpd: 1500, // 1.500 RPD no Free Tier
    tpm: 1000000, // 1 milhão TPM
    isFreeTier: true,
    resetCycle: 'daily_midnight',
    costPer1kPromptUSD: 0,
    costPer1kOutputUSD: 0,
  },
  'gemini-2.5-pro': {
    name: 'Gemini 2.5 Pro',
    rpm: 2, // 2 RPM no Free Tier
    rpd: 50, // 50 RPD no Free Tier
    tpm: 32000,
    isFreeTier: true,
    resetCycle: 'daily_midnight',
    costPer1kPromptUSD: 0,
    costPer1kOutputUSD: 0,
  },
  'gemini-2.5-flash-lite': {
    name: 'Gemini 2.5 Flash-Lite',
    rpm: 30, // 30 RPM
    rpd: 1500, // 1.500 RPD
    tpm: 1000000,
    isFreeTier: true,
    resetCycle: 'daily_midnight',
    costPer1kPromptUSD: 0,
    costPer1kOutputUSD: 0,
  },
  'deepseek-r1': {
    name: 'DeepSeek R1 / V3',
    rpm: 60,
    rpd: 500,
    tpm: 100000,
    isFreeTier: false, // Pay-as-you-go ou cota de crédito inicial
    resetCycle: 'daily_midnight',
    costPer1kPromptUSD: 0.00055,
    costPer1kOutputUSD: 0.00219,
  },
  'custom-rule-engine': {
    name: 'Motor Lógico Local',
    rpm: 9999,
    rpd: 99999,
    tpm: 9999999,
    isFreeTier: true,
    resetCycle: 'daily_midnight',
  },
};

const STORAGE_KEY = 'ai_usage_history_v1';

export function getUsageHistory(): UsageRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function logAiUsage(record: Omit<UsageRecord, 'id' | 'timestamp'>): UsageRecord {
  const newRecord: UsageRecord = {
    ...record,
    id: `usage-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
  };

  if (typeof window !== 'undefined') {
    try {
      const history = getUsageHistory();
      // Keep last 500 records to maintain fast storage
      const updated = [newRecord, ...history].slice(0, 500);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // Dispatch custom event for real-time reactivity in open tabs
      window.dispatchEvent(new CustomEvent('ai_usage_updated', { detail: newRecord }));
    } catch (err) {
      console.warn('Falha ao salvar log de consumo:', err);
    }
  }

  return newRecord;
}

export function clearUsageHistory(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('ai_usage_updated', { detail: null }));
  }
}

export interface ProviderConsumptionStats {
  provider: string;
  totalCallsToday: number;
  totalCallsMinute: number;
  totalTokensToday: number;
  successRate: number;
  rpdLimit: number;
  rpmLimit: number;
  percentRpd: number; // 0 a 100
  percentRpm: number; // 0 a 100
  status: 'safe' | 'warning' | 'danger';
  lastCallTime?: string;
  models: Record<
    string,
    {
      callsToday: number;
      callsTotal: number;
      tokensToday: number;
      rpdLimit: number;
      rpmLimit: number;
      percentRpd: number;
      status: 'safe' | 'warning' | 'danger';
    }
  >;
}

export function calculateUsageStats(): {
  googleAiStudio: ProviderConsumptionStats;
  deepSeek: ProviderConsumptionStats;
  allHistory: UsageRecord[];
  todayCallsCount: number;
} {
  const history = getUsageHistory();
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayTimestamp = startOfToday.getTime();

  // Filter today and minute
  const todayRecords = history.filter((r) => r.timestamp >= todayTimestamp);
  const minuteRecords = history.filter((r) => r.timestamp >= oneMinuteAgo);

  // Helper for Google AI Studio
  const googleToday = todayRecords.filter(
    (r) => r.provider === 'Google AI Studio' || r.agentId.startsWith('gemini')
  );
  const googleMinute = minuteRecords.filter(
    (r) => r.provider === 'Google AI Studio' || r.agentId.startsWith('gemini')
  );
  const googleAll = history.filter(
    (r) => r.provider === 'Google AI Studio' || r.agentId.startsWith('gemini')
  );

  // Default aggregate limit based on most common model (gemini-2.5-flash: 1500 RPD, 15 RPM)
  const googleRpdLimit = 1500;
  const googleRpmLimit = 15;
  const googlePercentRpd = Math.min(100, Math.round((googleToday.length / googleRpdLimit) * 100 * 10) / 10);
  const googlePercentRpm = Math.min(100, Math.round((googleMinute.length / googleRpmLimit) * 100));

  const googleSuccessCount = googleToday.filter((r) => r.status === 'success').length;
  const googleSuccessRate = googleToday.length > 0 ? Math.round((googleSuccessCount / googleToday.length) * 100) : 100;

  // Breakdown per Gemini model
  const geminiModels = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.5-flash-lite'];
  const googleModelsBreakdown: Record<string, any> = {};

  geminiModels.forEach((mId) => {
    const quota = PROVIDER_QUOTAS[mId] || { rpd: 1500, rpm: 15 };
    const mToday = googleToday.filter((r) => r.agentId === mId || r.modelKey === mId);
    const mAll = googleAll.filter((r) => r.agentId === mId || r.modelKey === mId);
    const pct = Math.min(100, Math.round((mToday.length / quota.rpd) * 100 * 10) / 10);
    googleModelsBreakdown[mId] = {
      callsToday: mToday.length,
      callsTotal: mAll.length,
      tokensToday: mToday.reduce((acc, curr) => acc + curr.estimatedTokensInput + curr.estimatedTokensOutput, 0),
      rpdLimit: quota.rpd,
      rpmLimit: quota.rpm,
      percentRpd: pct,
      status: pct > 85 ? 'danger' : pct > 60 ? 'warning' : 'safe',
    };
  });

  // Helper for DeepSeek
  const deepSeekToday = todayRecords.filter(
    (r) => r.provider === 'DeepSeek AI' || r.agentId.includes('deepseek')
  );
  const deepSeekMinute = minuteRecords.filter(
    (r) => r.provider === 'DeepSeek AI' || r.agentId.includes('deepseek')
  );
  const deepSeekAll = history.filter(
    (r) => r.provider === 'DeepSeek AI' || r.agentId.includes('deepseek')
  );

  const dsQuota = PROVIDER_QUOTAS['deepseek-r1'] || { rpd: 500, rpm: 60 };
  const dsPercentRpd = Math.min(100, Math.round((deepSeekToday.length / dsQuota.rpd) * 100 * 10) / 10);
  const dsPercentRpm = Math.min(100, Math.round((deepSeekMinute.length / dsQuota.rpm) * 100));
  const dsSuccess = deepSeekToday.filter((r) => r.status === 'success').length;
  const dsSuccessRate = deepSeekToday.length > 0 ? Math.round((dsSuccess / deepSeekToday.length) * 100) : 100;

  return {
    googleAiStudio: {
      provider: 'Google AI Studio',
      totalCallsToday: googleToday.length,
      totalCallsMinute: googleMinute.length,
      totalTokensToday: googleToday.reduce((acc, r) => acc + r.estimatedTokensInput + r.estimatedTokensOutput, 0),
      successRate: googleSuccessRate,
      rpdLimit: googleRpdLimit,
      rpmLimit: googleRpmLimit,
      percentRpd: googlePercentRpd,
      percentRpm: googlePercentRpm,
      status: googlePercentRpd > 85 ? 'danger' : googlePercentRpd > 60 ? 'warning' : 'safe',
      lastCallTime: googleToday[0] ? new Date(googleToday[0].timestamp).toLocaleTimeString('pt-BR') : undefined,
      models: googleModelsBreakdown,
    },
    deepSeek: {
      provider: 'DeepSeek AI',
      totalCallsToday: deepSeekToday.length,
      totalCallsMinute: deepSeekMinute.length,
      totalTokensToday: deepSeekToday.reduce((acc, r) => acc + r.estimatedTokensInput + r.estimatedTokensOutput, 0),
      successRate: dsSuccessRate,
      rpdLimit: dsQuota.rpd,
      rpmLimit: dsQuota.rpm,
      percentRpd: dsPercentRpd,
      percentRpm: dsPercentRpm,
      status: dsPercentRpd > 85 ? 'danger' : dsPercentRpd > 60 ? 'warning' : 'safe',
      lastCallTime: deepSeekToday[0] ? new Date(deepSeekToday[0].timestamp).toLocaleTimeString('pt-BR') : undefined,
      models: {
        'deepseek-r1': {
          callsToday: deepSeekToday.length,
          callsTotal: deepSeekAll.length,
          tokensToday: deepSeekToday.reduce((acc, r) => acc + r.estimatedTokensInput + r.estimatedTokensOutput, 0),
          rpdLimit: dsQuota.rpd,
          rpmLimit: dsQuota.rpm,
          percentRpd: dsPercentRpd,
          status: dsPercentRpd > 85 ? 'danger' : dsPercentRpd > 60 ? 'warning' : 'safe',
        },
      },
    },
    allHistory: history,
    todayCallsCount: todayRecords.length,
  };
}
