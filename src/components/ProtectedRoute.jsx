import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const location = useLocation();

  if (isLoadingAuth) {
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

  // Local development mode: allow full unhindered UI navigation and testing without 403 blocks
  const isLocalProvider = import.meta.env.VITE_DATABASE_PROVIDER === 'local' || !import.meta.env.VITE_DATABASE_PROVIDER;
  if (isLocalProvider) {
    return children;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = user.role;
    const isAllowed = allowedRoles.includes(userRole) || 
      (allowedRoles.includes('facility_admin') && userRole === 'admin') ||
      userRole === 'super_admin';

    if (!isAllowed) {
      return (
        <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white rounded-3xl p-8 border border-red-100 shadow-xl">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
              403
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-sm text-gray-600 mb-6">
              Your account role ({userRole || 'caregiver'}) does not have permission to access this portal interface.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-[#1B6B5A] text-white font-bold text-sm rounded-xl hover:bg-[#155447] transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
