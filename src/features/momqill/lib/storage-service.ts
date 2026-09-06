import { momqillSupabase } from "./supabase";

export const PRODUCT_IMAGES_BUCKET = "product-images";

/**
 * Mengekstrak path file di dalam Supabase Storage bucket dari URL publik atau signed URL.
 * Contoh input: "https://xyz.supabase.co/storage/v1/object/public/product-images/products/123-abc.webp"
 * Output: "products/123-abc.webp"
 */
export function extractStoragePath(imageUrl: string | null | undefined): string | null {
  if (!imageUrl || typeof imageUrl !== "string") {
    return null;
  }

  // Deteksi public object URL
  const publicSegment = `/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/`;
  const publicIndex = imageUrl.indexOf(publicSegment);
  if (publicIndex !== -1) {
    const rawPath = imageUrl.slice(publicIndex + publicSegment.length);
    const cleanPath = rawPath.split("?")[0];
    return decodeURIComponent(cleanPath);
  }

  // Deteksi signed object URL
  const signSegment = `/storage/v1/object/sign/${PRODUCT_IMAGES_BUCKET}/`;
  const signIndex = imageUrl.indexOf(signSegment);
  if (signIndex !== -1) {
    const rawPath = imageUrl.slice(signIndex + signSegment.length);
    const cleanPath = rawPath.split("?")[0];
    return decodeURIComponent(cleanPath);
  }

  return null;
}

/**
 * Memeriksa apakah URL gambar berasal dari bucket Supabase Storage proyek ini.
 */
export function isSupabaseStorageUrl(imageUrl: string | null | undefined): boolean {
  return extractStoragePath(imageUrl) !== null;
}

/**
 * Mengunggah file gambar ke bucket Supabase Storage.
 * Mengembalikan public URL dari file yang diunggah.
 */
export async function uploadProductImage(file: File): Promise<string> {
  if (!momqillSupabase) {
    throw new Error("Koneksi database Supabase belum tersedia.");
  }

  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30);

  const ext = file.type === "image/webp" ? "webp" : "jpg";
  const filePath = `products/${timestamp}-${cleanBaseName || "product"}-${randomSuffix}.${ext}`;

  const { data, error } = await momqillSupabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(filePath, file, {
      contentType: file.type || "image/webp",
      upsert: false,
    });

  if (error) {
    throw new Error(`Gagal mengunggah foto ke storage: ${error.message}`);
  }

  const { data: publicUrlData } = momqillSupabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
}

/**
 * Menghapus file foto produk dari Supabase Storage jika berasal dari bucket proyek ini.
 * Jika URL eksternal (misal Unsplash), fungsi mengabaikannya dengan aman.
 */
export async function deleteProductImageFromStorage(
  imageUrl: string | null | undefined,
): Promise<boolean> {
  if (!imageUrl || !momqillSupabase) {
    return false;
  }

  const storagePath = extractStoragePath(imageUrl);
  if (!storagePath) {
    // Bukan file storage di bucket ini (misal link eksternal)
    return false;
  }

  try {
    const { error } = await momqillSupabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove([storagePath]);

    if (error) {
      console.warn("Peringatan saat menghapus foto dari storage:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn("Kesalahan saat menghapus foto dari storage:", err);
    return false;
  }
}
