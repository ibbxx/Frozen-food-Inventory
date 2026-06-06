import type { PostgrestError } from "@supabase/supabase-js";

const DATABASE_CONFIG_MESSAGE =
  "Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY sebelum menjalankan Momqill.";

function isPostgrestError(error: unknown): error is PostgrestError {
  return Boolean(
    error &&
      typeof error === "object" &&
      "message" in error &&
      typeof error.message === "string" &&
      "code" in error,
  );
}

function extractDatabaseDetail(error: unknown): string {
  if (error instanceof TypeError && error.message.toLowerCase().includes("fetch")) {
    return "Koneksi internet sedang tidak stabil. Coba lagi dalam beberapa detik.";
  }

  if (isPostgrestError(error)) {
    const normalizedMessage = error.message.toLowerCase();

    if (normalizedMessage.includes("not authenticated")) {
      return "Sesi login tidak ditemukan. Silakan login ulang.";
    }

    if (normalizedMessage.includes("insufficient stock")) {
      return "Stok tidak mencukupi untuk memproses transaksi keluar.";
    }

    if (normalizedMessage.includes("product not found")) {
      return "Produk yang dipilih tidak ditemukan di database.";
    }

    if (
      normalizedMessage.includes("permission denied") ||
      normalizedMessage.includes("row-level security")
    ) {
      return "Akun ini tidak memiliki izin untuk operasi tersebut.";
    }

    if (normalizedMessage.includes("duplicate key")) {
      return "Data yang sama sudah ada. Periksa kembali input sebelum menyimpan.";
    }

    if (error.details) {
      return `${error.message} (${error.details})`;
    }

    return error.message;
  }

  if (error instanceof Error) {
    const normalizedMessage = error.message.toLowerCase();

    if (
      normalizedMessage.includes("network") ||
      normalizedMessage.includes("failed to fetch")
    ) {
      return "Koneksi internet sedang tidak stabil. Coba lagi dalam beberapa detik.";
    }

    return error.message;
  }

  return "Terjadi kesalahan database yang tidak dikenal.";
}

export function createDatabaseError(operation: string, error: unknown): Error {
  return new Error(`Gagal ${operation}. ${extractDatabaseDetail(error)}`);
}

export function createMissingDatabaseConfigError(): Error {
  return new Error(DATABASE_CONFIG_MESSAGE);
}
