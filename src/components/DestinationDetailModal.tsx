import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Star, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles,
  Heart,
  Compass,
  Hotel,
  Utensils,
  Building2,
  Navigation,
  ChevronRight,
  Ticket,
  Info,
  BarChart3
} from 'lucide-react';
import { Destination, UserAccount, NearbyPlace } from '../types';
import { CRITERIA_DEFINITIONS } from '../utils/moora';
import { getNearbyPlacesForDestination } from '../data/nearbyPlaces';

interface DestinationDetailModalProps {
  destination: Destination | null;
  onClose: () => void;
  onGoToRekomendasi: () => void;
  currentUser?: UserAccount | null;
  onToggleFavorite?: (destId: string) => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  onClose,
  onGoToRekomendasi,
  currentUser,
  onToggleFavorite,
}) => {
  const [activeNearbyTab, setActiveNearbyTab] = useState<'hotel' | 'kuliner' | 'fasilitas'>('hotel');
  const [selectedNearbyDetail, setSelectedNearbyDetail] = useState<NearbyPlace | null>(null);

  if (!destination) return null;

  const nearbyData = getNearbyPlacesForDestination(destination);
  const isFavorite = currentUser?.favorites.includes(destination.id) || false;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${destination.name} ${destination.location}`
  )}`;

  const currentNearbyList = 
    activeNearbyTab === 'hotel' 
      ? nearbyData.hotels 
      : activeNearbyTab === 'kuliner' 
      ? nearbyData.dining 
      : nearbyData.facilities;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-6 max-h-[92vh] flex flex-col">
        
        {/* Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all cursor-pointer shadow-md"
          aria-label="Tutup modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {/* Hero Banner */}
          <div className="relative h-60 sm:h-72 overflow-hidden bg-slate-900">
            <img
              src={destination.image}
              alt={destination.name}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            
            <div className="absolute bottom-5 left-5 right-5 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-slate-900/90 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-xs border border-white/20 backdrop-blur-md">
                    {destination.category}
                  </span>
                  <div className="bg-amber-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>{destination.rating.toFixed(1)} / 5.0</span>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{destination.name}</h2>
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-300">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>{destination.address}</span>
                </div>
              </div>

              {/* Favorite Button */}
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite(destination.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer shrink-0 ${
                    isFavorite
                      ? 'bg-rose-500 text-white hover:bg-rose-600'
                      : 'bg-white text-slate-900 hover:bg-slate-100 hover:text-rose-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : 'text-rose-500'}`} />
                  <span>{isFavorite ? 'Tersimpan' : 'Simpan Favorit'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Main 2-Column Responsive Body Layout */}
          <div className="p-5 sm:p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              
              {/* Left Column: lg:col-span-7 */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Description */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>Deskripsi Wisata</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {destination.description}
                  </p>
                </div>

                {/* Facilities */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Fasilitas Tersedia</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {destination.facilities.map((fac, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{fac}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MOORA Criteria Matrix */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span>Nilai Parameter MOORA</span>
                    </h3>
                    <span className="text-[11px] text-slate-600 font-bold bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                      Skala 1 - 5
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {CRITERIA_DEFINITIONS.map((crit) => {
                      const val = destination.criteria[crit.key as keyof typeof destination.criteria];
                      const pct = (val / 5) * 100;
                      return (
                        <div key={crit.key} className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                          <div className="flex justify-between text-xs font-extrabold">
                            <span className="text-slate-800 truncate">
                              {crit.code}. {crit.name}
                            </span>
                            <span className="text-slate-900 font-black shrink-0">{val} / 5</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                crit.type === 'Cost' ? 'bg-amber-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: lg:col-span-5 */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* Summary Info Card */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-200">
                    Informasi Kunjungan
                  </h3>

                  <div className="space-y-3 text-xs sm:text-sm">
                    {/* Google Rating */}
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/50">
                        <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block font-medium">Rating Google</span>
                        <span className="font-black text-slate-900">
                          {destination.rating.toFixed(1)} dari 5.0 Bintang
                        </span>
                      </div>
                    </div>

                    {/* Ticket Price */}
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/50">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block font-medium">Estimasi Tiket Masuk</span>
                        <span className="font-black text-slate-900 text-sm sm:text-base">
                          {destination.ticketPriceFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Opening Hours */}
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block font-medium">Jam Operasional</span>
                        <span className="font-bold text-slate-900">
                          {destination.operationalHours}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                        <MapPin className="w-5 h-5 text-rose-500" />
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-500 block font-medium">Lokasi Lengkap</span>
                        <span className="font-medium text-slate-800 leading-snug block">
                          {destination.address}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2.5">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-2xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 hover:border-slate-400 text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs group"
                  >
                    <ExternalLink className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span>Petunjuk Rute Google Maps</span>
                  </a>

                  <button
                    onClick={() => {
                      onClose();
                      onGoToRekomendasi();
                    }}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-[0.98]"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Hitung di Rekomendasi MOORA</span>
                  </button>
                </div>

              </div>

            </div>

            {/* ==================== FITUR JELAJAHI SEKITAR ==================== */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-lg mb-1 border border-blue-200/60">
                    <Compass className="w-3.5 h-3.5 text-blue-600" />
                    <span>Layanan Sekitar</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    Akomodasi & Fasilitas Terdekat
                  </h3>
                </div>

                {/* Category Tabs Switcher */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveNearbyTab('hotel')}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeNearbyTab === 'hotel'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <Hotel className="w-3.5 h-3.5" />
                    <span>Hotel ({nearbyData.hotels.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNearbyTab('kuliner')}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeNearbyTab === 'kuliner'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Kuliner ({nearbyData.dining.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveNearbyTab('fasilitas')}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeNearbyTab === 'fasilitas'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Fasilitas ({nearbyData.facilities.length})</span>
                  </button>
                </div>
              </div>

              {/* Cards Grid for Selected Nearby Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {currentNearbyList.map((place) => (
                  <div
                    key={place.id}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all group"
                  >
                    <div>
                      {/* Photo with distance pill overlay */}
                      <div className="relative h-32 overflow-hidden bg-slate-100">
                        <img
                          src={place.image}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                          <Navigation className="w-3 h-3 text-cyan-300" />
                          <span>{place.distance}</span>
                        </div>
                        <div className="absolute bottom-2.5 right-2.5 bg-white text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs border border-slate-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{place.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="p-3.5 space-y-1.5">
                        <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {place.name}
                        </h4>
                        {place.priceOrHours && (
                          <div className="text-[11px] font-extrabold text-slate-700">
                            {place.priceOrHours}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-500 line-clamp-1 leading-tight flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{place.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 pt-0">
                      <button
                        type="button"
                        onClick={() => setSelectedNearbyDetail(place)}
                        className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-[#2563EB] text-slate-700 hover:text-white text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>Lihat Detail</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs sm:text-sm font-bold text-slate-800 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>

      {/* ==================== SUB-MODAL DETAIL NEARBY PLACE ==================== */}
      {selectedNearbyDetail && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 relative my-8">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Compass className="w-4 h-4 text-blue-400 shrink-0" />
                <h3 className="text-sm font-bold truncate">{selectedNearbyDetail.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNearbyDetail(null)}
                className="text-white hover:bg-white/20 p-1 rounded-full cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              {/* Photo preview */}
              <div className="relative h-40 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={selectedNearbyDetail.image}
                  alt={selectedNearbyDetail.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md border border-white/20">
                  {selectedNearbyDetail.categoryLabel}
                </span>
                <span className="absolute bottom-2.5 right-2.5 bg-white text-slate-900 text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-sm border border-slate-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{selectedNearbyDetail.rating.toFixed(1)} / 5.0</span>
                </span>
              </div>

              {/* Basic Meta Info */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-500">Jarak dari Destinasi:</span>
                  <span className="font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-blue-600" />
                    <span>{selectedNearbyDetail.distance}</span>
                  </span>
                </div>
                {selectedNearbyDetail.priceOrHours && (
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                    <span className="font-bold text-slate-500">Tarif / Jam Operasional:</span>
                    <span className="font-black text-slate-900">{selectedNearbyDetail.priceOrHours}</span>
                  </div>
                )}
                <div className="flex items-start gap-1.5 border-t border-slate-200 pt-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 font-medium">{selectedNearbyDetail.address}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">Deskripsi Lengkap</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {selectedNearbyDetail.description}
                </p>
              </div>

              {/* Facilities */}
              {selectedNearbyDetail.facilities && selectedNearbyDetail.facilities.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1.5">Fasilitas</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNearbyDetail.facilities.map((fac, i) => (
                      <span key={i} className="bg-white text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-slate-200">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        <span>{fac}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedNearbyDetail(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <a
                  href={selectedNearbyDetail.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
