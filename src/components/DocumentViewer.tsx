import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, X, FileText, Image as ImageIcon } from 'lucide-react';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  previewUrl?: string;
  mimeType?: string;
}

export function DocumentViewer({
  isOpen,
  onClose,
  fileName,
  previewUrl,
  mimeType,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1);

  if (!isOpen) return null;

  const isPdf = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative flex flex-col w-full max-w-5xl h-[85vh] bg-stone-900 border border-stone-700 rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-950 border-b border-stone-800 text-stone-200">
          <div className="flex items-center gap-2">
            {isPdf ? <FileText className="w-5 h-5 text-red-400" /> : <ImageIcon className="w-5 h-5 text-emerald-400" />}
            <span className="font-medium text-sm text-stone-100 truncate max-w-md">{fileName}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-stone-800 text-stone-400">Visualização Original</span>
          </div>

          <div className="flex items-center gap-2">
            {!isPdf && (
              <div className="flex items-center gap-1 bg-stone-800 rounded-lg p-1 mr-3 border border-stone-700">
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                  className="p-1 hover:bg-stone-700 text-stone-300 rounded"
                  title="Reduzir Zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-stone-300 px-2 select-none">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                  className="p-1 hover:bg-stone-700 text-stone-300 rounded"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="p-1 hover:bg-stone-700 text-stone-300 rounded ml-1"
                  title="Resetar Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-stone-900/90 select-none">
          {previewUrl ? (
            isPdf ? (
              <iframe
                src={previewUrl}
                title={fileName}
                className="w-full h-full rounded border border-stone-700 bg-white"
              />
            ) : (
              <div className="overflow-auto max-w-full max-h-full flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt={fileName}
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                  className="max-w-full rounded shadow-lg transition-transform duration-150 ease-out border border-stone-700 bg-white"
                />
              </div>
            )
          ) : (
            <div className="text-center text-stone-400 py-12">
              <FileText className="w-12 h-12 mx-auto mb-2 text-stone-600" />
              <p className="text-sm">Pré-visualização visual não disponível para este formato.</p>
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div className="px-4 py-2 bg-stone-950 border-t border-stone-800 flex justify-between items-center text-xs text-stone-400">
          <span>Use este visualizador para conferir caligrafia manuscrita e carimbos contra os dados extraídos.</span>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-300 hover:text-white px-3 py-1 bg-stone-800 rounded hover:bg-stone-700 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
