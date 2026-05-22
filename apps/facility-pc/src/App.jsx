import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
  const currentPath = window.location.pathname;

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F7F5F0]">
        <div className="flex flex-col items-center gap-5">
          <div
            className="w-16 h-16 rounded-[22px] flex items-center justify-center shadow-[0_8px_32px_rgba(27,107,90,0.28)]"
            style={{ background: 'linear-gradient(145deg, #1B6B5A 0%, #2E8A74 100%)' }}
          >
            <span className="text-white text-[26px] font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>T</span>
          </div>
          <div className="w-6 h-6 border-2 border-[#1B6B5A] border-t-transparent rounded-full animate-spin" />
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

  // Redirect authenticated user with admin role away from login
  if (user && user.role === 'admin' && currentPath === '/login') {
    return <Navigate to="/" replace />;
  }

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
