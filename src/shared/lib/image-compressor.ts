export interface ImageCompressionOptions {
  initialQuality?: number;
  maxHeight?: number;
  maxSizeBytes?: number;
  maxWidth?: number;
  mimeType?: "image/webp" | "image/jpeg";
}

export interface CompressedImageResult {
  compressedSize: number;
  compressionRatio: number;
  file: File;
  height: number;
  originalSize: number;
  previewUrl: string;
  width: number;
}

const DEFAULT_MAX_SIZE_BYTES = 500 * 1024; // 500 KB
const DEFAULT_MAX_WIDTH = 1600;
const DEFAULT_MAX_HEIGHT = 1600;
const QUALITY_STEPS = [0.85, 0.75, 0.65, 0.5, 0.35];

/**
 * Format ukuran byte ke representasi yang mudah dibaca (KB / MB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

function calculateDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { targetHeight: number; targetWidth: number } {
  let targetWidth = width;
  let targetHeight = height;

  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const widthRatio = maxWidth / targetWidth;
    const heightRatio = maxHeight / targetHeight;
    const ratio = Math.min(widthRatio, heightRatio);

    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  return { targetHeight, targetWidth };
}

/**
 * Kompresi gambar client-side menggunakan HTML5 Canvas.
 * Menjamin ukuran file berada di bawah batas maksimum (default 500 KB).
 */
export async function compressImage(
  inputFile: File,
  options: ImageCompressionOptions = {},
): Promise<CompressedImageResult> {
  const {
    maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT,
    mimeType = "image/webp",
  } = options;

  const originalSize = inputFile.size;
  const objectUrl = URL.createObjectURL(inputFile);

  try {
    const img = await loadImage(objectUrl);

    let { targetWidth, targetHeight } = calculateDimensions(
      img.naturalWidth || img.width,
      img.naturalHeight || img.height,
      maxWidth,
      maxHeight,
    );

    let canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Gagal menginisialisasi Canvas 2D context.");
    }
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    let bestBlob: Blob | null = null;

    // Iterasi tahap 1: Penyesuaian kualitas kompresi
    for (const quality of QUALITY_STEPS) {
      const blob = await canvasToBlob(canvas, mimeType, quality);
      if (blob) {
        bestBlob = blob;
        if (blob.size <= maxSizeBytes) {
          break;
        }
      }
    }

    // Iterasi tahap 2: Jika masih > maxSizeBytes, perkecil dimensi secara agresif
    let scaleRatio = 0.8;
    while (bestBlob && bestBlob.size > maxSizeBytes && targetWidth > 320 && targetHeight > 320) {
      targetWidth = Math.round(targetWidth * scaleRatio);
      targetHeight = Math.round(targetHeight * scaleRatio);

      const resizedCanvas = document.createElement("canvas");
      resizedCanvas.width = targetWidth;
      resizedCanvas.height = targetHeight;
      const resizedCtx = resizedCanvas.getContext("2d");

      if (!resizedCtx) break;

      resizedCtx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Coba kompresi dengan kualitas menengah ke bawah
      for (const quality of [0.65, 0.5, 0.35]) {
        const blob = await canvasToBlob(resizedCanvas, mimeType, quality);
        if (blob) {
          bestBlob = blob;
          if (blob.size <= maxSizeBytes) {
            break;
          }
        }
      }

      canvas = resizedCanvas;
      scaleRatio *= 0.8;
    }

    if (!bestBlob) {
      throw new Error("Gagal memproses kompresi gambar.");
    }

    const extension = mimeType === "image/webp" ? "webp" : "jpg";
    const baseName = inputFile.name.replace(/\.[^/.]+$/, "");
    const outputFilename = `${baseName}.${extension}`;

    const compressedFile = new File([bestBlob], outputFilename, {
      type: mimeType,
      lastModified: Date.now(),
    });

    const compressedSize = compressedFile.size;
    const compressionRatio =
      originalSize > 0
        ? Math.max(0, Math.round(((originalSize - compressedSize) / originalSize) * 100))
        : 0;

    const previewUrl = URL.createObjectURL(compressedFile);

    return {
      compressedSize,
      compressionRatio,
      file: compressedFile,
      height: targetHeight,
      originalSize,
      previewUrl,
      width: targetWidth,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
