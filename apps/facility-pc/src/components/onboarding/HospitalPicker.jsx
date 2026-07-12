import React, { useState } from 'react';
import { MapPin, Search, Loader2, Navigation, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HospitalPicker({ value, onChange, lang }) {
  const [mode, setMode] = useState('text'); // 'text' | 'nearby'
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [locationError, setLocationError] = useState(null);
  const [query, setQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const getNearbyHospitals = () => {
    setLocationError(null);
    setLoading(true);
    setMode('nearby');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=hospital+maternity&format=json&limit=10&bounded=1&viewbox=${longitude - 0.1},${latitude + 0.1},${longitude + 0.1},${latitude - 0.1}&near=${latitude},${longitude}`
          );
          let data = await res.json();
          // Fallback: broader search if none found nearby
          if (!data.length) {
            const res2 = await fetch(
              `https://nominatim.openstreetmap.org/search?q=hospital&format=json&limit=10&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            data = await res2.json();
          }
          setHospitals(data.slice(0, 8));
        } catch {
          setLocationError(lang === 'sw' ? 'Imeshindwa kupata hospitali karibu' : 'Could not fetch nearby hospitals');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        setLocationError(
          lang === 'sw'
            ? 'Ruhusa ya eneo ilikataliwa. Ingiza jina la hospitali mwenyewe.'
            : 'Location access denied. Please type the hospital name manually.'
        );
      },
      { timeout: 10000 }
    );
  };

  const searchHospitals = async (q) => {
    setQuery(q);
    if (q.length < 3) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ' hospital Kenya')}&format=json&limit=6&addressdetails=1`
      );
      const data = await res.json();
      setSearchResults(data.filter(d => d.type === 'hospital' || d.class === 'amenity'));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectHospital = (name) => {
    onChange(name);
    setQuery(name);
    setHospitals([]);
    setSearchResults([]);
    setMode('text');
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] tracking-[0.18em] font-bold uppercase text-[#A0A0A0]">
        {lang === 'sw' ? 'HOSPITALI / KITUO CHA AFYA' : 'HEALTH FACILITY'}
      </label>

      {/* Main input */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-white border border-[#E5E5E5] rounded-[16px] px-4 focus-within:border-[#2E5B47] transition-colors">
          <MapPin size={15} className="text-[#A0A0A0] flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => searchHospitals(e.target.value)}
            placeholder={lang === 'sw' ? 'Tafuta hospitali...' : 'Search for a hospital...'}
            className="flex-1 h-14 text-[15px] font-medium text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none bg-transparent"
          />
          {searching && <Loader2 size={14} className="animate-spin text-[#A0A0A0]" />}
          {query && (
            <button onClick={() => { onChange(''); setQuery(''); setSearchResults([]); }}>
              <X size={14} className="text-[#A0A0A0]" />
            </button>
          )}
        </div>

        {/* Search dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-[16px] border border-[#E5E5E5] shadow-float overflow-hidden">
            {searchResults.map((h, i) => (
              <button key={i} onClick={() => selectHospital(h.name || h.display_name.split(',')[0])}
                className="w-full px-4 py-3 text-left hover:bg-[#F5F5F7] flex items-center gap-3 border-b border-[#F5F5F7] last:border-0">
                <MapPin size={13} className="text-[#2E5B47] flex-shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-[#0A0A0A]">{h.name || h.display_name.split(',')[0]}</p>
                  <p className="text-[11px] text-[#A0A0A0] truncate max-w-[260px]">
                    {h.display_name?.split(',').slice(1, 3).join(',').trim()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Use location button */}
      <button
        type="button"
        onClick={getNearbyHospitals}
        className="flex items-center gap-2 self-start px-4 py-2 rounded-full bg-[#2E5B47]/8 border border-[#2E5B47]/20 active:scale-[0.97] transition-all"
      >
        <Navigation size={13} className="text-[#2E5B47]" />
        <span className="text-[12px] font-bold text-[#2E5B47]">
          {loading
            ? (lang === 'sw' ? 'Inatafuta...' : 'Finding nearby...')
            : (lang === 'sw' ? 'Tumia Eneo Langu' : 'Use My Location')}
        </span>
        {loading && <Loader2 size={12} className="animate-spin text-[#2E5B47]" />}
      </button>

      {/* Location error */}
      {locationError && (
        <p className="text-[12px] text-[#E51010] px-1">{locationError}</p>
      )}

      {/* Nearby results */}
      {hospitals.length > 0 && (
        <div className="bg-white rounded-[16px] border border-[#E5E5E5] overflow-hidden shadow-card">
          <p className="px-4 py-2 text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] border-b border-[#F5F5F7]">
            {lang === 'sw' ? 'HOSPITALI KARIBU NAWE' : 'NEARBY HOSPITALS'}
          </p>
          {hospitals.map((h, i) => (
            <button key={i} onClick={() => selectHospital(h.name || h.display_name.split(',')[0])}
              className="w-full px-4 py-3 text-left hover:bg-[#F5F5F7] flex items-center gap-3 border-b border-[#F5F5F7] last:border-0 active:bg-[#F5F5F7]">
              <div className="w-8 h-8 rounded-full bg-[#2E5B47]/10 flex items-center justify-center flex-shrink-0">
                <MapPin size={13} className="text-[#2E5B47]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[#0A0A0A]">{h.name || h.display_name.split(',')[0]}</p>
                <p className="text-[11px] text-[#A0A0A0] truncate">
                  {h.display_name?.split(',').slice(1, 3).join(',').trim()}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
