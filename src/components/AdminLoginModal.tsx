import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  User, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Destination } from '../types';
import { CRITERIA_DEFINITIONS } from '../utils/moora';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminLoggedIn: boolean;
  onLoginSuccess: () => void;
  destinations: Destination[];
  onUpdateDestinations: (newDestinations: Destination[]) => void;
  onResetDestinations: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  isAdminLoggedIn,
  onLoginSuccess,
  destinations,
  onUpdateDestinations,
  onResetDestinations,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'matrix' | 'add'>('matrix');

  // New Destination Form State
  const [newDestName, setNewDestName] = useState('');
  const [newDestCategory, setNewDestCategory] = useState<'Wisata Alam' | 'Wisata Budaya' | 'Wisata Buatan' | 'Wisata MICE' | 'Wisata Kuliner' | 'Kampung Wisata'>('Wisata Alam');
  const [newDestLocation, setNewDestLocation] = useState('Tangerang Selatan');
  const [newDestPrice, setNewDestPrice] = useState('Gratis');
  const [newDestDesc, setNewDestDesc] = useState('');
  const [newDestImage, setNewDestImage] = useState(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBJOeNepu5_ALzZSgOhNhgjGVnyy2NcHsbbxIuHuhR5tTJLSBDvrk6R35Zhh5WWKFAd7PhxguybviMSKBGpyuSlwWgbBjenc5ynoevRu9Pazckc6YXhAQBfi1pMqTfwzAjTUCPh1D578d9xkc0vssyXWE8GA0-DbkWJAC-iZ69-qtGkpFukiSXwIkPi7qNMDErdG31SuXgsjHcBogOU9DXIyYrM0sAOMNX7eqONdiJ5Talizky4hQtV'
  );
  const [newCriteria, setNewCriteria] = useState({
    harga: 2,
    jarak: 2,
    fasilitas: 4,
    kebersihan: 4,
    keamanan: 4,
    popularitas: 4,
  });

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    const p = password.trim();

    if (
      (u === 'admintangsel' || u === 'admintangsel@gmail.com' || u === 'admin_tangsel' || u === 'admin') &&
      (p === 'superadmin123' || p === 'admin123')
    ) {
      setErrorMsg('');
      onLoginSuccess();
    } else {
      setErrorMsg('Username atau password administrator salah.');
    }
  };

  const handleCriteriaChange = (
    destId: string,
    criteriaKey: keyof Destination['criteria'],
    val: number
  ) => {
    const updated = destinations.map((d) => {
      if (d.id === destId) {
        return {
          ...d,
          criteria: {
            ...d.criteria,
            [criteriaKey]: Math.max(1, Math.min(5, val)),
          },
        };
      }
      return d;
    });
    onUpdateDestinations(updated);
  };

  const handleDeleteDestination = (id: string) => {
    if (destinations.length <= 3) {
      alert('Minimal harus ada 3 alternatif destinasi untuk perhitungan MOORA.');
      return;
    }
    const updated = destinations.filter((d) => d.id !== id);
    onUpdateDestinations(updated);
  };

  const handleAddNewDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestName.trim()) {
      alert('Nama destinasi wajib diisi.');
      return;
    }

    const isDuplicate = destinations.some(
      (d) => d.name.trim().toLowerCase() === newDestName.trim().toLowerCase()
    );
    if (isDuplicate) {
      alert(`Destinasi dengan nama "${newDestName.trim()}" sudah ada! Mohon gunakan nama yang berbeda.`);
      return;
    }

    const newDest: Destination = {
      id: `custom-${Date.now()}`,
      name: newDestName.trim(),
      category: newDestCategory,
      primaryCategory: newDestCategory,
      location: newDestLocation.trim(),
      rating: 4.5,
      image: newDestImage || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJOeNepu5_ALzZSgOhNhgjGVnyy2NcHsbbxIuHuhR5tTJLSBDvrk6R35Zhh5WWKFAd7PhxguybviMSKBGpyuSlwWgbBjenc5ynoevRu9Pazckc6YXhAQBfi1pMqTfwzAjTUCPh1D578d9xkc0vssyXWE8GA0-DbkWJAC-iZ69-qtGkpFukiSXwIkPi7qNMDErdG31SuXgsjHcBogOU9DXIyYrM0sAOMNX7eqONdiJ5Talizky4hQtV',
      description: newDestDesc.trim() || `Destinasi wisata ${newDestCategory} di ${newDestLocation}.`,
      address: `${newDestLocation}, Kota Tangerang Selatan`,
      operationalHours: '08:00 - 18:00 WIB',
      ticketPriceFormatted: newDestPrice,
      facilities: ['Area Parkir', 'Toilet', 'Musholla'],
      criteria: newCriteria,
    };

    onUpdateDestinations([...destinations, newDest]);
    alert(`Destinasi "${newDest.name}" berhasil ditambahkan ke matriks MOORA!`);
    setNewDestName('');
    setNewDestDesc('');
    setActiveTab('matrix');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#CBD5E1]/40 relative my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#0F172A] text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Panel Admin SPK Wisata</h2>
              <p className="text-xs text-slate-400">
                Kelola Matriks Keputusan & Nilai Kriteria Alternatif Destinasi
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Logged In - Login Form */}
        {!isAdminLoggedIn ? (
          <div className="p-8 max-w-md mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-[#0F172A]">Login Administrator</h3>
              <p className="text-xs text-[#64748B]">
                Masuk untuk mengedit data matriks keputusan kriteria destinasi (Ujian / Simulasi SPK).
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#F1F5F9] border focus:border-[#2563EB] focus:bg-white focus:outline-none"
                    placeholder="admin"
                  />
                  <User className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#F1F5F9] border focus:border-[#2563EB] focus:bg-white focus:outline-none"
                    placeholder="admin123"
                  />
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Masuk Panel Admin
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsername('admin');
                  setPassword('admin123');
                  onLoginSuccess();
                }}
                className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                ⚡ Login Cepat Demo (Penguji / Dosen)
              </button>
            </form>
          </div>
        ) : (
          /* Admin Logged In Content */
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('matrix')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    activeTab === 'matrix'
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-gray-100 text-[#334155]'
                  }`}
                >
                  Edit Matriks Nilai Alternatif ({destinations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('add')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 ${
                    activeTab === 'add'
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-gray-100 text-[#334155]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Alternatif Baru</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onResetDestinations}
                className="text-xs font-semibold text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                title="Kembalikan nilai ke data awal"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Data Awal</span>
              </button>
            </div>

            {/* TAB 1: Edit Matrix */}
            {activeTab === 'matrix' && (
              <div className="space-y-4">
                <p className="text-xs text-[#64748B]">
                  Ubah nilai parameter kriteria (skala 1 - 5) untuk menguji kepekaan metode MOORA secara langsung:
                </p>

                <div className="overflow-x-auto border rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F1F5F9] text-[#0F172A] font-bold text-[11px] border-b">
                      <tr>
                        <th className="px-3 py-2.5">Nama Alternatif</th>
                        {CRITERIA_DEFINITIONS.map((c) => (
                          <th key={c.key} className="px-2 py-2.5 text-center">
                            {c.code}
                            <span className="block text-[9px] text-[#64748B]">
                              ({c.type})
                            </span>
                          </th>
                        ))}
                        <th className="px-2 py-2.5 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {destinations.map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-semibold text-[#0F172A]">
                            {d.name}
                            <span className="block text-[10px] text-[#64748B]">{d.category}</span>
                          </td>
                          {CRITERIA_DEFINITIONS.map((c) => (
                            <td key={c.key} className="px-2 py-2 text-center">
                              <select
                                value={d.criteria[c.key as keyof Destination['criteria']]}
                                onChange={(e) =>
                                  handleCriteriaChange(
                                    d.id,
                                    c.key as keyof Destination['criteria'],
                                    parseInt(e.target.value)
                                  )
                                }
                                className="border rounded px-1.5 py-0.5 text-xs bg-white font-bold text-[#2563EB]"
                              >
                                {[1, 2, 3, 4, 5].map((v) => (
                                  <option key={v} value={v}>
                                    {v}
                                  </option>
                                ))}
                              </select>
                            </td>
                          ))}
                          <td className="px-2 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteDestination(d.id)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: Add New Destination */}
            {activeTab === 'add' && (
              <form onSubmit={handleAddNewDestination} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] block mb-1">
                      Nama Destinasi Wisata
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Danau Situ Pamulang"
                      value={newDestName}
                      onChange={(e) => setNewDestName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#F1F5F9] border focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#0F172A] block mb-1">
                      Kategori
                    </label>
                    <select
                      value={newDestCategory}
                      onChange={(e) => setNewDestCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#F1F5F9] border focus:outline-none"
                    >
                      <option value="Wisata Alam">Wisata Alam</option>
                      <option value="Wisata Budaya">Wisata Budaya</option>
                      <option value="Wisata Buatan">Wisata Buatan</option>
                      <option value="Wisata MICE">Wisata MICE</option>
                      <option value="Wisata Kuliner">Wisata Kuliner</option>
                      <option value="Kampung Wisata">Kampung Wisata</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#0F172A] block mb-1">
                      Kecamatan / Lokasi
                    </label>
                    <input
                      type="text"
                      placeholder="Pamulang, Tangerang Selatan"
                      value={newDestLocation}
                      onChange={(e) => setNewDestLocation(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#F1F5F9] border focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#0F172A] block mb-1">
                      Tarif Tiket Masuk
                    </label>
                    <input
                      type="text"
                      placeholder="Gratis / Rp 15.000"
                      value={newDestPrice}
                      onChange={(e) => setNewDestPrice(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-[#F1F5F9] border focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">
                    Deskripsi Singkat
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Tuliskan daya tarik utama destinasi wisata..."
                    value={newDestDesc}
                    onChange={(e) => setNewDestDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#F1F5F9] border focus:outline-none"
                  />
                </div>

                {/* Score inputs */}
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-2">
                    Skor Parameter Kriteria MOORA (1 - 5):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {CRITERIA_DEFINITIONS.map((c) => (
                      <div key={c.key} className="bg-gray-50 p-2.5 rounded-xl border text-xs">
                        <span className="font-semibold block truncate">
                          {c.code}. {c.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={newCriteria[c.key as keyof typeof newCriteria]}
                            onChange={(e) =>
                              setNewCriteria((prev) => ({
                                ...prev,
                                [c.key]: parseInt(e.target.value),
                              }))
                            }
                            className="w-full accent-[#2563EB]"
                          />
                          <span className="font-bold text-[#2563EB]">
                            {newCriteria[c.key as keyof typeof newCriteria]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Alternatif Baru
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
