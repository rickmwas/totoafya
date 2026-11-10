import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from './lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider, useLang } from '@/context/LanguageContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { useState, useCallback, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';
import B2CPaywall from '@/components/B2CPaywall';
import DevRoleSwitcher from '@/components/DevRoleSwitcher';
import db from '@/api/totoafyaClient';

// PWA Shell & Integrated Routes (Wave 2 TD-2.2, TD-2.3, TD-2.4)
import { ResponsivePwaShell } from './shell';
import { OnboardingFlow } from './routes/onboarding';
import { DashboardView } from './routes/dashboard';

// Wave 3 TD-3.1 Maternal Records & Emergency SOS
import {
  SCR09WeeklyFetalGuide,
  SCR10KickCounter,
  SCR11ANCVisitLog,
  SCR12BirthPlan,
  SCR21EmergencyTakeover,
} from './routes/maternal';

// Wave 3 TD-3.2 Child Immunization, WHO Growth & Milestones
import {
  SCR13VaccineSchedule,
  SCR15GrowthTracker,
  SCR17MilestonesChecklist,
} from './routes/child';

// Wave 3 TD-3.3 AI Assistant, Sensitive Exceptions & 6-State Lifecycle
import ArticleDetail from './routes/learning/ArticleDetail';
import SCR24SyncVault from './routes/settings/SCR24SyncVault';
import SCR28Bereavement from './routes/sensitive/SCR28Bereavement';


// Page imports (Preserved for full platform compatibility)
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
import Login from '@/pages/Login';
import Care from '@/pages/Care';
import Profile from '@/pages/Profile';
import Emergency from '@/pages/Emergency';
import Community from '@/pages/Community';
import PregnancyOverview from '@/pages/PregnancyOverview';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, user, checkAppState } = useAuth();
  const { lang } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  useEffect(() => {
    if (db.features && db.features.load) {
      db.features.load().catch(console.error);
    }
  }, []);

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
      if (currentPath !== '/login' && currentPath !== '/welcome' && currentPath !== '/onboarding') {
        return <Navigate to="/login" replace />;
      }
    }
  }

  // Only redirect mothers (role: 'user') with explicitly incomplete profiles to onboarding.
  // Use === false (not just falsy) to avoid redirect when profile_complete is undefined (mock/no-supabase mode).
  if (user && user.role === 'user' && user.profile_complete === false && currentPath !== '/onboarding' && currentPath !== '/login' && currentPath !== '/welcome') {
    return <Navigate to="/onboarding" replace />;
  }

  // Redirect B2C user with expired subscription to paywall
  if (user && user.role === 'user' && user.subscription_status === 'expired' && currentPath !== '/login' && currentPath !== '/onboarding' && currentPath !== '/welcome') {
    return <B2CPaywall user={user} onPaid={checkAppState} lang={lang} />;
  }

  // Redirect authenticated user with complete profile away from login/onboarding
  if (user && user.profile_complete && (currentPath === '/onboarding' || currentPath === '/welcome')) {
    return <Navigate to="/" replace />;
  }

  return (
    <ResponsivePwaShell lang={lang}>
      <Routes>
        {/* ── Core Wave 2 Routes (Onboarding & Dashboard Integration) ── */}
        <Route
          path="/welcome"
          element={
            <OnboardingFlow
              initialStep={1}
              initialLang={lang}
              onComplete={() => navigate('/')}
              onNavigateLogin={() => navigate('/login')}
            />
          }
        />
        <Route
          path="/login"
          element={
            <OnboardingFlow
              initialStep={2}
              initialLang={lang}
              onComplete={() => navigate('/')}
              onNavigateLogin={() => navigate('/login')}
            />
          }
        />
        <Route
          path="/onboarding"
          element={
            <OnboardingFlow
              initialStep={1}
              initialLang={lang}
              onComplete={() => navigate('/')}
              onNavigateLogin={() => navigate('/login')}
            />
          }
        />
        <Route
          path="/"
          element={
            <DashboardView
              initialLang={lang}
              motherName={user?.name || user?.full_name || 'Faith'}
              onNavigate={(path) => navigate(path)}
              onEmergencyCall={() => navigate('/emergency')}
            />
          }
        />
        <Route
          path="/dashboard"
          element={
            <DashboardView
              initialLang={lang}
              motherName={user?.name || user?.full_name || 'Faith'}
              onNavigate={(path) => navigate(path)}
              onEmergencyCall={() => navigate('/emergency')}
            />
          }
        />

        {/* ── Wave 3 TD-3.1 Maternal Records & Emergency SOS ───────── */}
        <Route
          path="/pregnancy/detail"
          element={<SCR09WeeklyFetalGuide lang={lang} onNavigate={(path) => navigate(path)} />}
        />
        <Route
          path="/pregnancy/kicks"
          element={
            <SCR10KickCounter
              lang={lang}
              onNavigate={(path) => navigate(path)}
              onEmergency={() => navigate('/emergency')}
            />
          }
        />
        <Route
          path="/pregnancy/anc"
          element={
            <SCR11ANCVisitLog
              lang={lang}
              onNavigate={(path) => navigate(path)}
              motherName={user?.name || user?.full_name || 'Faith'}
            />
          }
        />
        <Route
          path="/anc"
          element={
            <SCR11ANCVisitLog
              lang={lang}
              onNavigate={(path) => navigate(path)}
              motherName={user?.name || user?.full_name || 'Faith'}
            />
          }
        />
        <Route
          path="/pregnancy/birth-plan"
          element={<SCR12BirthPlan lang={lang} onNavigate={(path) => navigate(path)} />}
        />
        <Route
          path="/emergency"
          element={<SCR21EmergencyTakeover lang={lang} onNavigate={(path) => navigate(path)} />}
        />

        {/* ── Wave 3 TD-3.2 Child Immunization, WHO Growth & Milestones ─ */}
        <Route
          path="/records/vaccines"
          element={<SCR13VaccineSchedule lang={lang} onNavigate={(path) => navigate(path)} />}
        />
        <Route
          path="/vaccines"
          element={<SCR13VaccineSchedule lang={lang} onNavigate={(path) => navigate(path)} />}
        />
        <Route
          path="/records/growth"
          element={<SCR15GrowthTracker lang={lang} onNavigate={(path) => navigate(path)} />}
        />
        <Route
          path="/growth"
          element={<SCR15GrowthTracker lang={lang} onNavigate={(path) => navigate(path)} />}
        />
        <Route
          path="/records/milestones"
          element={<SCR17MilestonesChecklist lang={lang} onNavigate={(path) => navigate(path)} />}
        />

        {/* ── Wave 3 TD-3.3 AI Assistant, Sensitive Exceptions & Lifecycle ─ */}
        <Route path="/guide/article" element={<ArticleDetail />} />
        <Route path="/settings/sync" element={<SCR24SyncVault />} />
        <Route path="/sensitive/bereavement" element={<SCR28Bereavement />} />

        {/* ── Preserved Platform Compatibility Routes ───────────────── */}
        <Route path="/pregnancy" element={<PregnancyOverview />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/ai-health" element={<AIHealthAssistant />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/care" element={<Care />} />
        <Route path="/more" element={<Profile />} />
        <Route path="/community" element={<Community />} />
        <Route path="/add-child" element={<AddChild />} />
        <Route path="/child/:id" element={<ChildProfile />} />
        <Route path="/patent" element={<PatentDocument />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </ResponsivePwaShell>
  );
};

function App() {
  const [splashDone, setSplashDone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.pathname === '/login' ||
      sessionStorage.getItem('toto_splash_dismissed') === 'true'
    );
  });

  const handleSplashDone = useCallback(() => {
    sessionStorage.setItem('toto_splash_dismissed', 'true');
    setSplashDone(true);
  }, []);

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
          <DevRoleSwitcher />
        </Router>
        <Toaster />
        </ProfileProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
