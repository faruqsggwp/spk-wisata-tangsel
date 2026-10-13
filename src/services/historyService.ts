import { supabase } from '../lib/supabase';
import { RecommendationHistoryItem } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Mengambil riwayat rekomendasi user dari Supabase.
 * Prioritas:
 * 1. Tabel recommendation_histories di Supabase
 * 2. Supabase Auth raw_user_meta_data (cloud per-user di Supabase)
 * 3. LocalStorage fallback per user_id
 */
export const getUserHistory = async (userId: string): Promise<RecommendationHistoryItem[]> => {
  if (!userId) return [];

  // 1. Coba ambil dari tabel public.recommendation_histories
  try {
    const { data, error } = await supabase
      .from('recommendation_histories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data && Array.isArray(data) && data.length > 0) {
      const items: RecommendationHistoryItem[] = data.map((row: any) => ({
        id: row.id,
        timestamp: formatDate(row.created_at),
        preferences: row.preferences,
        preferenceSummary: row.preference_summary,
        topResults: row.top_results,
        resultCount: row.result_count,
        selectedCategory: row.preferences?.kategori,
      }));
      setStorageItem(`tangsel_history_${userId}`, JSON.stringify(items));
      return items;
    }
  } catch (err) {
    // Tabel belum dibuat atau RLS belum aktif
  }

  // 2. Coba ambil dari Supabase Auth User Metadata (Cloud Database Supabase)
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (
      userData?.user &&
      userData.user.id === userId &&
      Array.isArray(userData.user.user_metadata?.history) &&
      userData.user.user_metadata.history.length > 0
    ) {
      const items = userData.user.user_metadata.history as RecommendationHistoryItem[];
      setStorageItem(`tangsel_history_${userId}`, JSON.stringify(items));
      return items;
    }
  } catch (err) {
    // Session belum tersedia
  }

  // 3. Fallback ke LocalStorage cache per user ID
  try {
    const local = getStorageItem(`tangsel_history_${userId}`);
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  return [];
};

/**
 * Menyimpan riwayat rekomendasi ke Supabase Cloud.
 * Menjamin tersimpan baik di tabel Supabase (jika aktif) maupun di Supabase Auth Metadata.
 */
export const saveHistory = async (
  userId: string,
  historyItem: RecommendationHistoryItem | Omit<RecommendationHistoryItem, 'id' | 'timestamp'>
): Promise<RecommendationHistoryItem> => {
  const now = new Date();
  const timestamp = ('timestamp' in historyItem && historyItem.timestamp)
    ? historyItem.timestamp
    : formatDate(now.toISOString());
  const id = ('id' in historyItem && historyItem.id)
    ? historyItem.id
    : `hist-${Date.now()}`;

  let savedItem: RecommendationHistoryItem = {
    id,
    timestamp,
    preferences: historyItem.preferences,
    preferenceSummary: historyItem.preferenceSummary,
    topResults: historyItem.topResults,
    resultCount: historyItem.resultCount,
    selectedCategory: historyItem.selectedCategory || historyItem.preferences?.kategori,
  };

  // 1. Simpan ke tabel recommendation_histories di Supabase jika tabel siap
  try {
    const { data, error } = await supabase
      .from('recommendation_histories')
      .insert({
        user_id: userId,
        preferences: historyItem.preferences,
        preference_summary: historyItem.preferenceSummary,
        top_results: historyItem.topResults,
        result_count: historyItem.resultCount,
      })
      .select()
      .single();

    if (!error && data) {
      savedItem = {
        id: data.id,
        timestamp: formatDate(data.created_at),
        preferences: data.preferences,
        preferenceSummary: data.preference_summary,
        topResults: data.top_results,
        resultCount: data.result_count,
        selectedCategory: data.preferences?.kategori || historyItem.selectedCategory,
      };
    }
  } catch (err) {
    console.warn('Tabel recommendation_histories belum siap, menggunakan Supabase Auth Metadata.');
  }

  // 2. Simpan ke Supabase Auth User Metadata (Cloud Storage Supabase)
  try {
    const currentHist = await getUserHistory(userId);
    const updatedHistory = [savedItem, ...currentHist.filter((h) => h.id !== savedItem.id)].slice(0, 50);

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id === userId) {
      await supabase.auth.updateUser({
        data: { history: updatedHistory },
      });
    }

    // 3. Simpan ke LocalStorage cache per user
    setStorageItem(`tangsel_history_${userId}`, JSON.stringify(updatedHistory));
  } catch (err) {
    console.warn('Gagal sinkronisasi history ke Supabase user_metadata:', err);
  }

  return savedItem;
};

/**
 * Menghapus satu entri riwayat rekomendasi user.
 */
export const deleteHistory = async (userId: string, historyId: string) => {
  if (!userId || !historyId) return;

  // 1. Hapus dari tabel jika ada
  try {
    await supabase
      .from('recommendation_histories')
      .delete()
      .eq('id', historyId)
      .eq('user_id', userId);
  } catch (err) {}

  // 2. Hapus dari Supabase Auth User Metadata
  try {
    const currentHist = await getUserHistory(userId);
    const updatedHistory = currentHist.filter((h) => h.id !== historyId);

    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id === userId) {
      await supabase.auth.updateUser({
        data: { history: updatedHistory },
      });
    }

    setStorageItem(`tangsel_history_${userId}`, JSON.stringify(updatedHistory));
  } catch (err) {}
};

