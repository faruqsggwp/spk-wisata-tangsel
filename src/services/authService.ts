import { supabase } from '../lib/supabase';
import { UserAccount } from '../types';
import { getStorageItem, setStorageItem } from '../utils/storage';

export const DEFAULT_INITIAL_PROFILES: UserAccount[] = [
  {
    id: 'admin-tangsel-master-id',
    name: 'Admin Wisata Tangsel',
    email: 'admintangsel@gmail.com',
    role: 'admin',
    status: 'Aktif',
    createdAt: '2026-01-15T08:00:00.000Z',
    favorites: ['situ-gintung', 'ocean-park', 'taman-kota-1'],
    history: [],
  },
  {
    id: 'user-budi-santoso-id',
    name: 'Budi Santoso',
    email: 'budi.santoso@gmail.com',
    role: 'user',
    status: 'Aktif',
    createdAt: '2026-02-10T10:30:00.000Z',
    favorites: ['situ-gintung', 'kandank-jurank-doank'],
    history: [],
  },
  {
    id: 'user-siti-rahma-id',
    name: 'Siti Rahma',
    email: 'siti.rahma@gmail.com',
    role: 'user',
    status: 'Aktif',
    createdAt: '2026-03-01T14:15:00.000Z',
    favorites: ['taman-kota-2', 'broadway-alam-sutera'],
    history: [],
  },
  {
    id: 'user-dian-pratama-id',
    name: 'Dian Pratama',
    email: 'dian.pratama@yahoo.com',
    role: 'user',
    status: 'Nonaktif',
    createdAt: '2026-03-12T09:00:00.000Z',
    favorites: [],
    history: [],
  },
];

export const signUp = async (
  name: string,
  email: string,
  password: string,
  role: 'user' | 'admin' = 'user',
  status: 'Aktif' | 'Nonaktif' = 'Aktif'
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, role, status },
    },
  });
  if (error) throw error;

  if (data.user) {
    // 1. Sinkronisasi ke tabel profiles Supabase jika tabel siap
    try {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        email,
        role,
        status,
      });
    } catch (e) {}

    // 2. Simpan ke cache penyimpanan profil lokal
    try {
      const allStr = getStorageItem('tangsel_all_profiles');
      const all: UserAccount[] = allStr ? JSON.parse(allStr) : [];
      if (!all.some((u) => u.id === data.user?.id || u.email.toLowerCase() === email.toLowerCase())) {
        const newUser: UserAccount = {
          id: data.user.id,
          name,
          email,
          role,
          status,
          createdAt: data.user.created_at || new Date().toISOString(),
          favorites: [],
          history: [],
        };
        setStorageItem('tangsel_all_profiles', JSON.stringify([newUser, ...all]));
      }
    } catch (e) {}
  }

  return { user: data.user, session: data.session };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

export const getProfile = async (userId: string): Promise<UserAccount | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Fallback: ambil profil dari session auth Supabase beserta metadata
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user && userData.user.id === userId) {
        const metaFavs = Array.isArray(userData.user.user_metadata?.favorites)
          ? userData.user.user_metadata.favorites
          : [];
        const metaHist = Array.isArray(userData.user.user_metadata?.history)
          ? userData.user.user_metadata.history
          : [];

        return {
          id: userData.user.id,
          name: userData.user.user_metadata?.name || userData.user.email?.split('@')[0] || 'User',
          email: userData.user.email || '',
          role: (userData.user.user_metadata?.role as any) || 'user',
          status: (userData.user.user_metadata?.status as any) || 'Aktif',
          createdAt: userData.user.created_at || new Date().toISOString(),
          favorites: metaFavs,
          history: metaHist,
        };
      }
      return null;
    }

    const { data: userData } = await supabase.auth.getUser();
    const metaFavs = Array.isArray(userData?.user?.user_metadata?.favorites)
      ? userData.user.user_metadata.favorites
      : [];
    const metaHist = Array.isArray(userData?.user?.user_metadata?.history)
      ? userData.user.user_metadata.history
      : [];

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
      createdAt: data.created_at,
      favorites: metaFavs,
      history: metaHist,
    };
  } catch (err) {
    console.error('Error saat mengambil profile:', err);
    return null;
  }
};

