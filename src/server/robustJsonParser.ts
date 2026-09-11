/**
 * Parser e Reparador Ultrarrobusto de JSON para Extrações de IA.
 * Garante que erros de sintaxe (como aspas duplas ausentes, aspas internas não escapadas,
 * vírgulas extras, truncamento por limite de tokens ou chaves desbalanceadas) sejam corrigidos
 * automaticamente, deixando campos não reconhecidos em branco/nulos sem travar a aplicação.
 */

/**
 * Sanitiza aspas duplas não escapadas dentro de strings JSON.
 * Exemplo: "observacoes": "Troca de "oleo" e filtro" -> "observacoes": "Troca de \"oleo\" e filtro"
 */
export function sanitizeJsonQuotes(input: string): string {
  let result = "";
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (!inString) {
      if (char === '"') {
        inString = true;
      }
      result += char;
    } else {
      if (char === "\\") {
        isEscaped = !isEscaped;
        result += char;
      } else if (char === '"') {
        if (isEscaped) {
          result += char;
          isEscaped = false;
        } else {
          // Verifica se essa aspa é genuinamente o fechamento da string
          // Um fechamento genuíno é seguido por espaços opcionais e: vírgula, }, ], dois-pontos ou quebra de linha/fim
          const lookahead = input.slice(i + 1, i + 30);
          const isRealClose = /^\s*(?:,|}|]|:|\r?\n|$)/.test(lookahead);
          if (isRealClose) {
            inString = false;
            result += char;
          } else {
            // Aspa interna sem escape! Escapamos com \"
            result += '\\"';
          }
        }
      } else {
        isEscaped = false;
        result += char;
      }
    }
  }
  return result;
}

