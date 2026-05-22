import React, { useState, useEffect } from 'react';
import { MapPin, X, Check, Loader2 } from 'lucide-react';
import db from '@/api/totoafyaClient';

export default function HospitalPicker({ value, onChange, lang }) {
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState([]);
  const [query, setQuery] = useState(value || '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        let list = await db.entities.Facility.list();
        if (list.length === 0) {
          const f1 = await db.entities.Facility.create({ name: 'Demo Referral Hospital', location: 'Central Region', facility_code: 'REF-001' });
          const f2 = await db.entities.Facility.create({ name: 'Eldoret Clinic', location: 'Rift Valley Region', facility_code: 'ELD-002' });
          list = [f1, f2];
        }
        setFacilities(list);
      } catch (err) {
        console.error("Failed to load facilities:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = facilities.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase()) ||
    (f.location && f.location.toLowerCase().includes(query.toLowerCase())) ||
    (f.facility_code && f.facility_code.toLowerCase().includes(query.toLowerCase()))
  );

  const selectHospital = (facility) => {
    onChange(facility);
    setQuery(facility.name);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-col gap-2 relative">
      <label className="text-[10px] tracking-[0.18em] font-bold uppercase text-[#A0A0A0]">
        {lang === 'sw' ? 'HOSPITALI / KITUO CHA AFYA' : 'HEALTH FACILITY'}
      </label>

      {/* Main input */}
      <div className="relative z-50">
        <div className="flex items-center gap-2 bg-white border border-[#E5E5E5] rounded-[16px] px-4 focus-within:border-[#1B6B5A] transition-colors">
          <MapPin size={15} className="text-[#A0A0A0] flex-shrink-0" />
          <input
            type="text"
            value={query}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={e => {
              setQuery(e.target.value);
              setIsDropdownOpen(true);
            }}
            placeholder={lang === 'sw' ? 'Tafuta hospitali...' : 'Search for a hospital...'}
            className="flex-1 h-14 text-[15px] font-medium text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none bg-transparent"
          />
          {loading && <Loader2 size={14} className="animate-spin text-[#A0A0A0]" />}
          {query && (
            <button type="button" onClick={() => { onChange(null); setQuery(''); }}>
              <X size={14} className="text-[#A0A0A0]" />
            </button>
          )}
        </div>

        {/* Dropdown list */}
        {isDropdownOpen && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white rounded-[16px] border border-[#E5E5E5] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            {loading ? (
              <div className="p-4 text-center text-[#A0A0A0] text-[13px]">
                {lang === 'sw' ? 'Inapakia...' : 'Loading facilities...'}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-center text-[#A0A0A0] text-[13px]">
                {lang === 'sw' ? 'Hakuna hospitali iliyopatikana' : 'No facilities found'}
              </div>
            ) : (
              filtered.map((f, i) => (
                <button
                  key={f.id || i}
                  type="button"
                  onClick={() => selectHospital(f)}
                  className="w-full px-4 py-3 text-left hover:bg-[#F5F5F7] flex items-center gap-3 border-b border-[#F5F5F7] last:border-0 active:bg-[#F5F5F7]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#1B6B5A]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={13} className="text-[#1B6B5A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#0A0A0A]">{f.name}</p>
                    <p className="text-[11px] text-[#A0A0A0] truncate">
                      {f.location || (lang === 'sw' ? 'Kituo cha Afya' : 'Health Center')}
                    </p>
                  </div>
                  {value === f.name && (
                    <Check size={14} className="text-[#1B6B5A] flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Overlay to close dropdown if clicking outside */}
      {isDropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
      )}
    </div>
  );
}