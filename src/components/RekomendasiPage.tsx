import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Check, 
  RotateCcw, 
  Printer, 
  Share2, 
  ArrowRight, 
  Sliders, 
  Award, 
  MapPin, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  ExternalLink,
  Zap,
  Heart,
  Info,
  CheckCircle2,
  X,
  Trees,
  Landmark,
  Building2,
  Briefcase,
  Utensils,
  Home,
  Filter,
  Layers
} from 'lucide-react';
import { Destination, UserPreferences, MooraCalculationResult, MooraCalculationItem, UserAccount, RecommendationHistoryItem, CategoryType } from '../types';
import { calculateMoora, CRITERIA_DEFINITIONS } from '../utils/moora';

export const RECOMMENDATION_CATEGORIES: {
  id: CategoryType;
  label: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'Semua Kategori', label: 'Semua Kategori', shortDesc: 'Seluruh destinasi wisata', icon: Sparkles },
  { id: 'Wisata Alam', label: 'Wisata Alam', shortDesc: 'Danau, ekowisata hijau & asri', icon: Trees },
  { id: 'Wisata Budaya', label: 'Wisata Budaya', shortDesc: 'Seni tradisional & peninggalan', icon: Landmark },
  { id: 'Wisata Buatan', label: 'Wisata Buatan', shortDesc: 'Theme park, wahana & rekreasi', icon: Building2 },
  { id: 'Wisata MICE', label: 'Wisata MICE', shortDesc: 'Convention hall & pusat ekshibisi', icon: Briefcase },
  { id: 'Wisata Kuliner', label: 'Wisata Kuliner', shortDesc: 'Sentra kuliner & pasar modern', icon: Utensils },
  { id: 'Kampung Wisata', label: 'Kampung Wisata', shortDesc: 'Kampung tematik & edukasi warga', icon: Home },
];

interface RekomendasiPageProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  onGoToWisata: () => void;
  currentUser: UserAccount | null;
  onToggleFavorite: (destId: string) => void;
  onSaveHistory: (historyItem: RecommendationHistoryItem) => void;
  initialPreferences?: UserPreferences | null;
  initialCategory?: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  harga: 4,          // Budget (Cost)
  jarak: 2,          // Jarak dekat (Cost)
  fasilitas: 5,      // Fasilitas tinggi (Benefit)
  kebersihan: 5,     // Kebersihan tinggi (Benefit)
  keamanan: 4,       // Keamanan tinggi (Benefit)
  popularitas: 4,    // Popularitas tinggi (Benefit)
  kategori: 'Semua Kategori',
};