export function repairJsonString(raw: string): string {
  if (!raw || typeof raw !== "string") return "{}";

  // 1. Remover blocos de código markdown (```json ... ``` ou ``` ... ```)
  let text = raw
    .replace(/^```json\s*/im, "")
    .replace(/^```\s*/im, "")
    .replace(/\s*```$/m, "")
    .trim();

  // 2. Extrair apenas o bloco JSON delimitado entre o primeiro { ou [ e o último } ou ]
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  let startIdx = -1;

  if (firstBrace !== -1 && firstBracket !== -1) {
    startIdx = Math.min(firstBrace, firstBracket);
  } else if (firstBrace !== -1) {
    startIdx = firstBrace;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
  }

  if (startIdx !== -1) {
    text = text.slice(startIdx);
  }

  // 3. Sanitizar aspas internas não escapadas dentro de strings
  text = sanitizeJsonQuotes(text);

  // 4. Substituir valores Python/JS não conformes com JSON
  text = text
    .replace(/:\s*None\b/g, ": null")
    .replace(/:\s*True\b/g, ": true")
    .replace(/:\s*False\b/g, ": false")
    .replace(/:\s*NaN\b/g, ": null")
    .replace(/:\s*undefined\b/g, ": null");

  // 5. Remover vírgulas antes de fechamento de chaves ou colchetes: [1, 2,] -> [1, 2]
  text = text.replace(/,\s*([}\]])/g, "$1");

  // 6. Corrigir chaves de propriedades sem aspas: { dia: 1, frota: "46" } -> { "dia": 1, "frota": "46" }
  text = text.replace(/([{,]\s*)([a-zA-Z_0-9$]+)\s*:/g, '$1"$2":');

  // 7. Fechar automaticamente strings ou objetos truncados (se a IA parou no meio do JSON)
  text = balanceAndCloseJson(text);

  return text;
}

/**
 * Fecha strings, objetos e arrays abertos se o JSON foi cortado no meio pela IA.
 */
function balanceAndCloseJson(str: string): string {
  let inString = false;
  let isEscaped = false;
  const stack: string[] = [];

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (inString) {
      if (char === "\\" && !isEscaped) {
        isEscaped = true;
      } else if (char === '"' && !isEscaped) {
        inString = false;
      } else {
        isEscaped = false;
      }
    } else {
      if (char === '"') {
        inString = true;
      } else if (char === "{" || char === "[") {
        stack.push(char);
      } else if (char === "}") {
        if (stack.length > 0 && stack[stack.length - 1] === "{") {
          stack.pop();
        }
      } else if (char === "]") {
        if (stack.length > 0 && stack[stack.length - 1] === "[") {
          stack.pop();
        }
      }
    }
  }

  // Se terminou no meio de uma string, fecha a string primeiro
  let result = str;
  if (inString) {
    result += '"';
  }

  // Se terminou com uma vírgula ou chave incompleta no final (ex: ' "km_final": ' ou ', '), limpa até o último token válido
  result = result.replace(/,\s*$/, "");
  result = result.replace(/:\s*$/, ": null");
  result = result.replace(/,\s*([}\]])/g, "$1");

  // Recalcular pilha para fechar o que faltar
  const closeStack: string[] = [];
  let inStr2 = false;
  let esc2 = false;
  for (let i = 0; i < result.length; i++) {
    const c = result[i];
    if (inStr2) {
      if (c === "\\" && !esc2) esc2 = true;
      else if (c === '"' && !esc2) inStr2 = false;
      else esc2 = false;
    } else {
      if (c === '"') inStr2 = true;
      else if (c === "{" || c === "[") closeStack.push(c);
      else if (c === "}" && closeStack[closeStack.length - 1] === "{") closeStack.pop();
      else if (c === "]" && closeStack[closeStack.length - 1] === "[") closeStack.pop();
    }
  }

  while (closeStack.length > 0) {
    const openChar = closeStack.pop();
    if (openChar === "{") result += "}";
    else if (openChar === "[") result += "]";
  }

  return result;
}

/**
 * Tenta resgatar registros individuais linha a linha quando o JSON global
 * está corrompido demais para ser consertado em bloco.
 */
export function extractIndividualRecords(rawText: string): any[] {
  const records: any[] = [];
  // Padrão para capturar blocos { ... } que contenham propriedades típicas como "dia" ou "km"
  const blockRegex = /\{[^{}]*(?:"dia"|"km_inicial"|"km_final"|"frota"|"motorista")[^{}]*\}/g;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(rawText)) !== null) {
    try {
      const cleanedBlock = repairJsonString(match[0]);
      const obj = JSON.parse(cleanedBlock);
      if (obj && (typeof obj.dia !== "undefined" || typeof obj.km_inicial !== "undefined" || typeof obj.km_final !== "undefined" || obj.frota)) {
        records.push(obj);
      }
    } catch {
      // Tentar regex campo a campo no bloco
      const sub = match[0];
      const diaM = sub.match(/"dia"\s*:\s*(\d+)/);
      const kmIniM = sub.match(/"km_inicial"\s*:\s*(\d+(?:\.\d+)?)/);
      const kmFimM = sub.match(/"km_final"\s*:\s*(\d+(?:\.\d+)?)/);
      const kmProdM = sub.match(/"km_produtivo"\s*:\s*(\d+(?:\.\d+)?)/);
      const frotaM = sub.match(/"frota"\s*:\s*"([^"]*)"/);
      const motoristaM = sub.match(/"motorista"\s*:\s*"([^"]*)"/);
      const obsM = sub.match(/"observacoes"\s*:\s*"([^"]*)"/);

      if (diaM || kmIniM || kmFimM || frotaM) {
        records.push({
          dia: diaM ? parseInt(diaM[1], 10) : null,
          km_inicial: kmIniM ? parseFloat(kmIniM[1]) : null,
          km_final: kmFimM ? parseFloat(kmFimM[1]) : null,
          km_produtivo: kmProdM ? parseFloat(kmProdM[1]) : null,
          frota: frotaM ? frotaM[1] : "",
          motorista: motoristaM ? motoristaM[1] : "",
          observacoes: obsM ? obsM[1] : "",
        });
      }
    }
  }

  return records;
}

/**
 * Função principal de parsing ultrarrobusto.
 * NUNCA lança erro de parsing; se encontrar falhas, tenta reparar em múltiplos níveis.
 * O que não conseguir identificar, deixa os campos em branco/nulos.
 */
export function robustJsonParse<T = any>(rawText: string, fallbackFileName?: string): T {
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    return createEmptyDocument(fallbackFileName) as unknown as T;
  }

  // Nível 1: Tentativa direta de JSON.parse
  try {
    return JSON.parse(rawText) as T;
  } catch {
    // Continua para o Nível 2
  }

  // Nível 2: Limpeza básica de markdown e delimitadores
  try {
    let clean = rawText
      .replace(/^```json\s*/im, "")
      .replace(/^```\s*/im, "")
      .replace(/\s*```$/m, "")
      .trim();
    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      clean = clean.slice(firstBrace, lastBrace + 1);
      return JSON.parse(clean) as T;
    }
  } catch {
    // Continua para o Nível 3
  }

  // Nível 3: Reparador inteligente de aspas, vírgulas e fechamento balanceado
  try {
    const repaired = repairJsonString(rawText);
    const parsed = JSON.parse(repaired);
    if (parsed && typeof parsed === "object") {
      return parsed as T;
    }
  } catch (err3) {
    console.warn("[robustJsonParse] Reparo de nível 3 não completou JSON perfeito:", err3);
  }

  // Nível 4: Resgate de registros individuais linha a linha
  const salvagedRecords = extractIndividualRecords(rawText);
  if (salvagedRecords.length > 0) {
    console.log(`[robustJsonParse] Resgatados ${salvagedRecords.length} registros individuais via parser resiliente.`);
    const emptyDoc = createEmptyDocument(fallbackFileName);
    emptyDoc.registros = salvagedRecords;
    emptyDoc.resumo.total_registros = salvagedRecords.length;
    return emptyDoc as unknown as T;
  }

  // Nível 5: Fallback limpo estruturado (deixa em branco sem crashar)
  console.warn("[robustJsonParse] Nenhum JSON válido identificado. Retornando folha limpa estruturada.");
  return createEmptyDocument(fallbackFileName) as unknown as T;
}

export function createEmptyDocument(fileName?: string) {
  return {
    documento: {
      nome_arquivo: fileName || "documento",
      tipo_documento: "Diário de Bordo / Registro de Frota",
      data_referencia: "",
    },
    registros: [],
    resumo: {
      total_registros: 0,
      total_km_produtivo: 0,
      alertas: [
        "Campos não identificados ou ilegíveis foram mantidos em branco. Você pode preenchê-los manualmente na tabela ou solicitar ajuste via chat.",
      ],
    },
  };
}
