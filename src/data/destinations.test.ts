import { describe, it, expect } from 'vitest';
import { INITIAL_DESTINATIONS } from './destinations';

describe('Destinations Data Integrity Tests', () => {
  it('tidak boleh ada duplikasi ID destinasi', () => {
    const ids = INITIAL_DESTINATIONS.map((d) => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('tidak boleh ada duplikasi nama destinasi', () => {
    const names = INITIAL_DESTINATIONS.map((d) => d.name.trim().toLowerCase());
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('setiap kategori utama harus memiliki minimal 3 destinasi untuk perhitungan MOORA', () => {
    const categories = [
      'Wisata Alam',
      'Wisata Budaya',
      'Wisata Buatan',
      'Wisata MICE',
      'Wisata Kuliner',
      'Kampung Wisata',
    ] as const;

    categories.forEach((cat) => {
      const matching = INITIAL_DESTINATIONS.filter(
        (d) =>
          d.primaryCategory === cat ||
          d.category.toLowerCase().includes(cat.toLowerCase())
      );
      expect(matching.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('setiap kriteria destinasi bernilai valid antara 1 dan 5', () => {
    INITIAL_DESTINATIONS.forEach((d) => {
      const { harga, jarak, fasilitas, kebersihan, keamanan, popularitas } = d.criteria;
      [harga, jarak, fasilitas, kebersihan, keamanan, popularitas].forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(5);
      });
    });
  });
});
