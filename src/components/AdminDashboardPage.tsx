import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Sliders, 
  Grid3X3, 
  Award, 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  LogOut, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight,
  Filter,
  X,
  TrendingUp,
  Activity,
  Layers,
  Star,
  DollarSign,
  Clock,
  UserPlus,
  Heart,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { Destination, UserAccount, AdminCriteriaItem, MooraCalculationResult, MooraCalculationItem } from '../types';
import { calculateMoora, CRITERIA_DEFINITIONS } from '../utils/moora';
import * as authService from '../services/authService';
import * as favoritesService from '../services/favoritesService';
import * as historyService from '../services/historyService';
import { DestinationDetailModal } from './DestinationDetailModal';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}

const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemName = 'data',
}) => {
  if (totalItems === 0) return null;
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
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

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#CBD5E1]/40 text-xs sm:text-sm">
      <div className="text-[#64748B] font-medium">
        Menampilkan <span className="font-bold text-[#0F172A]">{start}</span> - <span className="font-bold text-[#0F172A]">{end}</span> dari <span className="font-bold text-[#0F172A]">{totalItems}</span> {itemName}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-xl border border-[#CBD5E1]/60 bg-white text-[#334155] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((p, idx) =>
          typeof p === 'string' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-[#64748B] font-bold">
              {p}
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-[36px] h-9 px-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                currentPage === p
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white border border-[#CBD5E1]/60 text-[#334155] hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl border border-[#CBD5E1]/60 bg-white text-[#334155] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
          title="Halaman Berikutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface AdminDashboardPageProps {
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
  onGoToSite: () => void;
  destinations: Destination[];
  onUpdateDestinations: (newDestinations: Destination[]) => void;
  onResetDestinations: () => void;
  users: UserAccount[];
  onUpdateUsers: (newUsers: UserAccount[]) => void;
  totalRecommendationCount: number;
}

export const DEFAULT_ADMIN_CRITERIA: AdminCriteriaItem[] = [
  { id: 'c1', code: 'C1', key: 'harga', name: 'Harga Tiket & Biaya', type: 'Cost', weight: 0.15, active: true, description: 'Biaya tiket masuk dan pengeluaran wisata' },
  { id: 'c2', code: 'C2', key: 'jarak', name: 'Kedekatan Jarak Tempuh', type: 'Cost', weight: 0.15, active: true, description: 'Estimasi jarak tempuh dari pusat Tangsel' },
  { id: 'c3', code: 'C3', key: 'fasilitas', name: 'Kelengkapan Fasilitas', type: 'Benefit', weight: 0.20, active: true, description: 'Fasilitas umum, toilet, ibadah, dan rekreasi' },
  { id: 'c4', code: 'C4', key: 'kebersihan', name: 'Tingkat Kebersihan', type: 'Benefit', weight: 0.20, active: true, description: 'Kebersihan lingkungan, area hijau, dan sampah' },
  { id: 'c5', code: 'C5', key: 'keamanan', name: 'Jaminan Keamanan', type: 'Benefit', weight: 0.15, active: true, description: 'Petugas pos jaga, CCTV, dan keamanan area' },
  { id: 'c6', code: 'C6', key: 'popularitas', name: 'Popularitas & Rating Ulasan', type: 'Benefit', weight: 0.15, active: true, description: 'Rating ulasan pengunjung dan ketenaran' },
];

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  isAdminLoggedIn,
  onLogoutAdmin,
  onGoToSite,
  destinations,
  onUpdateDestinations,
  onResetDestinations,
  users,
  onUpdateUsers,
  totalRecommendationCount,
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'destinations' | 'criteria' | 'matrix' | 'ranking' | 'users'>('dashboard');

  // Criteria State
  const [criteriaList, setCriteriaList] = useState<AdminCriteriaItem[]>(DEFAULT_ADMIN_CRITERIA);
  const [editingCriteria, setEditingCriteria] = useState<AdminCriteriaItem | null>(null);

  // Destination View Mode (Table vs Grid)
  const [destViewMode, setDestViewMode] = useState<'table' | 'grid'>('table');
  const [destSearchQuery, setDestSearchQuery] = useState('');
  const [destCategoryFilter, setDestCategoryFilter] = useState('Semua');

  // Pagination States (10 items per page)
  const [destPage, setDestPage] = useState(1);
  const destItemsPerPage = 10;

  const [matrixPage, setMatrixPage] = useState(1);
  const matrixItemsPerPage = 10;

  const [rankingPage, setRankingPage] = useState(1);
  const rankingItemsPerPage = 10;

  // Reset destination page whenever search query or category filter changes
  useEffect(() => {
    setDestPage(1);
  }, [destSearchQuery, destCategoryFilter]);

  // Destination Add/Edit Modal
  const [isDestModalOpen, setIsDestModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<Destination | null>(null);
  const [previewDest, setPreviewDest] = useState<Destination | null>(null);
  
  // Destination Form State
  const [destName, setDestName] = useState('');
  const [destCategory, setDestCategory] = useState<'Wisata Alam' | 'Wisata Budaya' | 'Wisata Buatan' | 'Wisata MICE' | 'Wisata Kuliner' | 'Kampung Wisata'>('Wisata Alam');
  const [destLocation, setDestLocation] = useState('Tangerang Selatan');
  const [destPrice, setDestPrice] = useState('Gratis');
  const [destHours, setDestHours] = useState('08:00 - 18:00 WIB');
  const [destDesc, setDestDesc] = useState('');
  const [destImage, setDestImage] = useState('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80');
  const [destFacilitiesStr, setDestFacilitiesStr] = useState('Area Parkir, Toilet, Musholla');
  const [destCriteriaScores, setDestCriteriaScores] = useState({
    harga: 3,
    jarak: 3,
    fasilitas: 4,
    kebersihan: 4,
    keamanan: 4,
    popularitas: 4,
  });

  // User Management State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserAccount | null>(null);
  const [isLoadingUserDetail, setIsLoadingUserDetail] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const [newUserStatus, setNewUserStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

  // MOORA Detailed Calculation Modal
  const [detailMooraItem, setDetailMooraItem] = useState<MooraCalculationItem | null>(null);

  // Load User Profiles from Supabase on mount
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const profiles = await authService.getAllProfiles();
        if (profiles) {
          onUpdateUsers(profiles);
        }
      } catch (err) {
        console.error('Error loading profiles from Supabase:', err);
      }
    };

    if (isAdminLoggedIn) {
      loadProfiles();
    }
  }, [isAdminLoggedIn]);

  // Default MOORA Result for Admin Dashboard
  const calculatedMoora = calculateMoora(destinations, {
    harga: 4,
    jarak: 2,
    fasilitas: 5,
    kebersihan: 5,
    keamanan: 4,
    popularitas: 4,
  });

  if (!isAdminLoggedIn) return null;

  // Open modal for new destination
  const handleOpenAddModal = () => {
    setEditingDest(null);
    setDestName('');
    setDestCategory('Wisata Alam');
    setDestLocation('Tangerang Selatan');
    setDestPrice('Gratis');
    setDestHours('08:00 - 18:00 WIB');
    setDestDesc('');
    setDestImage('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80');
    setDestFacilitiesStr('Area Parkir, Toilet, Musholla');
    setDestCriteriaScores({ harga: 3, jarak: 3, fasilitas: 4, kebersihan: 4, keamanan: 4, popularitas: 4 });
    setIsDestModalOpen(true);
  };

  // Open modal for editing destination
  const handleOpenEditModal = (dest: Destination) => {
    setEditingDest(dest);
    setDestName(dest.name);
    setDestCategory(dest.primaryCategory || 'Wisata Alam');
    setDestLocation(dest.location);
    setDestPrice(dest.ticketPriceFormatted);
    setDestHours(dest.operationalHours);
    setDestDesc(dest.description);
    setDestImage(dest.image);
    setDestFacilitiesStr(dest.facilities.join(', '));
    setDestCriteriaScores({ ...dest.criteria });
    setIsDestModalOpen(true);
  };

  // Save destination locally
  const handleSaveDestination = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destName.trim()) {
      alert('Nama destinasi wajib diisi.');
      return;
    }

    const facArray = destFacilitiesStr.split(',').map((f) => f.trim()).filter(Boolean);

    if (editingDest) {
      const updatedList = destinations.map((d) => {
        if (d.id === editingDest.id) {
          return {
            ...d,
            name: destName.trim(),
            category: destCategory,
            primaryCategory: destCategory,
            location: destLocation.trim(),
            address: `${destLocation.trim()}, Kota Tangerang Selatan`,
            ticketPriceFormatted: destPrice.trim(),
            operationalHours: destHours.trim(),
            description: destDesc.trim(),
            image: destImage.trim(),
            facilities: facArray.length > 0 ? facArray : ['Area Parkir', 'Toilet'],
            criteria: destCriteriaScores,
          };
        }
        return d;
      });
      onUpdateDestinations(updatedList);
      alert(`Destinasi "${destName}" berhasil diperbarui!`);
    } else {
      const isDuplicate = destinations.some(
        (d) => d.name.trim().toLowerCase() === destName.trim().toLowerCase()
      );
      if (isDuplicate) {
        alert(`Destinasi dengan nama "${destName.trim()}" sudah ada! Mohon gunakan nama yang berbeda untuk menghindari duplikasi.`);
        return;
      }
      const newDest: Destination = {
        id: `dest-${Date.now()}`,
        name: destName.trim(),
        category: destCategory,
        primaryCategory: destCategory,
        location: destLocation.trim(),
        address: `${destLocation.trim()}, Kota Tangerang Selatan`,
        rating: 4.5,
        image: destImage.trim(),
        description: destDesc.trim() || `Destinasi wisata ${destCategory} di Tangerang Selatan.`,
        operationalHours: destHours.trim(),
        ticketPriceFormatted: destPrice.trim(),
        facilities: facArray.length > 0 ? facArray : ['Area Parkir', 'Toilet'],
        active: true,
        criteria: destCriteriaScores,
      };
      onUpdateDestinations([...destinations, newDest]);
      alert(`Destinasi "${destName}" berhasil ditambahkan!`);
    }
    setIsDestModalOpen(false);
  };

  // Toggle active destination locally
  const handleToggleDestActive = (id: string) => {
    const updated = destinations.map((d) => {
      if (d.id === id) {
        return { ...d, active: d.active === false ? true : false };
      }
      return d;
    });
    onUpdateDestinations(updated);
  };

  // Delete destination locally
  const handleDeleteDest = (id: string) => {
    if (destinations.length <= 3) {
      alert('Minimal harus tersisa 3 destinasi untuk perhitungan MOORA.');
      return;
    }
    if (window.confirm('Apakah Anda yakin ingin menghapus destinasi ini?')) {
      onUpdateDestinations(destinations.filter((d) => d.id !== id));
      alert('Destinasi berhasil dihapus.');
    }
  };

  // Handle Criteria Score Change in Matrix Table locally
  const handleCriteriaScoreChange = (destId: string, criteriaKey: keyof Destination['criteria'], val: number) => {
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

  // Toggle Criteria Active locally
  const handleToggleCriteriaActive = (criteriaId: string) => {
    setCriteriaList((prev) =>
      prev.map((c) => (c.id === criteriaId ? { ...c, active: !c.active } : c))
    );
  };

  // Update User Status in Supabase & UI (Optimistic)
  const handleToggleUserStatus = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const nextStatus: 'Aktif' | 'Nonaktif' = target.status === 'Nonaktif' ? 'Aktif' : 'Nonaktif';

    // 1. Update UI seketika (Optimistic)
    onUpdateUsers(users.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));
    if (selectedUserDetail?.id === userId) {
      setSelectedUserDetail({ ...selectedUserDetail, status: nextStatus });
    }

    // 2. Simpan ke database Supabase
    try {
      await authService.updateProfileStatus(userId, nextStatus);
    } catch (err: any) {
      console.warn('Gagal sinkronisasi status ke Supabase:', err);
    }
  };

  // Update User Role in Supabase & UI (Optimistic)
  const handleToggleUserRole = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    const nextRole: 'user' | 'admin' = target.role === 'admin' ? 'user' : 'admin';

    // 1. Update UI seketika (Optimistic)
    onUpdateUsers(users.map((u) => (u.id === userId ? { ...u, role: nextRole } : u)));
    if (selectedUserDetail?.id === userId) {
      setSelectedUserDetail({ ...selectedUserDetail, role: nextRole });
    }

    // 2. Simpan ke database Supabase
    try {
      await authService.updateProfileRole(userId, nextRole);
    } catch (err: any) {
      console.warn('Gagal sinkronisasi role ke Supabase:', err);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    const confirmText = target
      ? `Apakah Anda yakin ingin menghapus akun pengguna "${target.name}" (${target.email})?`
      : 'Apakah Anda yakin ingin menghapus akun pengguna ini?';

    if (window.confirm(confirmText)) {
      onUpdateUsers(users.filter((u) => u.id !== userId));
      if (selectedUserDetail?.id === userId) {
        setSelectedUserDetail(null);
      }
      try {
        await authService.deleteProfile(userId);
      } catch (err) {
        console.warn('Gagal menghapus user dari Supabase:', err);
      }
    }
  };

  // Create new user account manually
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      alert('Nama dan Email pengguna wajib diisi.');
      return;
    }

    const cleanName = newUserName.trim();
    const cleanEmail = newUserEmail.trim().toLowerCase();

    try {
      // 1. Simpan ke sistem profil dengan role dan status pilihan
      const createdUser = await authService.createUserProfile(
        cleanName,
        cleanEmail,
        newUserRole,
        newUserStatus
      );

      // 2. Coba sinkronisasi ke Supabase Auth
      try {
        await authService.signUp(cleanName, cleanEmail, 'User123456!', newUserRole, newUserStatus);
      } catch (authErr) {
        // Abaikan jika rate limit
      }

      onUpdateUsers([createdUser, ...users.filter((u) => u.email.toLowerCase() !== cleanEmail)]);
      alert(`Akun pengguna "${cleanName}" (${newUserRole.toUpperCase()}) berhasil disimpan dan aktif!`);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('user');
      setNewUserStatus('Aktif');
      setIsAddUserModalOpen(false);
    } catch (err: any) {
      console.error('Error creating user in Supabase:', err);
      alert(`Gagal mendaftarkan user: ${err.message || 'Terjadi kesalahan'}`);
    }
  };

  // Buka detail user dan muat data live Favorit & Riwayat MOORA langsung dari Supabase
  const handleOpenUserDetail = async (u: UserAccount) => {
    setSelectedUserDetail(u);
    setIsLoadingUserDetail(true);
    try {
      const [favs, hist] = await Promise.all([
        favoritesService.getUserFavorites(u.id),
        historyService.getUserHistory(u.id),
      ]);
      const updatedUser: UserAccount = {
        ...u,
        favorites: favs || [],
        history: hist || [],
      };
      setSelectedUserDetail(updatedUser);
      onUpdateUsers(users.map((item) => (item.id === u.id ? updatedUser : item)));
    } catch (err) {
      console.error('Error fetching live user detail from Supabase:', err);
    } finally {
      setIsLoadingUserDetail(false);
    }
  };

  // Heatmap Color Helper for Decision Matrix Scores (1 - 5)
  const getScoreHeatmapClass = (score: number, type: 'Cost' | 'Benefit') => {
    if (type === 'Benefit') {
      switch (score) {
        case 5: return 'bg-blue-100 text-blue-900 border-blue-300 font-black';
        case 4: return 'bg-blue-50 text-blue-800 border-blue-200 font-bold';
        case 3: return 'bg-gray-50 text-gray-800 border-gray-200';
        case 2: return 'bg-amber-50 text-amber-900 border-amber-200';
        case 1: return 'bg-rose-50 text-rose-900 border-rose-200';
        default: return '';
      }
    } else {
      // For Cost criteria (lower raw score = better)
      switch (score) {
        case 1: return 'bg-blue-100 text-blue-900 border-blue-300 font-black';
        case 2: return 'bg-blue-50 text-blue-800 border-blue-200 font-bold';
        case 3: return 'bg-gray-50 text-gray-800 border-gray-200';
        case 4: return 'bg-amber-50 text-amber-900 border-amber-200';
        case 5: return 'bg-rose-50 text-rose-900 border-rose-200';
        default: return '';
      }
    }
  };

  // Filtered lists
  const filteredDestinations = destinations.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(destSearchQuery.toLowerCase()) || d.location.toLowerCase().includes(destSearchQuery.toLowerCase());
    const matchCat = destCategoryFilter === 'Semua' || d.category === destCategoryFilter || d.primaryCategory === destCategoryFilter;
    return matchSearch && matchCat;
  });

  const filteredUsers = users.filter((u) => {
    return u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(userSearchQuery.toLowerCase());
  });

  const activeDestCount = destinations.filter((d) => d.active !== false).length;

  // Pagination calculations
  const totalDestPages = Math.max(1, Math.ceil(filteredDestinations.length / destItemsPerPage));
  const paginatedDestinations = filteredDestinations.slice(
    (destPage - 1) * destItemsPerPage,
    destPage * destItemsPerPage
  );

  const totalMatrixPages = Math.max(1, Math.ceil(destinations.length / matrixItemsPerPage));
  const paginatedMatrixDestinations = destinations.slice(
    (matrixPage - 1) * matrixItemsPerPage,
    matrixPage * matrixItemsPerPage
  );

  const totalRankingPages = Math.max(1, Math.ceil(calculatedMoora.items.length / rankingItemsPerPage));
  const paginatedRankingItems = calculatedMoora.items.slice(
    (rankingPage - 1) * rankingItemsPerPage,
    rankingPage * rankingItemsPerPage
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans">
      {/* 1. TOP HEADER BAR */}
      <header className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E3A8A] text-white sticky top-0 z-40 shadow-lg border-b border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <span className="font-black text-xl sm:text-2xl tracking-tight">Panel Administrator</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 text-xs sm:text-sm text-slate-200 font-medium border border-white/15">
              <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>Status: Server Online • Synchronized</span>
            </div>

            <button
              onClick={onGoToSite}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-extrabold transition-all border border-white/20 cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Lihat Situs Wisata</span>
            </button>

            <button
              onClick={onLogoutAdmin}
              className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT WITH SIDEBAR & CONTENT */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* SIDEBAR NAVIGATION (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-5 border border-[#CBD5E1]/50 shadow-xs space-y-1.5">
            <div className="px-4 py-2.5 text-xs font-black uppercase tracking-wider text-[#64748B]">
              Menu Utama Admin
            </div>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-4 rounded-2xl text-sm sm:text-base font-extrabold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#2563EB] text-white shadow-md'
                  : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#2563EB]'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('destinations')}
              className={`w-full flex items-center justify-between px-4.5 py-4 rounded-2xl text-sm sm:text-base font-extrabold transition-all cursor-pointer ${
                activeTab === 'destinations'
                  ? 'bg-[#2563EB] text-white shadow-md'
                  : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#2563EB]'
              }`}
            >
              <span className="flex items-center gap-3.5">
                <MapPin className="w-5 h-5" />
                <span>Kelola Destinasi</span>
              </span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                activeTab === 'destinations' ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#2563EB]'
              }`}>
                {destinations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('criteria')}
              className={`w-full flex items-center justify-between px-4.5 py-4 rounded-2xl text-sm sm:text-base font-extrabold transition-all cursor-pointer ${
                activeTab === 'criteria'
                  ? 'bg-[#2563EB] text-white shadow-md'
                  : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#2563EB]'
              }`}
            >
              <span className="flex items-center gap-3.5">
                <Sliders className="w-5 h-5" />
                <span>Kelola Kriteria</span>
              </span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                activeTab === 'criteria' ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#2563EB]'
              }`}>
                {criteriaList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('matrix')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-4 rounded-2xl text-sm sm:text-base font-extrabold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-[#2563EB] text-white shadow-md'
                  : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#2563EB]'
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
              <span>Matriks & Nilai MOORA</span>
            </button>

            <button
              onClick={() => setActiveTab('ranking')}
              className={`w-full flex items-center gap-3.5 px-4.5 py-4 rounded-2xl text-sm sm:text-base font-extrabold transition-all cursor-pointer ${
                activeTab === 'ranking'
                  ? 'bg-[#2563EB] text-white shadow-md'
                  : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#2563EB]'
              }`}
            >
              <Award className="w-5 h-5" />
              <span>Hasil Perankingan</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-4.5 py-4 rounded-2xl text-sm sm:text-base font-extrabold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#2563EB] text-white shadow-md'
                  : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#2563EB]'
              }`}
            >
              <span className="flex items-center gap-3.5">
                <Users className="w-5 h-5" />
                <span>Kelola Pengguna</span>
              </span>
              <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-blue-100 text-[#2563EB]'
              }`}>
                {users.length}
              </span>
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA (9 cols) */}
        <div className="lg:col-span-9 space-y-8">
          {/* ==================== TAB 1: DASHBOARD ANALYTICS ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Stat Metric Grid (4 Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#CBD5E1]/50 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#64748B] tracking-wider">Total Destinasi</span>
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                      <MapPin className="w-5.5 h-5.5" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#0F172A]">{destinations.length}</div>
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm text-blue-800 font-extrabold bg-blue-50 px-3 py-1 rounded-xl w-fit">
                    <TrendingUp className="w-4 h-4" />
                    <span>+100% Data Terverifikasi</span>
                  </div>
                </div>

                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#CBD5E1]/50 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#64748B] tracking-wider">Kriteria MOORA</span>
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Sliders className="w-5.5 h-5.5" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#0F172A]">{criteriaList.length}</div>
                  <div className="text-xs sm:text-sm font-extrabold text-amber-900 bg-amber-50 px-3 py-1 rounded-xl w-fit">
                    <span>2 Cost • 4 Benefit</span>
                  </div>
                </div>

                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#CBD5E1]/50 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#64748B] tracking-wider">Destinasi Aktif</span>
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5.5 h-5.5" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#2563EB]">{activeDestCount}</div>
                  <div className="text-xs sm:text-sm font-extrabold text-blue-900 bg-blue-50 px-3 py-1 rounded-xl w-fit">
                    <span>{((activeDestCount / destinations.length) * 100).toFixed(0)}% Publik Tampil</span>
                  </div>
                </div>

                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#CBD5E1]/50 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[#64748B] tracking-wider">Kalkulasi User</span>
                    <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Sparkles className="w-5.5 h-5.5" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-[#0F172A]">{totalRecommendationCount || 28}</div>
                  <div className="text-xs sm:text-sm font-extrabold text-rose-900 bg-rose-50 px-3 py-1 rounded-xl w-fit">
                    <span>Riwayat Terkalkulasi</span>
                  </div>
                </div>
              </div>

              {/* PODIUM LEADERBOARD TOP 3 DESTINASI */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBD5E1]/50 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-3.5 py-1.5 rounded-xl">
                      Podium Perangkingan MOORA
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] mt-2">
                      Leaderboard Top 3 Destinasi Terbaik
                    </h3>
                  </div>
                  <Award className="w-8 h-8 text-amber-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  {calculatedMoora.items.slice(0, 3).map((item, idx) => {
                    const badgeColors = [
                      'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 border-amber-300',
                      'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-900 border-slate-300',
                      'bg-gradient-to-r from-amber-700 to-amber-800 text-white border-amber-900',
                    ];
                    const rankLabels = ['JUARA 1 (GOLD)', 'JUARA 2 (SILVER)', 'JUARA 3 (BRONZE)'];

                    return (
                      <div
                        key={item.destination.id}
                        className="bg-[#F8FAFC] rounded-3xl p-6 border border-[#CBD5E1]/50 space-y-4 hover:shadow-lg transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3.5">
                          <div className="relative h-48 sm:h-52 rounded-2xl overflow-hidden shadow-xs">
                            <img
                              src={item.destination.image}
                              alt={item.destination.name}
                              className="w-full h-full object-cover"
                            />
                            <div className={`absolute top-3 left-3 px-3.5 py-1.5 rounded-full text-xs font-black shadow-md border ${badgeColors[idx]}`}>
                              #{idx + 1} {rankLabels[idx]}
                            </div>
                            <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-[#0F172A] text-xs sm:text-sm font-extrabold px-3 py-1 rounded-xl flex items-center gap-1 shadow-xs">
                              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                              <span>{item.destination.rating.toFixed(1)}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-xs font-extrabold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-lg">
                              {item.destination.category}
                            </span>
                            <h4 className="font-extrabold text-lg sm:text-xl text-[#0F172A] mt-2 line-clamp-1">
                              {item.destination.name}
                            </h4>
                            <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 line-clamp-1">{item.destination.location}</p>
                          </div>
                        </div>

                        <div className="pt-3.5 border-t border-[#CBD5E1]/30 flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-bold text-[#64748B]">Skor Yi MOORA:</span>
                          <span className="text-lg sm:text-xl font-mono font-black text-[#2563EB]">
                            {item.scoreYi.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: KELOLA DESTINASI ==================== */}
          {activeTab === 'destinations' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBD5E1]/50 shadow-xs space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Kelola Destinasi Wisata</h2>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1">Tambah, edit foto, deskripsi, alamat, jam operasional, harga, dan kriteria destinasi.</p>
                </div>

                <div className="flex items-center gap-3">
                  {/* View Mode Switcher */}
                  <div className="flex bg-[#F1F5F9] p-1.5 rounded-2xl border border-[#CBD5E1]/40">
                    <button
                      type="button"
                      onClick={() => setDestViewMode('table')}
                      className={`px-3.5 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all cursor-pointer ${
                        destViewMode === 'table' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-[#64748B]'
                      }`}
                    >
                      Tabel List
                    </button>
                    <button
                      type="button"
                      onClick={() => setDestViewMode('grid')}
                      className={`px-3.5 py-2 text-xs sm:text-sm font-extrabold rounded-xl transition-all cursor-pointer ${
                        destViewMode === 'grid' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-[#64748B]'
                      }`}
                    >
                      Kartu Grid
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-extrabold px-5 py-3 rounded-2xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4.5 h-4.5" />
                    <span>Tambah Destinasi Baru</span>
                  </button>
                </div>
              </div>

              {/* Toolbar Search & Filter */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={destSearchQuery}
                    onChange={(e) => setDestSearchQuery(e.target.value)}
                    placeholder="Cari berdasarkan nama atau lokasi destinasi..."
                    className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-[#F1F5F9] border focus:outline-none"
                  />
                  <Search className="w-5 h-5 text-[#64748B] absolute left-3.5 top-3.5" />
                </div>

                <select
                  value={destCategoryFilter}
                  onChange={(e) => setDestCategoryFilter(e.target.value)}
                  className="px-4 py-3 text-xs sm:text-sm font-extrabold rounded-2xl bg-[#F1F5F9] border text-[#0F172A] cursor-pointer"
                >
                  <option value="Semua">Semua Kategori ({destinations.length})</option>
                  <option value="Wisata Alam">Wisata Alam</option>
                  <option value="Wisata Budaya">Wisata Budaya</option>
                  <option value="Wisata Buatan">Wisata Buatan</option>
                  <option value="Wisata MICE">Wisata MICE</option>
                  <option value="Wisata Kuliner">Wisata Kuliner</option>
                  <option value="Kampung Wisata">Kampung Wisata</option>
                </select>
              </div>

              {/* Destinations View: Table View */}
              {destViewMode === 'table' ? (
                <div className="overflow-x-auto border rounded-2xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#F1F5F9] text-[#0F172A] font-black text-xs uppercase tracking-wider border-b">
                      <tr>
                        <th className="px-5 py-4">Foto & Destinasi</th>
                        <th className="px-5 py-4">Kategori</th>
                        <th className="px-5 py-4">Harga & Jam Operasional</th>
                        <th className="px-5 py-4 text-center">Status</th>
                        <th className="px-5 py-4 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedDestinations.map((dest) => (
                        <tr key={dest.id} className="hover:bg-gray-50/80">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3.5">
                              <img
                                src={dest.image}
                                alt={dest.name}
                                className="w-14 h-14 rounded-2xl object-cover shrink-0 shadow-xs"
                              />
                              <div>
                                <div className="font-extrabold text-base text-[#0F172A]">{dest.name}</div>
                                <div className="text-xs sm:text-sm text-[#64748B] mt-0.5">{dest.location}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-blue-50 text-[#2563EB]">
                              {dest.category}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-black text-[#0F172A] text-sm sm:text-base">{dest.ticketPriceFormatted}</div>
                            <div className="text-xs sm:text-sm text-[#64748B] mt-0.5">{dest.operationalHours}</div>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleDestActive(dest.id)}
                              className={`px-4 py-1.5 rounded-full text-xs font-extrabold cursor-pointer transition-colors ${
                                dest.active !== false ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                              }`}
                            >
                              {dest.active !== false ? 'Aktif' : 'Nonaktif'}
                            </button>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPreviewDest(dest)}
                                className="p-2.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Pratinjau Tampilan User"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(dest)}
                                className="p-2.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Edit Destinasi"
                              >
                                <Edit3 className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDest(dest.id)}
                                className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus Destinasi"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedDestinations.map((dest) => (
                    <div
                      key={dest.id}
                      className="bg-[#F8FAFC] rounded-3xl overflow-hidden border border-[#CBD5E1]/50 shadow-xs flex flex-col justify-between"
                    >
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 bg-[#2563EB] text-white text-xs font-bold px-3 py-1 rounded-full">
                          {dest.category}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleDestActive(dest.id)}
                          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-extrabold cursor-pointer ${
                            dest.active !== false ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'
                          }`}
                        >
                          {dest.active !== false ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </div>

                      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-black text-lg sm:text-xl text-[#0F172A] line-clamp-1">{dest.name}</h4>
                          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">{dest.location}</p>
                          <p className="text-xs sm:text-sm text-[#334155] mt-2 line-clamp-2">{dest.description}</p>
                        </div>

                        <div className="pt-4 border-t flex items-center justify-between">
                          <span className="font-black text-[#0F172A] text-sm sm:text-base">{dest.ticketPriceFormatted}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewDest(dest)}
                              className="p-2 bg-blue-50 text-[#2563EB] hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                              title="Pratinjau Tampilan User"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(dest)}
                              className="px-3.5 py-2 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDest(dest.id)}
                              className="px-3.5 py-2 bg-rose-50 text-rose-800 hover:bg-rose-100 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              <TablePagination
                currentPage={destPage}
                totalPages={totalDestPages}
                totalItems={filteredDestinations.length}
                itemsPerPage={destItemsPerPage}
                onPageChange={setDestPage}
                itemName="destinasi"
              />
            </div>
          )}

          {/* ==================== TAB 3: KELOLA KRITERIA ==================== */}
          {activeTab === 'criteria' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBD5E1]/50 shadow-xs space-y-6 animate-fade-in">
              <div className="border-b pb-4">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Kelola Kriteria MOORA</h2>
                <p className="text-xs sm:text-sm text-[#64748B] mt-1">Daftar 6 parameter kriteria penilaian beserta atribut Cost/Benefit & Bobot.</p>
              </div>

              {/* Weight Distribution Bar */}
              <div className="bg-[#F8FAFC] p-6 rounded-3xl border border-[#CBD5E1]/50 space-y-4">
                <div className="flex justify-between items-center text-xs sm:text-sm font-extrabold">
                  <span className="text-[#0F172A]">Distribusi Total Bobot Kriteria</span>
                  <span className="text-[#2563EB]">Total: 100% (1.00)</span>
                </div>
                <div className="w-full bg-gray-200 h-5 rounded-full overflow-hidden flex shadow-inner">
                  {criteriaList.map((c, i) => (
                    <div
                      key={c.id}
                      className={`h-full ${
                        i % 2 === 0 ? 'bg-[#2563EB]' : 'bg-[#1D4ED8]'
                      }`}
                      style={{ width: `${c.weight * 100}%` }}
                      title={`${c.code} ${c.name}: ${c.weight * 100}%`}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-[#64748B]">
                  {criteriaList.map((c) => (
                    <span key={c.id} className="font-extrabold">
                      {c.code}: {(c.weight * 100).toFixed(0)}%
                    </span>
                  ))}
                </div>
              </div>

              {/* Criteria Table */}
              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F1F5F9] text-[#0F172A] font-black text-xs uppercase tracking-wider border-b">
                    <tr>
                      <th className="px-5 py-4">Kode</th>
                      <th className="px-5 py-4">Nama Kriteria</th>
                      <th className="px-5 py-4 text-center">Jenis</th>
                      <th className="px-5 py-4 text-right">Bobot</th>
                      <th className="px-5 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {criteriaList.map((crit) => (
                      <tr key={crit.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-mono font-black text-base sm:text-lg text-[#2563EB]">{crit.code}</td>
                        <td className="px-5 py-4">
                          <div className="font-black text-base text-[#0F172A]">{crit.name}</div>
                          <div className="text-xs sm:text-sm text-[#64748B] mt-0.5">{crit.description}</div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-black ${
                            crit.type === 'Cost' ? 'bg-rose-100 text-rose-900' : 'bg-blue-100 text-blue-900'
                          }`}>
                            {crit.type}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-extrabold text-base sm:text-lg">
                          {(crit.weight * 100).toFixed(0)}%
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleCriteriaActive(crit.id)}
                            className={`px-4 py-1.5 rounded-full text-xs font-extrabold cursor-pointer ${
                              crit.active ? 'bg-emerald-100 text-emerald-900' : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {crit.active ? 'Aktif' : 'Nonaktif'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================== TAB 4: MATRIKS & NILAI (HEATMAP) ==================== */}
          {activeTab === 'matrix' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBD5E1]/50 shadow-xs space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Matriks Keputusan (X)</h2>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1">Edit nilai kriteria skala (1 - 5) untuk setiap destinasi alternatif dengan gradasi warna heatmap.</p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={onResetDestinations}
                    className="px-4 py-3 rounded-2xl bg-rose-50 text-rose-800 hover:bg-rose-100 text-xs sm:text-sm font-extrabold transition-colors cursor-pointer"
                  >
                    Reset Data Awal
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ranking')}
                    className="px-5 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-extrabold rounded-2xl transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <Award className="w-4.5 h-4.5" />
                    <span>Jalankan Perhitungan MOORA</span>
                  </button>
                </div>
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center gap-3 text-xs sm:text-sm bg-[#F1F5F9] p-4 rounded-2xl border flex-wrap">
                <span className="font-extrabold text-[#0F172A]">Keterangan Heatmap:</span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-950 font-bold">5 = Sangat Tinggi</span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 font-bold">4 = Tinggi</span>
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800">3 = Sedang</span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-950 font-bold">2 = Rendah</span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-950 font-bold">1 = Sangat Rendah</span>
              </div>

              {/* Decision Matrix Table with Heatmap */}
              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F1F5F9] text-[#0F172A] font-black text-xs uppercase tracking-wider border-b">
                    <tr>
                      <th className="px-5 py-4">Nama Alternatif Destinasi</th>
                      {CRITERIA_DEFINITIONS.map((c) => (
                        <th key={c.key} className="px-4 py-4 text-center">
                          {c.code}
                          <span className="block text-xs text-[#64748B] font-semibold">({c.type})</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedMatrixDestinations.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-black text-base text-[#0F172A]">
                          {d.name}
                          <span className="block text-xs text-[#64748B] font-normal">{d.category}</span>
                        </td>
                        {CRITERIA_DEFINITIONS.map((c) => {
                          const val = d.criteria[c.key as keyof Destination['criteria']];
                          return (
                            <td key={c.key} className="px-4 py-4 text-center">
                              <select
                                value={val}
                                onChange={(e) =>
                                  handleCriteriaScoreChange(
                                    d.id,
                                    c.key as keyof Destination['criteria'],
                                    parseInt(e.target.value)
                                  )
                                }
                                className={`border rounded-xl px-3 py-2 text-sm font-black transition-colors cursor-pointer ${getScoreHeatmapClass(
                                  val,
                                  c.type as any
                                )}`}
                              >
                                {[1, 2, 3, 4, 5].map((v) => (
                                  <option key={v} value={v}>
                                    {v}
                                  </option>
                                ))}
                              </select>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <TablePagination
                currentPage={matrixPage}
                totalPages={totalMatrixPages}
                totalItems={destinations.length}
                itemsPerPage={matrixItemsPerPage}
                onPageChange={setMatrixPage}
                itemName="destinasi"
              />
            </div>
          )}

          {/* ==================== TAB 5: HASIL PERANKINGAN ==================== */}
          {activeTab === 'ranking' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBD5E1]/50 shadow-xs space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Hasil Perankingan MOORA</h2>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1">Hasil kalkulasi Nilai Optimasi Yi = ∑Benefit - ∑Cost dari tertinggi ke terendah.</p>
                </div>
              </div>

              {/* Ranking Table */}
              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F1F5F9] text-[#0F172A] font-black text-xs uppercase tracking-wider border-b">
                    <tr>
                      <th className="px-5 py-4 text-center">Rank</th>
                      <th className="px-5 py-4">Nama Destinasi</th>
                      <th className="px-5 py-4">Kategori</th>
                      <th className="px-5 py-4 text-right">∑ Benefit</th>
                      <th className="px-5 py-4 text-right">∑ Cost</th>
                      <th className="px-5 py-4 text-right">Nilai Yi</th>
                      <th className="px-5 py-4 text-center">Rincian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedRankingItems.map((item) => (
                      <tr key={item.destination.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-center font-black text-lg text-[#2563EB]">#{item.rank}</td>
                        <td className="px-5 py-4 font-extrabold text-base text-[#0F172A]">{item.destination.name}</td>
                        <td className="px-5 py-4 text-xs sm:text-sm text-[#2563EB] font-extrabold">{item.destination.category}</td>
                        <td className="px-5 py-4 text-right font-mono font-extrabold text-blue-800 text-sm sm:text-base">
                          +{item.benefitTotal.toFixed(4)}
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-extrabold text-rose-800 text-sm sm:text-base">
                          -{item.costTotal.toFixed(4)}
                        </td>
                        <td className="px-5 py-4 text-right font-mono font-black text-base sm:text-lg text-[#2563EB]">
                          {item.scoreYi.toFixed(4)}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => setDetailMooraItem(item)}
                            className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-[#2563EB] hover:text-white rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer"
                          >
                            Rincian MOORA
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <TablePagination
                currentPage={rankingPage}
                totalPages={totalRankingPages}
                totalItems={calculatedMoora.items.length}
                itemsPerPage={rankingItemsPerPage}
                onPageChange={setRankingPage}
                itemName="destinasi"
              />
            </div>
          )}

          {/* ==================== TAB 6: KELOLA PENGGUNA ==================== */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#CBD5E1]/50 shadow-xs space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Kelola Pengguna Terdaftar</h2>
                  <p className="text-xs sm:text-sm text-[#64748B] mt-1">Daftar pengguna terdaftar, status akun, favorit, dan riwayat rekomendasi.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-extrabold px-5 py-3 rounded-2xl shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus className="w-4.5 h-4.5" />
                  <span>Tambah User Baru</span>
                </button>
              </div>

              {/* Search User Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan nama atau email user..."
                  className="w-full pl-11 pr-4 py-3 text-xs sm:text-sm rounded-2xl bg-[#F1F5F9] border focus:outline-none"
                />
                <Search className="w-5 h-5 text-[#64748B] absolute left-3.5 top-3.5" />
              </div>

              {/* User Table */}
              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F1F5F9] text-[#0F172A] font-black text-xs uppercase tracking-wider border-b">
                    <tr>
                      <th className="px-5 py-4">Nama User</th>
                      <th className="px-5 py-4">Email</th>
                      <th className="px-5 py-4 text-center">Role</th>
                      <th className="px-5 py-4 text-center">Favorit</th>
                      <th className="px-5 py-4 text-center">Riwayat MOORA</th>
                      <th className="px-5 py-4 text-center">Status</th>
                      <th className="px-5 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-black text-base text-[#0F172A]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-sm font-black">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs sm:text-sm text-[#64748B] font-semibold">{u.email}</td>
                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleUserRole(u.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer shadow-2xs ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                            }`}
                            title="Klik untuk mengubah Role (User / Admin)"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{u.role === 'admin' ? 'Admin' : 'User'}</span>
                          </button>
                        </td>
                        <td className="px-5 py-4 text-center font-black text-rose-600 text-sm sm:text-base">♥ {u.favorites?.length || 0}</td>
                        <td className="px-5 py-4 text-center font-black text-[#2563EB] text-sm sm:text-base">{u.history?.length || 0}</td>
                        <td className="px-5 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer shadow-2xs ${
                              u.status !== 'Nonaktif'
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200'
                            }`}
                            title="Klik untuk mengubah Status (Aktif / Nonaktif)"
                          >
                            <span className={`w-2 h-2 rounded-full ${u.status !== 'Nonaktif' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                            <span>{u.status !== 'Nonaktif' ? 'Aktif' : 'Nonaktif'}</span>
                          </button>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenUserDetail(u)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer font-bold text-xs"
                              title="Lihat Detail Profil User"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              title="Hapus User"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT DESTINASI (LENGKAP PREVIEW & SLIDERS) */}
      {isDestModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#CBD5E1]/40 relative my-8">
            <div className="p-6 bg-[#2563EB] text-white flex items-center justify-between">
              <h3 className="text-xl font-black">
                {editingDest ? 'Edit Destinasi Wisata' : 'Tambah Destinasi Wisata Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsDestModalOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveDestination} className="p-6 sm:p-8 space-y-5 max-h-[78vh] overflow-y-auto text-xs sm:text-sm">
              {/* Live Image Preview */}
              {destImage && (
                <div className="relative h-48 rounded-2xl overflow-hidden border bg-gray-100">
                  <img src={destImage} alt="Pratinjau Foto" className="w-full h-full object-cover" />
                  <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-extrabold px-3 py-1 rounded-lg">
                    Pratinjau Foto Live
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="font-extrabold text-[#0F172A] block mb-1.5">Nama Destinasi</label>
                  <input
                    type="text"
                    required
                    value={destName}
                    onChange={(e) => setDestName(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-2xl bg-[#F1F5F9] border focus:outline-none font-bold"
                    placeholder="Contoh: Taman Wisata Situ Gintung"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-[#0F172A] block mb-1.5">Kategori Utama</label>
                  <select
                    value={destCategory}
                    onChange={(e) => setDestCategory(e.target.value as any)}
                    className="w-full px-4 py-3 text-sm rounded-2xl bg-[#F1F5F9] border focus:outline-none font-bold cursor-pointer"
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
                  <label className="font-extrabold text-[#0F172A] block mb-1.5">Lokasi / Kecamatan</label>
                  <input
                    type="text"
                    required
                    value={destLocation}
                    onChange={(e) => setDestLocation(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-2xl bg-[#F1F5F9] border focus:outline-none font-bold"
                    placeholder="Ciputat, Tangerang Selatan"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-[#0F172A] block mb-1.5">Harga Tiket Masuk</label>
                  <input
                    type="text"
                    required
                    value={destPrice}
                    onChange={(e) => setDestPrice(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-2xl bg-[#F1F5F9] border focus:outline-none font-bold"
                    placeholder="Gratis / Rp 15.000"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-[#0F172A] block mb-1.5">Jam Operasional</label>
                  <input
                    type="text"
                    required
                    value={destHours}
                    onChange={(e) => setDestHours(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-2xl bg-[#F1F5F9] border focus:outline-none font-bold"
                    placeholder="08:00 - 18:00 WIB"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-[#0F172A] block mb-1.5">URL Foto Destinasi</label>
                  <input
                    type="text"
                    required
                    value={destImage}
                    onChange={(e) => setDestImage(e.target.value)}
                    className="w-full px-4 py-3 text-sm rounded-2xl bg-[#F1F5F9] border focus:outline-none font-bold"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="font-extrabold text-[#0F172A] block mb-1.5">Fasilitas (Dipisah koma)</label>
                <input
                  type="text"
                  value={destFacilitiesStr}
                  onChange={(e) => setDestFacilitiesStr(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-2xl bg-[#F1F5F9] border focus:outline-none font-bold"
                  placeholder="Area Parkir, Toilet, Musholla, Gazebo"
                />
              </div>

              <div>
                <label className="font-extrabold text-[#0F172A] block mb-1.5">Deskripsi Lengkap Wisata</label>
                <textarea
                  rows={3}
                  value={destDesc}
                  onChange={(e) => setDestDesc(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-2xl bg-[#F1F5F9] border focus:outline-none font-medium"
                  placeholder="Tuliskan deskripsi keindahan dan daya tarik destinasi..."
                />
              </div>

              {/* Criteria score sliders */}
              <div className="space-y-3 pt-3 border-t">
                <label className="font-black text-base text-[#0F172A] block">Nilai Parameter Kriteria MOORA (Skala 1 - 5):</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {CRITERIA_DEFINITIONS.map((c) => (
                    <div key={c.key} className="bg-gray-50 p-3.5 rounded-2xl border text-xs sm:text-sm">
                      <span className="font-extrabold block truncate">{c.code}. {c.name}</span>
                      <div className="flex items-center gap-2.5 mt-2">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={destCriteriaScores[c.key as keyof typeof destCriteriaScores]}
                          onChange={(e) =>
                            setDestCriteriaScores((prev) => ({
                              ...prev,
                              [c.key]: parseInt(e.target.value),
                            }))
                          }
                          className="w-full accent-[#2563EB] cursor-pointer"
                        />
                        <span className="font-black text-base text-[#2563EB]">
                          {destCriteriaScores[c.key as keyof typeof destCriteriaScores]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsDestModalOpen(false)}
                  className="px-6 py-3 rounded-2xl border text-sm font-bold hover:bg-gray-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-7 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-extrabold rounded-2xl cursor-pointer shadow-xs"
                >
                  Simpan Destinasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DETIL MOORA FOR ADMIN */}
      {detailMooraItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#CBD5E1]/40 relative my-8">
            <div className="p-6 bg-[#2563EB] text-white flex items-center justify-between">
              <h3 className="text-xl font-black">Detail Perhitungan MOORA</h3>
              <button
                type="button"
                onClick={() => setDetailMooraItem(null)}
                className="text-white hover:bg-white/20 p-2 rounded-full cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto text-sm">
              <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#CBD5E1]/50 space-y-2">
                <div className="font-black text-lg text-[#0F172A]">{detailMooraItem.destination.name}</div>
                <div className="text-xs sm:text-sm text-[#64748B] font-semibold">{detailMooraItem.destination.category}</div>
                <div className="pt-2 text-2xl font-mono font-black text-[#2563EB]">
                  Skor Yi = {detailMooraItem.scoreYi.toFixed(4)}
                </div>
              </div>

              <div className="space-y-3">
                <span className="font-extrabold text-[#0F172A] block text-base">Nilai Terbobot Kriteria (wj · x*ij):</span>
                <div className="space-y-2 bg-gray-50 p-4 rounded-2xl border text-xs sm:text-sm">
                  {CRITERIA_DEFINITIONS.map((crit) => (
                    <div key={crit.key} className="flex justify-between font-mono">
                      <span>{crit.code}. {crit.name} ({crit.type}):</span>
                      <span className="font-extrabold text-[#2563EB]">
                        {detailMooraItem.weighted[crit.key as keyof typeof detailMooraItem.weighted].toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between text-sm font-extrabold pt-3 border-t">
                <span className="text-blue-800">Total Benefit (∑B): +{detailMooraItem.benefitTotal.toFixed(4)}</span>
                <span className="text-rose-800">Total Cost (∑C): -{detailMooraItem.costTotal.toFixed(4)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL USER DETAIL PROFIL (UNTUK ADMIN) */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#CBD5E1]/40 relative my-8">
            <div className="p-6 bg-[#2563EB] text-white flex items-center justify-between">
              <h3 className="text-xl font-black">Profil Akun Pengguna</h3>
              <button
                type="button"
                onClick={() => setSelectedUserDetail(null)}
                className="text-white hover:bg-white/20 p-2 rounded-full cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto text-sm">
              <div className="flex items-center gap-4 bg-[#F8FAFC] p-5 rounded-2xl border">
                <div className="w-14 h-14 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-black text-xl">
                  {selectedUserDetail.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-lg text-[#0F172A] truncate">{selectedUserDetail.name}</h4>
                  <p className="text-xs sm:text-sm text-[#64748B] font-semibold truncate">{selectedUserDetail.email}</p>
                </div>
              </div>

              {/* Kelola Role & Status Langsung */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 border space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Role Pengguna</span>
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                      selectedUserDetail.role === 'admin'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-200 text-slate-800'
                    }`}>
                      {selectedUserDetail.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleUserRole(selectedUserDetail.id)}
                      className="px-3 py-1 rounded-xl text-xs font-extrabold bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer shadow-2xs"
                    >
                      Ubah ke {selectedUserDetail.role === 'admin' ? 'User' : 'Admin'}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border space-y-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Status Akun</span>
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                      selectedUserDetail.status !== 'Nonaktif'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}>
                      {selectedUserDetail.status !== 'Nonaktif' ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleUserStatus(selectedUserDetail.id)}
                      className="px-3 py-1 rounded-xl text-xs font-extrabold bg-white border border-slate-300 hover:bg-slate-100 cursor-pointer shadow-2xs"
                    >
                      Ubah ke {selectedUserDetail.status !== 'Nonaktif' ? 'Nonaktif' : 'Aktif'}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-[#0F172A] block">Destinasi Favorit Tersimpan ({selectedUserDetail.favorites?.length || 0}):</span>
                  {isLoadingUserDetail && (
                    <span className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menyinkronkan...
                    </span>
                  )}
                </div>
                {isLoadingUserDetail && (!selectedUserDetail.favorites || selectedUserDetail.favorites.length === 0) ? (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Memuat data favorit dari Supabase...</span>
                  </div>
                ) : (!selectedUserDetail.favorites || selectedUserDetail.favorites.length === 0) ? (
                  <p className="text-xs sm:text-sm text-[#64748B] italic bg-gray-50 p-4 rounded-2xl border border-slate-100">Belum ada destinasi favorit tersimpan.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedUserDetail.favorites.map((favId) => {
                      const d = destinations.find((dest) => dest.id === favId);
                      return (
                        <div key={favId} className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                              <Heart className="w-3.5 h-3.5 fill-rose-500" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="font-extrabold text-xs sm:text-sm text-[#0F172A] truncate">
                                {d ? d.name : favId}
                              </h5>
                              <p className="text-[11px] text-[#64748B] truncate">
                                {d ? `${d.category} • ${d.location}` : 'Destinasi Wisata Tangsel'}
                              </p>
                            </div>
                          </div>
                          {d && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 shrink-0 ml-2">
                              ★ {d.rating}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-[#0F172A] block">Riwayat Rekomendasi MOORA ({selectedUserDetail.history?.length || 0}):</span>
                  {isLoadingUserDetail && (
                    <span className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Menyinkronkan...
                    </span>
                  )}
                </div>
                {isLoadingUserDetail && (!selectedUserDetail.history || selectedUserDetail.history.length === 0) ? (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Memuat data riwayat MOORA dari Supabase...</span>
                  </div>
                ) : (!selectedUserDetail.history || selectedUserDetail.history.length === 0) ? (
                  <p className="text-xs sm:text-sm text-[#64748B] italic bg-gray-50 p-4 rounded-2xl border border-slate-100">Belum ada riwayat rekomendasi tersimpan.</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {selectedUserDetail.history.map((h) => (
                      <div key={h.id} className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{h.timestamp}</span>
                          </div>
                          <span className="font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px]">
                            {h.resultCount} Destinasi
                          </span>
                        </div>
                        <p className="text-xs text-[#475569] font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="font-bold text-slate-700">Preferensi: </span>
                          {h.preferenceSummary || 'Kombinasi Kriteria MOORA'}
                        </p>
                        {h.topResults && h.topResults.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[11px] font-black uppercase text-slate-400 block mb-1.5 tracking-wider">
                              Top Rekomendasi MOORA:
                            </span>
                            <div className="space-y-1">
                              {h.topResults.slice(0, 3).map((res, rIdx) => (
                                <div
                                  key={`${h.id}-res-${rIdx}`}
                                  className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-slate-50"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                      res.rank === 1
                                        ? 'bg-amber-100 text-amber-800'
                                        : res.rank === 2
                                        ? 'bg-slate-200 text-slate-700'
                                        : 'bg-amber-50 text-amber-700'
                                    }`}>
                                      #{res.rank || rIdx + 1}
                                    </span>
                                    <span className="font-bold text-[#0F172A] truncate">{res.name}</span>
                                    {res.category && (
                                      <span className="text-[11px] text-slate-400 truncate">({res.category})</span>
                                    )}
                                  </div>
                                  <span className="text-[11px] font-black text-blue-600 shrink-0 ml-2">
                                    Yi: {typeof res.scoreYi === 'number' ? res.scoreYi.toFixed(4) : res.scoreYi}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH USER BARU */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#CBD5E1]/40 relative my-8">
            <div className="p-6 bg-[#2563EB] text-white flex items-center justify-between">
              <h3 className="text-xl font-black">Tambah Akun Pengguna Baru</h3>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-white hover:bg-white/20 p-2 rounded-full cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="p-6 sm:p-8 space-y-5 text-sm">
              <div>
                <label className="font-extrabold text-[#0F172A] block mb-1.5">Nama Lengkap Pengguna</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-2xl bg-[#F1F5F9] border focus:outline-none font-bold"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div>
                <label className="font-extrabold text-[#0F172A] block mb-1.5">Alamat Email Pengguna</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-2xl bg-[#F1F5F9] border focus:outline-none font-bold"
                  placeholder="budi@gmail.com"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-extrabold text-[#0F172A] block mb-1.5">Role Pengguna</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-4 py-3 text-sm rounded-2xl bg-[#F1F5F9] border focus:outline-none font-bold cursor-pointer"
                  >
                    <option value="user">User (Pengguna Biasa)</option>
                    <option value="admin">Admin (Administrator)</option>
                  </select>
                </div>

                <div>
                  <label className="font-extrabold text-[#0F172A] block mb-1.5">Status Akun</label>
                  <select
                    value={newUserStatus}
                    onChange={(e) => setNewUserStatus(e.target.value as any)}
                    className="w-full px-4 py-3 text-sm rounded-2xl bg-[#F1F5F9] border focus:outline-none font-bold cursor-pointer"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-5 py-3 rounded-2xl border text-sm font-bold hover:bg-gray-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-extrabold rounded-2xl cursor-pointer shadow-xs"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU DESTINASI (FITUR MATA) */}
      {previewDest && (
        <DestinationDetailModal
          destination={previewDest}
          onClose={() => setPreviewDest(null)}
          onGoToRekomendasi={() => {
            setPreviewDest(null);
            onGoToSite();
          }}
        />
      )}
    </div>
  );
};
