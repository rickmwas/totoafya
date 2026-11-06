import React, { useState } from 'react';
import db from '@/api/totoafyaClient';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Zap, ChevronUp, ChevronDown, Baby, Stethoscope, Building2, Crown, LogIn, RotateCcw } from 'lucide-react';

export default function DevRoleSwitcher() {
  const isLocal = import.meta.env.VITE_DATABASE_PROVIDER === 'local' || !import.meta.env.VITE_DATABASE_PROVIDER;
  if (!isLocal) return null;

  const { user, checkAppState } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const activeRole = user?.role || 'user';

  const handleSwitch = async (roleKey, targetUrl) => {
    try {
      if (db.auth && db.auth.quickLogin) {
        db.auth.quickLogin(roleKey);
      }
      if (checkAppState) await checkAppState();
      setOpen(false);

      if (targetUrl) {
        if (targetUrl.startsWith('http')) {
          window.location.href = targetUrl;
        } else {
          navigate(targetUrl);
        }
      } else {
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset local mock database to fresh defaults?')) {
      const keys = ['db_Mother', 'db_Child', 'db_Nurse', 'db_Facility', 'db_ANCVisit', 'db_GrowthRecord', 'db_Immunization', 'db_AIAlert', 'custom_mock_user', 'active_mock_role', 'is_logged_in', 'is_logged_out', 'toto_splash_dismissed'];
      keys.forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
      window.location.href = '/login';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[99999] font-sans select-none">
      {open && (
        <div className="mb-2 bg-slate-900/95 backdrop-blur text-white border border-slate-700/80 rounded-2xl p-3 shadow-2xl w-64 flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-700/60 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
            <span className="flex items-center gap-1">
              <Zap size={12} className="fill-emerald-400" /> Local Dev Auth Bypass
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Active: {activeRole}</span>
          </div>

          <p className="text-[10px] text-slate-400 px-1 py-0.5">Switch role & test portal UIs instantly:</p>

          <button
            onClick={() => handleSwitch('user', '/')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-all ${
              activeRole === 'user' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-200'
            }`}
          >
            <Baby size={14} className="text-amber-300 shrink-0" />
            <span className="flex-1">Mother / Caregiver</span>
            <span className="text-[10px] opacity-70">:5000</span>
          </button>

          <button
            onClick={() => handleSwitch('nurse', 'http://localhost:5001')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-all ${
              activeRole === 'nurse' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-200'
            }`}
          >
            <Stethoscope size={14} className="text-teal-300 shrink-0" />
            <span className="flex-1">Clinical Nurse</span>
            <span className="text-[10px] opacity-70">:5001</span>
          </button>

          <button
            onClick={() => handleSwitch('facility_admin', 'http://localhost:5002')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-all ${
              activeRole === 'facility_admin' || activeRole === 'admin' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-200'
            }`}
          >
            <Building2 size={14} className="text-sky-300 shrink-0" />
            <span className="flex-1">Facility Admin</span>
            <span className="text-[10px] opacity-70">:5002</span>
          </button>

          <button
            onClick={() => handleSwitch('super_admin', 'http://localhost:5003')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-all ${
              activeRole === 'super_admin' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 text-slate-200'
            }`}
          >
            <Crown size={14} className="text-yellow-300 shrink-0" />
            <span className="flex-1">Super Admin</span>
            <span className="text-[10px] opacity-70">:5003</span>
          </button>

          <div className="pt-1.5 mt-1 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
            <button
              onClick={() => { setOpen(false); navigate('/login'); }}
              className="flex items-center gap-1 text-slate-300 hover:text-white px-1.5 py-1 rounded hover:bg-slate-800 transition-colors"
            >
              <LogIn size={12} /> Go to Login
            </button>
            <button
              onClick={handleResetData}
              title="Reset mock database to fresh defaults"
              className="flex items-center gap-1 text-red-400 hover:text-red-300 px-1.5 py-1 rounded hover:bg-red-950/40 transition-colors"
            >
              <RotateCcw size={12} /> Reset Data
            </button>
          </div>
        </div>
      )}

      {/* Trigger pill */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-900 active:scale-95 text-white text-xs font-bold rounded-full shadow-lg border border-slate-700/80 transition-all backdrop-blur"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-slate-300">Local Auth:</span>
        <span className="text-emerald-400 font-extrabold capitalize">{activeRole}</span>
        {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
    </div>
  );
}
