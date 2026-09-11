import { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Sparkles,
  Calendar,
  Calculator,
  Moon,
  HelpCircle,
  CheckCircle2,
  Camera,
  Target,
  AlertTriangle,
  Zap,
  Brain,
  ShieldCheck,
  Search,
  Check,
  ArrowRight,
  TrendingUp,
  PenTool,
} from 'lucide-react';

interface QuickHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'tutorial' | 'accuracy' | 'features';

export function QuickHelpModal({ isOpen, onClose }: QuickHelpModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('tutorial');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl text-stone-900 dark:text-stone-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <HelpCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Central de Ajuda, Precisão & Guia de Uso
              </h3>
              <p className="text-xs text-stone-500">
                Tudo o que você precisa saber sobre a leitura de diários de bordo, precisão e conferência
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/60 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('tutorial')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'tutorial'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Passo a Passo (Como Usar)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('accuracy')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'accuracy'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Precisão & Força do OCR (% de Erro)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 border-b-2 ${
              activeTab === 'features'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dicas do Excel & Atalhos</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 text-xs space-y-4">
          {/* TAB 1: TUTORIAL PASSO A PASSO */}
          {activeTab === 'tutorial' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 text-blue-900 dark:text-blue-200">
                <p className="font-semibold text-xs leading-relaxed">
                  O sistema foi desenhado para substituir a digitação manual de cadernos de bordo por uma <strong>conferência rápida assistida por IA</strong>. Em vez de 20 minutos digitando linha por linha, você conclui a folha em menos de 1 minuto.
                </p>
              </div>

              <div className="space-y-3">
                {/* Step 1 */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs mb-1 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-blue-500" />
                      Capturar ou Enviar a Folha (Imagem ou PDF)
                    </h4>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                      Envie uma foto do celular, imagem escaneada (PNG, JPG, WebP) ou arquivo PDF do diário de bordo.
                    </p>
                    <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-300">
                      <strong>Dica para foto perfeita:</strong> Apoie a folha em mesa plana, fotografe de cima (sem inclinação) e evite a sombra do celular sobre as linhas de quilometragem.
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs mb-1 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-purple-500" />
                      Escolher o Modelo de IA Adequado
                    </h4>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                      No topo da tela você encontra o <strong>Seletor de Agentes</strong>:
                    </p>
                    <ul className="mt-1.5 space-y-1 text-[11px] text-stone-600 dark:text-stone-400 list-disc list-inside">
                      <li><strong>Gemini 2.5 Flash (Padrão):</strong> Para fotos nítidas e boa iluminação (resposta em segundos).</li>
                      <li><strong>Gemini 2.5 Pro:</strong> Para caligrafias difíceis, caneta desgastada ou folhas dobradas.</li>
                      <li><strong>DeepSeek R1 / V3:</strong> Para auditoria de odômetro e consistência matemática.</li>
                    </ul>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs mb-1 flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-emerald-500" />
                      Conferência Rápida na Tabela Interativa
                    </h4>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                      A tabela exibe todos os registros (Dia, Data, Frota, Motorista, KM Inicial, KM Final, KM Produtivo, Fazenda e Observações). Você pode:
                    </p>
                    <ul className="mt-1.5 space-y-1 text-[11px] text-stone-600 dark:text-stone-400 list-disc list-inside">
                      <li>Clicar em <strong>&quot;Recalcular KM&quot;</strong> para corrigir instantaneamente qualquer erro de conta do motorista.</li>
                      <li>Usar a barra de busca rápida para localizar placas ou motoristas específicos.</li>
                      <li>Dar duplo clique ou clicar em qualquer célula para corrigir algum número se necessário.</li>
                      <li>
                        <strong>Folhinha totalmente ilegível?</strong> Tratamos como <em>adivinhação/média</em>: calcule a média com base nos dias anterior e posterior e digite o valor estimado diretamente na célula com observação.
                      </li>
                      <li className="mt-1 pt-1 border-t border-stone-200/60 dark:border-stone-700/60 text-amber-900 dark:text-amber-300">
                        <strong>Dificuldade com garranchos e &quot;letra feita&quot;:</strong> Quando as anotações tiverem traços rápidos, números deformados ou caligrafia difícil, clique no ícone de visualização na tabela para comparar com a imagem original lado a lado. Caso a folha tenha muitos garranchos, use o agente <strong>Gemini 2.5 Pro</strong>.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-500" />
                      Preenchimento Automático de Mês & Ano
                    </h4>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                      Geralmente os motoristas anotam apenas o dia (1 a 31). Selecione o <strong>Mês</strong> e o <strong>Ano</strong> na barra superior da tabela e clique em <strong>&quot;Preencher Datas&quot;</strong>: o sistema cria a data completa (ex: <em>15/03/2026</em>) e descobre o dia da semana automaticamente.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    5
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-xs mb-1 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      Copiar Direto para o Excel (Ctrl+V) ou Baixar CSV
                    </h4>
                    <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                      Clique em <strong>&quot;Copiar para Excel&quot;</strong>, abra sua planilha e aperte <strong>Ctrl+V</strong>: todos os dados colam perfeitamente divididos em colunas, prontos para faturamento ou folha.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRECISÃO, FORÇA DO OCR E PERCENTUAL DE ERRO */}
          {activeTab === 'accuracy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-xs mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  Qual é a força e a precisão na leitura das folhinhas?
                </h4>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed mt-1">
                  Diferente de softwares de OCR tradicionais dos anos 2000 (que só liam letras de computador perfeitamente impressas e erravam 80% das fichas manuscritas), este sistema utiliza <strong>Visão Multimodal de Última Geração (Gemini 2.5 / DeepSeek / Claude)</strong>.
                </p>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed mt-1">
                  A IA não apenas olha traço por traço da caneta: ela compreende o <strong>contexto de uma ficha de frota</strong> (sabe que um odômetro é uma sequência lógica de números, que dias vão de 1 a 31 e que placas seguem o padrão brasileiro Mercosul ou antigo).
                </p>
              </div>

              {/* Benchmarks Matrix */}
              <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
                <div className="bg-stone-100 dark:bg-stone-800 px-3.5 py-2 font-bold text-xs text-stone-800 dark:text-stone-200 border-b border-stone-200 dark:border-stone-800">
                  Tabela de Precisão e Taxa de Erro Estimada por Situação
                </div>
                <div className="divide-y divide-stone-100 dark:divide-stone-800 text-[11px]">
                  <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white dark:bg-stone-900">
                    <div>
                      <span className="font-bold text-stone-900 dark:text-stone-100 block">
                        Ficha Impressa / Digitada
                      </span>
                      <span className="text-stone-500">Relatórios de sistema, tabelas emitidas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                        98% a 99.5% de Precisão
                      </span>
                    </div>
                    <div className="text-stone-500">
                      Taxa de erro de <strong>0.5% a 2%</strong> (quase nula, apenas eventuais caracteres desbotados).
                    </div>
                  </div>

                  <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white dark:bg-stone-900">
                    <div>
                      <span className="font-bold text-stone-900 dark:text-stone-100 block">
                        Manuscrito Padrão Nítido
                      </span>
                      <span className="text-stone-500">Caneta esferográfica, foto boa e sem sombra</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">
                        93% a 97% de Precisão
                      </span>
                    </div>
                    <div className="text-stone-500">
                      Taxa de erro de <strong>3% a 7%</strong> em números. Nomes cursivos complexos podem exigir ajuste.
                    </div>
                  </div>

                  <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white dark:bg-stone-900">
                    <div>
                      <span className="font-bold text-stone-900 dark:text-stone-100 block">
                        Garrancho, Letra Feia ou &quot;Letra Feita&quot;
                      </span>
                      <span className="text-stone-500">Traços rápidos no volante, caneta desgastada, números deformados (1 vs 7, 4 vs 9, 3 vs 8)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold">
                        82% a 91% de Precisão
                      </span>
                    </div>
                    <div className="text-stone-500">
                      Taxa de erro de <strong>9% a 18%</strong>. A IA deduz pela lógica de progressão do odômetro, mas exige conferência visual humana. Recomendado usar <strong>Gemini 2.5 Pro</strong>.
                    </div>
                  </div>

                  <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-red-50/40 dark:bg-red-950/20">
                    <div>
                      <span className="font-bold text-red-900 dark:text-red-300 block">
                        Folha Sem Legibilidade / Destruída
                      </span>
                      <span className="text-stone-500">Molhada, tinta sumida, mancha total, rasgada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold">
                        Sem Leitura Viável (0%)
                      </span>
                    </div>
                    <div className="text-stone-600 dark:text-stone-400">
                      Tratado como <strong>Adivinhação / Média</strong>. Exige critério operacional do auditor (veja regras abaixo).
                    </div>
                  </div>
                </div>
              </div>

              {/* Dificuldade Real: Garranchos, Letra Feia e Letra Feita */}
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-blue-950 dark:text-blue-200 text-xs flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    Dificuldade de Leitura por Garrancho, Letra Feia e Caligrafia Manual (&quot;Letra Feita&quot;)
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 font-semibold">
                    Guia Prático do Conferente
                  </span>
                </div>

                <div className="space-y-2.5 text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                  <p>
                    Em rotinas de campo e transporte, a folhinha de bordo quase nunca é preenchida com caligrafia escolar perfeita. O motorista escreve com pressa na cabine, apoiado no volante, com trepidação da estrada ou usando caneta esferográfica desgastada com falhas de tinta. Isso gera <strong>garranchos</strong>, <strong>letra feia</strong> e a chamada <strong>&quot;letra feita&quot;</strong> (quando a pessoa reforça traços sobrepostos ou deforma o desenho natural da letra).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="p-3 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 space-y-1.5">
                      <strong className="text-stone-900 dark:text-stone-100 block font-semibold text-xs text-amber-700 dark:text-amber-400">
                        Principais armadilhas e confusões visuais:
                      </strong>
                      <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400">
                        <li><strong>Dígito 1 vs. 7:</strong> Traço inicial inclinado ou traço horizontal cortado que se confunde facilmente.</li>
                        <li><strong>Dígito 4 vs. 9:</strong> Topo fechado ou haste encurtada pela pressa do preenchimento.</li>
                        <li><strong>Dígito 3 vs. 5 vs. 8:</strong> Curvaturas incompletas ou laçadas fechadas que transformam 3 em 8.</li>
                        <li><strong>Dígito 0 vs. 6:</strong> Espirais rápidas que parecem a perna de um seis.</li>
                        <li><strong>Nomes e Fazendas Cursivas:</strong> Letra emendada com abreviações locais dos motoristas.</li>
                      </ul>
                    </div>

                    <div className="p-3 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 space-y-1.5">
                      <strong className="text-stone-900 dark:text-stone-100 block font-semibold text-xs text-blue-700 dark:text-blue-400">
                        Como a IA e você resolvem o problema:
                      </strong>
                      <ul className="list-disc list-inside space-y-1 text-stone-600 dark:text-stone-400">
                        <li><strong>Raciocínio Contextual do Odômetro:</strong> Diferente de OCRs antigos que leem letras isoladas, a IA cruza o KM do dia anterior com o posterior. Se um garrancho parece &quot;145.720&quot; ou &quot;145.120&quot;, ela escolhe o número que respeita a progressão matemática real.</li>
                        <li><strong>Mudar para o Gemini 2.5 Pro:</strong> Folha com muito garrancho? Selecione o <em>Gemini 2.5 Pro</em> no Seletor de Agentes — ele possui maior poder de resolução para caligrafias complexas.</li>
                        <li><strong>Conferência com a Foto Lado a Lado:</strong> Clique no botão de visualização da foto para conferir a linha duvidosa em alta definição.</li>
                        <li><strong>Edição em 2 Segundos:</strong> Dê clique duplo em qualquer célula da tabela para digitar o número correto se necessário.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice regarding unreadable sheets / adivinhação vs média */}
              <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30">
                <h4 className="font-bold text-amber-950 dark:text-amber-200 text-xs mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  Regra Operacional para Folhinhas Sem Legibilidade (Adivinhação vs. Média)
                </h4>
                <div className="space-y-2 text-stone-700 dark:text-stone-300 leading-relaxed">
                  <p>
                    Quando uma folhinha ou linha está <strong>completamente ilegível</strong> (tinta desbotada pelo sol, papel molhado por chuva, graxa ou rasuras totais), <strong>não há possibilidade técnica de leitura ótica</strong>. Tentar inventar ou forçar um número é considerado <em>adivinhação arbitrária</em> e compromete a auditoria da frota.
                  </p>
                  <div className="p-2.5 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-amber-200 dark:border-amber-900/60 space-y-1.5 text-[11px]">
                    <span className="font-bold text-stone-900 dark:text-stone-100 block">
                      Como proceder com a regra de Média / Estimativa Técnica:
                    </span>
                    <ul className="space-y-1 list-disc list-inside text-stone-600 dark:text-stone-400">
                      <li>
                        <strong>Checagem de Continuidade:</strong> Pegue o <em>KM Final</em> do último dia legível antes da falha e o <em>KM Inicial</em> do próximo dia legível. A diferença entre eles é o KM total real rodado no intervalo.
                      </li>
                      <li>
                        <strong>Aplicação da Média da Rota:</strong> Divida essa quilometragem pela quantidade de dias sem leitura para preencher com a média diária correta.
                      </li>
                      <li>
                        <strong>Registro Transparente:</strong> Dê clique duplo na célula da tabela para inserir a média apurada e adicione na coluna de Observação: <em>&quot;KM estimado por média operacional (folha original ilegível)&quot;</em>.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Error Safeguards */}
              <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20">
                <h4 className="font-bold text-blue-950 dark:text-blue-200 text-xs mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Como o sistema te protege contra qualquer erro residual:
                </h4>
                <div className="space-y-2 text-stone-700 dark:text-stone-300">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                    <span><strong>Auditoria Matemática em Tempo Real:</strong> O sistema detecta se KM Inicial &gt; KM Final ou se houve salto anormal de odômetro, destacando a linha em alerta.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                    <span><strong>Recálculo de 1 Clique:</strong> Corrige erros clássicos de motoristas que erraram a conta de subtração na folha de papel.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                    <span><strong>Conferência com Imagem Lado a Lado:</strong> O botão de zoom abre a foto original para você tirar qualquer dúvida sem sair da página.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DICAS DO EXCEL E ATALHOS */}
          {activeTab === 'features' && (
            <div className="space-y-3">
              {/* Excel Card */}
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20">
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2 mb-1">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Cópia sem complicação para o Excel (Ctrl+V)
                </h4>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                  Clique no botão verde <strong>&quot;Copiar para o Excel&quot;</strong> ou selecione as células e aperte <strong>Ctrl+C</strong>.
                  O sistema formata os dados com suporte simultâneo a tabela HTML e tabulação TSV. No Excel, basta selecionar qualquer célula (ex: A1) e teclar <strong>Ctrl+V</strong>: as colunas mantêm alinhamento numérico e textos corretos.
                </p>
              </div>

              {/* Date Completion */}
              <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20">
                <h4 className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Preenchimento Inteligente de Datas
                </h4>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                  Fichas de controle costumam trazer apenas o número do dia (ex: 12, 13, 14...). Use a barra de preenchimento automático para selecionar o <strong>Mês</strong> e o <strong>Ano</strong> desejados. Com 1 clique, as colunas <em>Data Completa</em> (ex: 12/03/2026) e <em>Dia da Semana</em> (ex: Quinta-feira) são calculadas instantaneamente.
                </p>
              </div>

              {/* KM Recalculation */}
              <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20">
                <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2 mb-1">
                  <Calculator className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Recálculo Automático de KM Produtivo
                </h4>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed">
                  Erros de subtração na folha de papel são comuns. O botão <strong>&quot;Recalcular KM Produtivo&quot;</strong> calcula automaticamente a diferença matemática (<em>KM Final - KM Inicial</em>) para todas as linhas e atualiza o somatório total da frota.
                </p>
              </div>

              {/* Keyboard Shortcuts */}
              <div className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40">
                <h4 className="font-bold text-stone-900 dark:text-stone-200 flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  Atalhos de Teclado Úteis
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                    <span>Copiar dados da tabela</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono font-bold text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600">Ctrl + C</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                    <span>Colar na planilha</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono font-bold text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600">Ctrl + V</kbd>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                    <span>Editar célula da tabela</span>
                    <span className="font-semibold text-stone-600 dark:text-stone-400">Clique duplo</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
                    <span>Salvar edição de célula</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 font-mono font-bold text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-600">Enter / Tab</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-stone-500">
            Dúvida durante a conferência? Você sempre pode abrir este guia no botão <strong>&quot;Ajuda & Dicas&quot;</strong>.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Entendi, fechar
          </button>
        </div>
      </div>
    </div>
  );
}
