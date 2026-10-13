import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Search,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  Info,
  User,
  Heart,
  LogIn,
  LogOut,
  ChevronDown,
  History,
  Lock,
  ExternalLink
} from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  currentTab: 'home' | 'wisata' | 'rekomendasi' | 'tentang' | 'profil' | 'admin' | 'admin-login';
  onNavigate: (path: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
  currentUser: UserAccount | null;
  onOpenUserAuth: () => void;
  onLogoutUser: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  searchQuery,
  setSearchQuery,
  onOpenAdmin,
  isAdminLoggedIn,
  onLogoutAdmin,
  currentUser,
  onOpenUserAuth,
  onLogoutUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentTab !== 'wisata') {
      onNavigate('/wisata');
    }
  };

  const handleAdminPortalClick = () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    if (isAdminLoggedIn) {
      onNavigate('/admin');
    } else {
      onNavigate('/admin/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#CBD5E1]/40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* 1. BRAND LOGO */}
          <div
            id="brand-logo"
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-3 cursor-pointer group select-none py-2"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1D4ED8] to-[#2563EB] text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-black text-xl sm:text-2xl tracking-tight text-[#0F172A] leading-tight">
                Destinasi Wisata
              </span>
              <span className="text-xs text-[#2563EB] font-black tracking-wider uppercase leading-none mt-0.5">
                Tangerang Selatan
              </span>
            </div>
          </div>

          {/* 2. PUBLIC DESKTOP NAVIGATION LINKS */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              id="nav-home-btn"
              onClick={() => handleNavClick('/')}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${currentTab === 'home'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
            >
              Home
            </button>
            <button
              id="nav-wisata-btn"
              onClick={() => handleNavClick('/wisata')}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all cursor-pointer ${currentTab === 'wisata'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
            >
              Destinasi
            </button>
            <button
              id="nav-rekomendasi-btn"
              onClick={() => handleNavClick('/rekomendasi')}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${currentTab === 'rekomendasi'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Rekomendasi</span>
            </button>
            <button
              id="nav-tentang-btn"
              onClick={() => handleNavClick('/tentang')}
              className={`px-4 py-2 rounded-xl text-sm font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${currentTab === 'tentang'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
            >
              <Info className="w-4 h-4" />
              <span>Tentang</span>
            </button>
          </nav>

          {/* 3. RIGHT ACTIONS: SEARCH + USER ACCOUNT + STEALTH ADMIN PORTAL */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari destinasi Tangsel..."
                className="w-44 xl:w-52 pl-9 pr-4 py-2 text-xs sm:text-sm rounded-full bg-[#F1F5F9] text-[#0F172A] placeholder-[#64748B] border border-transparent focus:border-[#2563EB] focus:bg-white focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
            </form>

            {/* USER LOGIN / PROFILE DROPDOWN */}
            {currentUser ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  id="user-profile-menu-trigger"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 bg-blue-50 border border-blue-200/80 hover:bg-blue-100/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#0F172A] transition-all cursor-pointer shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-black shadow-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[110px] font-extrabold text-[#2563EB]">{currentUser.name}</span>
                  {currentUser.favorites.length > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      ♥ {currentUser.favorites.length}
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-[#2563EB] transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* USER DROPDOWN MENU */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-3xl shadow-xl border border-[#CBD5E1]/40 p-2 z-50 animate-fade-in space-y-1">
                    <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#CBD5E1]/30 space-y-0.5">
                      <div className="font-extrabold text-sm text-[#0F172A] truncate">{currentUser.name}</div>
                      <div className="text-xs text-[#64748B] truncate">{currentUser.email}</div>
                    </div>

                    <button
                      onClick={() => handleNavClick('/profil')}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-[#F1F5F9] text-xs sm:text-sm font-bold text-[#0F172A] flex items-center justify-between cursor-pointer group"
                    >
                      <span className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-[#2563EB]" />
                        <span>Profil Saya</span>
                      </span>
                      {currentUser.favorites.length > 0 && (
                        <span className="bg-rose-100 text-rose-800 text-xs font-black px-2 py-0.5 rounded-full">
                          ♥ {currentUser.favorites.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => handleNavClick('/profil')}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-[#F1F5F9] text-xs sm:text-sm font-bold text-[#0F172A] flex items-center gap-2.5 cursor-pointer"
                    >
                      <History className="w-4 h-4 text-[#2563EB]" />
                      <span>Riwayat Rekomendasi</span>
                    </button>

                    <div className="border-t border-gray-100 my-1" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onLogoutUser();
                      }}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-rose-50 text-xs sm:text-sm font-bold text-rose-700 flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>Keluar (Logout User)</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="nav-login-btn"
                onClick={onOpenUserAuth}
                className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-extrabold px-4 py-2.5 rounded-2xl shadow-xs transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk / Daftar</span>
              </button>
            )}

            {/* STEALTH PROFESSIONAL ADMIN PORTAL BUTTON */}
            {/* Discreetly hidden in main menu, accessible via stealth lock icon */}
            <div className="relative pl-1 border-l border-gray-200">
              <button
                id="nav-admin-stealth-btn"
                onClick={handleAdminPortalClick}
                className={`p-2.5 rounded-xl transition-all cursor-pointer relative group ${isAdminLoggedIn
                    ? 'bg-amber-100 text-amber-950 border border-amber-300'
                    : 'text-slate-400 hover:text-[#2563EB] hover:bg-[#F1F5F9]'
                  }`}
                title={isAdminLoggedIn ? 'Session Admin Aktif • Klik untuk ke Dashboard Admin' : 'Portal Sistem (Admin Access)'}
              >
                {isAdminLoggedIn ? (
                  <ShieldCheck className="w-5 h-5 text-amber-800" />
                ) : (
                  <Lock className="w-4.5 h-4.5" />
                )}

                {/* Live Active Admin session dot indicator */}
                {isAdminLoggedIn && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
                )}

                {/* Stealth Tooltip */}
                <div className="absolute right-0 top-11 hidden group-hover:block bg-[#0F172A] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap z-50 pointer-events-none">
                  {isAdminLoggedIn ? '🟢 Sesi Admin Aktif (Buka Dashboard)' : 'Portal Administrator (Internal)'}
                </div>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-[#334155] hover:bg-[#F1F5F9] focus:outline-none cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#CBD5E1]/30 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-fade-in">
          <form onSubmit={handleSearchSubmit} className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari destinasi wisata..."
              className="w-full pl-10 pr-4 py-3 text-base rounded-2xl bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]/50 focus:border-[#2563EB] focus:outline-none"
            />
            <Search className="w-5 h-5 text-[#64748B] absolute left-3.5 top-3.5" />
          </form>

          <div className="flex flex-col space-y-2">
            <button
              onClick={() => handleNavClick('/')}
              className={`text-left px-4 py-3 rounded-2xl text-base font-extrabold ${currentTab === 'home' ? 'bg-blue-50 text-[#2563EB]' : 'text-[#334155]'
                }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('/wisata')}
              className={`text-left px-4 py-3 rounded-2xl text-base font-extrabold ${currentTab === 'wisata' ? 'bg-blue-50 text-[#2563EB]' : 'text-[#334155]'
                }`}
            >
              Destinasi
            </button>
            <button
              onClick={() => handleNavClick('/rekomendasi')}
              className={`text-left px-4 py-3 rounded-2xl text-base font-extrabold flex items-center justify-between ${currentTab === 'rekomendasi' ? 'bg-[#2563EB] text-white' : 'text-[#334155]'
                }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Rekomendasi MOORA
              </span>
              <span className="text-xs bg-amber-400 text-amber-950 font-black px-2.5 py-1 rounded-full">
                Hitung SPK
              </span>
            </button>

            <button
              onClick={() => handleNavClick('/tentang')}
              className={`text-left px-4 py-3 rounded-2xl text-base font-extrabold flex items-center gap-2 ${currentTab === 'tentang' ? 'bg-blue-50 text-[#2563EB]' : 'text-[#334155]'
                }`}
            >
              <Info className="w-5 h-5" />
              Tentang Sistem
            </button>

            {currentUser ? (
              <div className="pt-2 border-t space-y-2">
                <button
                  onClick={() => handleNavClick('/profil')}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-base font-extrabold flex items-center justify-between ${currentTab === 'profil' ? 'bg-[#2563EB] text-white' : 'bg-blue-50 text-[#2563EB]'
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profil Saya ({currentUser.name})
                  </span>
                  <span className="text-xs bg-rose-500 text-white font-black px-2.5 py-1 rounded-full">
                    ♥ {currentUser.favorites.length}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogoutUser();
                  }}
                  className="w-full text-left px-4 py-3 rounded-2xl text-sm font-bold bg-rose-50 text-rose-800 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout User ({currentUser.name})
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenUserAuth();
                }}
                className="text-left px-4 py-3 rounded-2xl text-base font-extrabold bg-[#2563EB] text-white flex items-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                Masuk / Daftar User
              </button>
            )}

            {/* Stealth Admin link in mobile menu */}
            <div className="pt-2 border-t">
              <button
                onClick={handleAdminPortalClick}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between ${isAdminLoggedIn ? 'bg-amber-100 text-amber-950 font-black' : 'text-gray-500 bg-gray-50'
                  }`}
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                  <span>{isAdminLoggedIn ? '🔴 Dashboard Admin Active' : 'Portal Sistem (Admin Access)'}</span>
                </span>
                <Lock className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

