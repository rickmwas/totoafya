import React, { useState } from 'react';
import { Search } from 'lucide-react';

export default function FacilityChildren({ children, growthRecords }) {
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [filterHealth, setFilterHealth] = useState('all');

  // Map latest growth record per child
  const latestGrowth = {};
  growthRecords.forEach(g => {
    if (!latestGrowth[g.child_id] || new Date(g.recorded_date) > new Date(latestGrowth[g.child_id].recorded_date)) {
      latestGrowth[g.child_id] = g;
    }
  });

  const getAge = (dob) => {
    if (!dob) return '—';
    const diff = Date.now() - new Date(dob).getTime();
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44));
    if (months < 1) return `${Math.floor(diff / (1000 * 60 * 60 * 24))}d`;
    if (months < 24) return `${months}mo`;
    return `${Math.floor(months / 12)}yr ${months % 12}mo`;
  };

  const filtered = children.filter(c => {
    const matchSearch = c.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchGender = filterGender === 'all' || c.gender === filterGender;
    const matchHealth = filterHealth === 'all' || c.health_status === filterHealth;
    return matchSearch && matchGender && matchHealth;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-[#0A0A0A] tracking-[-0.02em]">Children</h1>
        <p className="text-[14px] text-[#A0A0A0] mt-1">{children.length} registered children</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#2E5B47]" />
        </div>
        <select value={filterGender} onChange={e => setFilterGender(e.target.value)}
          className="h-10 px-3 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47]">
          <option value="all">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <select value={filterHealth} onChange={e => setFilterHealth(e.target.value)}
          className="h-10 px-3 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47]">
          <option value="all">All Health Status</option>
          <option value="healthy">Healthy</option>
          <option value="monitor">Monitor</option>
          <option value="at_risk">At Risk</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="bg-white rounded-[20px] border border-[#E5E5E5] shadow-card overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-[#F5F5F7]">
            <tr>
              {['Name', 'Age', 'Gender', 'Health Status', 'Weight', 'Height', 'Nutrition', 'Birth Weight', 'DOB'].map(h => (
                <th key={h} className="text-left text-[10px] tracking-[0.12em] uppercase font-bold text-[#A0A0A0] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const g = latestGrowth[c.id];
              return (
                <tr key={c.id} className="border-t border-[#F5F5F7] hover:bg-[#F5F5F7]/50 transition-colors">
                  <td className="px-4 py-3 text-[13px] font-semibold text-[#0A0A0A]">{c.full_name}</td>
                  <td className="px-4 py-3 text-[12px] text-[#666666]">{getAge(c.date_of_birth)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${c.gender === 'male' ? 'bg-[#2E5B47]/10 text-[#2E5B47]' : 'bg-[#D946A8]/10 text-[#D946A8]'}`}>
                      {c.gender}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      c.health_status === 'healthy' ? 'bg-[#2E5B47]/10 text-[#2E5B47]' :
                      c.health_status === 'critical' ? 'bg-[#E51010]/10 text-[#E51010]' :
                      c.health_status === 'at_risk' ? 'bg-[#E51010]/10 text-[#E51010]' : 'bg-[#F9A825]/10 text-[#F9A825]'
                    }`}>{c.health_status || 'healthy'}</span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#666666]">{g?.weight_kg ? `${g.weight_kg} kg` : '—'}</td>
                  <td className="px-4 py-3 text-[12px] text-[#666666]">{g?.height_cm ? `${g.height_cm} cm` : '—'}</td>
                  <td className="px-4 py-3">
                    {g?.nutrition_status ? (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        g.nutrition_status === 'normal' ? 'bg-[#2E5B47]/10 text-[#2E5B47]' :
                        g.nutrition_status === 'sam' ? 'bg-[#E51010]/10 text-[#E51010]' : 'bg-[#F9A825]/10 text-[#F9A825]'
                      }`}>{g.nutrition_status}</span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#666666]">{c.birth_weight_kg ? `${c.birth_weight_kg} kg` : '—'}</td>
                  <td className="px-4 py-3 text-[12px] text-[#A0A0A0]">{c.date_of_birth || '—'}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-[13px] text-[#A0A0A0]">No children found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
