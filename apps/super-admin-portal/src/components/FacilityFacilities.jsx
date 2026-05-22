import React, { useState } from 'react';
import { Search, Plus, X, Building, MapPin, Key } from 'lucide-react';
import db from '@/api/totoafyaClient';

export default function FacilityFacilities({ facilities, onRefresh }) {
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', facility_code: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const filtered = facilities.filter(f =>
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.facility_code?.toLowerCase().includes(search.toLowerCase()) ||
    f.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.facility_code) {
      setError('Name and Facility Code are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await db.entities.Facility.create({
        name: form.name,
        location: form.location,
        facility_code: form.facility_code
      });
      setForm({ name: '', location: '', facility_code: '' });
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to create facility.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0A0A0A] tracking-[-0.02em]">Facilities</h1>
          <p className="text-[14px] text-[#A0A0A0] mt-1">{facilities.length} registered facilities</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 h-10 px-4 bg-[#0047FF] text-white text-[13px] font-bold rounded-[12px] hover:bg-[#003BCC] active:scale-[0.97] transition-all shadow-[0_4px_12px_rgba(0,71,255,0.2)]"
        >
          <Plus size={15} /> Add Facility
        </button>
      </div>

      {/* Add Facility Form/Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] border border-[#E5E5E5] w-full max-w-md p-6 relative shadow-[0_12px_40px_rgba(0,0,0,0.12)] animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => { setShowAddForm(false); setError(''); }}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F7] text-[#666666] hover:bg-[#E5E5E5]"
            >
              <X size={15} />
            </button>
            
            <h2 className="text-[20px] font-extrabold text-[#0A0A0A] mb-4">Register New Facility</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <p className="text-[12px] text-[#E51010] bg-[#E51010]/5 border border-[#E51010]/15 p-3 rounded-[12px]">{error}</p>
              )}
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Facility Name</label>
                <div className="flex items-center gap-2 px-3.5 bg-[#F5F5F7] rounded-[14px] border border-transparent focus-within:border-[#0047FF] focus-within:bg-white transition-all">
                  <Building size={14} className="text-[#A0A0A0]" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Eldoret Referral Hospital"
                    className="flex-1 h-11 text-[13px] font-medium text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Location</label>
                <div className="flex items-center gap-2 px-3.5 bg-[#F5F5F7] rounded-[14px] border border-transparent focus-within:border-[#0047FF] focus-within:bg-white transition-all">
                  <MapPin size={14} className="text-[#A0A0A0]" />
                  <input
                    type="text"
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Rift Valley, Eldoret"
                    className="flex-1 h-11 text-[13px] font-medium text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Facility Code</label>
                <div className="flex items-center gap-2 px-3.5 bg-[#F5F5F7] rounded-[14px] border border-transparent focus-within:border-[#0047FF] focus-within:bg-white transition-all">
                  <Key size={14} className="text-[#A0A0A0]" />
                  <input
                    type="text"
                    required
                    value={form.facility_code}
                    onChange={e => setForm(f => ({ ...f, facility_code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. ELD-002"
                    className="flex-1 h-11 text-[13px] font-medium text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none bg-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="h-12 bg-[#0047FF] text-white text-[14px] font-bold rounded-[16px] hover:bg-[#003BCC] active:scale-[0.98] transition-all disabled:opacity-50 mt-2 shadow-[0_4px_12px_rgba(0,71,255,0.25)]"
              >
                {submitting ? 'Creating...' : 'Register Facility'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, code or location..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#0047FF]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] border border-[#E5E5E5] shadow- premium overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-[#F5F5F7]">
            <tr>
              {['Facility Name', 'Facility Code', 'Location', 'Registered Date'].map(h => (
                <th key={h} className="text-left text-[10px] tracking-[0.12em] uppercase font-bold text-[#A0A0A0] px-6 py-3.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} className="border-t border-[#F5F5F7] hover:bg-[#F5F5F7]/50 transition-colors">
                <td className="px-6 py-4 text-[13px] font-semibold text-[#0A0A0A] whitespace-nowrap">{f.name}</td>
                <td className="px-6 py-4 text-[12px] font-bold text-[#0047FF]">{f.facility_code}</td>
                <td className="px-6 py-4 text-[12px] text-[#666666]">{f.location || '—'}</td>
                <td className="px-6 py-4 text-[12px] text-[#A0A0A0]">{f.created_date ? new Date(f.created_date).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-[13px] text-[#A0A0A0]">No facilities found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
