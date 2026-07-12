import db from '@/api/totoafyaClient';

import React, { useState } from 'react';
import { Users, Send, Check, X } from 'lucide-react';

import { cn } from '@/lib/utils';

export default function InvitePartner({ mother, lang, onUpdated }) {
  const [email, setEmail] = useState(mother?.partner_email || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [removing, setRemoving] = useState(false);

  const hasPartner = !!mother?.partner_email;

  const handleInvite = async () => {
    if (!email.trim() || !mother) return;
    setSaving(true);
    await db.entities.Mother.update(mother.id, { partner_email: email.trim() });
    setSaving(false);
    setSaved(true);
    onUpdated();
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRemove = async () => {
    if (!mother) return;
    setRemoving(true);
    await db.entities.Mother.update(mother.id, { partner_email: null, partner_user_id: null });
    setEmail('');
    setRemoving(false);
    onUpdated();
  };

  return (
    <div className="mx-4 mb-4 bg-white rounded-[24px] border border-[#E5E5E5] overflow-hidden">
      <div className="px-4 pt-4 pb-2 flex items-center gap-2">
        <Users size={15} className="text-[#7C3AED]" />
        <p className="text-[10px] tracking-[0.15em] uppercase font-bold text-[#A0A0A0]">
          {lang === 'sw' ? 'MSHIRIKA / MUME' : 'PARTNER ACCESS'}
        </p>
      </div>

      <div className="px-4 pb-4">
        {hasPartner ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-[#7C3AED]/5 rounded-[16px] px-4 py-3 border border-[#7C3AED]/20">
              <div className="w-9 h-9 rounded-[10px] bg-[#7C3AED]/15 flex items-center justify-center">
                <Users size={16} className="text-[#7C3AED]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-[#0A0A0A] truncate">{mother.partner_email}</p>
                <p className="text-[11px] text-[#A0A0A0]">
                  {lang === 'sw' ? 'Ana ufikiaji kamili wa data' : 'Has full access to family data'}
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#2E5B47] bg-[#2E5B47]/10 px-2 py-1 rounded-full">Active</span>
            </div>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="flex items-center justify-center gap-2 h-10 rounded-full border border-[#E51010]/30 text-[#E51010] text-[13px] font-semibold active:scale-[0.97] transition-all"
            >
              <X size={14} /> {removing ? 'Removing...' : (lang === 'sw' ? 'Ondoa ufikiaji' : 'Remove access')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-[13px] text-[#666666]">
              {lang === 'sw'
                ? 'Mwamshe mshirika wako ili aweze kuona na kuhariri data ya familia.'
                : 'Invite your partner so they can view and edit your family health data.'}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={lang === 'sw' ? 'Barua pepe ya mshirika' : "Partner's email address"}
                className="flex-1 h-12 px-4 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[14px] text-[14px] font-medium text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#7C3AED] transition-colors"
              />
              <button
                onClick={handleInvite}
                disabled={saving || !email.trim()}
                className={cn(
                  'h-12 px-4 rounded-[14px] text-[13px] font-bold flex items-center gap-1.5 transition-all active:scale-[0.97] disabled:opacity-50',
                  saved ? 'bg-[#2E5B47] text-white' : 'bg-[#7C3AED] text-white'
                )}
              >
                {saved ? <Check size={15} /> : <Send size={15} />}
                {saved ? 'Sent!' : saving ? '...' : (lang === 'sw' ? 'Tuma' : 'Invite')}
              </button>
            </div>
            <p className="text-[11px] text-[#A0A0A0]">
              {lang === 'sw'
                ? 'Mshirika atapata ufikiaji kamili — kuona na kubadilisha rekodi.'
                : 'Partner will get full access — they can view and edit all records.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
