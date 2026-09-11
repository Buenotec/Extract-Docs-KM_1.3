import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Eye,
  EyeOff,
  Maximize2,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Sliders,
  SunMedium,
  CheckCircle2,
} from 'lucide-react';
import { UploadedFileItem } from '../types';

interface DocumentComparisonViewerProps {
  file?: UploadedFileItem | null;
  onOpenFullScreen?: () => void;
  defaultVisible?: boolean;
}

export function DocumentComparisonViewer({
  file,
  onOpenFullScreen,
  defaultVisible = true,
}: DocumentComparisonViewerProps) {
  const [isVisible, setIsVisible] = useState<boolean>(defaultVisible);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [fitWidth, setFitWidth] = useState<boolean>(true);

  const fileName = file?.name || 'Documento Original';
  const previewUrl = file?.previewUrl || file?.base64;
  const isPdf = file?.type === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setHighContrast(false);
    setFitWidth(true);
  };

  return (
    <div className="rounded-2xl border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm overflow-hidden transition-all">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-stone-100 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            {isPdf ? <FileText className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                Comparativo Visual com o Documento Original
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono font-semibold shrink-0">
                {fileName}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
              Confira caligrafia, números de odômetro, placas e anotações contra os dados extraídos acima
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Toggle Exibir / Ocultar */}
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              isVisible
                ? 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700 hover:bg-stone-300'
                : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-xs'
            }`}
          >
            {isVisible ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Ocultar Imagem</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Exibir Imagem</span>
              </>
            )}
          </button>

          {isVisible && !isPdf && previewUrl && (
            <>
              {/* Zoom Controls */}
              <div className="inline-flex items-center rounded-xl bg-stone-200 dark:bg-stone-800 p-0.5 border border-stone-300 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => {
                    setFitWidth(false);
                    setZoom((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))));
                  }}
                  className="p-1 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-lg text-stone-700 dark:text-stone-300 transition"
                  title="Reduzir Zoom (-)"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono px-2 text-stone-700 dark:text-stone-200 min-w-[42px] text-center select-none font-semibold">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setFitWidth(false);
                    setZoom((z) => Math.min(3, Number((z + 0.15).toFixed(2))));
                  }}
                  className="p-1 hover:bg-stone-300 dark:hover:bg-stone-700 rounded-lg text-stone-700 dark:text-stone-300 transition"
                  title="Aumentar Zoom (+)"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Ajustar à largura */}
              <button
                type="button"
                onClick={() => {
                  setFitWidth(!fitWidth);
                  if (!fitWidth) setZoom(1);
                }}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition ${
                  fitWidth
                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                    : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                }`}
                title="Ajustar imagem à largura máxima da tela"
              >
                Ajustar Largura
              </button>

              {/* Rotate Button */}
              <button
                type="button"
                onClick={handleRotate}
                className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
                title={`Girar 90° (Atual: ${rotation}°)`}
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              {/* High Contrast / Invert */}
              <button
                type="button"
                onClick={() => setHighContrast(!highContrast)}
                className={`p-1.5 rounded-xl border transition ${
                  highContrast
                    ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                    : 'bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                }`}
                title="Alto contraste / Realce de escrita a lápis e caneta"
              >
                <SunMedium className="w-3.5 h-3.5" />
              </button>

              {/* Reset Button */}
              {(zoom !== 1 || rotation !== 0 || highContrast || !fitWidth) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition"
                  title="Restaurar zoom e orientação original"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          )}

          {/* Open Full Screen Modal */}
          {onOpenFullScreen && (
            <button
              type="button"
              onClick={onOpenFullScreen}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-semibold transition"
              title="Abrir em tela cheia / janela dedicada"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tela Cheia</span>
            </button>
          )}
        </div>
      </div>

      {/* Viewer Area */}
      {isVisible ? (
        <div className="relative bg-stone-900 dark:bg-black/95 border-t border-stone-200 dark:border-stone-800">
          <div className="overflow-auto max-h-[720px] p-4 flex items-center justify-center select-none no-scrollbar">
            {previewUrl ? (
              isPdf ? (
                <iframe
                  src={previewUrl}
                  title={fileName}
                  className="w-full h-[650px] rounded-lg border border-stone-700 bg-white"
                />
              ) : (
                <div
                  className={`transition-all duration-200 flex items-center justify-center ${
                    fitWidth ? 'w-full' : 'max-w-none'
                  }`}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                  }}
                >
                  <img
                    src={previewUrl}
                    alt={fileName}
                    style={{
                      transform: fitWidth ? `scale(${zoom})` : `scale(${zoom})`,
                      transformOrigin: 'top center',
                      filter: highContrast
                        ? 'contrast(1.6) brightness(0.9) saturate(1.2)'
                        : 'none',
                    }}
                    className={`rounded-lg shadow-2xl transition-all duration-150 border border-stone-700 bg-white ${
                      fitWidth ? 'w-full object-contain' : 'max-w-none'
                    }`}
                  />
                </div>
              )
            ) : (
              <div className="py-16 text-center text-stone-400 space-y-2">
                <FileText className="w-12 h-12 mx-auto text-stone-600" />
                <p className="text-sm font-semibold">Nenhuma imagem carregada no momento.</p>
                <p className="text-xs text-stone-500">
                  Envie uma folha de apontamento no Passo 1 ou selecione um documento de exemplo para visualizar.
                </p>
              </div>
            )}
          </div>

          {/* Sub-bar footer guidance */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-stone-950 border-t border-stone-800 text-[11px] text-stone-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Use este comparador para validar números manuscritos e carimbos contra as linhas da tabela acima.</span>
            </span>
            <div className="flex items-center gap-3">
              {rotation !== 0 && (
                <span className="text-amber-400 font-mono">Rotação: {rotation}°</span>
              )}
              {highContrast && (
                <span className="text-emerald-400 font-mono">Realce de Contraste Ativo</span>
              )}
              <span className="text-stone-500 font-mono">{Math.round(zoom * 100)}%</span>
            </div>
          </div>
        </div>
      ) : (
        /* Collapsed summary strip */
        <div className="px-4 py-3 bg-stone-50 dark:bg-stone-900/40 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-stone-400" />
            <span>
              O visualizador comparativo do documento (<strong>{fileName}</strong>) está oculto.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsVisible(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            Exibir Imagem Abaixo da Tabela
          </button>
        </div>
      )}
    </div>
  );
}
