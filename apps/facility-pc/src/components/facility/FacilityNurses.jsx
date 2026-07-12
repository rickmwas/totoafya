import React, { useState } from 'react';
import { Search, UserPlus, Shield, X, BadgeCheck, Mail, Key } from 'lucide-react';
import db from '@/api/totoafyaClient';
import { useToast } from '@/components/ui/use-toast';

const ROLE_LABELS = {
  admin: 'Facility Admin',
  charge_nurse: 'Charge Nurse',
  nurse: 'Staff Nurse',
};

const ROLE_COLORS = {
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  charge_nurse: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  nurse: 'bg-teal-50 text-teal-700 border-emerald-200',
};

export default function FacilityNurses({ nurses, facilityId, onRefresh }) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('nurse');
  const [pinCode, setPinCode] = useState('');
  const [badgeToken, setBadgeToken] = useState('');

  const filtered = nurses.filter(n => {
    return (
      n.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      n.email?.toLowerCase().includes(search.toLowerCase()) ||
      n.badge_token?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleAddNurse = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !pinCode) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Name, Email, PIN).',
        variant: 'destructive',
      });
      return;
    }

    if (pinCode.length < 4 || pinCode.length > 6 || isNaN(pinCode)) {
      toast({
        title: 'Validation Error',
        description: 'PIN must be a 4 to 6-digit number.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await db.entities.Nurse.create({
        facility_id: facilityId,
        full_name: fullName,
        email: email,
        role: role,
        pin_code: pinCode,
        badge_token: badgeToken || null,
      });

      toast({
        title: 'Success',
        description: `Successfully registered ${fullName} as a nurse.`,
      });

      // Reset
      setFullName('');
      setEmail('');
      setRole('nurse');
      setPinCode('');
      setBadgeToken('');
      setShowAddForm(false);
      
      // Refresh list
      onRefresh();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to add nurse profile.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0A0A0A] tracking-[-0.02em]">Nurses</h1>
          <p className="text-[14px] text-[#A0A0A0] mt-1">{nurses.length} registered clinic staff members</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-[#2E5B47] hover:bg-[#003CE5] active:scale-95 text-white text-[13px] font-bold rounded-[12px] shadow-sm transition-all"
        >
          <UserPlus size={15} />
          Register Nurse
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-2 mb-5 max-w-sm">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search nurses by name, email or badge..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#2E5B47] transition-all"
          />
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-white rounded-[20px] border border-[#E5E5E5] shadow-card overflow-x-auto">
        <table className="w-full min-w-[650px]">
          <thead className="bg-[#F5F5F7]">
            <tr>
              {['Name', 'Email Address', 'Staff Role', 'PIN Access', 'NFC Badge Token', 'Registered'].map(h => (
                <th key={h} className="text-left text-[10px] tracking-[0.12em] uppercase font-bold text-[#A0A0A0] px-6 py-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(n => (
              <tr key={n.id} className="border-t border-[#F5F5F7] hover:bg-[#F5F5F7]/50 transition-colors">
                <td className="px-6 py-4 text-[13px] font-semibold text-[#0A0A0A] whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#2E5B47]/10 text-[#2E5B47] flex items-center justify-center font-bold text-[13px]">
                      {n.full_name?.charAt(0)}
                    </div>
                    {n.full_name}
                  </div>
                </td>
                <td className="px-6 py-4 text-[13px] text-[#666666]">{n.email}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${ROLE_COLORS[n.role] || ROLE_COLORS.nurse}`}>
                    {ROLE_LABELS[n.role] || ROLE_LABELS.nurse}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1 text-[12px] font-mono text-[#666666] bg-[#F5F5F7] px-2 py-0.5 rounded border border-[#E5E5E5]">
                    ••••
                  </span>
                </td>
                <td className="px-6 py-4">
                  {n.badge_token ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2E5B47] bg-[#2E5B47]/10 px-2.5 py-0.5 rounded-full">
                      <BadgeCheck size={11} /> {n.badge_token}
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#A0A0A0]">None Linked</span>
                  )}
                </td>
                <td className="px-6 py-4 text-[12px] text-[#A0A0A0]">
                  {n.created_date ? new Date(n.created_date).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-[13px] text-[#A0A0A0]">
                  No nurse profiles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Nurse Drawer Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end transition-opacity duration-350">
          <div className="w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#F5F5F7] pb-4 mb-6">
              <h2 className="text-[18px] font-extrabold text-[#0A0A0A]">Register New Nurse</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F7] text-[#666666] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddNurse} className="flex-1 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Nurse Jane Doe"
                  className="h-11 px-3.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Email Address *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. jane.doe@totoafya.org"
                    className="w-full h-11 pl-10 pr-3.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Staff Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="h-11 px-3 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                >
                  <option value="nurse">Staff Nurse</option>
                  <option value="charge_nurse">Charge Nurse</option>
                  <option value="admin">Facility Admin</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Security PIN * (4-6 digits)</label>
                <div className="relative">
                  <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pinCode}
                    onChange={e => setPinCode(e.target.value)}
                    placeholder="Used for clinic check-ins"
                    className="w-full h-11 pl-10 pr-3.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">NFC/RFID Badge Token (Optional)</label>
                <div className="relative">
                  <Shield size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A0A0A0]" />
                  <input
                    type="text"
                    value={badgeToken}
                    onChange={e => setBadgeToken(e.target.value)}
                    placeholder="e.g. BDG-7749"
                    className="w-full h-11 pl-10 pr-3.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#2E5B47] focus:bg-white transition-all"
                  />
                </div>
                <p className="text-[10px] text-[#A0A0A0]">Physical token ID for scanner integrations.</p>
              </div>

              <div className="mt-auto flex flex-col gap-2 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#2E5B47] hover:bg-[#003CE5] disabled:opacity-50 active:scale-[0.98] transition-all text-white text-[14px] font-bold rounded-[14px] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Register Nurse Profile'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="w-full h-11 border border-[#E5E5E5] hover:bg-[#F5F5F7] active:scale-[0.98] transition-all text-[#666666] text-[13px] font-semibold rounded-[14px]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
