import { describe, it, expect } from 'vitest';
import { calculateMoora, CRITERIA_DEFINITIONS } from './moora';
import { Destination, UserPreferences } from '../types';

// Helper: membuat destinasi dummy untuk testing
function makeDestination(id: string, criteria: Destination['criteria']): Destination {
  return {
    id,
    name: `Destinasi ${id}`,
    category: 'Wisata Alam',
    primaryCategory: 'Wisata Alam',
    location: 'Tangerang Selatan',
    rating: 4.0,
    image: '',
    description: 'Deskripsi test',
    address: 'Alamat test',
    operationalHours: '08:00 - 18:00',
    ticketPriceFormatted: 'Gratis',
    facilities: ['Parkir'],
    criteria,
  };
}

const sampleDestinations: Destination[] = [
  makeDestination('A1', { harga: 1, jarak: 2, fasilitas: 4, kebersihan: 4, keamanan: 4, popularitas: 5 }),
  makeDestination('A2', { harga: 3, jarak: 3, fasilitas: 5, kebersihan: 5, keamanan: 5, popularitas: 5 }),
  makeDestination('A3', { harga: 4, jarak: 2, fasilitas: 5, kebersihan: 4, keamanan: 5, popularitas: 4 }),
  makeDestination('A4', { harga: 2, jarak: 2, fasilitas: 3, kebersihan: 4, keamanan: 4, popularitas: 4 }),
  makeDestination('A5', { harga: 1, jarak: 3, fasilitas: 3, kebersihan: 3, keamanan: 3, popularitas: 4 }),
];

const defaultPreferences: UserPreferences = {
  harga: 4,
  jarak: 3,
  fasilitas: 5,
  kebersihan: 5,
  keamanan: 4,
  popularitas: 4,
};

