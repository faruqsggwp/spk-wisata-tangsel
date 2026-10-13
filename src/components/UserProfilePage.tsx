import React, { useState } from 'react';
import {
  User,
  Heart,
  Clock,
  Sparkles,
  MapPin,
  Star,
  Trash2,
  ArrowRight,
  Calendar,
  Sliders,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Destination, UserAccount, RecommendationHistoryItem } from '../types';

interface UserProfilePageProps {
  currentUser: UserAccount | null;
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  onToggleFavorite: (destId: string) => void;
  onLoadHistory: (historyItem: RecommendationHistoryItem) => void;
  onDeleteHistory?: (historyId: string) => void;
  onGoToRekomendasi: () => void;
  onGoToWisata: () => void;
  onLogout: () => void;
  onOpenLogin: () => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
  currentUser,
  destinations,
  onSelectDestination,
  onToggleFavorite,
  onLoadHistory,
  onDeleteHistory,
  onGoToRekomendasi,
  onGoToWisata,
  onLogout,
  onOpenLogin,
}) => {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'favorites' | 'history'>('favorites');

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-blue-50 text-[#2563EB] rounded-3xl flex items-center justify-center mx-auto shadow-xs">
          <User className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
            Anda Belum Login
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] max-w-md mx-auto leading-relaxed">
            Silakan login untuk mengakses Profil Saya, melihat Destinasi Favorit tersimpan, dan membuka Riwayat Rekomendasi MOORA.
          </p>
        </div>
        <button
          onClick={onOpenLogin}
          className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-extrabold px-8 py-3.5 rounded-2xl shadow-md transition-all cursor-pointer"
        >
          <span>Login / Register User</span>
          <ArrowRight className="w-4.5 h-4.5" />
        </button>
      </div>
    );
  }

  // Get favorite destination objects
  const favoriteDestinations = destinations.filter((d) => currentUser.favorites.includes(d.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* User Header Profile Card */}
      <div className="bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] rounded-3xl p-6 sm:p-10 text-white shadow-xl mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5 z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-inner border border-white/20 shrink-0">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-blue-100">
              <User className="w-3.5 h-3.5 text-blue-200" />
              <span>Wisatawan Tangsel</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{currentUser.name}</h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 z-10 shrink-0">
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/5 rounded-full pointer-events-none" />
      </div>

      {/* Profile Sidebar & Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-3xl p-4 border border-[#CBD5E1]/50 shadow-xs space-y-1.5">
            <div className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-[#64748B]">
              Profil Saya
            </div>

            <button
              onClick={() => setActiveTab('recommendations')}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'recommendations'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#2563EB]'
                }`}
            >
              <span className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>Rekomendasi Saya</span>
              </span>
              <ChevronRight className="w-4 h-4 opacity-70" />
            </button>

            <button
              onClick={() => setActiveTab('favorites')}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'favorites'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#2563EB]'
                }`}
            >
              <span className="flex items-center gap-3">
                <Heart className={`w-5 h-5 ${currentUser.favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>Destinasi Favorit</span>
              </span>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${activeTab === 'favorites' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
                }`}>
                {currentUser.favorites.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'history'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#2563EB]'
                }`}
            >
              <span className="flex items-center gap-3">
                <Clock className="w-5 h-5" />
                <span>Riwayat Rekomendasi</span>
              </span>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-900'
                }`}>
                {currentUser.history.length}
              </span>
            </button>
          </div>
        </div>

        {/* Main Tab Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* TAB 1: Rekomendasi Saya */}
          {activeTab === 'recommendations' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBD5E1]/50 shadow-xs space-y-6">
              <div className="border-b pb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-3 py-1 rounded-lg">
                  Fitur Utama User
                </span>
                <h2 className="text-2xl font-extrabold text-[#0F172A] mt-2">Rekomendasi Saya</h2>
                <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
                  Cari destinasi wisata Tangerang Selatan berdasarkan preferensi Budget, Jarak, Fasilitas, Kebersihan, Keamanan, dan Popularitas menggunakan metode MOORA.
                </p>
              </div>

              <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-[#CBD5E1]/50 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-md">
                    <Sparkles className="w-6 h-6 text-amber-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg text-[#0F172A]">Mulai Analisis Rekomendasi Baru</h3>
                    <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                      Sistem akan secara matematis menghitung alternatif terbaik yang paling cocok dengan kriteria liburan Anda.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={onGoToRekomendasi}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-extrabold px-6 py-3.5 rounded-2xl shadow-sm transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Buka Kalkulator SPK MOORA</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {currentUser.history.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-extrabold text-[#0F172A]">Hasil Analisis Terakhir Anda:</h3>
                  <div className="p-4 rounded-2xl border border-[#CBD5E1]/50 bg-white hover:bg-[#F1F5F9]/50 transition-colors flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-[#64748B] font-semibold">
                        {currentUser.history[0].timestamp}
                      </div>
                      <div className="text-sm font-extrabold text-[#0F172A] mt-0.5">
                        {currentUser.history[0].preferenceSummary}
                      </div>
                      <div className="text-xs text-[#2563EB] font-bold mt-1">
                        Top Result: #{currentUser.history[0].topResults[0]?.rank || 1} {currentUser.history[0].topResults[0]?.name}
                      </div>
                    </div>

                    <button
                      onClick={() => onLoadHistory(currentUser.history[0])}
                      className="px-4 py-2.5 bg-[#2563EB] text-white text-xs font-bold rounded-xl hover:bg-[#1D4ED8] transition-colors shrink-0 cursor-pointer"
                    >
                      Lihat Hasil
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Destinasi Favorit */}
          {activeTab === 'favorites' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBD5E1]/50 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-lg">
                    Tersimpan
                  </span>
                  <h2 className="text-2xl font-extrabold text-[#0F172A] mt-2">Destinasi Favorit</h2>
                  <p className="text-sm text-[#64748B] mt-1">
                    Daftar tempat wisata yang Anda tandai dengan tombol <span className="text-rose-600 font-bold">♡ Simpan</span>.
                  </p>
                </div>
                <span className="text-xs font-black text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full">
                  {favoriteDestinations.length} Destinasi
                </span>
              </div>

              {favoriteDestinations.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl space-y-4">
                  <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                    <Heart className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#0F172A]">Belum ada destinasi favorit</h3>
                    <p className="text-xs text-[#64748B]">
                      Klik tombol <strong className="text-rose-600 font-bold">♡ Simpan</strong> pada kartu destinasi wisata untuk menyimpannya ke daftar ini.
                    </p>
                  </div>
                  <button
                    onClick={onGoToWisata}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-xs font-extrabold rounded-xl hover:bg-[#1D4ED8] transition-colors cursor-pointer"
                  >
                    <span>Jelajahi Katalog Wisata</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favoriteDestinations.map((dest) => (
                    <div
                      key={dest.id}
                      className="bg-[#F8FAFC] rounded-2xl overflow-hidden border border-[#CBD5E1]/50 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(dest.id);
                          }}
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-rose-600 hover:bg-white transition-colors cursor-pointer shadow-sm"
                          title="Hapus dari favorit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-3 left-3 bg-[#2563EB] text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                          {dest.category}
                        </div>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-extrabold text-base text-[#0F172A] line-clamp-1">
                            {dest.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate">{dest.location}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="font-extrabold text-[#0F172A]">
                              {dest.ticketPriceFormatted}
                            </span>
                            <span className="flex items-center gap-1 font-bold text-amber-600">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              {dest.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onSelectDestination(dest)}
                          className="w-full py-2 bg-white hover:bg-blue-50 text-[#2563EB] border border-[#CBD5E1]/60 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>Lihat Detail Lengkap</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Riwayat Rekomendasi */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBD5E1]/50 shadow-xs space-y-6">
              <div className="border-b pb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-3 py-1 rounded-lg">
                  Arsip Pencarian MOORA
                </span>
                <h2 className="text-2xl font-extrabold text-[#0F172A] mt-2">Riwayat Rekomendasi</h2>
                <p className="text-sm text-[#64748B] mt-1">
                  Riwayat pencarian preferensi kriteria yang pernah Anda lakukan beserta hasil rekomendasi 5 besar.
                </p>
              </div>

              {currentUser.history.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#0F172A]">Belum ada riwayat rekomendasi</h3>
                    <p className="text-xs text-[#64748B]">
                      Lakukan pencarian pada Kalkulator Rekomendasi MOORA untuk menyimpannya di sini.
                    </p>
                  </div>
                  <button
                    onClick={onGoToRekomendasi}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-xs font-extrabold rounded-xl hover:bg-[#1D4ED8] transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Cari Rekomendasi Sekarang</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentUser.history.map((item) => (
                    <div
                      key={item.id}
                      className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#CBD5E1]/50 space-y-4 hover:border-[#2563EB] transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CBD5E1]/30 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-[#2563EB]">
                            <Calendar className="w-4 h-4" />
                            <span>{item.timestamp}</span>
                          </div>
                          {(item.selectedCategory || item.preferences?.kategori) && (
                            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                              {item.selectedCategory || item.preferences?.kategori}
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-bold text-[#64748B]">
                          Hasil: {item.resultCount} Destinasi Terkalkulasi
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-xs font-extrabold text-[#0F172A]">Preferensi Input:</span>
                        <p className="text-xs sm:text-sm text-[#334155] font-semibold bg-white p-3 rounded-xl border border-[#CBD5E1]/40">
                          {item.preferenceSummary}
                        </p>
                      </div>

                      {/* Top Results Preview */}
                      <div className="space-y-2">
                        <span className="text-xs font-extrabold text-[#0F172A]">Peringkat Teratas (Top 3):</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {item.topResults.slice(0, 3).map((res) => (
                            <div key={res.id} className="bg-white p-2.5 rounded-xl border text-xs flex items-center justify-between">
                              <span className="font-extrabold text-[#0F172A] truncate pr-1">
                                #{res.rank} {res.name}
                              </span>
                              <span className="font-mono font-bold text-[#2563EB] shrink-0">
                                {res.scoreYi.toFixed(3)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-2">
                        {onDeleteHistory && (
                          <button
                            type="button"
                            onClick={() => onDeleteHistory(item.id)}
                            className="p-2.5 rounded-xl border border-gray-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus riwayat ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onLoadHistory(item)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
                        >
                          <span>Lihat Hasil</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
