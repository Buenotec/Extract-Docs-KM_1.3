/**
 * Otimiza arquivos de imagem antes do envio para a API.
 * Fotos tiradas por câmeras de celular (8MP - 48MP) geram de 5MB a 20MB em base64,
 * o que estoura o limite de payload de funções serverless (Netlify Functions limita a 6MB).
 * Esta função redimensiona imagens gigantes para no máximo 2048px (mantendo nitidez total
 * para o OCR/Gemini e gerando arquivos leves de ~600KB a 1.2MB).
 */
export async function optimizeFileForExtraction(file: File): Promise<{ base64: string; mimeType: string }> {
  if (file.type === 'application/pdf') {
    const base64 = await readFileAsBase64(file);
    return { base64, mimeType: 'application/pdf' };
  }

  if (!file.type.startsWith('image/')) {
    const base64 = await readFileAsBase64(file);
    return { base64, mimeType: file.type || 'image/png' };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => {
      readFileAsBase64(file).then((b) => resolve({ base64: b, mimeType: file.type || 'image/png' }));
    };
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => resolve({ base64: dataUrl, mimeType: file.type || 'image/png' });
      img.onload = () => {
        const MAX_DIM = 2048;
        let { width, height } = img;

        // If file is already reasonably sized, don't recompress
        if (width <= MAX_DIM && height <= MAX_DIM && file.size < 2 * 1024 * 1024) {
          resolve({ base64: dataUrl, mimeType: file.type || 'image/png' });
          return;
        }

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        try {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve({ base64: dataUrl, mimeType: file.type || 'image/png' });
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve({ base64: optimizedDataUrl, mimeType: 'image/jpeg' });
        } catch {
          resolve({ base64: dataUrl, mimeType: file.type || 'image/png' });
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
