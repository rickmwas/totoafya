import db from '@/api/totoafyaClient';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

export default function NursePatientSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const currentUser = await db.auth.me();
      let all;
      if (currentUser && currentUser.role === 'super_admin') {
        all = await db.entities.Mother.list('-created_date', 100);
      } else if (currentUser && currentUser.facility_id) {
        all = await db.entities.Mother.filter({ facility_id: currentUser.facility_id }, '-created_date', 100);
      } else {
        all = [];
      }
      const q = query.toLowerCase();
      const filtered = all.filter(m =>
        m.full_name?.toLowerCase().includes(q) ||
        m.anc_number?.toLowerCase().includes(q) ||
        m.national_id?.includes(q) ||
        m.phone?.includes(q)
      );
      setResults(filtered);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white border border-[#E5E5E5] rounded-[16px] px-4 focus-within:border-[#2E7A5D] transition-colors">
          <Search size={17} className="text-[#A0A0A0] flex-shrink-0" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by name, ANC number, ID or phone..."
            className="flex-1 h-12 text-[14px] font-medium text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none bg-transparent"
          />
          {query && (
            <button onClick={clear}>
              <X size={15} className="text-[#A0A0A0]" />
            </button>
          )}
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="h-12 px-5 bg-[#2E7A5D] text-white text-[13px] font-bold rounded-[16px] disabled:opacity-50 active:scale-[0.97] transition-all shadow-green-glow"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>

      {searched && (
        <div className="mt-3">
          {results.length === 0 ? (
            <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-6 text-center">
              <p className="text-[14px] font-bold text-[#0A0A0A] mb-1">No patients found</p>
              <p className="text-[12px] text-[#A0A0A0]">Try searching by a different name, ANC number, or phone</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map(p => (
                <button
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className="bg-white rounded-[20px] border border-[#E5E5E5] p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-all shadow-card hover:border-[#2E7A5D]/40"
                >
                  <div className="w-10 h-10 rounded-[12px] bg-[#0047FF]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[13px] font-extrabold text-[#0047FF]">
                      {p.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#0A0A0A] truncate">{p.full_name}</p>
                    <p className="text-[11px] text-[#A0A0A0]">
                      {[p.anc_number, p.phone, p.county].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="text-[11px] font-semibold text-[#2E7A5D] bg-[#2E7A5D]/10 px-2.5 py-1 rounded-full flex-shrink-0">
                    Open →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}