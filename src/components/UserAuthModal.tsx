import React, { useState } from 'react';
import { X, User, Mail, Lock, CheckCircle2, AlertCircle, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { UserAccount } from '../types';
import * as authService from '../services/authService';
import * as favoritesService from '../services/favoritesService';
import * as historyService from '../services/historyService';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  users: UserAccount[];
  onRegisterUser: (newUser: UserAccount) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSuccessInfo, setRegSuccessInfo] = useState<{
    type: 'verification_needed' | 'auto_login';
    email: string;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const getReadableAuthError = (err: any): string => {
    const raw = (err?.message || '').toLowerCase();
    if (
      raw.includes('already registered') ||
      raw.includes('already in use') ||
      raw.includes('user already exists') ||
      raw.includes('identity already exists')
    ) {
      return 'Alamat email ini sudah terdaftar. Silakan gunakan alamat email lain atau langsung masuk.';
    }
    if (raw.includes('password should be at least') || raw.includes('at least 6 characters')) {
      return 'Password terlalu pendek. Harap gunakan minimal 6 karakter.';
    }
    if (raw.includes('valid email') || raw.includes('invalid email')) {
      return 'Format alamat email tidak valid. Pastikan penulisan email sudah benar (contoh: user@tangsel.id).';
    }
    if (raw.includes('rate limit') || raw.includes('over_email_send_rate_limit')) {
      return 'Terlalu banyak permintaan dalam waktu singkat. Mohon tunggu beberapa menit sebelum mencoba lagi.';
    }
    if (raw.includes('network') || raw.includes('failed to fetch')) {
      return 'Gagal terhubung ke server Supabase. Pastikan koneksi internet Anda aktif.';
    }
    return err?.message || 'Terjadi kesalahan pada sistem. Silakan coba beberapa saat lagi.';
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setRegSuccessInfo(null);
    setIsSubmitting(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const user = await authService.signIn(cleanEmail, password);

      if (user) {
        const profile = await authService.getProfile(user.id);
        if (profile) {
          const favs = await favoritesService.getUserFavorites(user.id);
          const hist = await historyService.getUserHistory(user.id);
          const fullUser: UserAccount = { ...profile, favorites: favs, history: hist };
          onLoginSuccess(fullUser);
          onClose();
        }
      }
    } catch (error: any) {
      const raw = (error?.message || '').toLowerCase();
      if (raw.includes('email not confirmed')) {
        setErrorMsg('Email Anda belum diverifikasi. Silakan periksa kotak masuk (inbox) atau folder spam email Anda untuk mengonfirmasi akun.');
      } else if (raw.includes('invalid login credentials') || raw.includes('invalid_credentials')) {
        setErrorMsg('Email atau password salah. Silakan periksa kembali data login Anda.');
      } else {
        setErrorMsg(getReadableAuthError(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setRegSuccessInfo(null);

    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPass = regPassword.trim();

    if (!cleanName || !cleanEmail || !cleanPass) {
      setErrorMsg('Semua kolom pendaftaran wajib diisi.');
      return;
    }

    if (cleanPass.length < 6) {
      setErrorMsg('Password harus terdiri dari minimal 6 karakter.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { user, session } = await authService.signUp(cleanName, cleanEmail, cleanPass);

      // Check if user already exists (Supabase enumeration protection: user exists with empty identities)
      if (user && Array.isArray(user.identities) && user.identities.length === 0) {
        setErrorMsg('Alamat email ini sudah terdaftar. Silakan gunakan alamat email lain atau langsung masuk.');
        setIsSubmitting(false);
        return;
      }

      if (user) {
        // Kondisi 1: Verifikasi email diperlukan (session null atau user belum confirmed)
        if (!session && !user.confirmed_at) {
          setRegSuccessInfo({
            type: 'verification_needed',
            email: cleanEmail,
            message: `Tautan verifikasi telah dikirimkan ke ${cleanEmail}. Silakan periksa kotak masuk (inbox) atau folder spam email Anda untuk mengaktifkan akun sebelum masuk.`,
          });
          setRegName('');
          setRegEmail('');
          setRegPassword('');
        } else {
          // Kondisi 2: Akun langsung aktif tanpa verifikasi email
          await new Promise((resolve) => setTimeout(resolve, 500));
          const profile = await authService.getProfile(user.id);
          const fullUser: UserAccount = profile
            ? { ...profile, favorites: [], history: [] }
            : {
                id: user.id,
                name: cleanName,
                email: cleanEmail,
                role: 'user',
                status: 'Aktif',
                createdAt: new Date().toISOString(),
                favorites: [],
                history: [],
              };
          onLoginSuccess(fullUser);
          setRegSuccessInfo({
            type: 'auto_login',
            email: cleanEmail,
            message: 'Pendaftaran berhasil! Akun Anda telah aktif dan Anda otomatis masuk.',
          });
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      }
    } catch (error: any) {
      setErrorMsg(getReadableAuthError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#CBD5E1]/40 relative my-8">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Akun Pengguna</h2>
              <p className="text-xs text-slate-400">
                Akses Fitur Favorit & Riwayat Rekomendasi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-100 bg-slate-100 p-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg('');
              setRegSuccessInfo(null);
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${activeTab === 'login'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Masuk Akun</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setErrorMsg('');
              setRegSuccessInfo(null);
            }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${activeTab === 'register'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Daftar Akun</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-rose-900 block">
                  {activeTab === 'register' ? 'Pendaftaran Gagal' : 'Login Gagal'}
                </span>
                <span className="leading-relaxed text-rose-700 block">{errorMsg}</span>
              </div>
            </div>
          )}

          {regSuccessInfo && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5 flex-1">
                <p className="font-extrabold text-emerald-950 text-xs sm:text-sm">
                  Registrasi Berhasil!
                </p>
                <p className="text-emerald-800 leading-relaxed">
                  {regSuccessInfo.message}
                </p>
                {regSuccessInfo.type === 'verification_needed' && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(regSuccessInfo.email);
                      setActiveTab('login');
                      setRegSuccessInfo(null);
                      setErrorMsg('');
                    }}
                    className="inline-flex items-center gap-1.5 mt-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Lanjut ke Masuk Akun</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">
                  Email User
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-[#F1F5F9] text-[#0F172A] border border-transparent focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                    placeholder="user@tangsel.id"
                  />
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-[#F1F5F9] text-[#0F172A] border border-transparent focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-black rounded-2xl shadow-sm shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? 'Memproses...' : 'Login'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-[#F1F5F9] text-[#0F172A] border border-transparent focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                    placeholder="Faruq Wisatawan"
                  />
                  <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-[#F1F5F9] text-[#0F172A] border border-transparent focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                    placeholder="faruq@gmail.com"
                  />
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-[#F1F5F9] text-[#0F172A] border border-transparent focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-black rounded-2xl shadow-sm shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span>{isSubmitting ? 'Memproses...' : 'Daftar & Masuk Sekarang'}</span>
                <UserPlus className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
