export type CategoryType = 
  | 'Semua Kategori'
  | 'Wisata Alam'
  | 'Wisata Budaya'
  | 'Wisata Buatan'
  | 'Wisata MICE'
  | 'Wisata Kuliner'
  | 'Kampung Wisata';

export interface Destination {
  id: string;
  name: string;
  category: string;
  primaryCategory: 'Wisata Alam' | 'Wisata Budaya' | 'Wisata Buatan' | 'Wisata MICE' | 'Wisata Kuliner' | 'Kampung Wisata';
  theme?: string;
  location: string;
  rating: number;
  image: string;
  description: string;
  address: string;
  operationalHours: string;
  ticketPriceFormatted: string;
  facilities: string[];
  active?: boolean;
  dpdRegion?: string; // Internal reference only, not displayed in UI
  // MOORA Raw Criteria values (1 - 5 scale)
  criteria: {
    harga: number;          // C1: Cost (1: Sangat Murah/Gratis -> 5: Sangat Mahal)
    jarak: number;          // C2: Cost (1: Sangat Dekat -> 5: Sangat Jauh)
    fasilitas: number;      // C3: Benefit (1: Minim -> 5: Sangat Lengkap)
    kebersihan: number;     // C4: Benefit (1: Kurang -> 5: Sangat Bersih)
    keamanan: number;       // C5: Benefit (1: Kurang -> 5: Sangat Aman)
    popularitas: number;    // C6: Benefit (1: Rendah -> 5: Sangat Populer)
  };
  nearby?: NearbySection;
}

export interface NearbyPlace {
  id: string;
  name: string;
  categoryType: 'hotel' | 'kuliner' | 'fasilitas';
  categoryLabel: string;
  distance: string;
  address: string;
  rating: number;
  image: string;
  priceOrHours?: string;
  description: string;
  googleMapsUrl: string;
  facilities?: string[];
}

export interface NearbySection {
  hotels: NearbyPlace[];
  dining: NearbyPlace[];
  facilities: NearbyPlace[];
}

export interface AdminCriteriaItem {
  id: string;
  code: string;
  key: 'harga' | 'jarak' | 'fasilitas' | 'kebersihan' | 'keamanan' | 'popularitas';
  name: string;
  type: 'Cost' | 'Benefit';
  weight: number;
  active: boolean;
  description: string;
}

export interface UserPreferences {
  harga: number;          // 1 - 5
  jarak: number;          // 1 - 5
  fasilitas: number;      // 1 - 5
  kebersihan: number;     // 1 - 5
  keamanan: number;       // 1 - 5
  popularitas: number;    // 1 - 5
  kategori?: string;      // Kategori wisata pilihan (e.g. 'Semua Kategori', 'Wisata Alam', dll)
}

export interface MooraCalculationItem {
  destination: Destination;
  normalized: {
    harga: number;
    jarak: number;
    fasilitas: number;
    kebersihan: number;
    keamanan: number;
    popularitas: number;
  };
  weighted: {
    harga: number;
    jarak: number;
    fasilitas: number;
    kebersihan: number;
    keamanan: number;
    popularitas: number;
  };
  benefitTotal: number;
  costTotal: number;
  scoreYi: number;
  rank: number;
  recommendationStatus: 'Sangat Direkomendasikan' | 'Direkomendasikan' | 'Cukup' | 'Kurang Direkomendasikan';
}

export interface MooraCalculationResult {
  items: MooraCalculationItem[];
  weights: Record<string, number>;
  decisionMatrixNormDivisors: Record<string, number>;
}

export interface RecommendationHistoryItem {
  id: string;
  timestamp: string; // e.g. "04 September 2026"
  preferences: UserPreferences;
  preferenceSummary: string; // e.g. "Budget Rp50.000, Jarak dekat, Fasilitas tinggi"
  topResults: {
    id: string;
    name: string;
    category: string;
    scoreYi: number;
    rank: number;
  }[];
  resultCount: number;
  selectedCategory?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  status?: 'Aktif' | 'Nonaktif';
  createdAt?: string;
  favorites: string[]; // Destination IDs
  history: RecommendationHistoryItem[];
}
