import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { Toaster } from "@/components/ui/toaster";
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/context/LanguageContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { StationProvider, useStation } from '@/context/StationContext';
import SplashScreen from '@/components/SplashScreen';
import LockScreen from '@/components/LockScreen';

// Page imports
import Login from '@/pages/Login';
import NurseDashboard from '@/pages/NurseDashboard';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user, isLocked: isAuthLocked } = useAuth();
  let stationCtx = null;
  try {
    stationCtx = useStation();
  } catch {}
  const location = useLocation();
  const currentPath = location.pathname;

  const isStationLocked = stationCtx?.isLocked || false;
  const isLocked = isAuthLocked || isStationLocked;

  if (isLocked && currentPath !== '/login') {
    return <LockScreen />;
  }

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-5">
          <div
            className="w-16 h-16 rounded-[22px] flex items-center justify-center shadow-[0_8px_32px_rgba(0,107,95,0.28)]"
            style={{ background: 'linear-gradient(145deg, #006B5F 0%, #0A2E2B 100%)' }}
          >
            <span className="text-white text-[26px] font-bold" style={{ fontFamily: "Merriweather, Georgia, serif" }}>T</span>
          </div>
          <div className="w-6 h-6 border-2 border-[#006B5F] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            TotoAfya Clinical Workstation
          </p>
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

  // Enforce staff role boundary for non-local mode
  const isLocal = import.meta.env.VITE_DATABASE_PROVIDER === 'local' || !import.meta.env.VITE_DATABASE_PROVIDER;
  const isStaff = user && ['nurse', 'doctor', 'facility_admin', 'admin', 'chv', 'super_admin'].includes(user.role);
  if (!isLocal && user && !isStaff) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-3xl p-8 border border-red-100 shadow-xl">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            403
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Clinical Portal Access Denied</h2>
          <p className="text-sm text-slate-600 mb-6">
            Your account role ({user.role || 'caregiver'}) does not have clinical staff access privileges.
          </p>
          <button
            onClick={() => { useAuth().logout(); }}
            className="px-6 py-3 bg-[#006B5F] text-white font-bold text-sm rounded-xl hover:bg-[#0A2E2B] transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<NurseDashboard initialTab="summary" />} />
      <Route path="/anc" element={<NurseDashboard initialTab="anc" />} />
      <Route path="/immunization" element={<NurseDashboard initialTab="immunization" />} />
      <Route path="/growth" element={<NurseDashboard initialTab="growth" />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashDone = useCallback(() => setSplashDone(true), []);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <LanguageProvider>
          <ProfileProvider>
            <StationProvider>
              <Router>
                {!splashDone && <SplashScreen onDone={handleSplashDone} />}
                <AuthenticatedApp />
              </Router>
              <Toaster />
            </StationProvider>
          </ProfileProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