export const isAdmin = async (userId: string): Promise<boolean> => {
  const profile = await getProfile(userId);
  return profile?.role === 'admin';
};

export const onAuthStateChange = (callback: (event: any, session: any) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

/**
 * Mengambil semua data pengguna untuk panel Admin.
 * Mengintegrasikan data dari tabel public.profiles di Supabase,
 * disinkronkan dengan cache profil persisten dan data favorit/riwayat.
 */
export const getAllProfiles = async (): Promise<UserAccount[]> => {
  let dbProfiles: UserAccount[] = [];

  try {
    const [profilesRes, favsRes, histRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_favorites').select('user_id, destination_id'),
      supabase.from('recommendation_histories').select('*').order('created_at', { ascending: false }),
    ]);

    const favsMap = new Map<string, string[]>();
    if (!favsRes.error && favsRes.data && Array.isArray(favsRes.data)) {
      favsRes.data.forEach((row: any) => {
        if (!row.user_id || !row.destination_id) return;
        const current = favsMap.get(row.user_id) || [];
        if (!current.includes(row.destination_id)) {
          current.push(row.destination_id);
        }
        favsMap.set(row.user_id, current);
      });
    }

    const histMap = new Map<string, any[]>();
    if (!histRes.error && histRes.data && Array.isArray(histRes.data)) {
      histRes.data.forEach((row: any) => {
        if (!row.user_id) return;
        const current = histMap.get(row.user_id) || [];
        const date = new Date(row.created_at);
        const formattedDate = date.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
        current.push({
          id: row.id,
          timestamp: formattedDate,
          preferences: row.preferences,
          preferenceSummary: row.preference_summary,
          topResults: row.top_results || [],
          resultCount: row.result_count || 0,
          selectedCategory: row.preferences?.kategori,
        });
        histMap.set(row.user_id, current);
      });
    }

    if (!profilesRes.error && profilesRes.data && Array.isArray(profilesRes.data) && profilesRes.data.length > 0) {
      dbProfiles = profilesRes.data.map((row: any) => {
        let favs = favsMap.get(row.id) || [];
        let hist = histMap.get(row.id) || [];

        // Fallback ke storage jika kosong
        if (favs.length === 0) {
          try {
            const fStr = getStorageItem(`tangsel_favorites_${row.id}`);
            if (fStr) favs = JSON.parse(fStr);
          } catch {}
        }
        if (hist.length === 0) {
          try {
            const hStr = getStorageItem(`tangsel_history_${row.id}`);
            if (hStr) hist = JSON.parse(hStr);
          } catch {}
        }

        return {
          id: row.id,
          name: row.name,
          email: row.email,
          role: (row.role as 'user' | 'admin') || 'user',
          status: (row.status as 'Aktif' | 'Nonaktif') || 'Aktif',
          createdAt: row.created_at,
          favorites: favs,
          history: hist,
        };
      });
    }
  } catch (err) {
    console.warn('Tabel profiles belum siap di Supabase, menggunakan penyimpanan profil sinkron:', err);
  }

  // Ambil cache profil lokal
  let cachedProfiles: UserAccount[] = [];
  try {
    const local = getStorageItem('tangsel_all_profiles');
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedProfiles = parsed;
      }
    }
  } catch {}

  // Gabungkan profiles dengan prioritas data Supabase
  const mergedMap = new Map<string, UserAccount>();

  if (cachedProfiles.length === 0) {
    DEFAULT_INITIAL_PROFILES.forEach((u) => mergedMap.set(u.id, u));
  } else {
    cachedProfiles.forEach((u) => mergedMap.set(u.id, u));
  }

  dbProfiles.forEach((u) => {
    const existing = mergedMap.get(u.id) || mergedMap.get(u.email);
    mergedMap.set(u.id, {
      ...u,
      favorites: u.favorites.length > 0 ? u.favorites : (existing?.favorites || []),
      history: u.history.length > 0 ? u.history : (existing?.history || []),
    });
  });

  const result = Array.from(mergedMap.values());
  setStorageItem('tangsel_all_profiles', JSON.stringify(result));
  return result;
};

