/**
 * Client-side image compression utility using HTML5 Canvas.
 * Ensures images never exceed Firestore document size limits (1MB)
 * while maintaining crisp resolution and clarity for retina displays.
 */

export async function compressImageFile(
  file: File | Blob,
  maxDimension: number = 1000,
  quality: number = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        reject(new Error('Empty image data.'));
        return;
      }
      compressDataUrl(src, maxDimension, quality)
        .then(resolve)
        .catch(reject);
    };
    reader.readAsDataURL(file);
  });
}

export async function compressDataUrl(
  dataUrl: string,
  maxDimension: number = 1000,
  quality: number = 0.78
): Promise<string> {
  // If it's a web URL (http/https), return as is
  if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) {
    return dataUrl;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onerror = () => reject(new Error('Failed to load image for compression.'));
    img.onload = () => {
      let { width, height } = img;

      // Calculate constrained dimensions preserving aspect ratio
      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback: return original if canvas context unavailable
        resolve(dataUrl);
        return;
      }

      // Fill white background in case of transparent PNGs
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Output as optimized JPEG
      let compressed = canvas.toDataURL('image/jpeg', quality);

      // If still large (> 600KB), perform second pass with lower quality
      if (compressed.length > 800000) {
        compressed = canvas.toDataURL('image/jpeg', 0.6);
      }

      resolve(compressed);
    };
    img.src = dataUrl;
  });
}
