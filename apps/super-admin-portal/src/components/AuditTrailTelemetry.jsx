import React, { useState } from 'react';
import {
  Shield,
  Search,
  Filter,
  Clock,
  User,
  Building2,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lock,
} from 'lucide-react';
import { Badge, Input, Button } from '@totoafya/shared-ui';

const MOCK_AUDIT_LOGS = [
  {
    id: 'audit-01',
    event: 'STAFF_INVITATION_SENT',
    actor: 'Dr. Evans Ochieng (Super Admin)',
    facility: 'Kenyatta National Hospital',
    details: 'Tokenized invite issued for Nurse Faith Chemutai (MCH Triage)',
    severity: 'info',
    timestamp: '2026-11-06 17:42:10 UTC',
    ip_address: '197.232.14.88',
  },
  {
    id: 'audit-02',
    event: 'PREECLAMPSIA_EMERGENCY_ALERT',
    actor: 'Clinical Rule Engine (Edge Function)',
    facility: 'Pumwani Maternity Hospital',
    details: 'Severe preeclampsia flagged: BP 152/98 mmHg for patient Amina Mwangi',
    severity: 'critical',
    timestamp: '2026-11-06 16:30:22 UTC',
    ip_address: '10.0.12.4',
  },
  {
    id: 'audit-03',
    event: 'FACILITY_PROVISIONED',
    actor: 'Evans Ochieng (MOH Admin)',
    facility: 'Kilifi County Referral Hospital',
    details: 'New facility registered: Code MFL-11500 (Level 4)',
    severity: 'info',
    timestamp: '2026-11-06 14:15:00 UTC',
    ip_address: '197.232.14.88',
  },
  {
    id: 'audit-04',
    event: 'M_PESA_STK_CALLBACK_VERIFIED',
    actor: 'Safaricom Daraja Gateway',
    facility: 'TotoAfya Digital Cloud',
    details: 'Receipt QK982144 completed for KES 150 (30-day Premium B2C)',
    severity: 'info',
    timestamp: '2026-11-06 13:08:44 UTC',
    ip_address: '196.201.214.20',
  },
  {
    id: 'audit-05',
    event: 'MUTATION_OUTBOX_BATCH_SYNC',
    actor: 'Nurse Joy Wambui (Tablet Client)',
    facility: 'Pumwani Maternity Hospital',
    details: '24 offline vaccination and ANC records synced to Supabase cluster',
    severity: 'info',
    timestamp: '2026-11-06 11:45:19 UTC',
    ip_address: '10.0.14.12',
  },
  {
    id: 'audit-06',
    event: 'SECURITY_PIN_AUTH_FAILURE',
    actor: 'Caregiver Portal (National ID: 31908472)',
    facility: 'TotoAfya Web Client',
    details: '3 consecutive invalid PIN attempts from device iPhone15,2',
    severity: 'warning',
    timestamp: '2026-11-06 09:22:04 UTC',
    ip_address: '105.161.44.120',
  },
];

export default function AuditTrailTelemetry() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    const matchesSearch =
      log.event.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.facility.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Audit Trail & System Telemetry
            </h1>
            <Badge variant="secondary">IMMUTABLE</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographic ledger of administrative actions, clinical alerts, and authentication events
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
          {['all', 'info', 'warning', 'critical'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                severityFilter === sev
                  ? 'bg-white text-[#006B5F] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sev.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event, actor, facility, or IP address..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-[#006B5F]"
          />
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Showing <strong>{filteredLogs.length}</strong> audited events
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Event & Severity</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Facility</th>
              <th className="py-3 px-4">Payload Details</th>
              <th className="py-3 px-4">Timestamp (UTC)</th>
              <th className="py-3 px-4 text-right">Source IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{log.event}</span>
                    <Badge variant={log.severity === 'critical' ? 'sam' : log.severity === 'warning' ? 'mam' : 'normal'}>
                      {log.severity.toUpperCase()}
                    </Badge>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-700">
                  {log.actor}
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  {log.facility}
                </td>
                <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={log.details}>
                  {log.details}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-500">
                  {log.timestamp}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                  {log.ip_address}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No audit records match the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
}