describe('Algoritma MOORA - calculateMoora()', () => {

  it('harus mengembalikan hasil dengan jumlah item sama dengan jumlah destinasi', () => {
    const result = calculateMoora(sampleDestinations, defaultPreferences);
    expect(result.items).toHaveLength(sampleDestinations.length);
  });

  it('harus menghasilkan total bobot ternormalisasi (∑wj) = 1.0', () => {
    const result = calculateMoora(sampleDestinations, defaultPreferences);
    const totalWeight = Object.values(result.weights).reduce((sum, w) => sum + w, 0);
    expect(totalWeight).toBeCloseTo(1.0, 10);
  });

  it('harus menghasilkan 6 bobot kriteria sesuai definisi MOORA', () => {
    const result = calculateMoora(sampleDestinations, defaultPreferences);
    expect(Object.keys(result.weights)).toHaveLength(6);
    for (const crit of CRITERIA_DEFINITIONS) {
      expect(result.weights).toHaveProperty(crit.key);
    }
  });

  it('normalisasi matriks harus menghasilkan nilai 0 ≤ x*ij ≤ 1', () => {
    const result = calculateMoora(sampleDestinations, defaultPreferences);
    for (const item of result.items) {
      for (const crit of CRITERIA_DEFINITIONS) {
        const normVal = item.normalized[crit.key as keyof typeof item.normalized];
        expect(normVal).toBeGreaterThanOrEqual(0);
        expect(normVal).toBeLessThanOrEqual(1);
      }
    }
  });

  it('nilai Yi harus = benefitTotal - costTotal', () => {
    const result = calculateMoora(sampleDestinations, defaultPreferences);
    for (const item of result.items) {
      const expectedYi = item.benefitTotal - item.costTotal;
      expect(item.scoreYi).toBeCloseTo(expectedYi, 10);
    }
  });

  it('hasil perangkingan harus terurut dari Yi tertinggi ke terendah (descending)', () => {
    const result = calculateMoora(sampleDestinations, defaultPreferences);
    for (let i = 1; i < result.items.length; i++) {
      expect(result.items[i - 1].scoreYi).toBeGreaterThanOrEqual(result.items[i].scoreYi);
    }
  });

  it('rank harus berurutan dari 1 sampai N tanpa duplikat', () => {
    const result = calculateMoora(sampleDestinations, defaultPreferences);
    const ranks = result.items.map((item) => item.rank);
    const expectedRanks = Array.from({ length: sampleDestinations.length }, (_, i) => i + 1);
    expect(ranks).toEqual(expectedRanks);
  });

  it('status rekomendasi harus sesuai dengan rank', () => {
    const result = calculateMoora(sampleDestinations, defaultPreferences);
    for (const item of result.items) {
      if (item.rank <= 3) {
        expect(item.recommendationStatus).toBe('Sangat Direkomendasikan');
      } else if (item.rank <= 7) {
        expect(item.recommendationStatus).toBe('Direkomendasikan');
      } else if (item.rank <= 10) {
        expect(item.recommendationStatus).toBe('Cukup');
      } else {
        expect(item.recommendationStatus).toBe('Kurang Direkomendasikan');
      }
    }
  });

  it('divisor normalisasi harus = √(∑ x²ij) untuk setiap kriteria', () => {
    const result = calculateMoora(sampleDestinations, defaultPreferences);
    for (const crit of CRITERIA_DEFINITIONS) {
      const key = crit.key as keyof Destination['criteria'];
      const sumSquares = sampleDestinations.reduce((sum, dest) => {
        const val = dest.criteria[key];
        return sum + val * val;
      }, 0);
      const expectedDivisor = Math.sqrt(sumSquares);
      expect(result.decisionMatrixNormDivisors[key]).toBeCloseTo(expectedDivisor, 10);
    }
  });

  it('benefitTotal harus = jumlah weighted fasilitas + kebersihan + keamanan + popularitas', () => {
    const result = calculateMoora(sampleDestinations, defaultPreferences);
    for (const item of result.items) {
      const expectedBenefit =
        item.weighted.fasilitas +
        item.weighted.kebersihan +
        item.weighted.keamanan +
        item.weighted.popularitas;
      expect(item.benefitTotal).toBeCloseTo(expectedBenefit, 10);
    }
  });

  it('costTotal harus = jumlah weighted harga + jarak', () => {
    const result = calculateMoora(sampleDestinations, defaultPreferences);
    for (const item of result.items) {
      const expectedCost = item.weighted.harga + item.weighted.jarak;
      expect(item.costTotal).toBeCloseTo(expectedCost, 10);
    }
  });

  it('perubahan bobot harus mengubah ranking (sensitivitas)', () => {
    // Bobot yang sangat menekankan harga murah
    const hematPreferences: UserPreferences = {
      harga: 5, jarak: 5, fasilitas: 1, kebersihan: 1, keamanan: 1, popularitas: 1,
    };
    
    // Bobot yang sangat menekankan fasilitas
    const fasilitasPreferences: UserPreferences = {
      harga: 1, jarak: 1, fasilitas: 5, kebersihan: 5, keamanan: 5, popularitas: 5,
    };

    const resultHemat = calculateMoora(sampleDestinations, hematPreferences);
    const resultFasilitas = calculateMoora(sampleDestinations, fasilitasPreferences);

    // Peringkat 1 harus berbeda karena preferensi berbeda drastis
    // A1 (harga=1, murah) seharusnya unggul di hemat
    // A2 (fasilitas=5, lengkap) seharusnya unggul di fasilitas
    expect(resultHemat.items[0].destination.id).not.toBe(resultFasilitas.items[0].destination.id);
  });

  it('harus bisa menangani semua bobot sama (equal weight)', () => {
    const equalPreferences: UserPreferences = {
      harga: 3, jarak: 3, fasilitas: 3, kebersihan: 3, keamanan: 3, popularitas: 3,
    };
    const result = calculateMoora(sampleDestinations, equalPreferences);
    
    // Setiap bobot harus = 1/6
    for (const key of Object.keys(result.weights)) {
      expect(result.weights[key]).toBeCloseTo(1 / 6, 10);
    }
    expect(result.items).toHaveLength(5);
  });

  it('harus menangani array destinasi kosong secara aman tanpa error', () => {
    const result = calculateMoora([], defaultPreferences);
    expect(result.items).toHaveLength(0);
    expect(result.weights).toEqual({});
  });

  it('harus merangking destinasi spesifik saat difilter berdasarkan kategori Wisata Alam', () => {
    const mixedDestinations: Destination[] = [
      { ...sampleDestinations[0], id: 'alam-1', category: 'Wisata Alam', primaryCategory: 'Wisata Alam' },
      { ...sampleDestinations[1], id: 'budaya-1', category: 'Wisata Budaya', primaryCategory: 'Wisata Budaya' },
      { ...sampleDestinations[2], id: 'alam-2', category: 'Wisata Alam', primaryCategory: 'Wisata Alam' },
      { ...sampleDestinations[3], id: 'kuliner-1', category: 'Wisata Kuliner', primaryCategory: 'Wisata Kuliner' },
    ];

    const filterCategory = 'Wisata Alam';
    const candidateAlam = mixedDestinations.filter(d => 
      d.category.includes(filterCategory) || d.primaryCategory === filterCategory
    );

    expect(candidateAlam).toHaveLength(2);

    const resultAlam = calculateMoora(candidateAlam, { ...defaultPreferences, kategori: filterCategory });
    expect(resultAlam.items).toHaveLength(2);
    expect(resultAlam.items.every(item => item.destination.category.includes('Wisata Alam'))).toBe(true);
    expect(resultAlam.items[0].rank).toBe(1);
    expect(resultAlam.items[1].rank).toBe(2);
  });
});
