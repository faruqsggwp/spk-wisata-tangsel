import React from 'react';
import {
  Sparkles,
  Compass,
  MapPin,
  Star,
  ArrowRight,
  Sliders,
  Trees,
  Utensils,
  Building2,
  Landmark,
  Briefcase,
  Home,
  Heart
} from 'lucide-react';
import { Destination, UserAccount } from '../types';

interface HomePageProps {
  onStartRekomendasi: () => void;
  onExploreWisata: (categoryFilter?: string) => void;
  onSelectDestination: (dest: Destination) => void;
  featuredDestinations: Destination[];
  currentUser?: UserAccount | null;
  onToggleFavorite?: (destId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartRekomendasi,
  onExploreWisata,
  onSelectDestination,
  featuredDestinations,
  currentUser,
  onToggleFavorite,
}) => {
  return (
    <div className="min-h-screen pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 bg-slate-950 text-white shadow-2xl group border border-slate-800">
        {/* Background Image with Transparent Gradient Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEx3CTKRNiss5o8cRpMmBunleGmjdkn_z8OvszRu3qFcxXyi2PhYBiTmiJ9ZoFG9aCc_GSvWaMdE4jA5gc1TWSL-xYpxK9n_ouz7HIp_bpwYPIdMsE960VAsJbN2PmnuZd2HoxNLdYbzUmiOf7XcyWBqPf-X4PD1WO9ASHGIeA4i58aT9RLlgWxvQayd2-4qKn93yrkPYuZmwtE1TPRL_PPMcwi_SAjZ5izTZlauLwoYNCaUKcSulQ"
            alt="Aerial Tangerang Selatan Urban Park"
            className="w-full h-full object-cover opacity-80 filter brightness-105 contrast-110 group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Subtle Transparent Emerald & Dark Vignette Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/50 to-slate-950/70 backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl px-6 sm:px-12 py-16 sm:py-24 space-y-6 sm:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-extrabold text-cyan-300 tracking-wide shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Temukan Wisata Favoritmu di Tangerang Selatan</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
            Temukan Tempat Wisata Terbaik Berdasarkan Preferensi Kamu
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-200 max-w-3xl font-normal leading-relaxed">
            Sistem cerdas berbasis <em className="text-cyan-300 not-italic font-semibold">Multi-Objective Optimization by Ratio Analysis (MOORA)</em> untuk membantu Anda memilih destinasi liburan ideal di Tangerang Selatan secara objektif berdasarkan 6 kriteria terukur.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              id="hero-btn-mulai-rekomendasi"
              onClick={onStartRekomendasi}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] hover:from-[#1E40AF] hover:to-[#1D4ED8] text-white text-sm sm:text-base font-black shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <Sliders className="w-5 h-5 text-white" />
              <span>Mulai Rekomendasi</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>

            <button
              id="hero-btn-lihat-wisata"
              onClick={() => onExploreWisata()}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/25 text-sm sm:text-base font-bold transition-all duration-200 cursor-pointer backdrop-blur-md"
            >
              <Compass className="w-5 h-5 text-white" />
              <span>Lihat Semua Wisata</span>
            </button>
          </div>

          {/* Key Metric Highlights */}
          <div className="pt-8 grid grid-cols-3 gap-6 border-t border-white/20 max-w-xl">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white">70+</div>
              <div className="text-xs sm:text-sm text-slate-300 font-semibold mt-1">Destinasi Tangsel</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white">6</div>
              <div className="text-xs sm:text-sm text-slate-300 font-semibold mt-1">Kategori Utama</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white">100%</div>
              <div className="text-xs sm:text-sm text-slate-300 font-semibold mt-1">Akurat MOORA</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24 space-y-20 sm:space-y-28">
        {/* 2. KATEGORI DESTINASI TANGSEL */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
            <div>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-4 py-1.5 rounded-full">
                Eksplorasi Kategori
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] mt-3 tracking-tight">
                Kategori Wisata Tangerang Selatan
              </h2>
            </div>
            <button
              onClick={() => onExploreWisata()}
              className="text-xs sm:text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Jelajahi Semua Destinasi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Kategori 1: Wisata Alam */}
            <div
              id="category-card-alam"
              onClick={() => onExploreWisata('Wisata Alam')}
              className="group relative rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer h-72 sm:h-80 border border-[#CBD5E1]/40"
            >
              <img
                src="/assets/aistudio/Asset/Tandon%20Ciater.webp"
                alt="Wisata Alam Tangerang Selatan"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-cyan-300 mb-1">
                  <Trees className="w-4 h-4" />
                  <span>Keindahan Alam</span>
                </div>
                <h3 className="text-xl font-extrabold">Wisata Alam</h3>
                <p className="text-xs sm:text-sm text-gray-200 mt-1 line-clamp-2 leading-relaxed">
                  Situ Gintung, Taman Kota 1 & 2 Jaletreng, Tandon Ciater, & Jombang.
                </p>
              </div>
            </div>

            {/* Kategori 2: Wisata Budaya */}
            <div
              id="category-card-budaya"
              onClick={() => onExploreWisata('Wisata Budaya')}
              className="group relative rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer h-72 sm:h-80 border border-[#CBD5E1]/40"
            >
              <img
                src="/assets/aistudio/Asset/Rumah%20Seni%20Budaya%20Lengkong%20(RSBL).webp"
                alt="Wisata Budaya Tangerang Selatan"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-300 mb-1">
                  <Landmark className="w-4 h-4" />
                  <span>Kesenian & Tradisi</span>
                </div>
                <h3 className="text-xl font-extrabold">Wisata Budaya</h3>
                <p className="text-xs sm:text-sm text-gray-200 mt-1 line-clamp-2 leading-relaxed">
                  Puspo Budoyo, Palagan Lengkong, Boen Hay Bio, Cirendeu, & Sawah.
                </p>
              </div>
            </div>

            {/* Kategori 3: Wisata Buatan */}
            <div
              id="category-card-buatan"
              onClick={() => onExploreWisata('Wisata Buatan')}
              className="group relative rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer h-72 sm:h-80 border border-[#CBD5E1]/40"
            >
              <img
                src="/assets/aistudio/Asset/Ocean%20Park.webp"
                alt="Wisata Buatan Tangerang Selatan"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-sky-300 mb-1">
                  <Building2 className="w-4 h-4" />
                  <span>Rekreasi & Mall Modern</span>
                </div>
                <h3 className="text-xl font-extrabold">Wisata Buatan</h3>
                <p className="text-xs sm:text-sm text-gray-200 mt-1 line-clamp-2 leading-relaxed">
                  BXSea, Trans Snow World, Ocean Park, Broadway, AEON, & Breeze.
                </p>
              </div>
            </div>

            {/* Kategori 4: Wisata MICE */}
            <div
              id="category-card-mice"
              onClick={() => onExploreWisata('Wisata MICE')}
              className="group relative rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer h-72 sm:h-80 border border-[#CBD5E1]/40"
            >
              <img
                src="/assets/aistudio/Asset/Damai%20Indah%20Golf%20BSD%20City.webp"
                alt="Wisata MICE Tangerang Selatan"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-300 mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span>Bisnis & Pameran</span>
                </div>
                <h3 className="text-xl font-extrabold">Wisata MICE</h3>
                <p className="text-xs sm:text-sm text-gray-200 mt-1 line-clamp-2 leading-relaxed">
                  ICE BSD, Kawasan Bisnis BSD, dan Kawasan Alam Sutera.
                </p>
              </div>
            </div>

            {/* Kategori 5: Wisata Kuliner */}
            <div
              id="category-card-kuliner"
              onClick={() => onExploreWisata('Wisata Kuliner')}
              className="group relative rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer h-72 sm:h-80 border border-[#CBD5E1]/40"
            >
              <img
                src="/assets/aistudio/Asset/Flavor%20Bliss.webp"
                alt="Wisata Kuliner Tangerang Selatan"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-300 mb-1">
                  <Utensils className="w-4 h-4" />
                  <span>Kuliner & Jajanan</span>
                </div>
                <h3 className="text-xl font-extrabold">Wisata Kuliner</h3>
                <p className="text-xs sm:text-sm text-gray-200 mt-1 line-clamp-2 leading-relaxed">
                  Pasar Modern BSD, Taman Jajan BSD, Bintaro, Pamulang, & Serpong.
                </p>
              </div>
            </div>

            {/* Kategori 6: Kampung Wisata */}
            <div
              id="category-card-kampung"
              onClick={() => onExploreWisata('Kampung Wisata')}
              className="group relative rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer h-72 sm:h-80 border border-[#CBD5E1]/40"
            >
              <img
                src="/assets/aistudio/Asset/Kampung%20Konservasi%20Rimbun.webp"
                alt="Kampung Wisata Tangerang Selatan"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-cyan-300 mb-1">
                  <Home className="w-4 h-4" />
                  <span>Desa & Kampung Tematik</span>
                </div>
                <h3 className="text-xl font-extrabold">Kampung Wisata</h3>
                <p className="text-xs sm:text-sm text-gray-200 mt-1 line-clamp-2 leading-relaxed">
                  Keranggan, Kampung Jawa, Akar Bambu, & Konservasi Rimbun.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. DESTINASI PILIHAN TERATAS PREVIEW */}
        <section>
          <div className="flex items-center justify-between mb-8 sm:mb-10">
            <div>
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#2563EB] bg-blue-50 px-4 py-1.5 rounded-full">
                Rekomendasi Terpopuler
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#0F172A] mt-3 tracking-tight">
                Destinasi Favorit Tangerang Selatan
              </h2>
            </div>
            <button
              onClick={() => onExploreWisata()}
              className="text-xs sm:text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Semua Destinasi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {featuredDestinations.slice(0, 3).map((dest) => {
              const isFav = currentUser?.favorites.includes(dest.id) || false;
              return (
                <div
                  key={dest.id}
                  onClick={() => onSelectDestination(dest)}
                  className="bg-white rounded-3xl overflow-hidden border border-[#CBD5E1]/50 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col relative"
                >
                  {/* Image & Pill */}
                  <div className="relative h-56 sm:h-64 overflow-hidden bg-gray-100">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-sm border border-white/20">
                      {dest.category}
                    </div>

                    {/* ♡ Simpan Button on top right */}
                    {onToggleFavorite && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(dest.id);
                        }}
                        className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${isFav
                            ? 'bg-rose-500 text-white'
                            : 'bg-white/90 text-gray-800 hover:bg-white hover:text-rose-600'
                          }`}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : 'text-rose-500'}`} />
                        <span>{isFav ? '♥ Tersimpan' : '♡ Simpan'}</span>
                      </button>
                    )}

                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-xs text-[#0F172A] text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{dest.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-extrabold text-lg sm:text-xl text-[#0F172A] group-hover:text-blue-600 transition-colors">
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

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-xs sm:text-sm">
                        <span className="text-[#64748B] text-xs">Tiket: </span>
                        <span className="font-black text-[#0F172A] ml-1">{dest.ticketPriceFormatted}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Detail <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
