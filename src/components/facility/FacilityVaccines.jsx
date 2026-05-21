import React, { useState } from 'react';
import { Search } from 'lucide-react';

const STATUS_STYLE = {
  given:     'bg-[#2E7A5D]/10 text-[#2E7A5D]',
  scheduled: 'bg-[#0047FF]/10 text-[#0047FF]',
  due:       'bg-[#F9A825]/10 text-[#F9A825]',
  overdue:   'bg-[#E51010]/10 text-[#E51010]',
  missed:    'bg-[#E51010]/10 text-[#E51010]',
};

export default function FacilityVaccines({ immunizations, children }) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const childMap = {};
  children.forEach(c => { childMap[c.id] = c.full_name; });

  const filtered = immunizations.filter(i => {
    const childName = childMap[i.child_id] || '';
    const matchSearch = i.vaccine_name?.toLowerCase().includes(search.toLowerCase()) || childName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = { given: 0, scheduled: 0, due: 0, overdue: 0, missed: 0 };
  immunizations.forEach(i => { if (counts[i.status] !== undefined) counts[i.status]++; });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-[#0A0A0A] tracking-[-0.02em]">Vaccination Records</h1>
        <p className="text-[14px] text-[#A0A0A0] mt-1">{immunizations.length} total records</p>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 mb-5 flex-wrap">
        {Object.entries(counts).map(([status, count]) => (
          <button key={status} onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
            className={`px-4 py-2 rounded-full text-[12px] font-bold border-2 transition-all ${filterStatus === status ? 'border-[#0047FF] bg-[#0047FF]/5' : 'border-transparent bg-white'}`}>
            <span className={`inline-block w-2 h-2 rounded-full mr-2 ${STATUS_STYLE[status]?.split(' ')[0]}`} />
            {status}: {count}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search vaccine or child name..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#0047FF]" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="h-10 px-3 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#0047FF]">
          <option value="all">All Status</option>
          <option value="given">Given</option>
          <option value="scheduled">Scheduled</option>
          <option value="due">Due</option>
          <option value="overdue">Overdue</option>
          <option value="missed">Missed</option>
        </select>
      </div>

      <div className="bg-white rounded-[20px] border border-[#E5E5E5] shadow-card overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-[#F5F5F7]">
            <tr>
              {['Child', 'Vaccine', 'Dose', 'Status', 'Scheduled', 'Given Date', 'Facility', 'Administered By'].map(h => (
                <th key={h} className="text-left text-[10px] tracking-[0.12em] uppercase font-bold text-[#A0A0A0] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} className="border-t border-[#F5F5F7] hover:bg-[#F5F5F7]/50 transition-colors">
                <td className="px-4 py-3 text-[13px] font-semibold text-[#0A0A0A]">{childMap[i.child_id] || '—'}</td>
                <td className="px-4 py-3 text-[13px] text-[#0A0A0A]">{i.vaccine_name}</td>
                <td className="px-4 py-3 text-[12px] text-[#666666]">{i.dose_number ? `Dose ${i.dose_number}` : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[i.status] || ''}`}>{i.status}</span>
                </td>
                <td className="px-4 py-3 text-[12px] text-[#666666]">{i.scheduled_date || '—'}</td>
                <td className="px-4 py-3 text-[12px] text-[#666666]">{i.given_date || '—'}</td>
                <td className="px-4 py-3 text-[12px] text-[#666666] max-w-[120px] truncate">{i.facility || '—'}</td>
                <td className="px-4 py-3 text-[12px] text-[#666666]">{i.administered_by || '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-[13px] text-[#A0A0A0]">No records found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}