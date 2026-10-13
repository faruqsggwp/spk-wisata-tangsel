import React from 'react';
import {
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  MapPin,
  Compass,
  CheckCircle2,
  TreePine,
  Search,
  Building2,
  UtensilsCrossed,
  SlidersHorizontal,
  Star,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Map,
  Award
} from 'lucide-react';
import { CRITERIA_DEFINITIONS } from '../utils/moora';
import { useNavigate } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const costCriteria = CRITERIA_DEFINITIONS.filter(c => c.type === 'Cost');
  const benefitCriteria = CRITERIA_DEFINITIONS.filter(c => c.type === 'Benefit');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16 animate-fade-in">
      
      {/* 1. Hero Header with Ambient Glow & Badges */}
      <div className="relative text-center max-w-3xl mx-auto space-y-6 pt-4">
        {/* Soft Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs sm:text-sm font-black text-[#2563EB] shadow-xs backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
          <span>Tentang Destinasi Wisata Tangsel</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#0F172A] tracking-tight leading-[1.15]">
          Kenali Destinasi Wisata <br />
          <span className="bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-blue-600 bg-clip-text text-transparent">
            Kota Tangerang Selatan
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#475569] leading-relaxed font-normal max-w-2xl mx-auto">
          Platform informasi terpadu dan sistem pendukung keputusan cerdas yang membantu Anda 
          menemukan ragam destinasi liburan terbaik di Tangerang Selatan secara objektif, praktis, 
          dan sesuai preferensi personal.
        </p>

        {/* Quick Highlights Bar */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-extrabold text-[#2563EB]">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#CBD5E1]/50 shadow-xs">
            <Map className="w-4 h-4 text-[#2563EB]" />
            <span>20+ Destinasi Pilihan</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#CBD5E1]/50 shadow-xs">
            <Award className="w-4 h-4 text-[#2563EB]" />
            <span>Metode Rekomendasi MOORA</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#CBD5E1]/50 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span>Data Lokasi Terverifikasi</span>
          </div>
        </div>
      </div>

      {/* 2. Jelajahi Wisata Tangerang Selatan (4 Pilar Kategori) */}
      <section className="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-[#CBD5E1]/50 shadow-sm space-y-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#2563EB] bg-blue-50 px-3 py-1 rounded-lg">
              <Compass className="w-3.5 h-3.5" />
              <span>Daya Tarik Kota</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
              Jelajahi Ragam Pesona Wisata
            </h2>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Tangerang Selatan memadukan keindahan alam asri, kemajuan rekreasi buatan modern, 
              hingga warisan budaya dan kuliner yang sangat beragam.
            </p>
          </div>
        </div>

        {/* Interactive Aesthetic Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Wisata Alam */}
          <div className="group bg-gradient-to-b from-[#F8FAFC] to-white p-6 rounded-3xl border border-[#CBD5E1]/40 hover:border-[#2563EB] hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1D4ED8] to-[#2563EB] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <TreePine className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                Wisata Alam & Edukasi
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Kawasan tepi danau alami, keasrian hutan kota, susur sungai Cisadane, dan ruang terbuka hijau yang menenangkan.
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center text-[11px] font-extrabold text-[#2563EB] gap-1">
              <span>Jelajahi Alam</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Rekreasi Keluarga */}
          <div className="group bg-gradient-to-b from-[#F8FAFC] to-white p-6 rounded-3xl border border-[#CBD5E1]/40 hover:border-[#2563EB] hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1E3A8A] to-[#2563EB] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                Rekreasi Keluarga Modern
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Wahana akuarium terpanjang, arena bermain salju bertaraf internasional, theme park air, dan open-air lifestyle mall.
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center text-[11px] font-extrabold text-[#2563EB] gap-1">
              <span>Wahana Keluarga</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Seni & Budaya */}
          <div className="group bg-gradient-to-b from-[#F8FAFC] to-white p-6 rounded-3xl border border-[#CBD5E1]/40 hover:border-amber-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-[#0F172A] group-hover:text-amber-700 transition-colors">
                Seni & Kearifan Budaya
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Kampung tematik pelestari kesenian tradisional daerah, workshop kriya lokal, sanggar tari, dan balai adat Sunda/Jawa.
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center text-[11px] font-extrabold text-amber-700 gap-1">
              <span>Warisan Seni</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Kuliner & MICE */}
          <div className="group bg-gradient-to-b from-[#F8FAFC] to-white p-6 rounded-3xl border border-[#CBD5E1]/40 hover:border-[#2563EB] hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-800 to-[#1D4ED8] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                Sentra Kuliner & Event
              </h3>
              <p className="text-xs text-[#475569] leading-relaxed">
                Pusat kuliner legendaris nusantara, kafe tematik hits, hingga gedung pertemuan dan pameran skala internasional.
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center text-[11px] font-extrabold text-[#2563EB] gap-1">
              <span>Jelajah Rasa</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* 3. Kemudahan Fitur Aplikasi (Modern Slate & Royal Blue Banner) */}
      <section className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E3A8A] text-white rounded-3xl p-6 sm:p-12 shadow-2xl space-y-10 relative overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#2563EB]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl relative z-10 space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-blue-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md inline-block">
            Fitur & Keunggulan Platform
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            Semua Kebutuhan Perjalanan dalam Satu Tempat
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Melalui aplikasi ini, Anda dapat merencanakan liburan dengan mudah, nyaman, dan terarah tanpa perlu ragu dalam menentukan pilihan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-blue-300">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-white">Informasi Komprehensif</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Dapatkan detail deskripsi, jam operasional, tiket masuk, dan ulasan rating bintang pengunjung.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-blue-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-white">Fasilitas & Layanan Sekitar</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Akses cepat rekomendasi hotel penginapan, tempat makan kuliner, dan fasilitas penunjang di sekitar destinasi.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-blue-300">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-white">Navigasi Google Maps</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Terhubung langsung dengan petunjuk arah rute perjalanan agar Anda tiba di lokasi dengan mudah dan cepat.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 hover:bg-white/15 transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-blue-300">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h3 className="font-black text-sm text-white">Rekomendasi Cerdas MOORA</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tentukan bobot kriteria sesuai bujet dan waktu Anda, lalu biarkan sistem menghitung destinasi yang paling cocok.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Metodologi Penilaian MOORA (Aesthetic Split Cards) */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#CBD5E1]/50 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#2563EB] bg-blue-50 px-3 py-1 rounded-lg">
              <Layers className="w-3.5 h-3.5" />
              <span>Sistem Pendukung Keputusan</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
              6 Parameter Penilaian MOORA
            </h2>
            <p className="text-xs sm:text-sm text-[#475569]">
              Perhitungan objektif berbasis perbandingan rasio antara keuntungan (Benefit) dan biaya (Cost).
            </p>
          </div>
        </div>

        {/* 2 Big Aesthetic Columns: Cost vs Benefit */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Cost Column */}
          <div className="bg-rose-50/50 rounded-3xl p-6 border border-rose-200/80 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-rose-900">Kriteria Cost (Biaya)</h3>
                  <span className="text-xs font-bold text-rose-700">Semakin kecil nilainya, semakin baik</span>
                </div>
              </div>
              <span className="text-xs font-black bg-rose-200/70 text-rose-800 px-3 py-1 rounded-full">
                Pengurang Skor (Yi)
              </span>
            </div>

            <div className="space-y-3">
              {costCriteria.map(crit => (
                <div key={crit.key} className="bg-white p-4 rounded-2xl border border-rose-100 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#0F172A]">{crit.code}. {crit.name}</span>
                    <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg">
                      Skala 1 - 5
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed font-normal">
                    {crit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefit Column */}
          <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-200/80 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-blue-900">Kriteria Benefit (Manfaat)</h3>
                  <span className="text-xs font-bold text-blue-800">Semakin besar nilainya, semakin menguntungkan</span>
                </div>
              </div>
              <span className="text-xs font-black bg-blue-200/70 text-blue-900 px-3 py-1 rounded-full">
                Penambah Skor (Yi)
              </span>
            </div>

            <div className="space-y-3">
              {benefitCriteria.map(crit => (
                <div key={crit.key} className="bg-white p-4 rounded-2xl border border-blue-100 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#0F172A]">{crit.code}. {crit.name}</span>
                    <span className="text-xs font-mono font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-lg">
                      Skala 1 - 5
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed font-normal">
                    {crit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 5. Panduan Penggunaan 3 Langkah Simpel */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#CBD5E1]/50 shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-xs font-black uppercase tracking-wider text-[#2563EB]">
            Langkah Cepat
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
            Cara Mudah Menemukan Destinasi
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Tiga tahapan praktis untuk mendapatkan rekomendasi wisata terbaik Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          
          <div className="bg-[#F8FAFC] p-6 rounded-3xl border border-[#CBD5E1]/40 space-y-3 relative overflow-hidden group hover:border-[#2563EB] transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white font-black text-sm flex items-center justify-center shadow-xs">
              1
            </div>
            <h3 className="text-base font-black text-[#0F172A]">Cari & Lihat Destinasi</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Buka menu <strong>Wisata</strong> untuk menelusuri puluhan tempat liburan, filter kategori, dan detail foto lokasi.
            </p>
          </div>

          <div className="bg-[#F8FAFC] p-6 rounded-3xl border border-[#CBD5E1]/40 space-y-3 relative overflow-hidden group hover:border-[#2563EB] transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white font-black text-sm flex items-center justify-center shadow-xs">
              2
            </div>
            <h3 className="text-base font-black text-[#0F172A]">Sesuaikan Kebutuhan</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Buka menu <strong>Rekomendasi</strong>, lalu tentukan prioritas kriteria seperti tarif tiket, jarak, atau fasilitas.
            </p>
          </div>

          <div className="bg-[#F8FAFC] p-6 rounded-3xl border border-[#CBD5E1]/40 space-y-3 relative overflow-hidden group hover:border-[#2563EB] transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white font-black text-sm flex items-center justify-center shadow-xs">
              3
            </div>
            <h3 className="text-base font-black text-[#0F172A]">Dapatkan Hasil MOORA</h3>
            <p className="text-xs text-[#475569] leading-relaxed">
              Sistem akan menghitung skor otomatis dan menyajikan urutan destinasi yang paling ideal untuk dikunjungi.
            </p>
          </div>

        </div>
      </section>

      {/* 6. Aesthetic Call to Action (CTA) */}
      <section className="bg-gradient-to-r from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB] rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-white/15 text-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Mulai Perjalanan Anda</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Siap Menjelajahi Tangerang Selatan?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-normal">
            Temukan tempat wisata terbaik untuk akhir pekan Anda atau hitung rekomendasi personal sekarang.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 w-full sm:w-auto">
          <button
            onClick={() => navigate('/wisata')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-extrabold transition-all border border-white/20 cursor-pointer shadow-xs"
          >
            Lihat Semua Wisata
          </button>
          <button
            onClick={() => navigate('/rekomendasi')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white text-[#2563EB] hover:bg-blue-50 text-xs sm:text-sm font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Hitung Rekomendasi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};
