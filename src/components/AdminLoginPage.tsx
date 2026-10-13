import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight, Compass, Eye, EyeOff, Loader2 } from 'lucide-react';
import * as authService from '../services/authService';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onGoToHome: () => void;
}

// Daftar akun administrator yang diizinkan
const VALID_ADMIN_ACCOUNTS = [
  { username: 'admintangsel', email: 'admintangsel@gmail.com', password: 'superadmin123' },
  { username: 'admin_tangsel', email: 'admintangsel@gmail.com', password: 'superadmin123' },
  { username: 'admin', email: 'admintangsel@gmail.com', password: 'superadmin123' },
];

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onGoToHome,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    // 1. Verifikasi kredensial akun administrator (bisa pakai username atau email)
    const isMatchedAdmin = VALID_ADMIN_ACCOUNTS.some(
      (acc) =>
        (acc.username.toLowerCase() === cleanUser || acc.email.toLowerCase() === cleanUser) &&
        acc.password === cleanPass
    );

    if (isMatchedAdmin) {
      setIsSubmitting(false);
      onLoginSuccess();
      return;
    }

    // 2. Coba login melalui Supabase Auth
    try {
      const user = await authService.signIn(cleanUser, cleanPass);
      if (user) {
        const isAdminRole = await authService.isAdmin(user.id);
        if (isAdminRole) {
          onLoginSuccess();
        } else {
          setErrorMsg('Akun ini bukan Administrator. Akses ditolak.');
          await authService.signOut();
        }
      }
    } catch (error: any) {
      setErrorMsg(error?.message || 'Username atau password administrator salah.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] via-[#0F172A] to-[#1E293B] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-[#0F172A]">
      {/* Background Subtle Mesh */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 relative">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-[#1E3A8A] via-[#1D4ED8] to-[#2563EB] px-8 pt-10 pb-8 text-white text-center space-y-3 relative">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-9 h-9 text-amber-300" />
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Portal Administrator
            </h1>
            <p className="text-xs text-blue-100 mt-1 font-medium">
              Sistem Informasi Pariwisata Kota Tangerang Selatan
            </p>
          </div>
        </div>

        {/* Login Form Body */}
        <div className="p-8 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2.5 shadow-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Username / Email Administrator
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 text-sm rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-100 transition-all font-semibold"
                  placeholder="admintangsel atau email admin"
                  autoComplete="username"
                />
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Password Administrator
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3.5 text-sm rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-3 focus:ring-blue-100 transition-all font-semibold"
                  placeholder="Masukkan password admin"
                  autoComplete="current-password"
                />
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Panel Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Clean Footer Link */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onGoToHome}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer py-1"
            >
              <Compass className="w-4 h-4" />
              <span>Kembali ke Beranda Wisata</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
