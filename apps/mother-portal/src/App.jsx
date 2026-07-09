import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider, useLang } from '@/context/LanguageContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { useState, useCallback } from 'react';
import SplashScreen from '@/components/SplashScreen';
import B2CPaywall from '@/components/B2CPaywall';

// Page imports
import Home from '@/pages/Home';
import InstallBridge from '@/pages/InstallBridge';
import Onboarding from '@/pages/Onboarding';
import VaccinationSchedule from '@/pages/VaccinationSchedule';
import GrowthTracker from '@/pages/GrowthTracker';
import ANCVisitLog from '@/pages/ANCVisitLog';
import Learn from '@/pages/Learn';
import AIHealthAssistant from '@/pages/AIHealthAssistant';
import Settings from '@/pages/Settings';
import AddChild from '@/pages/AddChild';
import ChildProfile from '@/pages/ChildProfile';
import PatentDocument from '@/pages/PatentDocument';
import PitchDeck from '@/pages/PitchDeck';
import Login from '@/pages/Login';
import Care from '@/pages/Care';
import Profile from '@/pages/Profile';
import Emergency from '@/pages/Emergency';
import Community from '@/pages/Community';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user, checkAppState } = useAuth();
  const { lang } = useLang();
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

  // Redirect authenticated user with incomplete profile to onboarding
  if (user && !user.profile_complete && currentPath !== '/onboarding' && currentPath !== '/login') {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect B2C user with expired subscription to paywall
  if (user && user.role === 'user' && user.subscription_status === 'expired' && currentPath !== '/login' && currentPath !== '/onboarding') {
    return <B2CPaywall user={user} onPaid={checkAppState} lang={lang} />;
  }

  // Redirect authenticated user with complete profile away from login/onboarding
  if (user && user.profile_complete && (currentPath === '/login' || currentPath === '/onboarding')) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/vaccines" element={<VaccinationSchedule />} />
      <Route path="/growth" element={<GrowthTracker />} />
      <Route path="/anc" element={<ANCVisitLog />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/ai-health" element={<AIHealthAssistant />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/care" element={<Care />} />
      <Route path="/more" element={<Profile />} />
      <Route path="/emergency" element={<Emergency />} />
      <Route path="/community" element={<Community />} />
      <Route path="/add-child" element={<AddChild />} />
      <Route path="/child/:id" element={<ChildProfile />} />
      <Route path="/patent" element={<PatentDocument />} />
      <Route path="/pitch" element={<PitchDeck />} />
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
          <Routes>
            {/* ── Public route: install bridge (no auth required) ── */}
            <Route path="/install-bridge" element={<InstallBridge />} />
            {/* ── All other routes go through auth guard ─────────── */}
            <Route path="/*" element={<AuthenticatedApp />} />
          </Routes>
        </Router>
        <Toaster />
        </ProfileProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
