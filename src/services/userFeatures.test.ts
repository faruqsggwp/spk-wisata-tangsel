import { describe, it, expect, vi } from 'vitest';
import * as favoritesService from './favoritesService';
import * as historyService from './historyService';
import { RecommendationHistoryItem } from '../types';

describe('User Features Persistence Tests', () => {
  const testUserId = 'test-user-unit-id-123';

  it('toggleFavorite harus menambah dan menghapus favorit dengan benar', async () => {
    // Awal: kosong
    const initialFavs: string[] = [];

    // Tambah destinasi 'situ-gintung'
    const updated1 = await favoritesService.toggleFavorite(testUserId, 'situ-gintung', initialFavs);
    expect(updated1).toContain('situ-gintung');

    // Tambah destinasi kedua 'ekowisata-keranggan'
    const updated2 = await favoritesService.toggleFavorite(testUserId, 'ekowisata-keranggan', updated1);
    expect(updated2).toContain('situ-gintung');
    expect(updated2).toContain('ekowisata-keranggan');
    expect(updated2).toHaveLength(2);

    // Toggle kembali 'situ-gintung' (harus terhapus)
    const updated3 = await favoritesService.toggleFavorite(testUserId, 'situ-gintung', updated2);
    expect(updated3).not.toContain('situ-gintung');
    expect(updated3).toContain('ekowisata-keranggan');
    expect(updated3).toHaveLength(1);
  });

  it('saveHistory dan getUserHistory harus menyimpan dan mengambil riwayat rekomendasi', async () => {
    const dummyHistory: RecommendationHistoryItem = {
      id: 'hist-unit-test-1',
      timestamp: '09 September 2026',
      preferences: {
        harga: 3,
        jarak: 2,
        fasilitas: 4,
        kebersihan: 5,
        keamanan: 4,
        popularitas: 4,
        kategori: 'Wisata Alam',
      },
      preferenceSummary: 'Kategori: Wisata Alam • Budget sedang, Jarak dekat, Fasilitas tinggi',
      topResults: [
        { id: 'situ-gintung', name: 'Situ Gintung', category: 'Wisata Alam', scoreYi: 0.385, rank: 1 },
      ],
      resultCount: 3,
      selectedCategory: 'Wisata Alam',
    };

    const saved = await historyService.saveHistory(testUserId, dummyHistory);
    expect(saved.id).toBe(dummyHistory.id);
    expect(saved.preferenceSummary).toContain('Wisata Alam');

    const list = await historyService.getUserHistory(testUserId);
    expect(list.some(h => h.id === dummyHistory.id)).toBe(true);
  });

  it('deleteHistory harus menghapus riwayat spesifik dari daftar', async () => {
    const historyIdToDelete = 'hist-unit-test-delete';
    const dummyHistory: RecommendationHistoryItem = {
      id: historyIdToDelete,
      timestamp: '09 September 2026',
      preferences: {
        harga: 1,
        jarak: 1,
        fasilitas: 5,
        kebersihan: 5,
        keamanan: 5,
        popularitas: 5,
      },
      preferenceSummary: 'Budget hemat',
      topResults: [],
      resultCount: 0,
    };

    await historyService.saveHistory(testUserId, dummyHistory);
    const beforeDelete = await historyService.getUserHistory(testUserId);
    expect(beforeDelete.some(h => h.id === historyIdToDelete)).toBe(true);

    await historyService.deleteHistory(testUserId, historyIdToDelete);
    const afterDelete = await historyService.getUserHistory(testUserId);
    expect(afterDelete.some(h => h.id === historyIdToDelete)).toBe(false);
  });

  it('getAllProfiles harus mengembalikan daftar pengguna dan dapat diubah status dan rolenya', async () => {
    const authService = await import('./authService');
    const profiles = await authService.getAllProfiles();
    expect(Array.isArray(profiles)).toBe(true);
    expect(profiles.length).toBeGreaterThan(0);

    const testUser = profiles[0];
    const originalStatus = testUser.status;
    const targetStatus = originalStatus === 'Nonaktif' ? 'Aktif' : 'Nonaktif';

    // Update status
    await authService.updateProfileStatus(testUser.id, targetStatus);
    const updatedProfiles = await authService.getAllProfiles();
    const updatedUser = updatedProfiles.find(u => u.id === testUser.id);
    expect(updatedUser?.status).toBe(targetStatus);

    // Update role
    const originalRole = testUser.role;
    const targetRole = originalRole === 'admin' ? 'user' : 'admin';
    await authService.updateProfileRole(testUser.id, targetRole);
    const updatedProfiles2 = await authService.getAllProfiles();
    const updatedUser2 = updatedProfiles2.find(u => u.id === testUser.id);
    expect(updatedUser2?.role).toBe(targetRole);
  });
});
