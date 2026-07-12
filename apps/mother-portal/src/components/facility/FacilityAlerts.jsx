import db from '@/api/totoafyaClient';

import React, { useState } from 'react';
import { AlertTriangle, Info, AlertCircle, Check } from 'lucide-react';

const SEVERITY = {
  info:     { icon: Info,          bg: 'bg-[#0047FF]/8',  border: 'border-[#0047FF]/20', text: 'text-[#0047FF]',  badge: 'bg-[#0047FF]/10 text-[#0047FF]' },
  warning:  { icon: AlertTriangle, bg: 'bg-[#F9A825]/8',  border: 'border-[#F9A825]/20', text: 'text-[#F9A825]',  badge: 'bg-[#F9A825]/10 text-[#F9A825]' },
  critical: { icon: AlertCircle,   bg: 'bg-[#E51010]/8',  border: 'border-[#E51010]/20', text: 'text-[#E51010]',  badge: 'bg-[#E51010]/10 text-[#E51010]' },
};

export default function FacilityAlerts({ alerts, onRefresh }) {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [resolving, setResolving] = useState(null);

  const filtered = alerts.filter(a => filterSeverity === 'all' || a.severity === filterSeverity);

  const resolve = async (alertId) => {
    setResolving(alertId);
    await db.entities.AIAlert.update(alertId, { is_resolved: true, resolved_date: new Date().toISOString().split('T')[0] });
    await onRefresh();
    setResolving(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-[#0A0A0A] tracking-[-0.02em]">Active Alerts</h1>
        <p className="text-[14px] text-[#A0A0A0] mt-1">{alerts.length} unresolved alerts</p>
      </div>

      <div className="flex gap-2 mb-5">
        {['all', 'critical', 'warning', 'info'].map(s => (
          <button key={s} onClick={() => setFilterSeverity(s)}
            className={`px-4 py-2 rounded-full text-[12px] font-bold transition-all border-2 ${filterSeverity === s ? 'bg-[#0A0A0A] text-white border-[#0A0A0A]' : 'bg-white text-[#666666] border-[#E5E5E5]'}`}>
            {s === 'all' ? `All (${alerts.length})` :
             s === 'critical' ? `Critical (${alerts.filter(a => a.severity === 'critical').length})` :
             s === 'warning' ? `Warning (${alerts.filter(a => a.severity === 'warning').length})` :
             `Info (${alerts.filter(a => a.severity === 'info').length})`}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map(alert => {
          const cfg = SEVERITY[alert.severity] || SEVERITY.info;
          const Icon = cfg.icon;
          return (
            <div key={alert.id} className={`${cfg.bg} border ${cfg.border} rounded-[16px] p-5 flex items-start gap-4`}>
              <div className={`w-9 h-9 rounded-[10px] ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} className={cfg.text} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${cfg.badge}`}>{alert.severity}</span>
                  <span className="text-[10px] text-[#A0A0A0] font-medium px-2 py-0.5 bg-white/60 rounded-full">{alert.alert_type?.replace('_', ' ')}</span>
                  {!alert.is_read && <span className="text-[10px] font-bold px-2 py-0.5 bg-[#0047FF]/10 text-[#0047FF] rounded-full">Unread</span>}
                </div>
                <p className="text-[14px] font-bold text-[#0A0A0A]">{alert.title}</p>
                <p className="text-[13px] text-[#666666] mt-0.5 leading-snug">{alert.message}</p>
                <p className="text-[11px] text-[#A0A0A0] mt-2">{new Date(alert.created_date).toLocaleString()}</p>
              </div>
              <button
                onClick={() => resolve(alert.id)}
                disabled={resolving === alert.id}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-[#E5E5E5] rounded-[10px] text-[12px] font-semibold text-[#666666] hover:bg-[#F5F5F7] transition-colors flex-shrink-0 disabled:opacity-50">
                <Check size={13} />
                {resolving === alert.id ? 'Resolving...' : 'Resolve'}
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-12 text-center">
            <p className="text-[32px] mb-3">✅</p>
            <p className="text-[15px] font-bold text-[#0A0A0A]">No active alerts</p>
            <p className="text-[13px] text-[#A0A0A0] mt-1">All clear — no unresolved alerts at this time</p>
          </div>
        )}
      </div>
    </div>
  );
}
