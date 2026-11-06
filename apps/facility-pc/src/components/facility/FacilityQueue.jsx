import React, { useState } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  Building2,
  UserCheck,
  Stethoscope,
  Filter,
} from 'lucide-react';
import { Button, Input, Badge, Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableRow, TableCell } from '@totoafya/shared-ui';

export default function FacilityQueue({ mothers = [], children = [], onRoutePatient }) {
  const [search, setSearch] = useState('');
  const [selectedStation, setSelectedStation] = useState('all'); // 'all' | 'triage' | 'anc' | 'immunization' | 'nutrition'
  const [routedPatients, setRoutedPatients] = useState({});

  // Prepare active clinic queue from registered mothers and children
  const queuePatients = mothers.map((m, idx) => {
    const isPregnant = m.pregnancy_status === 'pregnant';
    const isHighRisk = m.risk_level === 'high' || m.risk_level === 'critical';
    const defaultStation = isHighRisk ? 'anc' : isPregnant ? 'anc' : 'triage';

    return {
      id: m.id,
      patient_number: `Q-${String(idx + 1).padStart(3, '0')}`,
      name: m.full_name,
      identifier: m.national_id || m.anc_number || 'N/A',
      type: isPregnant ? 'Maternal ANC' : 'Postpartum Mother',
      station: routedPatients[m.id] || defaultStation,
      waitTime: `${10 + (idx * 7) % 35} mins`,
      risk_level: m.risk_level || 'low',
      phone: m.phone,
    };
  });

  const filteredQueue = queuePatients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.identifier.toLowerCase().includes(search.toLowerCase()) ||
      p.patient_number.toLowerCase().includes(search.toLowerCase());

    const matchesStation = selectedStation === 'all' || p.station === selectedStation;
    return matchesSearch && matchesStation;
  });

  const handleStationChange = (patientId, newStation) => {
    setRoutedPatients((prev) => ({ ...prev, [patientId]: newStation }));
    if (onRoutePatient) onRoutePatient(patientId, newStation);
  };

  const stationLabels = {
    triage: 'MCH Triage',
    anc: 'ANC Clinic',
    immunization: 'Immunization Room',
    nutrition: 'Nutrition Desk',
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Cross-Station Patient Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central check-in, triage routing, and station load distribution
          </p>
        </div>

        {/* Station Filter Pills */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
          {['all', 'triage', 'anc', 'immunization', 'nutrition'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStation(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedStation === st
                  ? 'bg-white text-[#006B5F] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? 'All Stations' : stationLabels[st]}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar & Queue Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient or ticket #..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-[#006B5F]"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span>Active Queue: <strong className="text-slate-900">{filteredQueue.length}</strong></span>
          <span>•</span>
          <span>Triage: <strong className="text-[#006B5F]">{queuePatients.filter((p) => p.station === 'triage').length}</strong></span>
          <span>•</span>
          <span>ANC: <strong className="text-teal-700">{queuePatients.filter((p) => p.station === 'anc').length}</strong></span>
          <span>•</span>
          <span>Vaccines: <strong className="text-amber-700">{queuePatients.filter((p) => p.station === 'immunization').length}</strong></span>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Ticket</th>
              <th className="py-3 px-4">Patient Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Risk Triage</th>
              <th className="py-3 px-4">Assigned Station</th>
              <th className="py-3 px-4">Wait Time</th>
              <th className="py-3 px-4 text-right">Route Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredQueue.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                  {p.patient_number}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900">{p.name}</div>
                  <div className="text-[10px] text-slate-400">ID: {p.identifier}</div>
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  {p.type}
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant={p.risk_level === 'high' || p.risk_level === 'critical' ? 'sam' : 'normal'}>
                    {p.risk_level.toUpperCase()}
                  </Badge>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 text-[#006B5F] font-bold text-[11px] border border-teal-200">
                    <Building2 size={12} />
                    <span>{stationLabels[p.station] || p.station}</span>
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500 font-mono">
                  {p.waitTime}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <select
                    value={p.station}
                    onChange={(e) => handleStationChange(p.id, e.target.value)}
                    className="h-8 px-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#006B5F]"
                  >
                    <option value="triage">Route to Triage</option>
                    <option value="anc">Route to ANC</option>
                    <option value="immunization">Route to Vaccines</option>
                    <option value="nutrition">Route to Nutrition</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredQueue.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400">
            No patients currently waiting in this station queue.
          </div>
        )}
      </div>
    </div>
  );
}
