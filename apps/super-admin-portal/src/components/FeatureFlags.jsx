import React, { useState } from 'react';
import { Search, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import db from '@/api/totoafyaClient';

export default function FeatureFlags({ initialFlags, onRefresh }) {
  const [search, setSearch] = useState('');
  const [updatingFlagId, setUpdatingFlagId] = useState(null);
  const [error, setError] = useState('');

  const filtered = initialFlags.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (flag) => {
    setUpdatingFlagId(flag.id);
    setError('');
    const newStatus = !flag.is_enabled;
    try {
      // 1. Update in DB
      await db.entities.FeatureFlag.update(flag.id, { is_enabled: newStatus });
      
      // 2. Synchronize local features memory cache
      if (db.features && db.features.setCache) {
        db.features.setCache(flag.name, newStatus);
      }
      
      // 3. Trigger reload of data in parent App
      await onRefresh();
    } catch (err) {
      console.error(err);
      setError(`Failed to update flag: ${err.message}`);
    } finally {
      setUpdatingFlagId(null);
    }
  };

  return (
    <div className="animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0A0A0A] tracking-[-0.02em]">Runtime Feature Flags</h1>
          <p className="text-[14px] text-[#A0A0A0] mt-1">Control active platform modules dynamically without pushing code edits or deployments.</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-rose-50 border border-rose-200 rounded-[14px] p-4 flex items-start gap-3">
          <AlertCircle className="text-rose-600 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-[12px] text-rose-700 font-semibold">{error}</p>
        </div>
      )}

      {/* Filter and Info bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 w-full max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search feature flags by name..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#0047FF]"
          />
        </div>
        
        <div className="bg-[#0047FF]/5 border border-[#0047FF]/10 py-2 px-4 rounded-[12px] flex items-center gap-2 text-[11px] font-bold text-[#0047FF] ml-auto">
          <Sparkles size={12} className="animate-pulse" />
          <span>Real-time runtime updates enabled</span>
        </div>
      </div>

      {/* Feature Flags Grid / Table */}
      <div className="bg-white rounded-[20px] border border-[#E5E5E5] shadow-premium overflow-hidden">
        <table className="w-full min-w-[600px]">
          <thead className="bg-[#FAFAFA]">
            <tr>
              <th className="text-left text-[10px] tracking-[0.12em] uppercase font-bold text-[#A0A0A0] px-6 py-4">Flag / Identifier</th>
              <th className="text-left text-[10px] tracking-[0.12em] uppercase font-bold text-[#A0A0A0] px-6 py-4">Description</th>
              <th className="text-left text-[10px] tracking-[0.12em] uppercase font-bold text-[#A0A0A0] px-6 py-4 w-32">Status</th>
              <th className="text-center text-[10px] tracking-[0.12em] uppercase font-bold text-[#A0A0A0] px-6 py-4 w-32">Toggle</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(flag => (
              <tr key={flag.id} className="border-t border-[#FAFAFA] hover:bg-[#FAFAFA]/50 transition-colors">
                <td className="px-6 py-5">
                  <span className="font-mono text-[13px] font-bold text-[#0A0A0A] bg-[#FAFAFA] border border-[#E5E5E5] py-1 px-2.5 rounded-[8px]">
                    {flag.name}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <p className="text-[13px] text-[#666666] leading-relaxed max-w-md">{flag.description || 'No description provided.'}</p>
                </td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-[11px] font-bold ${
                    flag.is_enabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                      : 'bg-rose-50 text-rose-700 border border-rose-150'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${flag.is_enabled ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    {flag.is_enabled ? 'Active / Enabled' : 'Inactive / Disabled'}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex items-center justify-center">
                    {updatingFlagId === flag.id ? (
                      <RefreshCw size={18} className="animate-spin text-[#0047FF]" />
                    ) : (
                      <button
                        onClick={() => handleToggle(flag)}
                        aria-label={`Toggle ${flag.name}`}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 outline-none ${
                          flag.is_enabled ? 'bg-[#0047FF]' : 'bg-[#E5E5E5]'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            flag.is_enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-[13px] text-[#A0A0A0]">
                  No feature flags found matching filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
