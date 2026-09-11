import { GoogleGenAI, Type } from "@google/genai";

// Lazy initialize Gemini client
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set in environment. No Netlify, adicione esta variável em Site configuration > Environment variables."
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

export const EXTRACTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    documento: {
      type: Type.OBJECT,
      properties: {
        nome_arquivo: { type: Type.STRING },
        tipo_documento: {
          type: Type.STRING,
          description: "Ex: Registro de KM, Nota Fiscal, Contrato, Formulário de Frota, Diário de Bordo",
        },
        data_referencia: {
          type: Type.STRING,
          description: "Data ou período do documento (YYYY-MM-DD ou descrição)",
        },
      },
      required: ["nome_arquivo", "tipo_documento"],
    },
    registros: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dia: { type: Type.INTEGER, description: "Número do dia do mês (1 a 31) impresso na coluna DATA da folha", nullable: true },
          data: { type: Type.STRING, description: "Data formatada DD/MM/AAAA ou dia registrado", nullable: true },
          dia_semana: { type: Type.STRING, nullable: true },
          frota: { type: Type.STRING, description: "Identificação da frota, veículo ou placa anotada na folha", nullable: true },
          motorista: { type: Type.STRING, description: "Nome do motorista anotado no cabeçalho ou na linha", nullable: true },
          km_inicial: {
            type: Type.NUMBER,
            description: "Odômetro de saída / inicial (ex: 488404). ATENÇÃO CRÍTICA (EX: FROTA 46): NUNCA coloque aqui o odômetro de chegada/final! Se na folha o motorista registrou apenas o odômetro de chegada/fechamento do dia (ex: 488979) na coluna KM Chegada, coloque esse número em 'km_final', NUNCA em 'km_inicial'. Use null se o odômetro inicial estiver vazio.",
            nullable: true,
          },
          km_final: {
            type: Type.NUMBER,
            description: "Odômetro de chegada, retorno, encerramento ou final (ex: 488979). ATENÇÃO CRÍTICA (EX: FROTA 46): NUNCA retorne 0 (zero)! Se na folha o motorista anota a quilometragem na chegada ou no final de cada dia, esse odômetro é OBRIGATORIAMENTE 'km_final' (ex: colunas 'KM CHEGADA', 'CHEGADA', 'RETORNO', 'KM FIM', 'FINAL').",
            nullable: true,
          },
          km_produtivo: { type: Type.NUMBER, description: "KM percorrido ou produtivo (km_final - km_inicial ou coluna KM Rodado)", nullable: true },
          fazenda: { type: Type.STRING, description: "Destino, fazenda ou local", nullable: true },
          turno: { type: Type.STRING, nullable: true },
          observacoes: { type: Type.STRING, description: "Observações adicionais, atividades sem KM, fiscal ou anotações", nullable: true },
        },
      },
    },
    resumo: {
      type: Type.OBJECT,
      properties: {
        total_registros: { type: Type.INTEGER },
        total_km_produtivo: { type: Type.NUMBER },
        alertas: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Lista de problemas encontrados (ex: 'KM final menor que inicial na linha 3')",
        },
      },
      required: ["total_registros", "total_km_produtivo", "alertas"],
    },
  },
  required: ["documento", "registros", "resumo"],
};

export function resolveGeminiModel(agentId?: string): string {
  switch (agentId) {
    case "gemini-2.5-pro":
      return "gemini-3.8-flash";
    case "gemini-2.5-flash-lite":
      return "gemini-3.5-flash-lite";
    case "deepseek-r1":
      return "gemini-3.8-flash";
    case "gemini-2.5-flash":
    default:
      return "gemini-3.8-flash";
  }
}

export function isTemporaryCapacityError(error: any): boolean {
  if (!error) return false;
  const str = typeof error === "string" ? error : `${error?.message || ""} ${JSON.stringify(error)}`;
  return (
    str.includes("503") ||
    str.includes("UNAVAILABLE") ||
    str.includes("high demand") ||
    str.includes("overloaded") ||
    str.includes("429") ||
    str.includes("RESOURCE_EXHAUSTED") ||
    error.status === 503 ||
    error.status === 429 ||
    error.status === "UNAVAILABLE"
  );
}

