import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/context/LanguageContext';
import { ProfileProvider } from '@/context/ProfileContext';

// Page imports
import Home from '@/pages/Home';
import Onboarding from '@/pages/Onboarding';
import VaccinationSchedule from '@/pages/VaccinationSchedule';
import GrowthTracker from '@/pages/GrowthTracker';
import ANCVisitLog from '@/pages/ANCVisitLog';
import Learn from '@/pages/Learn';
import AIHealthAssistant from '@/pages/AIHealthAssistant';
import Settings from '@/pages/Settings';
import AddChild from '@/pages/AddChild';
import ChildProfile from '@/pages/ChildProfile';
import FacilityDashboard from '@/pages/FacilityDashboard';
import NursePortal from '@/pages/NursePortal';
import PatentDocument from '@/pages/PatentDocument';
import PitchDeck from '@/pages/PitchDeck';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F5F5F7]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-[16px] bg-[#0047FF] flex items-center justify-center shadow-[0_8px_30px_rgba(0,71,255,0.25)]">
            <span className="text-white text-[18px] font-extrabold">T</span>
          </div>
          <div className="w-8 h-8 border-2 border-[#0047FF] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      {/* Nurses get their own portal */}
      <Route path="/nurse/*" element={<NursePortal />} />
      <Route path="/" element={<Home />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/vaccines" element={<VaccinationSchedule />} />
      <Route path="/growth" element={<GrowthTracker />} />
      <Route path="/anc" element={<ANCVisitLog />} />
      <Route path="/learn" element={<Learn />} />
      <Route path="/ai-health" element={<AIHealthAssistant />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/add-child" element={<AddChild />} />
      <Route path="/child/:id" element={<ChildProfile />} />
      <Route path="/facility" element={<FacilityDashboard />} />
      <Route path="/patent" element={<PatentDocument />} />
      <Route path="/pitch" element={<PitchDeck />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <LanguageProvider>
        <ProfileProvider>
        <Router>
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