export const RekomendasiPage: React.FC<RekomendasiPageProps> = ({
  destinations,
  onSelectDestination,
  onGoToWisata,
  currentUser,
  onToggleFavorite,
  onSaveHistory,
  initialPreferences,
  initialCategory,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(initialPreferences ? 3 : 1);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialPreferences?.kategori || initialCategory || 'Semua Kategori'
  );
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences || DEFAULT_PREFERENCES);
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [currentCalcMessage, setCurrentCalcMessage] = useState('');

  // Helper untuk memfilter kandidat destinasi sesuai kategori dengan deduplikasi
  const getCandidateDestinations = (cat: string) => {
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const uniqueDestinations = destinations.filter((dest) => {
      const normalizedName = dest.name.trim().toLowerCase();
      if (seenIds.has(dest.id) || seenNames.has(normalizedName)) {
        return false;
      }
      seenIds.add(dest.id);
      seenNames.add(normalizedName);
      return true;
    });

    if (!cat || cat === 'Semua Kategori') {
      return uniqueDestinations;
    }
    return uniqueDestinations.filter((dest) => {
      return (
        dest.category.toLowerCase().includes(cat.toLowerCase()) ||
        dest.primaryCategory.toLowerCase().includes(cat.toLowerCase()) ||
        (dest.theme && dest.theme.toLowerCase().includes(cat.toLowerCase()))
      );
    });
  };

  const getCategoryCount = (cat: string) => {
    return getCandidateDestinations(cat).length;
  };

  const currentCandidates = useMemo(() => {
    return getCandidateDestinations(selectedCategory);
  }, [destinations, selectedCategory]);

  const [mooraResult, setMooraResult] = useState<MooraCalculationResult | null>(() => {
    if (initialPreferences) {
      const cat = initialPreferences.kategori || initialCategory || 'Semua Kategori';
      const cands = destinations.filter((dest) => {
        if (!cat || cat === 'Semua Kategori') return true;
        return (
          dest.category.toLowerCase().includes(cat.toLowerCase()) ||
          dest.primaryCategory.toLowerCase().includes(cat.toLowerCase()) ||
          (dest.theme && dest.theme.toLowerCase().includes(cat.toLowerCase()))
        );
      });
      return calculateMoora(cands, initialPreferences);
    }
    return null;
  });

  // Modal detail item untuk modal "Lihat Detail" ranking MOORA
  const [detailMooraItem, setDetailMooraItem] = useState<MooraCalculationItem | null>(null);

  // Tab detail matriks teknis MOORA
  const [showMatrixDetail, setShowMatrixDetail] = useState(false);
  const [selectedMatrixTab, setSelectedMatrixTab] = useState<'decision' | 'normalized' | 'weighted'>('decision');

  useEffect(() => {
    if (initialPreferences) {
      setPreferences(initialPreferences);
      const cat = initialPreferences.kategori || initialCategory || 'Semua Kategori';
      setSelectedCategory(cat);
      const cands = getCandidateDestinations(cat);
      setMooraResult(calculateMoora(cands, initialPreferences));
      setStep(3);
    }
  }, [initialPreferences, initialCategory, destinations]);

  // Helper labels untuk Budget & Jarak
  const getBudgetText = (val: number) => {
    switch (val) {
      case 1: return 'Sangat Terjangkau (Rp 0 - Rp 10.000)';
      case 2: return 'Terjangkau (Rp 10.000 - Rp 25.000)';
      case 3: return 'Sedang (Rp 25.000 - Rp 50.000)';
      case 4: return 'Menengah Tinggi (Rp 50.000 - Rp 75.000)';
      case 5: return 'Premium (Rp 75.000 - Rp 100.000+)';
      default: return `Skor ${val}`;
    }
  };

  const getJarakText = (val: number) => {
    switch (val) {
      case 1: return 'Sangat Dekat (< 3 km)';
      case 2: return 'Dekat (3 - 7 km)';
      case 3: return 'Sedang (7 - 12 km)';
      case 4: return 'Jauh (12 - 18 km)';
      case 5: return 'Sangat Jauh (> 18 km)';
      default: return `Skor ${val}`;
    }
  };

  const getBenefitText = (val: number) => {
    switch (val) {
      case 1: return 'Sangat Rendah (1/5)';
      case 2: return 'Rendah (2/5)';
      case 3: return 'Sedang (3/5)';
      case 4: return 'Tinggi (4/5)';
      case 5: return 'Sangat Tinggi (5/5)';
      default: return `Skor ${val}`;
    }
  };

  // Helper format summary preferensi
  const createPreferenceSummary = (pref: UserPreferences, cat: string = selectedCategory): string => {
    const catStr = cat && cat !== 'Semua Kategori' ? `Kategori: ${cat}` : 'Semua Kategori';
    const budgetStr = pref.harga <= 2 ? 'Budget rendah' : pref.harga === 3 ? 'Budget sedang' : 'Budget tinggi';
    const jarakStr = pref.jarak <= 2 ? 'Jarak dekat' : pref.jarak === 3 ? 'Jarak sedang' : 'Jarak jauh';
    const fasilitasStr = pref.fasilitas >= 4 ? 'Fasilitas tinggi' : 'Fasilitas sedang';
    return `${catStr} • ${budgetStr}, ${jarakStr}, ${fasilitasStr}`;
  };

  // Run MOORA Calculation & Save History
  const handleCalculate = () => {
    setStep(2);
    setCalculationProgress(20);
    const catLabel = selectedCategory === 'Semua Kategori' ? 'Semua Kategori' : `Kategori ${selectedCategory}`;
    setCurrentCalcMessage(`Menyusun Matriks Keputusan X (${currentCandidates.length} Destinasi ${catLabel} x 6 Kriteria)...`);

    const timer1 = setTimeout(() => {
      setCalculationProgress(50);
      setCurrentCalcMessage(`Melakukan Normalisasi Kuadratik Matriks Rasio MOORA (${catLabel})...`);
    }, 350);

    const timer2 = setTimeout(() => {
      setCalculationProgress(80);
      setCurrentCalcMessage('Menghitung Pembobotan dan Nilai Optimasi Yi = ∑Benefit - ∑Cost...');
    }, 700);

    const timer3 = setTimeout(() => {
      const updatedPref: UserPreferences = { ...preferences, kategori: selectedCategory };
      const res = calculateMoora(currentCandidates, updatedPref);
      setMooraResult(res);
      setCalculationProgress(100);
      setStep(3);

      // Simpan ke Riwayat jika user login
      if (res && res.items.length > 0) {
        const historyItem: RecommendationHistoryItem = {
          id: `hist-${Date.now()}`,
          timestamp: new Date().toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }),
          preferences: updatedPref,
          preferenceSummary: createPreferenceSummary(preferences, selectedCategory),
          topResults: res.items.slice(0, 5).map((item) => ({
            id: item.destination.id,
            name: item.destination.name,
            category: item.destination.category,
            scoreYi: item.scoreYi,
            rank: item.rank,
          })),
          resultCount: res.items.length,
          selectedCategory,
        };
        onSaveHistory(historyItem);
      }
    }, 1050);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  };

  // Beralih kategori langsung di halaman hasil (Step 3) secara instan
  const handleSwitchCategoryInResults = (newCategory: string) => {
    setSelectedCategory(newCategory);
    const cands = getCandidateDestinations(newCategory);
    const updatedPref: UserPreferences = { ...preferences, kategori: newCategory };
    const res = calculateMoora(cands, updatedPref);
    setMooraResult(res);
  };

  // Apply Quick Preset
  const handleApplyPreset = (presetName: 'hemat' | 'keluarga' | 'viral') => {
    if (presetName === 'hemat') {
      setPreferences({
        harga: 5,         // Mengutamakan budget murah
        jarak: 2,         // Dekat
        fasilitas: 3,
        kebersihan: 4,
        keamanan: 3,
        popularitas: 3,
      });
    } else if (presetName === 'keluarga') {
      setPreferences({
        harga: 3,
        jarak: 3,
        fasilitas: 5,     // Fasilitas tinggi
        kebersihan: 5,    // Kebersihan tinggi
        keamanan: 5,      // Keamanan tinggi
        popularitas: 4,
      });
    } else if (presetName === 'viral') {
      setPreferences({
        harga: 2,
        jarak: 2,
        fasilitas: 4,
        kebersihan: 4,
        keamanan: 4,
        popularitas: 5,   // Popularitas tinggi
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* 1. STEPPER NAVIGATION HEADER */}
      <div className="mb-10">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-xs sm:text-sm font-bold text-[#2563EB] mb-3">
            <Sparkles className="w-4 h-4" />
            <span>Sistem Pendukung Keputusan MOORA</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
            Kalkulator Rekomendasi Wisata
          </h1>
          <p className="text-sm sm:text-base text-[#334155] mt-2 leading-relaxed">
            Atur preferensi Budget, Jarak, Fasilitas, Kebersihan, Keamanan, dan Popularitas Anda untuk mendapatkan perangkingan destinasi terakurat secara matematis.
          </p>
        </div>

        {/* Stepper Progress Indicator */}
        <div className="flex items-center justify-center max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                step >= 1 ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-gray-200 text-gray-500'
              }`}
            >
              1
            </div>
            <span className={`text-xs sm:text-sm font-bold hidden sm:inline ${step === 1 ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
              Pilih Preferensi
            </span>
          </div>

          <div className={`w-12 sm:w-16 h-1 mx-2 rounded-full transition-all ${step >= 2 ? 'bg-[#2563EB]' : 'bg-gray-200'}`} />

          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                step >= 2 ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-gray-200 text-gray-500'
              }`}
            >
              2
            </div>
            <span className={`text-xs sm:text-sm font-bold hidden sm:inline ${step === 2 ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
              Hitung MOORA
            </span>
          </div>

          <div className={`w-12 sm:w-16 h-1 mx-2 rounded-full transition-all ${step >= 3 ? 'bg-[#2563EB]' : 'bg-gray-200'}`} />

          <div className="flex items-center gap-2">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all ${
                step === 3 ? 'bg-[#2563EB] text-white shadow-sm' : 'bg-gray-200 text-gray-500'
              }`}
            >
              3
            </div>
            <span className={`text-xs sm:text-sm font-bold hidden sm:inline ${step === 3 ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
              Hasil Rekomendasi
            </span>
          </div>
        </div>
      </div>

      {/* 2. STEP 1: FORMULIR PREFERENSI USER */}
      {step === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Controls (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-[#CBD5E1]/50 shadow-xs space-y-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">
                Pilih Preferensi Wisata Anda
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1 leading-relaxed">
                Pilih referensi kategori destinasi dan atur kriteria pencarian di bawah ini untuk perangkingan MOORA yang akurat.
              </p>
            </div>

            {/* 0. REFERENSI KATEGORI WISATA */}
            <div className="bg-[#F8FAFC] p-5 sm:p-6 rounded-2xl border border-[#CBD5E1]/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-sm sm:text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#2563EB]" />
                    <span>Pilih Referensi Kategori Wisata</span>
                  </label>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Pilih kategori destinasi (contoh: <strong>Wisata Alam</strong>) agar MOORA memprioritaskan kategori tersebut, atau pilih <strong>Semua Kategori</strong>.
                  </p>
                </div>
                <span className="text-xs font-extrabold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg shrink-0 self-start sm:self-auto">
                  {currentCandidates.length} Destinasi Terpilih
                </span>
              </div>

              {/* Category Grid Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {RECOMMENDATION_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  const count = getCategoryCount(cat.id);

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`relative flex flex-col p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-blue-50/90 border-[#2563EB] shadow-xs ring-2 ring-blue-500/20'
                          : 'bg-white border-[#CBD5E1]/60 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-[#2563EB]'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected ? (
                          <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[10px] shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {count}
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-bold leading-snug ${isSelected ? 'text-[#1D4ED8]' : 'text-[#0F172A]'}`}>
                        {cat.label}
                      </span>
                      <span className="text-[11px] text-[#64748B] mt-0.5 line-clamp-1">
                        {count} destinasi
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PREFERENCE SLIDERS */}
            <div className="space-y-6">
              {/* 1. Budget */}
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#CBD5E1]/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label htmlFor="pref-budget" className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                    Budget
                  </label>
                  <span className="text-xs sm:text-sm font-extrabold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg self-start sm:self-auto">
                    {getBudgetText(preferences.harga)}
                  </span>
                </div>
                <input
                  id="pref-budget"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={preferences.harga}
                  onChange={(e) => setPreferences((p) => ({ ...p, harga: parseInt(e.target.value) }))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                />
                <div className="flex justify-between text-xs text-[#64748B] font-mono font-bold">
                  <span>[ Rp 20.000</span>
                  <span>─────────────────────</span>
                  <span>Rp 100.000 ]</span>
                </div>
              </div>

              {/* 2. Jarak */}
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#CBD5E1]/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label htmlFor="pref-jarak" className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                    Jarak
                  </label>
                  <span className="text-xs sm:text-sm font-extrabold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg self-start sm:self-auto">
                    {getJarakText(preferences.jarak)}
                  </span>
                </div>
                <input
                  id="pref-jarak"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={preferences.jarak}
                  onChange={(e) => setPreferences((p) => ({ ...p, jarak: parseInt(e.target.value) }))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                />
                <div className="flex justify-between text-xs text-[#64748B] font-mono font-bold">
                  <span>[ Dekat</span>
                  <span>─────────────────────</span>
                  <span>Jauh ]</span>
                </div>
              </div>

              {/* 3. Fasilitas */}
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#CBD5E1]/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label htmlFor="pref-fasilitas" className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                    Fasilitas
                  </label>
                  <span className="text-xs sm:text-sm font-extrabold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg self-start sm:self-auto">
                    {getBenefitText(preferences.fasilitas)}
                  </span>
                </div>
                <input
                  id="pref-fasilitas"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={preferences.fasilitas}
                  onChange={(e) => setPreferences((p) => ({ ...p, fasilitas: parseInt(e.target.value) }))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                />
                <div className="flex justify-between text-xs text-[#64748B] font-mono font-bold">
                  <span>[ Rendah</span>
                  <span>─────────────────────</span>
                  <span>Tinggi ]</span>
                </div>
              </div>

              {/* 4. Kebersihan */}
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#CBD5E1]/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label htmlFor="pref-kebersihan" className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                    Kebersihan
                  </label>
                  <span className="text-xs sm:text-sm font-extrabold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg self-start sm:self-auto">
                    {getBenefitText(preferences.kebersihan)}
                  </span>
                </div>
                <input
                  id="pref-kebersihan"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={preferences.kebersihan}
                  onChange={(e) => setPreferences((p) => ({ ...p, kebersihan: parseInt(e.target.value) }))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                />
                <div className="flex justify-between text-xs text-[#64748B] font-mono font-bold">
                  <span>[ Rendah</span>
                  <span>─────────────────────</span>
                  <span>Tinggi ]</span>
                </div>
              </div>

              {/* 5. Keamanan */}
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#CBD5E1]/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label htmlFor="pref-keamanan" className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                    Keamanan
                  </label>
                  <span className="text-xs sm:text-sm font-extrabold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg self-start sm:self-auto">
                    {getBenefitText(preferences.keamanan)}
                  </span>
                </div>
                <input
                  id="pref-keamanan"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={preferences.keamanan}
                  onChange={(e) => setPreferences((p) => ({ ...p, keamanan: parseInt(e.target.value) }))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                />
                <div className="flex justify-between text-xs text-[#64748B] font-mono font-bold">
                  <span>[ Rendah</span>
                  <span>─────────────────────</span>
                  <span>Tinggi ]</span>
                </div>
              </div>

              {/* 6. Popularitas */}
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#CBD5E1]/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label htmlFor="pref-popularitas" className="text-sm sm:text-base font-extrabold text-[#0F172A]">
                    Popularitas
                  </label>
                  <span className="text-xs sm:text-sm font-extrabold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg self-start sm:self-auto">
                    {getBenefitText(preferences.popularitas)}
                  </span>
                </div>
                <input
                  id="pref-popularitas"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={preferences.popularitas}
                  onChange={(e) => setPreferences((p) => ({ ...p, popularitas: parseInt(e.target.value) }))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                />
                <div className="flex justify-between text-xs text-[#64748B] font-mono font-bold">
                  <span>[ Rendah</span>
                  <span>─────────────────────</span>
                  <span>Tinggi ]</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setPreferences(DEFAULT_PREFERENCES);
                  setSelectedCategory('Semua Kategori');
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-rose-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Preferensi</span>
              </button>

              <button
                type="button"
                id="btn-cari-rekomendasi"
                onClick={handleCalculate}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-base font-black px-8 py-4 rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all cursor-pointer active:scale-95"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Cari Rekomendasi MOORA</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Presets Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#CBD5E1]/50 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-[#2563EB]">
                <Zap className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-[#0F172A]">Preset Cepat</h3>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Pilih profil preferensi instan yang sudah dikonfigurasi:
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('hemat')}
                  className="w-full text-left p-4 rounded-2xl border border-[#CBD5E1]/50 hover:border-[#2563EB] hover:bg-[#F1F5F9] transition-all cursor-pointer space-y-1"
                >
                  <div className="font-extrabold text-sm text-[#0F172A]">
                    💰 Liburan Hemat Budget
                  </div>
                  <div className="text-xs text-[#64748B]">
                    Fokus tiket murah & lokasi dekat.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPreset('keluarga')}
                  className="w-full text-left p-4 rounded-2xl border border-[#CBD5E1]/50 hover:border-[#2563EB] hover:bg-[#F1F5F9] transition-all cursor-pointer space-y-1"
                >
                  <div className="font-extrabold text-sm text-[#0F172A]">
                    👨‍👩‍👧‍👦 Wisata Keluarga
                  </div>
                  <div className="text-xs text-[#64748B]">
                    Fasilitas lengkap, bersih & sangat aman.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyPreset('viral')}
                  className="w-full text-left p-4 rounded-2xl border border-[#CBD5E1]/50 hover:border-[#2563EB] hover:bg-[#F1F5F9] transition-all cursor-pointer space-y-1"
                >
                  <div className="font-extrabold text-sm text-[#0F172A]">
                    📸 Wisata Populer & Hits
                  </div>
                  <div className="text-xs text-[#64748B]">
                    Popularitas tinggi & spot estetik.
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. STEP 2: CALCULATION ANIMATION */}
      {step === 2 && (
        <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#CBD5E1]/40 shadow-md max-w-lg mx-auto text-center space-y-6 my-10">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-[#0F172A]">
              Memproses Perhitungan MOORA
            </h2>
            <p className="text-xs text-[#64748B]">
              Kalkulasi optimasi rasio multi-kriteria...
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-[#2563EB] h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${calculationProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#64748B] font-mono">
              <span className="truncate pr-2">{currentCalcMessage}</span>
              <span className="font-bold text-[#2563EB]">{calculationProgress}%</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. STEP 3: HASIL REKOMENDASI MOORA */}
      {step === 3 && mooraResult && (
        <div className="space-y-10">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-[#CBD5E1]/50 shadow-xs">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-3 py-1 rounded-lg">
                Hasil Terkalkulasi MOORA
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-2 tracking-tight">
                Rekomendasi Untuk Anda
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1">
                Daftar destinasi {selectedCategory === 'Semua Kategori' ? 'semua kategori' : `kategori "${selectedCategory}"`} diurutkan dari skor Yi tertinggi berdasarkan perhitungan MOORA.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#CBD5E1]/60 bg-white hover:bg-gray-50 text-xs font-bold text-[#0F172A] transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#2563EB]" />
                <span>Cetak</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ubah Preferensi</span>
              </button>
            </div>
          </div>

          {/* QUICK CATEGORY SWITCHER PILLS (STEP 3) */}
          <div className="bg-white rounded-3xl p-5 border border-[#CBD5E1]/50 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-[#2563EB]" />
                <span className="text-xs sm:text-sm font-extrabold text-[#0F172A]">Filter Kategori Rekomendasi:</span>
                <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-blue-100 text-blue-700">
                  {selectedCategory} ({mooraResult.items.length} Destinasi)
                </span>
              </div>
              <span className="text-xs text-[#64748B]">
                Klik kategori lain untuk melihat perangkingan MOORA seketika
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {RECOMMENDATION_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = getCategoryCount(cat.id);
                const Icon = cat.icon;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSwitchCategoryInResults(cat.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-[#F1F5F9] text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/25 text-white' : 'bg-white text-slate-600'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CLEAN RECOMMENDATION LIST FORMAT (AS REQUESTED) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBD5E1]/50 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-extrabold text-[#0F172A]">
                Rekomendasi Untuk Anda {selectedCategory !== 'Semua Kategori' && `(${selectedCategory})`}
              </h3>
              <span className="text-xs text-[#64748B] font-semibold">
                Urutan Nilai Optimasi Yi (Skor MOORA)
              </span>
            </div>

            <div className="space-y-4">
              {mooraResult.items.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                    <Info className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-[#0F172A]">Tidak ada destinasi pada kategori ini</h4>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                    Belum ada destinasi wisata aktif untuk kategori <strong>{selectedCategory}</strong>. Silakan pilih kategori lain atau Semua Kategori.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSwitchCategoryInResults('Semua Kategori')}
                    className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-[#1D4ED8] transition-colors cursor-pointer"
                  >
                    Tampilkan Semua Kategori
                  </button>
                </div>
              ) : (
                mooraResult.items.map((item) => {
                const isFavorite = currentUser?.favorites.includes(item.destination.id) || false;
                const isTop1 = item.rank === 1;

                return (
                  <div
                    key={item.destination.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isTop1
                        ? 'bg-blue-50/60 border-blue-200 shadow-xs'
                        : 'bg-[#F8FAFC] border-[#CBD5E1]/50 hover:border-[#2563EB]'
                    }`}
                  >
                    {/* Destination Info & Score */}
                    <div className="flex items-start md:items-center gap-4">
                      {/* Rank Badge */}
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                        isTop1 ? 'bg-amber-400 text-amber-950 shadow-sm' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {item.rank}
                      </div>

                      {/* Image Thumb */}
                      <img
                        src={item.destination.image}
                        alt={item.destination.name}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 hidden sm:block border border-slate-200"
                      />

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-base sm:text-lg text-[#0F172A]">
                            {item.destination.name}
                          </h4>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {item.destination.category}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#64748B]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            {item.destination.location}
                          </span>
                          <span>•</span>
                          <span className="font-black text-[#0F172A]">
                            {item.destination.ticketPriceFormatted}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Score & Detail Button */}
                    <div className="flex items-center justify-between md:justify-end gap-5 pt-3 md:pt-0 border-t md:border-t-0 border-[#CBD5E1]/30">
                      {/* Exact Score formatted cleanly */}
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-[#64748B] block uppercase font-bold">Skor Yi MOORA</span>
                        <span className="text-lg font-mono font-black text-blue-700">
                          {item.scoreYi.toFixed(3)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Save Favorite Button */}
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(item.destination.id)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isFavorite
                              ? 'bg-rose-500 text-white border-rose-500'
                              : 'bg-white text-rose-500 border-rose-200 hover:bg-rose-50'
                          }`}
                          title={isFavorite ? 'Tersimpan di Favorit' : 'Simpan ke Favorit'}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
                        </button>

                        {/* LIHAT DETAIL BUTTON */}
                        <button
                          type="button"
                          onClick={() => setDetailMooraItem(item)}
                          className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-extrabold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <span>Lihat Detail</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }))}
            </div>
          </div>

          {/* COMPLETE MOORA RANKING TABLE */}
          <div className="bg-white rounded-3xl border border-[#CBD5E1]/50 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A]">
                  Tabel Perangkingan MOORA Lengkap
                </h3>
                <p className="text-xs text-[#64748B]">
                  Rincian komponen Total Benefit (∑B) dan Total Cost (∑C).
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F8FAFC] text-[#334155] uppercase font-bold text-xs border-b border-[#CBD5E1]/40">
                  <tr>
                    <th className="px-5 py-4 text-center">Rank</th>
                    <th className="px-5 py-4">Nama Destinasi Wisata</th>
                    <th className="px-5 py-4">Kategori</th>
                    <th className="px-5 py-4 text-right">∑ Benefit</th>
                    <th className="px-5 py-4 text-right">∑ Cost</th>
                    <th className="px-5 py-4 text-right">Nilai Yi</th>
                    <th className="px-5 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[#0F172A]">
                  {mooraResult.items.map((item) => (
                    <tr key={item.destination.id} className="hover:bg-[#F1F5F9]/60 transition-colors">
                      <td className="px-5 py-4 text-center font-bold">{item.rank}</td>
                      <td className="px-5 py-4 font-extrabold">{item.destination.name}</td>
                      <td className="px-5 py-4 text-xs text-[#2563EB] font-bold">{item.destination.category}</td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-blue-700">
                        +{item.benefitTotal.toFixed(4)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-bold text-rose-700">
                        -{item.costTotal.toFixed(4)}
                      </td>
                      <td className="px-5 py-4 text-right font-mono font-black text-blue-700">
                        {item.scoreYi.toFixed(4)}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => setDetailMooraItem(item)}
                          className="px-3 py-1 bg-blue-50 text-[#2563EB] hover:bg-[#2563EB] hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Rincian
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETIL RANKING MOORA (SAAT USER KLIK "LIHAT DETAIL") */}
      {detailMooraItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-[#CBD5E1]/40 relative my-8">
            <div className="p-6 bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-base shadow-sm">
                  #{detailMooraItem.rank}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold">{detailMooraItem.destination.name}</h3>
                  <p className="text-xs text-blue-100">
                    Mengapa destinasi ini mendapat ranking #{detailMooraItem.rank}?
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDetailMooraItem(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Score Highlight Box */}
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#CBD5E1]/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#64748B] font-bold block">Skor Akhir Yi MOORA</span>
                  <span className="text-3xl font-mono font-black text-[#2563EB]">
                    {detailMooraItem.scoreYi.toFixed(4)}
                  </span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-full block">
                    Status: {detailMooraItem.recommendationStatus}
                  </span>
                  <span className="text-xs text-[#64748B] block">
                    Total Benefit: +{detailMooraItem.benefitTotal.toFixed(3)} | Cost: -{detailMooraItem.costTotal.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Destination Overview */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">Informasi Destinasi</h4>
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="bg-gray-50 p-3 rounded-xl border">
                    <span className="text-[#64748B] block text-[11px]">Kategori</span>
                    <span className="font-extrabold text-[#0F172A]">{detailMooraItem.destination.category}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border">
                    <span className="text-[#64748B] block text-[11px]">Tiket Masuk</span>
                    <span className="font-extrabold text-[#0F172A]">{detailMooraItem.destination.ticketPriceFormatted}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border">
                    <span className="text-[#64748B] block text-[11px]">Lokasi</span>
                    <span className="font-extrabold text-[#0F172A] truncate block">{detailMooraItem.destination.location}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border">
                    <span className="text-[#64748B] block text-[11px]">Jam Buka</span>
                    <span className="font-extrabold text-[#0F172A] truncate block">{detailMooraItem.destination.operationalHours}</span>
                  </div>
                </div>
              </div>

              {/* Criteria Scores Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#64748B]">Breakdown Nilai Kriteria MOORA</h4>
                <div className="space-y-2 bg-[#F1F5F9] p-4 rounded-2xl border border-[#CBD5E1]/40 text-xs">
                  {CRITERIA_DEFINITIONS.map((crit) => {
                    const rawVal = detailMooraItem.destination.criteria[crit.key as keyof Destination['criteria']];
                    const normVal = detailMooraItem.normalized[crit.key as keyof typeof detailMooraItem.normalized];
                    const weightVal = detailMooraItem.weighted[crit.key as keyof typeof detailMooraItem.weighted];

                    return (
                      <div key={crit.key} className="bg-white p-3 rounded-xl border flex items-center justify-between">
                        <div>
                          <span className="font-bold text-[#0F172A]">{crit.code}. {crit.name}</span>
                          <span className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${crit.type === 'Cost' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'}`}>
                            {crit.type}
                          </span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-extrabold text-[#2563EB] mr-2">Skor: {rawVal}/5</span>
                          <span className="text-[#64748B] text-[11px]">Terbobot: {weightVal.toFixed(4)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 bg-gray-50 border-t flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const dest = detailMooraItem.destination;
                  setDetailMooraItem(null);
                  onSelectDestination(dest);
                }}
                className="px-5 py-2.5 bg-white border border-[#CBD5E1]/60 hover:bg-gray-100 text-[#0F172A] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Buka Informasi Wisata Lengkap
              </button>

              <button
                type="button"
                onClick={() => setDetailMooraItem(null)}
                className="px-6 py-2.5 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-[#1D4ED8] transition-colors cursor-pointer"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
