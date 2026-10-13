import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { WisataPage } from './components/WisataPage';
import { RekomendasiPage } from './components/RekomendasiPage';
import { AboutPage } from './components/AboutPage';
import { UserProfilePage } from './components/UserProfilePage';
import { AdminDashboardPage } from './components/AdminDashboardPage';
import { AdminLoginPage } from './components/AdminLoginPage';
import { DestinationDetailModal } from './components/DestinationDetailModal';
import { UserAuthModal } from './components/UserAuthModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Destination, UserAccount, RecommendationHistoryItem, UserPreferences } from './types';
import { INITIAL_DESTINATIONS } from './data/destinations';
import * as authService from './services/authService';
import * as favoritesService from './services/favoritesService';
import * as historyService from './services/historyService';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Semua Kategori');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Admin state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  // Track Recommendation calculation count
  const [totalRecommendationCount, setTotalRecommendationCount] = useState<number>(0);

  // User Auth & Favorites state
  const [isUserAuthModalOpen, setIsUserAuthModalOpen] = useState(false);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // History reload state for Rekomendasi Page
  const [selectedHistoryPreferences, setSelectedHistoryPreferences] = useState<UserPreferences | null>(null);

  // Destinations data state (initialized with 25+ local destinations)
  const [destinations, setDestinations] = useState<Destination[]>(INITIAL_DESTINATIONS);

  // Initialize: Load auth session, profile, favorites, and history from Supabase
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      try {
        // Check existing auth session
        const session = await authService.getCurrentSession();
        if (session?.user) {
          const profile = await authService.getProfile(session.user.id);
          if (profile) {
            // Load favorites
            const favs = await favoritesService.getUserFavorites(session.user.id);
            // Load history
            const hist = await historyService.getUserHistory(session.user.id);
            const fullUser: UserAccount = {
              ...profile,
              favorites: favs,
              history: hist,
            };
            setCurrentUser(fullUser);

            // Check if admin
            if (profile.role === 'admin') {
              setIsAdminLoggedIn(true);
            }
          }
        }
        // Load profiles for management
        const allUsers = await authService.getAllProfiles();
        setUsers(allUsers);
      } catch (error) {
        console.error('Error initializing app auth session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();

    // Subscribe to auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsAdminLoggedIn(false);
      } else if (event === 'SIGNED_IN' && session?.user) {
        try {
          const profile = await authService.getProfile(session.user.id);
          if (profile) {
            const favs = await favoritesService.getUserFavorites(session.user.id);
            const hist = await historyService.getUserHistory(session.user.id);
            setCurrentUser({
              ...profile,
              favorites: favs && favs.length > 0 ? favs : profile.favorites,
              history: hist && hist.length > 0 ? hist : profile.history,
            });
            if (profile.role === 'admin') {
              setIsAdminLoggedIn(true);
            }
          }
        } catch (e) {
          console.error('Error handling SIGNED_IN event:', e);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Persist Admin Session
  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    navigate('/admin');
  };

  const handleAdminLogout = async () => {
    setIsAdminLoggedIn(false);
    try {
      await authService.signOut();
    } catch (e) {
      console.error('Error signing out admin:', e);
    }
    setCurrentUser(null);
    navigate('/');
  };

  // Handlers for Users
  const handleLoginUserSuccess = async (user: UserAccount) => {
    try {
      const favs = await favoritesService.getUserFavorites(user.id);
      const hist = await historyService.getUserHistory(user.id);
      setCurrentUser({
        ...user,
        favorites: favs && favs.length > 0 ? favs : user.favorites,
        history: hist && hist.length > 0 ? hist : user.history,
      });
    } catch {
      setCurrentUser(user);
    }
    setIsUserAuthModalOpen(false);
  };

  const handleRegisterUser = (_newUser: UserAccount) => {
    // Registration is handled by Supabase Auth + DB trigger
  };

  const handleLogoutUser = async () => {
    try {
      await authService.signOut();
    } catch (e) {
      console.error('Error signing out:', e);
    }
    setCurrentUser(null);
  };

  const handleToggleFavorite = async (destId: string) => {
    if (!currentUser) {
      setIsUserAuthModalOpen(true);
      return;
    }

    const isFav = currentUser.favorites.includes(destId);
    const optimisticFavs = isFav
      ? currentUser.favorites.filter((id) => id !== destId)
      : [...currentUser.favorites, destId];

    // Optimistic UI response
    setCurrentUser((prev) => (prev ? { ...prev, favorites: optimisticFavs } : null));

    try {
      const updatedFavs = await favoritesService.toggleFavorite(
        currentUser.id,
        destId,
        currentUser.favorites
      );
      setCurrentUser((prev) => (prev ? { ...prev, favorites: updatedFavs } : null));
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert if error
      setCurrentUser((prev) => (prev ? { ...prev, favorites: currentUser.favorites } : null));
    }
  };

  const handleSaveRecommendationHistory = async (historyItem: RecommendationHistoryItem) => {
    setTotalRecommendationCount((prev) => prev + 1);

    if (!currentUser) return;

    try {
      const saved = await historyService.saveHistory(currentUser.id, historyItem);
      setCurrentUser((prev) => {
        if (!prev) return null;
        const updatedHistory = [saved, ...prev.history.filter((h) => h.id !== saved.id)];
        return { ...prev, history: updatedHistory };
      });
    } catch (error) {
      console.error('Error saving recommendation history:', error);
    }
  };

  const handleDeleteHistory = async (historyId: string) => {
    if (!currentUser) return;

    try {
      await historyService.deleteHistory(currentUser.id, historyId);
      setCurrentUser((prev) => {
        if (!prev) return null;
        const updatedHistory = prev.history.filter((h) => h.id !== historyId);
        return { ...prev, history: updatedHistory };
      });
    } catch (error) {
      console.error('Error deleting recommendation history:', error);
    }
  };

  const handleLoadHistoryResult = (historyItem: RecommendationHistoryItem) => {
    setSelectedHistoryPreferences(historyItem.preferences);
    const cat = historyItem.selectedCategory || historyItem.preferences?.kategori;
    if (cat) {
      setSelectedCategoryFilter(cat);
    }
    handleNavigate('/rekomendasi');
  };

  // Save changes for Destinations (called from AdminDashboard)
  const handleUpdateDestinations = (newDestinations: Destination[]) => {
    setDestinations(newDestinations);
  };

  const handleResetDestinations = () => {
    setDestinations(INITIAL_DESTINATIONS);
  };

  const handleExploreCategory = (category?: string) => {
    if (category) {
      setSelectedCategoryFilter(category);
    } else {
      setSelectedCategoryFilter('Semua Kategori');
    }
    navigate('/wisata');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine current tab from location for Navbar active state
  const getCurrentTab = (): 'home' | 'wisata' | 'rekomendasi' | 'tentang' | 'profil' | 'admin' | 'admin-login' => {
    switch (location.pathname) {
      case '/wisata': return 'wisata';
      case '/rekomendasi': return 'rekomendasi';
      case '/profil': return 'profil';
      case '/admin': return 'admin';
      case '/admin/login': return 'admin-login';
      case '/tentang': return 'tentang';
      default: return 'home';
    }
  };

  const isHideNavbarFooter = location.pathname === '/admin/login' || location.pathname === '/admin';

  // Show loading screen while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-[#64748B] font-medium">Memuat data wisata...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Top Navigation (Hide when inside full Admin panel/login for clean UI) */}
      {!isHideNavbarFooter && (
        <Navbar
          currentTab={getCurrentTab()}
          onNavigate={handleNavigate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAdmin={() => {
            if (isAdminLoggedIn) navigate('/admin');
            else navigate('/admin/login');
          }}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogoutAdmin={handleAdminLogout}
          currentUser={currentUser}
          onOpenUserAuth={() => setIsUserAuthModalOpen(true)}
          onLogoutUser={handleLogoutUser}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onStartRekomendasi={() => handleNavigate('/rekomendasi')}
                onExploreWisata={handleExploreCategory}
                onSelectDestination={(dest) => setSelectedDestination(dest)}
                featuredDestinations={destinations.filter((d) => d.active !== false)}
                currentUser={currentUser}
                onToggleFavorite={handleToggleFavorite}
              />
            }
          />
          <Route
            path="/wisata"
            element={
              <WisataPage
                destinations={destinations.filter((d) => d.active !== false)}
                onSelectDestination={(dest) => setSelectedDestination(dest)}
                initialCategory={selectedCategoryFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onGoToRekomendasi={() => handleNavigate('/rekomendasi')}
                currentUser={currentUser}
                onToggleFavorite={handleToggleFavorite}
              />
            }
          />
          <Route
            path="/rekomendasi"
            element={
              <RekomendasiPage
                destinations={destinations.filter((d) => d.active !== false)}
                onSelectDestination={(dest) => setSelectedDestination(dest)}
                onGoToWisata={() => handleNavigate('/wisata')}
                currentUser={currentUser}
                onToggleFavorite={handleToggleFavorite}
                onSaveHistory={handleSaveRecommendationHistory}
                initialPreferences={selectedHistoryPreferences}
                initialCategory={selectedCategoryFilter}
              />
            }
          />
          <Route
            path="/profil"
            element={
              <UserProfilePage
                currentUser={currentUser}
                destinations={destinations}
                onSelectDestination={(dest) => setSelectedDestination(dest)}
                onToggleFavorite={handleToggleFavorite}
                onLoadHistory={handleLoadHistoryResult}
                onDeleteHistory={handleDeleteHistory}
                onGoToRekomendasi={() => handleNavigate('/rekomendasi')}
                onGoToWisata={() => handleNavigate('/wisata')}
                onLogout={handleLogoutUser}
                onOpenLogin={() => setIsUserAuthModalOpen(true)}
              />
            }
          />
          <Route
            path="/admin/login"
            element={
              <AdminLoginPage
                onLoginSuccess={handleAdminLoginSuccess}
                onGoToHome={() => handleNavigate('/')}
              />
            }
          />
          <Route
            path="/admin"
            element={
              isAdminLoggedIn ? (
                <AdminDashboardPage
                  isAdminLoggedIn={isAdminLoggedIn}
                  onLogoutAdmin={handleAdminLogout}
                  onGoToSite={() => handleNavigate('/')}
                  destinations={destinations}
                  onUpdateDestinations={handleUpdateDestinations}
                  onResetDestinations={handleResetDestinations}
                  users={users}
                  onUpdateUsers={setUsers}
                  totalRecommendationCount={totalRecommendationCount}
                />
              ) : (
                <AdminLoginPage
                  onLoginSuccess={handleAdminLoginSuccess}
                  onGoToHome={() => handleNavigate('/')}
                />
              )
            }
          />
          <Route path="/tentang" element={<AboutPage />} />
        </Routes>
      </main>

      {/* Destination Detail Modal */}
      <DestinationDetailModal
        destination={selectedDestination}
        onClose={() => setSelectedDestination(null)}
        onGoToRekomendasi={() => {
          setSelectedDestination(null);
          handleNavigate('/rekomendasi');
        }}
        currentUser={currentUser}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* User Login & Register Modal */}
      <UserAuthModal
        isOpen={isUserAuthModalOpen}
        onClose={() => setIsUserAuthModalOpen(false)}
        onLoginSuccess={handleLoginUserSuccess}
        users={users}
        onRegisterUser={handleRegisterUser}
      />

      {/* Footer */}
      {!isHideNavbarFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
