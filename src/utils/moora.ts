import { Destination, UserPreferences, MooraCalculationResult, MooraCalculationItem } from '../types';

export const CRITERIA_DEFINITIONS = [
  { key: 'harga', code: 'C1', name: 'Prioritas Harga Tiket & Biaya', type: 'Cost', description: 'Biaya tiket masuk dan pengeluaran wisata' },
  { key: 'jarak', code: 'C2', name: 'Prioritas Kedekatan Jarak Tempuh', type: 'Cost', description: 'Estimasi jarak tempuh dan kemudahan tempuh' },
  { key: 'fasilitas', code: 'C3', name: 'Kelengkapan Fasilitas', type: 'Benefit', description: 'Kelengkapan fasilitas umum, toilet, ibadah, dan rekreasi' },
  { key: 'kebersihan', code: 'C4', name: 'Tingkat Kebersihan', type: 'Benefit', description: 'Tingkat kebersihan lingkungan, area hijau, dan fasilitas' },
  { key: 'keamanan', code: 'C5', name: 'Jaminan Keamanan', type: 'Benefit', description: 'Fasilitas pos jaga, keamanan parkir, dan ketenangan area' },
  { key: 'popularitas', code: 'C6', name: 'Popularitas & Rating Ulasan', type: 'Benefit', description: 'Tingkat ketenaran destinasi dan ulasan pengunjung' },
] as const;

export function calculateMoora(
  destinations: Destination[],
  preferences: UserPreferences
): MooraCalculationResult {
  if (!destinations || destinations.length === 0) {
    return {
      items: [],
      weights: {},
      decisionMatrixNormDivisors: {},
    };
  }

  type CriteriaKey = 'harga' | 'jarak' | 'fasilitas' | 'kebersihan' | 'keamanan' | 'popularitas';
  const criteriaKeys: CriteriaKey[] = [
    'harga',
    'jarak',
    'fasilitas',
    'kebersihan',
    'keamanan',
    'popularitas',
  ];

  // 1. Calculate weights normalization (w_j)
  const totalRawWeight = criteriaKeys.reduce((acc, key) => acc + (preferences[key] || 1), 0);
  const normalizedWeights: Record<string, number> = {};
  for (const key of criteriaKeys) {
    normalizedWeights[key] = (preferences[key] || 1) / totalRawWeight;
  }

  // 2. Calculate divisor (akar jumlah kuadrat nilai setiap kriteria)
  // sqrt(sum(x_ij ^ 2))
  const normDivisors: Record<string, number> = {};
  for (const key of criteriaKeys) {
    const sumSquares = destinations.reduce((sum, dest) => {
      const val = dest.criteria[key];
      return sum + val * val;
    }, 0);
    normDivisors[key] = Math.sqrt(sumSquares) || 1;
  }

  // 3. Normalize decision matrix and multiply by weights
  const items: Omit<MooraCalculationItem, 'rank' | 'recommendationStatus'>[] = destinations.map((dest) => {
    const normalized: Record<string, number> = {};
    const weighted: Record<string, number> = {};

    for (const key of criteriaKeys) {
      const rawVal = dest.criteria[key];
      const normVal = rawVal / normDivisors[key];
      normalized[key] = normVal;
      weighted[key] = normVal * normalizedWeights[key];
    }

    // Cost vs Benefit
    // Benefit: fasilitas, kebersihan, keamanan, popularitas
    const benefitTotal =
      weighted.fasilitas +
      weighted.kebersihan +
      weighted.keamanan +
      weighted.popularitas;

    // Cost: harga, jarak
    const costTotal = weighted.harga + weighted.jarak;

    const scoreYi = benefitTotal - costTotal;

    return {
      destination: dest,
      normalized: normalized as any,
      weighted: weighted as any,
      benefitTotal,
      costTotal,
      scoreYi,
    };
  });

  // 4. Perankingan / Sorting descending by Yi
  items.sort((a, b) => b.scoreYi - a.scoreYi);

  // 5. Assign Rank & Recommendation Status
  const rankedItems: MooraCalculationItem[] = items.map((item, index) => {
    const rank = index + 1;
    let recommendationStatus: MooraCalculationItem['recommendationStatus'] = 'Cukup';

    if (rank <= 3) {
      recommendationStatus = 'Sangat Direkomendasikan';
    } else if (rank <= 7) {
      recommendationStatus = 'Direkomendasikan';
    } else if (rank <= 10) {
      recommendationStatus = 'Cukup';
    } else {
      recommendationStatus = 'Kurang Direkomendasikan';
    }

    return {
      ...item,
      rank,
      recommendationStatus,
    };
  });

  return {
    items: rankedItems,
    weights: normalizedWeights,
    decisionMatrixNormDivisors: normDivisors,
  };
}
