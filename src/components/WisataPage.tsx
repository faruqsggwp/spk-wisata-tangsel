import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  ArrowRight, 
  SlidersHorizontal, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  DollarSign, 
  Heart 
} from 'lucide-react';
import { Destination, CategoryType, UserAccount } from '../types';

interface WisataPageProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  initialCategory?: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onGoToRekomendasi: () => void;
  currentUser: UserAccount | null;
  onToggleFavorite: (destId: string) => void;
}

const CATEGORIES: CategoryType[] = [
  'Semua Kategori',
  'Wisata Alam',
  'Wisata Budaya',
  'Wisata Buatan',
  'Wisata MICE',
  'Wisata Kuliner',
  'Kampung Wisata'
];

export const WisataPage: React.FC<WisataPageProps> = ({
  destinations,
  onSelectDestination,
  initialCategory,
  searchQuery,
  setSearchQuery,
  onGoToRekomendasi,
  currentUser,
  onToggleFavorite,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'Semua Kategori');
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'harga'>('rating');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Filter and Sort destinations with deduplication safeguard
  const filteredDestinations = useMemo(() => {
    // Defensive deduplication by ID and normalized name
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

    return uniqueDestinations.filter((dest) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'Semua Kategori' ||
        dest.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        dest.primaryCategory.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (dest.theme && dest.theme.toLowerCase().includes(selectedCategory.toLowerCase()));

      // Search query filter
      const matchesSearch =
        searchQuery === '' ||
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'harga') {
        return a.criteria.harga - b.criteria.harga;
      }
      return 0;
    });
  }, [destinations, selectedCategory, searchQuery, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage) || 1;
  const paginatedDestinations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDestinations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDestinations, currentPage]);

  // Ensure currentPage stays within valid bounds when filters change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= Math.max(3, currentPage + 1); i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = Math.min(totalPages - 2, currentPage - 1); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const handleResetFilter = () => {
    setSelectedCategory('Semua Kategori');
    setSearchQuery('');
    setSortBy('rating');
    setCurrentPage(1);
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Page Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-xs sm:text-sm font-bold text-[#2563EB] mb-3">
              <MapPin className="w-4 h-4" />
              <span>Katalog Wisata Kota Tangerang Selatan</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight">
              Jelajahi Wisata Tangerang Selatan
            </h1>
            <p className="text-sm sm:text-base text-[#334155] mt-2.5 max-w-3xl leading-relaxed">
              Daftar alternatif destinasi wisata terverifikasi lengkap dengan parameter penilaian MOORA (Harga, Jarak, Fasilitas, Akses, Kebersihan, Keamanan, dan Popularitas).
            </p>
          </div>

          <button
            onClick={onGoToRekomendasi}
            className="inline-flex items-center gap-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm sm:text-base font-extrabold px-6 py-3 rounded-2xl shadow-sm shadow-blue-500/20 hover:shadow-md transition-all self-start md:self-auto cursor-pointer"
          >
            <span>Hitung Rekomendasi MOORA</span>
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#CBD5E1]/50 shadow-xs mb-10 space-y-5">
        {/* Search & Sort Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              id="wisata-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari berdasarkan nama tempat, lokasi, atau kata kunci..."
              className="w-full pl-11 pr-4 py-3 text-sm sm:text-base rounded-2xl bg-[#F1F5F9] text-[#0F172A] placeholder-[#64748B] border border-transparent focus:border-[#2563EB] focus:bg-white focus:outline-none transition-all"
            />
            <Search className="w-5 h-5 text-[#64748B] absolute left-4 top-3.5" />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-sm text-[#334155]">
              <SlidersHorizontal className="w-4 h-4 text-[#2563EB]" />
              <span className="font-bold hidden sm:inline">Urutkan:</span>
            </div>
            <select
              id="wisata-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm font-bold py-3 px-4 rounded-2xl bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]/50 focus:border-[#2563EB] focus:outline-none cursor-pointer"
            >
              <option value="rating">Rating Tertinggi</option>
              <option value="harga">Harga Termurah (Cost Rendah)</option>
              <option value="name">Nama (A - Z)</option>
            </select>

            {(selectedCategory !== 'Semua Kategori' || searchQuery !== '') && (
              <button
                id="wisata-reset-filter-btn"
                onClick={handleResetFilter}
                className="text-sm font-bold px-4 py-3 rounded-2xl text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset Filter"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-2 no-scrollbar border-t border-gray-100">
          <span className="text-sm font-bold text-[#64748B] shrink-0 mr-2 hidden sm:inline">
            Kategori:
          </span>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-white text-[#334155] border border-slate-200 hover:border-[#2563EB] hover:text-[#2563EB]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Destination Grid */}
      {paginatedDestinations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 sm:p-16 text-center border border-[#CBD5E1]/50 max-w-lg mx-auto space-y-4">
          <Info className="w-14 h-14 text-[#64748B] mx-auto" />
          <h3 className="text-xl font-extrabold text-[#0F172A]">Tidak ada destinasi yang sesuai</h3>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Coba ubah kata kunci pencarian Anda atau pilih kategori lain.
          </p>
          <button
            onClick={handleResetFilter}
            className="px-6 py-3 text-sm font-bold bg-[#2563EB] text-white rounded-2xl hover:bg-[#1D4ED8] transition-colors cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {paginatedDestinations.map((dest) => {
            const isFav = currentUser?.favorites.includes(dest.id) || false;
            return (
              <div
                key={dest.id}
                onClick={() => onSelectDestination(dest)}
                className="bg-white rounded-3xl overflow-hidden border border-[#CBD5E1]/50 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col relative"
              >
                {/* Card Image */}
                <div className="relative h-60 sm:h-64 overflow-hidden bg-gray-100">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
                    <div className="bg-slate-950/80 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs border border-white/20 backdrop-blur-md">
                      {dest.primaryCategory}
                    </div>
                  </div>

                  {/* ♡ Simpan Button on top right */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(dest.id);
                    }}
                    className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                      isFav
                        ? 'bg-rose-500 text-white'
                        : 'bg-white/90 text-gray-800 hover:bg-white hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : 'text-rose-500'}`} />
                    <span>{isFav ? '♥ Tersimpan' : '♡ Simpan'}</span>
                  </button>

                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs text-[#0F172A] text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{dest.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-extrabold text-lg sm:text-xl text-[#0F172A] group-hover:text-blue-600 transition-colors line-clamp-1">
                      {dest.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#64748B] mt-2">
                      <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="truncate">{dest.location}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#334155] mt-3 line-clamp-2 leading-relaxed">
                      {dest.description}
                    </p>
                  </div>

                  {/* Card Meta & Action */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="text-[#64748B] block text-[11px] font-medium">Tiket Masuk</span>
                      <span className="font-black text-[#0F172A] text-sm sm:text-base">
                        {dest.ticketPriceFormatted}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 font-extrabold text-xs sm:text-sm text-slate-700 bg-slate-100 group-hover:bg-[#2563EB] group-hover:text-white px-4 py-2 rounded-xl transition-all">
                      <span>Detail</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="mt-14 flex items-center justify-center gap-2 sm:gap-2.5">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2.5 sm:p-3 rounded-2xl border border-[#CBD5E1]/60 bg-white text-[#334155] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            aria-label="Halaman sebelumnya"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {getPageNumbers().map((page, idx) => {
            if (typeof page === 'string') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-10 sm:w-11 sm:h-11 flex items-center justify-center text-sm font-black text-slate-400 select-none tracking-widest"
                >
                  ...
                </span>
              );
            }
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/25'
                    : 'bg-white border border-[#CBD5E1]/60 text-[#334155] hover:bg-gray-50 hover:border-blue-300'
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2.5 sm:p-3 rounded-2xl border border-[#CBD5E1]/60 bg-white text-[#334155] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            aria-label="Halaman berikutnya"
            title="Halaman Berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
