/**
 * Utilitário de requisição segura para a API.
 * Evita o erro 'Unexpected token <, "<!DOCTYPE "... is not valid JSON'
 * identificando respostas HTML de servidores estáticos (ex: Netlify sem functions ou rota 404)
 * e exibindo mensagens claras e orientativas para o usuário.
 */

export async function postApiJson<T = any>(endpoint: string, payload: any): Promise<T> {
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (netErr: any) {
    throw new Error(
      `Falha de conexão com o servidor ao chamar ${endpoint}: ${netErr?.message || 'Verifique sua conexão de rede.'}`
    );
  }

  const responseText = await response.text();

  let data: any;
  try {
    data = JSON.parse(responseText);
  } catch {
    const isHtml =
      responseText.trim().startsWith('<!DOCTYPE') ||
      responseText.includes('<html') ||
      responseText.includes('<head') ||
      (response.headers.get('content-type') || '').includes('text/html');

    if (isHtml) {
      if (response.status === 404) {
        throw new Error(
          `A rota ${endpoint} não foi encontrada (Erro 404 - Página HTML retornada). No Netlify, verifique se os arquivos 'netlify.toml' e 'netlify/functions' estão no seu repositório GitHub e se a variável GEMINI_API_KEY foi adicionada em Site configuration > Environment variables.`
        );
      }
      throw new Error(
        `O servidor retornou uma página HTML em vez de JSON (Status ${response.status}). No Netlify, isso indica que as Netlify Functions não foram acionadas. Certifique-se de configurar a variável GEMINI_API_KEY no painel do Netlify.`
      );
    }

    throw new Error(`Resposta inválida do servidor (${response.status}): ${responseText.slice(0, 150)}`);
  }

  if (!response.ok || data?.success === false) {
    let errMsg = data?.error || `Falha na requisição para ${endpoint} (Status ${response.status})`;
    try {
      if (typeof errMsg === 'string' && errMsg.trim().startsWith('{')) {
        const parsed = JSON.parse(errMsg);
        if (parsed?.error?.message) {
          errMsg = parsed.error.message;
        }
      }
    } catch {
      // keep errMsg
    }
    throw new Error(errMsg);
  }

  return data;
}
