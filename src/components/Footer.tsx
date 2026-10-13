import React from 'react';
import { Compass, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-[#0F172A] text-slate-300 mt-16 sm:mt-20 border-t border-slate-800 overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 left-10 w-60 h-60 bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top subtle gradient highlight */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#2563EB]/60 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Col 1: Brand & Info (md:col-span-5) */}
          <div className="md:col-span-5 space-y-3.5">
            <div 
              className="flex items-center gap-3 group cursor-pointer w-fit" 
              onClick={() => handleNavigate('/')}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#1D4ED8] to-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight leading-tight block">
                  Destinasi Wisata
                </span>
                <span className="text-[10px] text-[#38BDF8] font-black tracking-wider uppercase leading-none block">
                  Tangerang Selatan
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm font-normal">
              Sistem Pendukung Keputusan pemilihan destinasi wisata di Kota Tangerang Selatan dengan metode MOORA secara objektif dan akurat.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/90 border border-slate-700/70 text-[11px] font-medium text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
              <span>Tangerang Selatan, Banten, Indonesia</span>
            </div>
          </div>

          {/* Col 2: Navigasi Cepat (md:col-span-4) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Navigasi Halaman
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <button
                onClick={() => handleNavigate('/')}
                className="hover:text-white hover:translate-x-0.5 transition-all text-left py-1 cursor-pointer"
              >
                Beranda
              </button>
              <button
                onClick={() => handleNavigate('/wisata')}
                className="hover:text-white hover:translate-x-0.5 transition-all text-left py-1 cursor-pointer"
              >
                Katalog Wisata
              </button>
              <button
                onClick={() => handleNavigate('/rekomendasi')}
                className="hover:text-[#38BDF8] hover:translate-x-0.5 transition-all text-left py-1 font-bold text-slate-300 cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Rekomendasi</span>
              </button>
              <button
                onClick={() => handleNavigate('/tentang')}
                className="hover:text-white hover:translate-x-0.5 transition-all text-left py-1 cursor-pointer"
              >
                Tentang Platform
              </button>
            </div>
          </div>

          {/* Col 3: SPK MOORA Highlight (md:col-span-3) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Metodologi SPK
            </h4>
            <div className="bg-slate-800/70 p-3.5 rounded-2xl border border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
                <span>Metode MOORA</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Optimalisasi multi-objektif berbasis rasio (2 Kriteria Cost & 4 Kriteria Benefit).
              </p>
            </div>
          </div>

        </div>

        {/* Compact Bottom Bar */}
        <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2 text-[11px]">
            <span>© {new Date().getFullYear()} Faruq Saifullah</span>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => handleNavigate('/admin/login')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Portal Admin
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            <span>Sistem Pendukung Keputusan Berbasis Web</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
