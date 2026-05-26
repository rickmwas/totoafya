import React, { useState } from 'react';
import { Send, AlertCircle, Clock, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';
import db from '@/api/totoafyaClient';
import { useToast } from '@/components/ui/use-toast';

const SEVERITY_METRICS = {
  low: { label: 'Low', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: HelpCircle },
  medium: { label: 'Medium', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle },
  high: { label: 'High', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertCircle },
  critical: { label: 'Critical', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertOctagon },
};

const STATUS_METRICS = {
  open: { label: 'Open', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Clock },
  in_progress: { label: 'Investigating', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
};

export default function FacilityDeveloperDesk({ concerns, facilityId, onRefresh }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('medium');

  const handleSubmitConcern = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      toast({
        title: 'Validation Error',
        description: 'Please provide both a summary title and detailed description.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await db.entities.DeveloperConcern.create({
        facility_id: facilityId,
        title,
        description,
        severity,
        status: 'open',
      });

      toast({
        title: 'Ticket Raised Successfully',
        description: 'Your concern has been dispatched directly to the engineering team.',
      });

      // Clear form
      setTitle('');
      setDescription('');
      setSeverity('medium');

      // Refresh list
      onRefresh();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Submission Error',
        description: err.message || 'Could not submit your concern.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-[#0A0A0A] tracking-[-0.02em]">Developer Support Desk</h1>
        <p className="text-[14px] text-[#A0A0A0] mt-1">
          Raise operational concerns, report interface bugs, or submit system feedback directly to the engineering team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Previous Concerns list */}
        <div className="lg:col-span-7 flex flex-col gap-4 order-2 lg:order-1">
          <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-5 shadow-card">
            <h2 className="text-[16px] font-bold text-[#0A0A0A] mb-4">Support History ({concerns.length})</h2>
            
            <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
              {concerns.map((c) => {
                const sev = SEVERITY_METRICS[c.severity] || SEVERITY_METRICS.medium;
                const stat = STATUS_METRICS[c.status] || STATUS_METRICS.open;
                const SevIcon = sev.icon;
                const StatIcon = stat.icon;

                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-[16px] border border-[#E5E5E5] hover:border-[#CCCCCC] transition-all bg-[#F5F5F7]/30 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-bold text-[#0A0A0A] leading-snug break-words">
                          {c.title}
                        </h3>
                        <p className="text-[11px] text-[#A0A0A0] mt-0.5">
                          Ticket ID: <span className="font-mono">{c.id?.slice(0, 8)}</span> • {c.created_date ? new Date(c.created_date).toLocaleString() : 'Just now'}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 flex-shrink-0">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${sev.color}`}>
                          <SevIcon size={10} /> {sev.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${stat.color}`}>
                          <StatIcon size={10} /> {stat.label}
                        </span>
                      </div>
                    </div>

                    <p className="text-[13px] text-[#555555] leading-relaxed break-words whitespace-pre-wrap">
                      {c.description}
                    </p>
                  </div>
                );
              })}

              {concerns.length === 0 && (
                <div className="py-12 border border-dashed border-[#E5E5E5] rounded-[16px] flex flex-col items-center justify-center text-center px-4">
                  <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#A0A0A0] mb-3">
                    <CheckCircle2 size={20} />
                  </div>
                  <p className="text-[13px] font-semibold text-[#0A0A0A]">No open developer concerns</p>
                  <p className="text-[11px] text-[#A0A0A0] mt-0.5">Everything looks quiet. Let us know if you run into any system issues!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Raise Concern form */}
        <div className="lg:col-span-5 order-1 lg:order-2">
          <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-5 shadow-card sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#0047FF]/10 text-[#0047FF] flex items-center justify-center">
                <AlertCircle size={16} />
              </div>
              <h2 className="text-[16px] font-bold text-[#0A0A0A]">Raise a Concern</h2>
            </div>

            <form onSubmit={handleSubmitConcern} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Summary Topic *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Immunization reports fail to download as PDF"
                  className="h-11 px-3.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#0047FF] focus:bg-white transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Detailed Description *</label>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide step-by-step description of what happened, error messages, and context so the developers can resolve it quickly."
                  className="p-3.5 bg-[#F5F5F7] border border-[#E5E5E5] rounded-[12px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:border-[#0047FF] focus:bg-white resize-none transition-all leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.15em] font-bold uppercase text-[#A0A0A0]">Severity Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {['low', 'medium', 'high', 'critical'].map((s) => {
                    const active = severity === s;
                    const sevColor = active
                      ? s === 'low'
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                        : s === 'medium'
                        ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                        : s === 'high'
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-rose-500 text-white border-rose-500 shadow-sm'
                      : 'bg-white border-[#E5E5E5] text-[#666666] hover:bg-[#F5F5F7]';
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSeverity(s)}
                        className={`h-9 border text-[11px] font-bold rounded-[8px] transition-all capitalize ${sevColor}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-2 bg-[#0047FF] hover:bg-[#003CE5] disabled:opacity-50 active:scale-[0.98] transition-all text-white text-[14px] font-bold rounded-[12px] flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={14} /> Submit Ticket
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
