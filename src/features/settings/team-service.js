import { supabase } from "@/shared/lib/supabase";

/**
 * Mengambil semua anggota tim dari database.
 */
export async function fetchTeamMembers() {
  if (!supabase) {
    throw new Error("Koneksi ke database belum dikonfigurasi.");
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message || "Gagal mengambil daftar anggota tim.");
  }

  return data;
}

/**
 * Memperbarui nama lengkap dan peran hak akses anggota tim.
 */
export async function updateTeamMember(userId, { full_name, role }) {
  if (!supabase) {
    throw new Error("Koneksi ke database belum dikonfigurasi.");
  }

  const { data, error } = await supabase
    .from("users")
    .update({ full_name, role })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Gagal memperbarui data anggota tim.");
  }

  return data;
}
