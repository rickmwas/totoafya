import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/context/LanguageContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { useState, useCallback } from 'react';
import SplashScreen from '@/components/SplashScreen';
import Login from '@/pages/Login';

// Page imports
import FacilityDashboard from '@/pages/FacilityDashboard';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#FAFBFB]">
        <div className="flex flex-col items-center gap-5">
          <div
            className="w-16 h-16 rounded-[22px] flex items-center justify-center shadow-[0_8px_32px_rgba(27,107,90,0.28)]"
            style={{ background: 'linear-gradient(145deg, #2E5B47 0%, #2E8A74 100%)' }}
          >
            <span className="text-white text-[26px] font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>T</span>
          </div>
          <div className="w-6 h-6 border-2 border-[#2E5B47] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') {
      if (currentPath !== '/login') {
        navigateToLogin();
        return null;
      }
    }
  }

  if (user && user.status === 'pending_activation') {
    return <Login isActivationFlow={true} />;
  }

  // Enforce facility admin role boundary
  const isLocal = import.meta.env.VITE_DATABASE_PROVIDER === 'local' || !import.meta.env.VITE_DATABASE_PROVIDER;
  const isFacilityAdmin = user && ['facility_admin', 'admin', 'county_admin', 'moh_admin', 'super_admin'].includes(user.role);
  if (!isLocal && user && !isFacilityAdmin) {
    return (
      <div className="min-h-screen bg-[#FAFBFB] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-3xl p-8 border border-red-100 shadow-xl">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            403
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Facility Desktop Access Denied</h2>
          <p className="text-sm text-gray-600 mb-6">
            Your account role ({user.role || 'caregiver'}) does not have facility administration privileges.
          </p>
          <button
            onClick={() => { useAuth().logout(); }}
            className="px-6 py-3 bg-[#2E5B47] text-white font-bold text-sm rounded-xl hover:bg-[#234737] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Redirect authenticated user with admin role away from login
  // Allow visiting /login for testing

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<FacilityDashboard />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashDone = useCallback(() => setSplashDone(true), []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <LanguageProvider>
        <ProfileProvider>
        <Router>
          {!splashDone && <SplashScreen onDone={handleSplashDone} />}
          <AuthenticatedApp />
        </Router>
        <Toaster />
        </ProfileProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
