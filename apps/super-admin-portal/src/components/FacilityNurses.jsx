import React, { useState } from 'react';
import { Search, Plus, X, User, Mail, Building } from 'lucide-react';
import db from '@/api/totoafyaClient';

export default function FacilityNurses({ nurses, facilities, onRefresh }) {
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', facility_id: '', role: 'nurse' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const filtered = nurses.filter(n =>
    n.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    n.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.facility_id) {
      setError('Full Name, Email and Facility assignment are required.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await db.entities.Nurse.create({
        full_name: form.full_name,
        email: form.email,
        facility_id: form.facility_id,
        role: form.role
      });
      setForm({ full_name: '', email: '', facility_id: '', role: 'nurse' });
      setShowAddForm(false);
      onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to register nurse.');
    } finally {
      setSubmitting(false);
    }
  };

  const getFacilityName = (facilityId) => {
    const f = facilities.find(fac => fac.id === facilityId);
    return f ? f.name : 'Unknown Facility';
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0A0A0A] tracking-[-0.02em]">Nurses</h1>
          <p className="text-[14px] text-[#A0A0A0] mt-1">{nurses.length} registered nurses</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 h-10 px-4 bg-[#0047FF] text-white text-[13px] font-bold rounded-[12px] hover:bg-[#003BCC] active:scale-[0.97] transition-all shadow-[0_4px_12px_rgba(0,71,255,0.2)]"
        >
          <Plus size={15} /> Add Nurse
        </button>
      </div>

      {/* Add Nurse Form/Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] border border-[#E5E5E5] w-full max-w-md p-6 relative shadow-[0_12px_40px_rgba(0,0,0,0.12)] animate-in fade-in zoom-in duration-150">
            <button
              onClick={() => { setShowAddForm(false); setError(''); }}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F7] text-[#666666] hover:bg-[#E5E5E5]"
            >
              <X size={15} />
            </button>
            
            <h2 className="text-[20px] font-extrabold text-[#0A0A0A] mb-4">Register New Nurse</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <p className="text-[12px] text-[#E51010] bg-[#E51010]/5 border border-[#E51010]/15 p-3 rounded-[12px]">{error}</p>
              )}
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Full Name</label>
                <div className="flex items-center gap-2 px-3.5 bg-[#F5F5F7] rounded-[14px] border border-transparent focus-within:border-[#0047FF] focus-within:bg-white transition-all">
                  <User size={14} className="text-[#A0A0A0]" />
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    placeholder="e.g. Nurse Joy"
                    className="flex-1 h-11 text-[13px] font-medium text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Email Address</label>
                <div className="flex items-center gap-2 px-3.5 bg-[#F5F5F7] rounded-[14px] border border-transparent focus-within:border-[#0047FF] focus-within:bg-white transition-all">
                  <Mail size={14} className="text-[#A0A0A0]" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="e.g. joy@hospital.com"
                    className="flex-1 h-11 text-[13px] font-medium text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Facility Assignment</label>
                <div className="flex items-center gap-2 px-3.5 bg-[#F5F5F7] rounded-[14px] border border-transparent focus-within:border-[#0047FF] focus-within:bg-white transition-all">
                  <Building size={14} className="text-[#A0A0A0]" />
                  <select
                    required
                    value={form.facility_id}
                    onChange={e => setForm(f => ({ ...f, facility_id: e.target.value }))}
                    className="flex-1 h-11 text-[13px] font-medium text-[#0A0A0A] outline-none bg-transparent appearance-none"
                  >
                    <option value="">Select Facility...</option>
                    {facilities.map(fac => (
                      <option key={fac.id} value={fac.id}>{fac.name} ({fac.facility_code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0] px-1">Staff Role</label>
                <div className="flex items-center gap-2 px-3.5 bg-[#F5F5F7] rounded-[14px] border border-transparent focus-within:border-[#0047FF] focus-within:bg-white transition-all">
                  <User size={14} className="text-[#A0A0A0]" />
                  <select
                    required
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="flex-1 h-11 text-[13px] font-medium text-[#0A0A0A] outline-none bg-transparent appearance-none"
                  >
                    <option value="nurse">Nurse</option>
                    <option value="admin">Facility Administrator</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="h-12 bg-[#0047FF] text-white text-[14px] font-bold rounded-[16px] hover:bg-[#003BCC] active:scale-[0.98] transition-all disabled:opacity-50 mt-2 shadow-[0_4px_12px_rgba(0,71,255,0.25)]"
              >
                {submitting ? 'Registering...' : 'Register Nurse'}
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
            placeholder="Search by name or email..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#0047FF]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] border border-[#E5E5E5] shadow-premium overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-[#F5F5F7]">
            <tr>
              {['Nurse Name', 'Email Address', 'Assigned Facility', 'Role', 'Registered Date'].map(h => (
                <th key={h} className="text-left text-[10px] tracking-[0.12em] uppercase font-bold text-[#A0A0A0] px-6 py-3.5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(n => (
              <tr key={n.id} className="border-t border-[#F5F5F7] hover:bg-[#F5F5F7]/50 transition-colors">
                <td className="px-6 py-4 text-[13px] font-semibold text-[#0A0A0A] whitespace-nowrap">{n.full_name}</td>
                <td className="px-6 py-4 text-[12px] text-[#666666]">{n.email}</td>
                <td className="px-6 py-4 text-[12px] text-[#666666] whitespace-nowrap">{getFacilityName(n.facility_id)}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                    n.role === 'admin' ? 'bg-[#7C3AED]/10 text-[#7C3AED]' : 'bg-[#2E7A5D]/10 text-[#2E7A5D]'
                  }`}>
                    {n.role || 'nurse'}
                  </span>
                </td>
                <td className="px-6 py-4 text-[12px] text-[#A0A0A0]">{n.created_date ? new Date(n.created_date).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-[13px] text-[#A0A0A0]">No nurses found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