/**
 * Memperbarui status akun pengguna ('Aktif' | 'Nonaktif') di Supabase dan UI
 */
export const updateProfileStatus = async (
  userId: string,
  status: 'Aktif' | 'Nonaktif'
): Promise<boolean> => {
  // 1. Update ke Supabase database
  try {
    await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId);
  } catch (err) {
    console.warn('Error saat memperbarui status di Supabase profiles:', err);
  }

  // 2. Update session metadata jika user sedang aktif
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id === userId) {
      await supabase.auth.updateUser({
        data: { status },
      });
    }
  } catch {}

  // 3. Update cache lokal
  try {
    const current = await getAllProfiles();
    const updated = current.map((u) => (u.id === userId ? { ...u, status } : u));
    setStorageItem('tangsel_all_profiles', JSON.stringify(updated));
  } catch {}

  return true;
};

/**
 * Memperbarui role pengguna ('user' | 'admin') di Supabase dan UI
 */
export const updateProfileRole = async (
  userId: string,
  role: 'user' | 'admin'
): Promise<boolean> => {
  // 1. Update ke Supabase database
  try {
    await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
  } catch (err) {
    console.warn('Error saat memperbarui role di Supabase profiles:', err);
  }

  // 2. Update session metadata jika user sedang aktif
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session?.user?.id === userId) {
      await supabase.auth.updateUser({
        data: { role },
      });
    }
  } catch {}

  // 3. Update cache lokal
  try {
    const current = await getAllProfiles();
    const updated = current.map((u) => (u.id === userId ? { ...u, role } : u));
    setStorageItem('tangsel_all_profiles', JSON.stringify(updated));
  } catch {}

  return true;
};

/**
 * Membuat entri pengguna baru oleh Admin
 */
export const createUserProfile = async (
  name: string,
  email: string,
  role: 'user' | 'admin' = 'user',
  status: 'Aktif' | 'Nonaktif' = 'Aktif'
): Promise<UserAccount> => {
  const newId = `user-${Date.now()}`;
  const newUser: UserAccount = {
    id: newId,
    name,
    email,
    role,
    status,
    createdAt: new Date().toISOString(),
    favorites: [],
    history: [],
  };

  // 1. Simpan ke Supabase database
  try {
    await supabase.from('profiles').insert({
      id: newId,
      name,
      email,
      role,
      status,
    });
  } catch (err) {
    console.warn('Info: Supabase profiles belum tersinkronisasi langsung:', err);
  }

  // 2. Simpan ke cache lokal
  try {
    const current = await getAllProfiles();
    const updated = [newUser, ...current.filter((u) => u.email.toLowerCase() !== email.toLowerCase())];
    setStorageItem('tangsel_all_profiles', JSON.stringify(updated));
  } catch {}

  return newUser;
};

/**
 * Menghapus akun pengguna dari database
 */
export const deleteProfile = async (userId: string): Promise<boolean> => {
  // 1. Hapus dari Supabase database
  try {
    await supabase.from('profiles').delete().eq('id', userId);
  } catch (err) {
    console.warn('Info: Supabase profiles delete:', err);
  }

  // 2. Hapus dari cache lokal
  try {
    const current = await getAllProfiles();
    const updated = current.filter((u) => u.id !== userId);
    setStorageItem('tangsel_all_profiles', JSON.stringify(updated));
  } catch {}

  return true;
};