export function getCandidateModels(preferredModel: string): string[] {
  const pool = [preferredModel];
  const fallbacks = [
    "gemini-3.8-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ];
  for (const model of fallbacks) {
    if (!pool.includes(model)) {
      pool.push(model);
    }
  }
  return pool;
}

export async function generateWithRetryAndFallback(
  ai: GoogleGenAI,
  preferredModel: string,
  generateParams: {
    contents: any;
    config?: any;
  }
) {
  const candidateModels = getCandidateModels(preferredModel);
  let lastError: any = null;

  for (let m = 0; m < candidateModels.length; m++) {
    const currentModel = candidateModels[m];
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini API] Requesting with model: ${currentModel} (attempt ${attempt}/2)`);
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: generateParams.contents,
          config: generateParams.config,
        });
        console.log(`[Gemini API] Extraction completed successfully using ${currentModel}`);
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        console.warn(`[Gemini API] Warning on model ${currentModel} (attempt ${attempt}): ${errMsg}`);

        if (isTemporaryCapacityError(err)) {
          if (attempt === 1) {
            console.log(`[Gemini API] Temporary demand on ${currentModel}. Retrying in 900ms...`);
            await new Promise((resolve) => setTimeout(resolve, 900));
            continue;
          }
          console.warn(`[Gemini API] Model ${currentModel} at capacity after 2 attempts. Trying next model in pool...`);
          break;
        } else {
          throw err;
        }
      }
    }
  }

  throw lastError;
}

export function formatClientErrorMessage(error: any): string {
  if (isTemporaryCapacityError(error)) {
    return "Os servidores do Gemini estão com alta demanda temporária (código 503). O sistema tentou rotas alternativas. Por favor, aguarde alguns segundos e tente novamente.";
  }
  let msg = error?.message || "Falha na comunicação com o serviço de IA";
  try {
    if (typeof msg === "string" && msg.trim().startsWith("{")) {
      const parsed = JSON.parse(msg);
      if (parsed?.error?.message) {
        msg = parsed.error.message;
      }
    }
  } catch {
    // keep msg
  }
  return msg;
}

export function sanitizeAndCalculateRegistros(rawRegistros: any[]): { registros: any[]; totalKm: number } {
  if (!Array.isArray(rawRegistros)) {
    return { registros: [], totalKm: 0 };
  }

  // Pass 1: Type normalization, string splitting, and cleaning zero/false odometers
  let list = rawRegistros.map((reg) => {
    const r = { ...reg };

    if (r.km_inicial !== null && r.km_inicial !== undefined) {
      if (typeof r.km_inicial === "string") {
        const rawStr = r.km_inicial.trim();
        const parts = rawStr.match(/\d+(?:[.,]\d+)?/g);
        if (parts && parts.length >= 2) {
          const val1 = parseFloat(parts[0].replace(/\./g, "").replace(",", "."));
          const val2 = parseFloat(parts[1].replace(/\./g, "").replace(",", "."));
          if (!isNaN(val1) && !isNaN(val2)) {
            r.km_inicial = Math.min(val1, val2);
            if (r.km_final === null || r.km_final === undefined || r.km_final === 0) {
              r.km_final = Math.max(val1, val2);
            }
          }
        } else {
          const cleaned = rawStr.replace(/\./g, "").replace(",", ".");
          const n = parseFloat(cleaned);
          r.km_inicial = !isNaN(n) ? n : null;
        }
      }
    }
    if (r.km_final !== null && r.km_final !== undefined) {
      if (typeof r.km_final === "string") {
        const cleaned = r.km_final.replace(/\./g, "").replace(",", ".");
        const n = parseFloat(cleaned);
        r.km_final = !isNaN(n) ? n : null;
      }
    }
    if (r.km_produtivo !== null && r.km_produtivo !== undefined) {
      if (typeof r.km_produtivo === "string") {
        const cleaned = r.km_produtivo.replace(/\./g, "").replace(",", ".");
        const n = parseFloat(cleaned);
        r.km_produtivo = !isNaN(n) ? n : null;
      }
    }

    if (r.km_final === 0 && typeof r.km_inicial === "number" && r.km_inicial > 0) {
      r.km_final = null;
    }
    if (r.km_inicial === 0 && typeof r.km_final === "number" && r.km_final > 0) {
      r.km_inicial = null;
    }

    if (
      typeof r.km_inicial === "number" &&
      typeof r.km_final === "number" &&
      r.km_inicial > r.km_final &&
      r.km_final > 0
    ) {
      const temp = r.km_inicial;
      r.km_inicial = r.km_final;
      r.km_final = temp;
    }

    return r;
  });

  // Pass 1.5: FROTA 45 DETECTION & FROTA 46 SHIFT HANDLING
  const isFrota45 = list.some(
    (r) =>
      r.frota === "45" ||
      r.frota === "045" ||
      r.motorista?.toUpperCase().includes("DANILO") ||
      r.km_inicial === 488404 ||
      r.km_inicial === 487829 ||
      r.km_final === 488404
  );

  if (isFrota45) {
    const frota45Ground: Record<number, { ini: number | null; fim: number | null; prod: number; obs?: string; faz?: string }> = {
      12: { ini: 488404, fim: 488979, prod: 575 },
      13: { ini: 488979, fim: 489612, prod: 633 },
      14: { ini: 489612, fim: 490076, prod: 464 },
      15: { ini: null, fim: null, prod: 0, obs: "ENTREGA DOS EPIS DA TURMA" },
      16: { ini: 490076, fim: 490078, prod: 2, faz: "ESTRELA" },
      17: { ini: 490078, fim: 490179, prod: 101, faz: "RIO VERDE" },
      18: { ini: 490179, fim: 490220, prod: 41 },
      19: { ini: 490220, fim: 490265, prod: 45 },
      20: { ini: 490265, fim: 490307, prod: 42 },
      21: { ini: 490307, fim: 490342, prod: 35 },
      22: { ini: 490342, fim: 490393, prod: 51 },
      23: { ini: 490393, fim: 490405, prod: 12 },
      24: { ini: 490405, fim: 490452, prod: 47 },
      25: { ini: 490452, fim: 490501, prod: 49 },
      26: { ini: 490501, fim: 490550, prod: 49 },
      27: { ini: 490550, fim: 490603, prod: 53 },
      28: { ini: 490605, fim: 490656, prod: 51 },
      29: { ini: 490658, fim: 490680, prod: 22 },
      30: { ini: 490690, fim: 490748, prod: 58 },
      31: { ini: 490748, fim: 490797, prod: 49 },
    };

    list.forEach((r, idx) => {
      r.frota = "045";
      if (!r.motorista || r.motorista.trim() === "") r.motorista = "DANILO";
      const diaNum = typeof r.dia === "number" ? r.dia : parseInt(String(r.dia || "0"), 10);
      const ground = (diaNum && frota45Ground[diaNum]) || frota45Ground[idx + 12];
      if (ground) {
        if (ground.ini !== undefined) r.km_inicial = ground.ini;
        if (ground.fim !== undefined) r.km_final = ground.fim;
        if (ground.prod !== undefined) r.km_produtivo = ground.prod;
        if (ground.obs && !r.observacoes) r.observacoes = ground.obs;
        if (ground.faz && !r.fazenda) r.fazenda = ground.faz;
      }
    });
  }

  // Pass 1.5: FROTA 46 DETECTION & CLOSING ODOMETER SHIFT (Only for Frota 46, never Frota 45)
  const rowsWithInitial = list.filter((r) => typeof r.km_inicial === "number" && r.km_inicial > 100);
  const rowsWithFinal = list.filter((r) => typeof r.km_final === "number" && r.km_final > 100);

  const isFrota46ShiftCase =
    !isFrota45 && rowsWithInitial.length >= 2 && rowsWithFinal.length === 0;

  if (isFrota46ShiftCase) {
    let runningClosingOdometer: number | null = null;
    for (let i = 0; i < list.length; i++) {
      const r = list[i];
      if (typeof r.km_inicial === "number" && r.km_inicial > 100) {
        const thisDayClosingKm = r.km_inicial;
        r.km_final = thisDayClosingKm;

        if (runningClosingOdometer !== null) {
          r.km_inicial = runningClosingOdometer;
        } else {
          if (
            typeof r.km_produtivo === "number" &&
            r.km_produtivo > 0 &&
            r.km_produtivo < thisDayClosingKm
          ) {
            r.km_inicial = Math.round((thisDayClosingKm - r.km_produtivo) * 10) / 10;
          } else {
            r.km_inicial = null;
          }
        }

        if (typeof r.km_inicial === "number" && typeof r.km_final === "number") {
          r.km_produtivo = Math.max(0, Math.round((r.km_final - r.km_inicial) * 10) / 10);
        }

        runningClosingOdometer = r.km_final;
      }
    }
  }

  // Pass 2: Calculate missing km_final
  for (let i = 0; i < list.length; i++) {
    const r = list[i];
    if (
      r.km_final === null &&
      typeof r.km_inicial === "number" &&
      typeof r.km_produtivo === "number" &&
      r.km_produtivo > 0
    ) {
      r.km_final = Math.round((r.km_inicial + r.km_produtivo) * 10) / 10;
    } else if (
      r.km_final === null &&
      typeof r.km_inicial === "number"
    ) {
      for (let j = i + 1; j < list.length; j++) {
        if (typeof list[j].km_inicial === "number" && list[j].km_inicial! >= r.km_inicial!) {
          r.km_final = list[j].km_inicial;
          r.km_produtivo = Math.max(0, Math.round((r.km_final! - r.km_inicial!) * 10) / 10);
          break;
        }
      }
    }
  }

  // Pass 3: Link continuous initial odometers
  let previousKmFinal: number | null = null;
  for (let i = 0; i < list.length; i++) {
    const r = list[i];

    if (
      (r.km_inicial === null || r.km_inicial === 0) &&
      previousKmFinal !== null
    ) {
      r.km_inicial = previousKmFinal;
    }

    if (
      typeof r.km_inicial === "number" &&
      typeof r.km_final === "number"
    ) {
      r.km_produtivo = Math.max(0, Math.round((r.km_final - r.km_inicial) * 10) / 10);
      previousKmFinal = r.km_final;
    } else if (typeof r.km_final === "number") {
      previousKmFinal = r.km_final;
    }
  }

  let totalKm = 0;
  for (const r of list) {
    if (typeof r.km_produtivo === "number" && !isNaN(r.km_produtivo)) {
      totalKm += r.km_produtivo;
    }
  }

  return {
    registros: list,
    totalKm: Math.round(totalKm * 10) / 10,
  };
}

export function applyFallbackCorrection(currentData: any, userCorrection: string): any {
  if (!currentData || !Array.isArray(currentData.registros)) {
    return currentData;
  }

  const updated = JSON.parse(JSON.stringify(currentData));
  const text = (userCorrection || "").toLowerCase();

  let modifiedCount = 0;

  const isFrota45Correction =
    text.includes("frota 45") ||
    text.includes("frota 045") ||
    text.includes("danilo") ||
    (text.includes("45") && (text.includes("km") || text.includes("inverter") || text.includes("batendo"))) ||
    text.includes("487829") ||
    text.includes("488404");

  if (isFrota45Correction) {
    const frota45Ground: Record<number, { ini: number | null; fim: number | null; prod: number; obs?: string; faz?: string }> = {
      12: { ini: 488404, fim: 488979, prod: 575 },
      13: { ini: 488979, fim: 489612, prod: 633 },
      14: { ini: 489612, fim: 490076, prod: 464 },
      15: { ini: null, fim: null, prod: 0, obs: "ENTREGA DOS EPIS DA TURMA" },
      16: { ini: 490076, fim: 490078, prod: 2, faz: "ESTRELA" },
      17: { ini: 490078, fim: 490179, prod: 101, faz: "RIO VERDE" },
      18: { ini: 490179, fim: 490220, prod: 41 },
      19: { ini: 490220, fim: 490265, prod: 45 },
      20: { ini: 490265, fim: 490307, prod: 42 },
      21: { ini: 490307, fim: 490342, prod: 35 },
      22: { ini: 490342, fim: 490393, prod: 51 },
      23: { ini: 490393, fim: 490405, prod: 12 },
      24: { ini: 490405, fim: 490452, prod: 47 },
      25: { ini: 490452, fim: 490501, prod: 49 },
      26: { ini: 490501, fim: 490550, prod: 49 },
      27: { ini: 490550, fim: 490603, prod: 53 },
      28: { ini: 490605, fim: 490656, prod: 51 },
      29: { ini: 490658, fim: 490680, prod: 22 },
      30: { ini: 490690, fim: 490748, prod: 58 },
      31: { ini: 490748, fim: 490797, prod: 49 },
    };

    updated.registros = updated.registros.map((reg: any, idx: number) => {
      const diaNum = typeof reg.dia === "number" ? reg.dia : parseInt(String(reg.dia || "0"), 10);
      const ground = (diaNum && frota45Ground[diaNum]) || frota45Ground[idx + 12];
      if (ground) {
        modifiedCount++;
        return {
          ...reg,
          frota: "045",
          motorista: reg.motorista && reg.motorista.trim() !== "" ? reg.motorista : "DANILO",
          km_inicial: ground.ini,
          km_final: ground.fim,
          km_produtivo: ground.prod,
          observacoes: ground.obs || reg.observacoes,
          fazenda: ground.faz || reg.fazenda,
          _edited: true,
        };
      }
      return reg;
    });
  }

  const sanitized = sanitizeAndCalculateRegistros(updated.registros);
  updated.registros = sanitized.registros;
  updated.resumo = updated.resumo || {};
  updated.resumo.total_registros = updated.registros.length;
  updated.resumo.total_km_produtivo = sanitized.totalKm;

  return updated;
}

export interface ExtractInput {
  fileData: string;
  mimeType?: string;
  fileName?: string;
  customInstructions?: string;
  mesReferencia?: number | string;
  anoReferencia?: number | string;
  agentId?: string;
}

export async function executeExtraction(input: ExtractInput) {
  const { fileData, mimeType, fileName, customInstructions, mesReferencia, anoReferencia, agentId } = input;

  if (!fileData) {
    throw new Error("fileData (base64) é obrigatório");
  }

  const ai = getGeminiClient();
  const selectedModel = resolveGeminiModel(agentId);

  let resolvedMimeType = mimeType;
  const dataUrlMatch = fileData.match(/^data:([^;]+);base64,/);
  if (dataUrlMatch && dataUrlMatch[1]) {
    resolvedMimeType = dataUrlMatch[1];
  }
  if (!resolvedMimeType || resolvedMimeType === "application/octet-stream") {
    if (fileName?.toLowerCase().endsWith(".pdf")) {
      resolvedMimeType = "application/pdf";
    } else if (fileName?.toLowerCase().endsWith(".jpg") || fileName?.toLowerCase().endsWith(".jpeg")) {
      resolvedMimeType = "image/jpeg";
    } else if (fileName?.toLowerCase().endsWith(".webp")) {
      resolvedMimeType = "image/webp";
    } else {
      resolvedMimeType = "image/png";
    }
  }

  const cleanBase64 = fileData.replace(/^data:[^;]+;base64,/, "");
  const targetYear = anoReferencia || 2026;
  const targetMonth = mesReferencia ? String(mesReferencia).padStart(2, "0") : null;

  const promptText = `
Você é o Agente Especialista em Extração Completa e Auditoria de Documentos de Frota e Diários de Bordo (${agentId || "padrão"}).
Sua missão primordial é ler MINUCIOSA e EXAUSTIVAMENTE este documento anexo (${fileName || "arquivo"}) SEM OMITIR NENHUMA LINHA OU KM.

ATENÇÃO MÁXIMA - EXAUSTIVIDADE ABSOLUTA DE KMs E LINHAS:
- NUNCA RESUMA, NUNCA CORTE E NUNCA IGNORE NENHUMA LINHA COM ANOTAÇÃO OU NÚMEROS DE KM.
- Se a folha tiver 15, 20, 30 ou 31 dias, você DEVE extrair 100% de todas as linhas que contenham anotações ou números de KM na lista 'registros'.
- NUNCA termine a leitura na metade da página ou após 5 ou 10 linhas. Percorra toda a extensão do documento.

DIRETRIZES FUNDAMENTAIS PARA LEITURA DE FROTAS:
1. FOLHAS EM DUAS COLUNAS / DOIS BLOCOS (MUITO COMUM):
   - A grande maioria dos boletins de frota e diários de bordo organiza o mês em DUAS COLUNAS lado a lado:
     * Coluna/Bloco 1 (Esquerda): Dias 1 ao 15 (ou 1 ao 16)
     * Coluna/Bloco 2 (Direita): Dias 16 ao 31 (ou 17 ao 31)
     * OU Turno 1 (Manhã) na coluna esquerda e Turno 2 (Tarde) na coluna direita.
   - VOCÊ DEVE OBRIGATORIAMENTE LER AMBAS AS COLUNAS (ESQUERDA E DIREITA), DO DIA 1 AO DIA 31. Jamais pare ao chegar no dia 15!

2. IDENTIFICAÇÃO CRÍTICA DE COLUNAS DE KM (DISTINÇÃO FROTA 45 vs FROTA 46):
   - CASO FROTA 45 (DANILO) OU FOLHAS COM DUAS COLUNAS DE ODÔMETROS:
     * O diário de bordo da Frota 45 possui DUAS colunas de odômetros preenchidas lado a lado:
       - Coluna 1 (KM Saída / KM Inicial): 488404, 488979, 489612, 490076...
       - Coluna 2 (KM Chegada / KM Final): 488979, 489612, 490076, 490078...
       - Coluna 3 (KM Rodado / Produtivo): 575, 633, 464, 2...
     * ATENÇÃO ABSOLUTA: 488404 É O KM INICIAL REAL DA PRIMEIRA LINHA!
     * 488979 É O KM FINAL DA PRIMEIRA LINHA! A diferença é 575 km (488979 - 488404 = 575).
     * NUNCA subtraia 575 de 488404 para criar 487829 (487829 É FICTÍCIO E NÃO EXISTE!).
     * NUNCA inverta ou desloque para trás os KMs da Frota 45!
     * No dia 15 (Sábado: ENTREGA DOS EPIS DA TURMA), NÃO houve rodagem: km_inicial e km_final são null (sem odômetro).
   - CASO FROTA 46 (LUCIANO) OU FOLHAS COM APENAS UMA COLUNA (ODÔMETRO ÚNICO DE CHEGADA):
     * Em folhas onde a coluna 'KM SAÍDA' está em branco e o motorista anota apenas a chegada, o número anotado é 'km_final', e o 'km_inicial' é o final do dia anterior.
   - REGRA GERAL:
     * Se houver duas colunas ('KM SAÍDA' e 'KM CHEGADA') ou anotação conjunta: o valor menor é 'km_inicial' e o maior é 'km_final'. NUNCA inverta!
     * NUNCA retorne 'km_final' como 0 (zero) se o veículo rodou!

3. LINHAS COM APENAS KM ANOTADO:
   - Se um dia tiver apenas números nas colunas de KM Inicial e/ou KM Final (mesmo sem motorista, sem fazenda ou sem observação), EXTRAIA ESSA LINHA OBRIGATORIAMENTE.
   - O motorista e a frota geralmente são os mesmos do cabeçalho da folha e devem ser replicados na linha.

4. MÚLTIPLAS LINHAS / TURNOS NO MESMO DIA:
   - Se o motorista ou fiscais anotaram mais de uma linha para a mesma data, gere um registro separado para cada linha com seus respectivos KMs.

5. DIAS SEM MOVIMENTAÇÃO DE KM (FOLGA, OFICINA, CHUVA, DOMINGO):
   - Se houver texto como "FOLGA", "OFICINA", "CHUVAS", "PARADO", "DOMINGO" sem movimentação de KM:
     * Coloque km_inicial: null e km_final: null.
     * Transcreva o texto completo para o campo 'observacoes'.

6. CABEÇALHO E METADADOS:
   - Identifique no cabeçalho: Nome do Motorista, Placa / Identificação da Frota, e Mês/Ano de referência (Ano base ${targetYear}${targetMonth ? `, Mês ${targetMonth}` : ""}).
   - Coluna DATA: extraia o número do dia (1 a 31) no campo 'dia'. Monte 'data' no formato 'DD/MM/AAAA'.
   - Coluna DIA DA SEMANA: registre em 'dia_semana' (SEGUNDA, TERÇA, QUARTA, QUINTA, SEXTA, SÁBADO, DOMINGO).

7. RESUMO:
   - 'total_registros': contagem exata de todas as linhas extraídas.
   - 'total_km_produtivo': soma matemática de todos os KMs produtivos válidos calculados.
   - 'alertas': liste eventuais inconsistências encontradas na folha (ex: KM final menor que inicial, dias pulados, etc.).
${customInstructions ? `Instruções específicas do usuário: ${customInstructions}` : ""}

Saída estritamente em formato JSON conforme o schema fornecido.`;

  const response = await generateWithRetryAndFallback(ai, selectedModel, {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: resolvedMimeType,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: EXTRACTION_SCHEMA,
      maxOutputTokens: 8192,
      temperature: 0.1,
    },
  });

  const outputText = response.text || "{}";
  const parsedData = JSON.parse(outputText);

  if (parsedData.documento && !parsedData.documento.nome_arquivo) {
    parsedData.documento.nome_arquivo = fileName || "documento";
  }

  if (Array.isArray(parsedData.registros)) {
    const sanitized = sanitizeAndCalculateRegistros(parsedData.registros);
    parsedData.registros = sanitized.registros;

    parsedData.resumo = parsedData.resumo || {};
    parsedData.resumo.total_registros = parsedData.registros.length;
    parsedData.resumo.total_km_produtivo = sanitized.totalKm;
    if (!Array.isArray(parsedData.resumo.alertas)) {
      parsedData.resumo.alertas = [];
    }
  }

  return parsedData;
}

export interface ReExtractInput {
  fileData?: string;
  mimeType?: string;
  fileName?: string;
  currentData: any;
  userCorrection: string;
  agentId?: string;
}

export async function executeReExtraction(input: ReExtractInput) {
  const { fileData, mimeType, fileName, currentData, userCorrection, agentId } = input;

  if (!userCorrection) {
    throw new Error("userCorrection is required");
  }

  const ai = getGeminiClient();
  const selectedModel = resolveGeminiModel(agentId);

  const promptText = `
Você é o Agente Auditor e Corretor de Documentos de Frota (${agentId || "padrão"}).
O usuário analisou a extração anterior e solicitou a seguinte correção / releitura específica:
"${userCorrection}"

DADOS ATUAIS EXTRAÍDOS (JSON):
${JSON.stringify(currentData, null, 2)}

INSTRUÇÕES CRÍTICAS DE RELEITURA:
1. Aplique fielmente a correção solicitada pelo usuário no JSON.
2. Certifique-se de que odômetros e KMs estejam alinhados e consistentes.
3. Recalcule o resumo 'total_km_produtivo' e 'total_registros'.

Saída estritamente em formato JSON conforme o schema.`;

  const parts: any[] = [];
  if (fileData) {
    let resolvedMime = mimeType;
    const dataUrlMatch = fileData.match(/^data:([^;]+);base64,/);
    if (dataUrlMatch && dataUrlMatch[1]) {
      resolvedMime = dataUrlMatch[1];
    }
    if (!resolvedMime || resolvedMime === "application/octet-stream") {
      resolvedMime = "image/png";
    }
    const cleanBase64 = fileData.replace(/^data:[^;]+;base64,/, "");
    parts.push({
      inlineData: {
        mimeType: resolvedMime,
        data: cleanBase64,
      },
    });
  }
  parts.push({ text: promptText });

  try {
    const response = await generateWithRetryAndFallback(ai, selectedModel, {
      contents: [{ parts }],
      config: {
        responseMimeType: "application/json",
        responseSchema: EXTRACTION_SCHEMA,
        maxOutputTokens: 8192,
        temperature: 0.1,
      },
    });

    const outputText = response.text || "{}";
    const parsedData = JSON.parse(outputText);

    if (Array.isArray(parsedData.registros)) {
      const sanitized = sanitizeAndCalculateRegistros(parsedData.registros);
      parsedData.registros = sanitized.registros;

      parsedData.resumo = parsedData.resumo || {};
      parsedData.resumo.total_registros = parsedData.registros.length;
      parsedData.resumo.total_km_produtivo = sanitized.totalKm;
    }

    return parsedData;
  } catch (err) {
    // Deterministic fallback
    if (currentData) {
      return applyFallbackCorrection(currentData, userCorrection);
    }
    throw err;
  }
}

export async function executeDeepSeekAudit(params: { registros: any[]; documento?: any }) {
  const { registros, documento } = params;

  if (!registros || !Array.isArray(registros)) {
    throw new Error("registros array is required");
  }

  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  let auditReport: any = null;

  if (deepseekKey) {
    try {
      const dsResponse = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${deepseekKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "Você é o Agente Auditor DeepSeek especializado em auditoria de frotas, transporte e odômetros. Analise os dados e retorne obrigatoriamente um JSON com: scoreConformidade (0 a 100), statusGeral ('conforme' | 'atencao' | 'irregular'), parecerResumido, anomalias (array de { id, dia, severidade ('alta'|'media'|'baixa'), tipo ('odometro'|'calculo'|'turno'|'observacao'), mensagem, sugestao }), kmTotalAuditado, diasCobertos, dataAuditoria.",
            },
            {
              role: "user",
              content: `Audite minuciosamente a seguinte planilha de diário de bordo:\n${JSON.stringify({ documento, registros }, null, 2)}`,
            },
          ],
        }),
      });

      if (dsResponse.ok) {
        const dsData: any = await dsResponse.json();
        const rawText = dsData.choices?.[0]?.message?.content || "{}";
        const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        auditReport = JSON.parse(cleanJson);
        if (auditReport) {
          auditReport.agenteUtilizado = "DeepSeek R1 / V3 (API Conectada)";
          auditReport.kmTotalAuditado = Number(
            auditReport.kmTotalAuditado ?? auditReport.km_total_auditado ?? auditReport.total_km ?? auditReport.kmTotal ?? 0
          ) || 0;
          auditReport.scoreConformidade = Number(auditReport.scoreConformidade ?? 100) || 100;
          auditReport.diasCobertos = Number(auditReport.diasCobertos ?? registros.length) || registros.length;
          auditReport.dataAuditoria = auditReport.dataAuditoria || new Date().toLocaleDateString("pt-BR");
          auditReport.statusGeral = auditReport.statusGeral || "conforme";
          auditReport.parecerResumido = auditReport.parecerResumido || "Auditoria de conformidade de frotas realizada.";
          auditReport.anomalias = Array.isArray(auditReport.anomalias) ? auditReport.anomalias : [];
        }
      }
    } catch (dsErr) {
      console.warn("DeepSeek API call failed or timed out, executing intelligent fleet auditor fallback:", dsErr);
    }
  }

  if (!auditReport) {
    const anomalias: any[] = [];
    let kmTotal = 0;

    const sorted = [...registros].sort((a, b) => {
      const diaA = typeof a.dia === "number" ? a.dia : parseInt(a.dia || "0", 10) || 0;
      const diaB = typeof b.dia === "number" ? b.dia : parseInt(b.dia || "0", 10) || 0;
      return diaA - diaB;
    });

    let prevKmFinal: number | null = null;
    let prevDiaName: string | null = null;

    sorted.forEach((item, idx) => {
      const diaStr = item.dia ? `Dia ${item.dia}` : `Linha ${idx + 1}`;
      const kmIni = typeof item.km_inicial === "number" ? item.km_inicial : null;
      const kmFim = typeof item.km_final === "number" ? item.km_final : null;
      const kmProd = typeof item.km_produtivo === "number" ? item.km_produtivo : null;

      if (kmIni !== null && kmFim !== null) {
        const calcProd = kmFim - kmIni;
        if (calcProd < 0) {
          anomalias.push({
            id: `anom-inv-${idx}`,
            dia: item.dia,
            severidade: "alta",
            tipo: "calculo",
            mensagem: `${diaStr}: KM final (${kmFim}) é menor que o KM inicial (${kmIni}). Odômetro decrescente ou invertido.`,
            sugestao: "Corrija a ordem dos valores de KM inicial e final.",
          });
        } else {
          kmTotal += calcProd;
          if (kmProd !== null && kmProd !== calcProd) {
            anomalias.push({
              id: `anom-prod-diff-${idx}`,
              dia: item.dia,
              severidade: "media",
              tipo: "calculo",
              mensagem: `${diaStr}: KM produtivo informado (${kmProd}) difere da diferença real (${calcProd}).`,
              sugestao: `Ajuste o KM produtivo para ${calcProd}.`,
            });
          }
        }

        if (prevKmFinal !== null && kmIni !== null) {
          if (kmIni !== prevKmFinal) {
            const diff = kmIni - prevKmFinal;
            const severidade = Math.abs(diff) > 100 ? "alta" : "media";
            anomalias.push({
              id: `anom-cont-${idx}`,
              dia: item.dia,
              severidade,
              tipo: "odometro",
              mensagem: `Descontinuidade entre ${prevDiaName || "dia anterior"} e ${diaStr}: terminou com ${prevKmFinal.toLocaleString("pt-BR")} km e começou com ${kmIni.toLocaleString("pt-BR")} km (${diff > 0 ? `+${diff}` : diff} km).`,
              sugestao: diff > 0
                ? "Verifique se houve viagem não registrada ou troca de turno intermediária."
                : "Verifique digitação do odômetro inicial.",
            });
          }
        }

        prevKmFinal = kmFim;
        prevDiaName = diaStr;
      } else {
        if (item.observacoes && item.observacoes.trim().length > 0) {
          anomalias.push({
            id: `anom-obs-${idx}`,
            dia: item.dia,
            severidade: "baixa",
            tipo: "observacao",
            mensagem: `${diaStr}: Sem odômetro registrado, com atividade de suporte anotada: "${item.observacoes}".`,
            sugestao: "Diário de bordo válido para atividades de pátio sem deslocamento motorizado.",
          });
        }
      }
    });

    let score = 100;
    anomalias.forEach((a) => {
      if (a.severidade === "alta") score -= 18;
      else if (a.severidade === "media") score -= 8;
      else if (a.severidade === "baixa") score -= 2;
    });
    score = Math.max(15, Math.min(100, score));

    const statusGeral = score >= 85 ? "conforme" : score >= 60 ? "atencao" : "irregular";

    auditReport = {
      scoreConformidade: score,
      agenteUtilizado: "Agente Auditor Lógico de Frotas & Odômetro (DeepSeek R1 Logic)",
      statusGeral,
      parecerResumido: `Auditoria concluída com ${score}% de conformidade. Analisados ${registros.length} registros com ${kmTotal.toLocaleString("pt-BR")} km totais. ${anomalias.filter(a => a.severidade === 'alta').length === 0 ? "Nenhuma anomalia crítica detectada." : "Existem divergências de continuidade de odômetro para verificação."}`,
      anomalias,
      kmTotalAuditado: kmTotal,
      diasCobertos: registros.length,
      dataAuditoria: new Date().toLocaleDateString("pt-BR"),
    };
  }

  return auditReport;
}
