import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

const RISK_COLORS = {
  low: 'bg-[#0F4C81]/10 text-[#0F4C81]',
  medium: 'bg-[#F9A825]/10 text-[#F9A825]',
  high: 'bg-[#E51010]/10 text-[#E51010]',
  critical: 'bg-[#E51010]/10 text-[#E51010]',
};

export default function FacilityMothers({ mothers }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  const filtered = mothers.filter(m => {
    const matchSearch = m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.national_id?.includes(search) || m.phone?.includes(search);
    const matchStatus = filterStatus === 'all' || m.pregnancy_status === filterStatus;
    const matchRisk = filterRisk === 'all' || m.risk_level === filterRisk;
    const matchRole = filterRole === 'all' || (m.caregiver_type || 'mother') === filterRole;
    return matchSearch && matchStatus && matchRisk && matchRole;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-[#0A0A0A] tracking-[-0.02em]">Mothers & Caregivers</h1>
        <p className="text-[14px] text-[#A0A0A0] mt-1">{mothers.length} registered caregivers</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, ID or phone..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#0047FF]"
          />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="h-10 px-3 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0047FF]">
          <option value="all">All Roles</option>
          <option value="mother">Mother</option>
          <option value="father">Father</option>
          <option value="guardian">Guardian</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-10 px-3 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0047FF]">
          <option value="all">All Status</option>
          <option value="pregnant">Pregnant</option>
          <option value="postpartum">Postpartum</option>
          <option value="not_pregnant">Not Pregnant</option>
        </select>
        <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
          className="h-10 px-3 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0047FF]">
          <option value="all">All Risk Levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] border border-[#E5E5E5] shadow-card overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-[#F4F6F8]">
            <tr>
              {['Name', 'Role', 'National ID', 'Phone', 'Status', 'Risk', 'EDD', 'County', 'Facility', 'Registered'].map(h => (
                <th key={h} className="text-left text-[10px] tracking-[0.12em] uppercase font-bold text-[#A0A0A0] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-t border-[#F4F6F8] hover:bg-[#F4F6F8]/50 transition-colors">
                <td className="px-4 py-3 text-[13px] font-semibold text-[#0A0A0A] whitespace-nowrap">{m.full_name}</td>
                <td className="px-4 py-3 text-[12px] capitalize font-medium text-[#666666]">{m.caregiver_type || 'mother'}</td>
                <td className="px-4 py-3 text-[12px] text-[#666666]">{m.national_id || '—'}</td>
                <td className="px-4 py-3 text-[12px] text-[#666666]">{m.phone || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    m.pregnancy_status === 'pregnant' ? 'bg-[#0047FF]/10 text-[#0047FF]' :
                    m.pregnancy_status === 'postpartum' ? 'bg-[#0F4C81]/10 text-[#0F4C81]' : 'bg-[#F4F6F8] text-[#666666]'
                  }`}>{m.pregnancy_status}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${RISK_COLORS[m.risk_level] || RISK_COLORS.low}`}>
                    {m.risk_level || 'low'}
                  </span>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#666666]">{m.edd || '—'}</td>
                <td className="px-4 py-3 text-[12px] text-[#666666]">{m.county || '—'}</td>
                <td className="px-4 py-3 text-[12px] text-[#666666] max-w-[140px] truncate">{m.facility_name || '—'}</td>
                <td className="px-4 py-3 text-[12px] text-[#A0A0A0]">{new Date(m.created_date).toLocaleDateString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-12 text-center text-[13px] text-[#A0A0A0]">No caregivers found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
