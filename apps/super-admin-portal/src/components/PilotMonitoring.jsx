import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, ToggleLeft, ToggleRight, ScrollText, AlertTriangle, 
  Settings, RefreshCw, CheckCircle, Database, Smartphone, Play
} from 'lucide-react';
import db, { supabaseDb } from '@/api/totoafyaClient';

export default function PilotMonitoring() {
  const [flags, setFlags] = useState([]);
  const [errors, setErrors] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stats
  const [activeFlagsCount, setActiveFlagsCount] = useState(0);

  useEffect(() => {
    loadTelemetry();
  }, []);

  const loadTelemetry = async () => {
    setRefreshing(true);
    try {
      // 1. Fetch feature flags
      const flagsRes = await db.entities.list('feature_flags', '-created_at', 100);
      setFlags(flagsRes || []);
      setActiveFlagsCount(flagsRes ? flagsRes.filter(f => f.is_enabled).length : 0);

      // 2. Fetch system errors
      const errorsRes = await db.entities.list('system_errors', '-created_at', 50);
      setErrors(errorsRes || []);

      // 3. Fetch system logs
      const logsRes = await db.entities.list('system_logs', '-created_at', 50);
      setLogs(logsRes || []);
    } catch (err) {
      console.error("Failed to load telemetry:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleFlag = async (id, currentVal) => {
    try {
      await db.entities.update('feature_flags', id, {
        is_enabled: !currentVal,
        updated_at: new Date().toISOString()
      });
      // Reload flags
      const flagsRes = await db.entities.list('feature_flags', '-created_at', 100);
      setFlags(flagsRes || []);
      setActiveFlagsCount(flagsRes ? flagsRes.filter(f => f.is_enabled).length : 0);
    } catch (err) {
      console.error("Failed to toggle feature flag:", err);
    }
  };

  const seedDemoFlags = async () => {
    try {
      const demoFlags = [
        { flag_key: 'ai_chat', is_enabled: true, description: 'Bilingual AI chatbot diagnostic disclaimers and danger sign checks' },
        { flag_key: 'learning_hub', is_enabled: true, description: 'English/Swahili maternal safety articles and growth resources' },
        { flag_key: 'community', is_enabled: false, description: 'Peer support group chat channels for mothers' },
        { flag_key: 'telemedicine', is_enabled: false, description: 'Direct nurse audio/video checkup bookings' }
      ];

      for (const flag of demoFlags) {
        // Simple search and insert bypass
        const existing = flags.find(f => f.flag_key === flag.flag_key);
        if (!existing) {
          await db.entities.create('feature_flags', flag);
        }
      }
      await loadTelemetry();
    } catch (err) {
      console.error("Failed to seed demo flags:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-black text-[#0A0A0A] tracking-[-0.03em]">Pilot Telemetry & Control</h1>
          <p className="text-[14px] text-[#A0A0A0] mt-1">Live monitoring, crash audits, and remote feature toggles.</p>
        </div>
        <button 
          onClick={loadTelemetry}
          disabled={refreshing}
          className="flex items-center gap-2 h-10 px-4 bg-white border border-[#E5E5E5] rounded-[12px] text-[12px] font-bold text-[#0A0A0A] hover:bg-[#FAFAFA] active:scale-95 transition-all shadow-sm"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-white p-6 rounded-[22px] border border-[#E5E5E5] shadow-premium flex items-start justify-between">
          <div>
            <p className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Feature Flags Active</p>
            <p className="text-[38px] font-extrabold text-[#0A0A0A] leading-none mt-2">{activeFlagsCount} / {flags.length}</p>
            <p className="text-[11px] text-[#A0A0A0] font-medium mt-2">Remote rollout gates</p>
          </div>
          <div className="w-10 h-10 rounded-[12px] bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Settings size={18} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[22px] border border-[#E5E5E5] shadow-premium flex items-start justify-between">
          <div>
            <p className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Crash & Errors Logged</p>
            <p className="text-[38px] font-extrabold text-[#E51010] leading-none mt-2">{errors.length}</p>
            <p className="text-[11px] text-[#A0A0A0] font-medium mt-2">Exceptions caught by app boundaries</p>
          </div>
          <div className="w-10 h-10 rounded-[12px] bg-rose-50 text-[#E51010] flex items-center justify-center">
            <AlertTriangle size={18} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[22px] border border-[#E5E5E5] shadow-premium flex items-start justify-between">
          <div>
            <p className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Sync Events Tracked</p>
            <p className="text-[38px] font-extrabold text-emerald-600 leading-none mt-2">{logs.filter(l => l.log_type === 'sync').length}</p>
            <p className="text-[11px] text-[#A0A0A0] font-medium mt-2">Offline database merges</p>
          </div>
          <div className="w-10 h-10 rounded-[12px] bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Database size={18} />
          </div>
        </div>

      </div>

      {/* Feature Flags Section */}
      <div className="bg-white border border-[#E5E5E5] rounded-[24px] p-6 shadow-premium">
        <div className="flex items-center justify-between mb-5 border-b border-[#F5F5F5] pb-4">
          <div>
            <h3 className="text-[16px] font-bold text-[#0A0A0A]">Remote Feature Flags</h3>
            <p className="text-[12px] text-[#A0A0A0] mt-0.5">Toggle app segments instantly without re-deploying source code.</p>
          </div>
          {flags.length === 0 && (
            <button 
              onClick={seedDemoFlags}
              className="flex items-center gap-1.5 h-8 px-3.5 bg-indigo-600 text-white rounded-[10px] text-[11px] font-bold hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <Play size={11} fill="white" />
              <span>Seed Pilot Flags</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flags.map(flag => (
            <div key={flag.id} className="p-4 rounded-[16px] bg-[#FAFAFA] border border-[#E5E5E5]/50 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-[#0A0A0A] font-mono bg-white px-2 py-0.5 rounded border border-[#E5E5E5]">{flag.flag_key}</span>
                  {flag.is_enabled ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Active" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" title="Disabled" />
                  )}
                </div>
                <p className="text-[11px] text-[#666666] mt-2 leading-relaxed">{flag.description || 'No description provided.'}</p>
                <p className="text-[9px] text-[#A0A0A0] mt-1.5 uppercase font-bold tracking-wider">Last updated: {new Date(flag.updated_at).toLocaleTimeString()}</p>
              </div>
              <button 
                onClick={() => toggleFlag(flag.id, flag.is_enabled)}
                className={`flex-shrink-0 transition-colors ${flag.is_enabled ? "text-indigo-600" : "text-[#A0A0A0]"}`}
              >
                {flag.is_enabled ? <ToggleRight size={38} /> : <ToggleLeft size={38} />}
              </button>
            </div>
          ))}
          {flags.length === 0 && (
            <div className="col-span-2 py-8 text-center bg-[#FAFAFA] rounded-[16px] border border-dashed border-[#E5E5E5]">
              <p className="text-[13px] text-[#A0A0A0] font-medium">No remote flags seeded yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Exception Audits and Sync logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Exception bounds */}
        <div className="bg-white border border-[#E5E5E5] rounded-[24px] p-6 shadow-premium flex flex-col max-h-[480px]">
          <div className="flex items-center gap-2 mb-4 border-b border-[#F5F5F5] pb-3">
            <ShieldAlert size={18} className="text-[#E51010]" />
            <h3 className="text-[15px] font-bold text-[#0A0A0A]">Crash & Error Registry</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {errors.map(err => (
              <div key={err.id} className="p-3.5 rounded-[14px] bg-rose-50/50 border border-rose-100 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#E51010] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded font-mono uppercase tracking-wider">{err.error_code || 'ERROR'}</span>
                  <span className="text-[9px] text-[#A0A0A0] font-semibold">{new Date(err.created_at).toLocaleTimeString()}</span>
                </div>
                <p className="text-[12px] font-bold text-[#0A0A0A] leading-tight">{err.message}</p>
                {err.device_info && (
                  <p className="text-[10px] text-[#666666] font-mono bg-white p-1.5 rounded border border-[#E5E5E5]/40 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(err.device_info)}
                  </p>
                )}
              </div>
            ))}
            {errors.length === 0 && (
              <div className="py-12 text-center text-[12px] text-[#A0A0A0]">No application exceptions logged. All systems stable.</div>
            )}
          </div>
        </div>

        {/* Sync telemetry */}
        <div className="bg-white border border-[#E5E5E5] rounded-[24px] p-6 shadow-premium flex flex-col max-h-[480px]">
          <div className="flex items-center gap-2 mb-4 border-b border-[#F5F5F5] pb-3">
            <ScrollText size={18} className="text-emerald-600" />
            <h3 className="text-[15px] font-bold text-[#0A0A0A]">Background Sync Activity</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {logs.map(log => (
              <div key={log.id} className="p-3 rounded-[12px] bg-[#FAFAFA] border border-[#E5E5E5]/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle size={13} />
                  </div>
                  <div>
                    <p className="text-[11.5px] font-bold text-[#0A0A0A] leading-none">{log.message}</p>
                    <p className="text-[9px] text-[#A0A0A0] mt-1 font-semibold">User: {log.user_role || 'system'}</p>
                  </div>
                </div>
                <span className="text-[9px] text-[#A0A0A0] flex-shrink-0">{new Date(log.created_at).toLocaleTimeString()}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="py-12 text-center text-[12px] text-[#A0A0A0]">No background synchronization events recorded.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
