import { supabase } from '../lib/supabase';
import { getStorageItem, setStorageItem } from '../utils/storage';

/**
 * Mengambil daftar ID destinasi favorit user yang tersimpan di Supabase.
 * Prioritas:
 * 1. Tabel user_favorites di Supabase
 * 2. Supabase Auth raw_user_meta_data (cloud per-user di Supabase)
 * 3. LocalStorage fallback per user_id
 */
export const getUserFavorites = async (userId: string): Promise<string[]> => {
  if (!userId) return [];

  // 1. Coba ambil dari tabel public.user_favorites
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('destination_id')
      .eq('user_id', userId);

    if (!error && data && Array.isArray(data) && data.length > 0) {
      const favIds = data.map((row: any) => row.destination_id);
      setStorageItem(`tangsel_favorites_${userId}`, JSON.stringify(favIds));
      return favIds;
    }
  } catch (err) {
    // Tabel belum dibuat atau RLS belum aktif
  }

  // 2. Coba ambil dari Supabase Auth User Metadata (Tersimpan di cloud Supabase auth.users)
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (
      userData?.user &&
      userData.user.id === userId &&
      Array.isArray(userData.user.user_metadata?.favorites) &&
      userData.user.user_metadata.favorites.length > 0
    ) {
      const favIds = userData.user.user_metadata.favorites as string[];
      setStorageItem(`tangsel_favorites_${userId}`, JSON.stringify(favIds));
      return favIds;
    }
  } catch (err) {
    // Session belum tersedia
  }

  // 3. Fallback ke Storage cache per user ID
  try {
    const local = getStorageItem(`tangsel_favorites_${userId}`);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  return [];
};

export const addFavorite = async (userId: string, destinationId: string) => {
  if (!userId || !destinationId) return;

  // Coba simpan ke tabel user_favorites jika ada
  try {
    await supabase
      .from('user_favorites')
      .insert({ user_id: userId, destination_id: destinationId });
  } catch (err) {
    console.warn('Tabel user_favorites belum siap, menggunakan Supabase Auth Cloud Metadata.');
  }
};

export const removeFavorite = async (userId: string, destinationId: string) => {
  if (!userId || !destinationId) return;

  // Coba hapus dari tabel user_favorites jika ada
  try {
    await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('destination_id', destinationId);
  } catch (err) {
    console.warn('Tabel user_favorites belum siap, menggunakan Supabase Auth Cloud Metadata.');
  }
};

/**
 * Toggle status favorit destinasi untuk user yang sedang login.
 * Menjamin tersimpan di Supabase Cloud (tabel / user_metadata) dan local cache.
 */
export const toggleFavorite = async (
  userId: string,
  destinationId: string,
  currentFavorites: string[]
): Promise<string[]> => {
  if (!userId || !destinationId) return currentFavorites;

  const isFavorite = currentFavorites.includes(destinationId);
  const updatedFavorites = isFavorite
    ? currentFavorites.filter((id) => id !== destinationId)
    : [...currentFavorites, destinationId];

  // 1. Simpan/hapus di database table Supabase jika tabel tersedia
  try {
    if (isFavorite) {
      await removeFavorite(userId, destinationId);
    } else {
      await addFavorite(userId, destinationId);
    }
  } catch (e) {
    // Abaikan error tabel jika schema belum di-apply
  }

  // 2. Simpan ke Supabase Auth User Metadata (Cloud Database Supabase)
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id === userId) {
      await supabase.auth.updateUser({
        data: { favorites: updatedFavorites },
      });
    }
  } catch (e) {
    console.warn('Gagal sinkronisasi favorites ke Supabase user_metadata:', e);
  }

  // 3. Simpan ke Storage cache per user
  setStorageItem(`tangsel_favorites_${userId}`, JSON.stringify(updatedFavorites));

  return updatedFavorites;
};

