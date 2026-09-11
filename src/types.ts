export interface DocumentoInfo {
  nome_arquivo: string;
  tipo_documento: string;
  data_referencia?: string | null;
  mes_referencia?: number | null; // 1 to 12
  ano_referencia?: number | null; // e.g. 2026
}

export interface RegistroItem {
  id: string;
  dia?: number | string | null; // e.g. 12, 13, 14
  data: string | null; // Formatted date e.g. 12/08/2026
  dia_semana?: string | null;
  frota: string | null;
  motorista: string | null;
  km_inicial: number | null;
  km_final: number | null;
  km_produtivo?: number | null;
  fazenda?: string | null;
  turno?: string | null;
  observacoes?: string | null;
  _edited?: boolean;
}

export interface ResumoData {
  total_registros: number;
  total_km_produtivo: number;
  alertas: string[];
}

export interface ExtractionResult {
  documento: DocumentoInfo;
  registros: RegistroItem[];
  resumo: ResumoData;
}

export interface UploadedFileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  previewUrl?: string;
  base64?: string;
  fileObject?: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  result?: ExtractionResult;
}

export type StepState = 1 | 2 | 3 | 4 | 5 | 6;

export interface AgentOption {
  id: string;
  name: string;
  badge: string;
  provider: string;
  modelKey: string;
  category: 'vision' | 'auditor' | 'rules' | 'custom';
  description: string;
  iconName: 'zap' | 'brain' | 'feather' | 'shield' | 'truck' | 'bot' | 'cpu' | 'sparkles';
  isFree: boolean;
  hasVision: boolean;
  specialty: string;
  isCustom?: boolean;
  apiEndpoint?: string;
  version?: string;
}

export interface AuditAnomaly {
  id: string;
  dia?: number | string | null;
  severidade: 'baixa' | 'media' | 'alta';
  tipo: 'odometro' | 'calculo' | 'turno' | 'observacao';
  mensagem: string;
  sugestao?: string;
}

export interface AuditReport {
  scoreConformidade: number; // 0 to 100
  agenteUtilizado: string;
  statusGeral: 'conforme' | 'atencao' | 'irregular';
  parecerResumido: string;
  anomalias: AuditAnomaly[];
  kmTotalAuditado: number;
  diasCobertos: number;
  dataAuditoria: string;
}
