import React, { useState, useEffect } from 'react';
import {
  Syringe,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Save,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { dataClient } from '@totoafya/api-client';
import { KENYA_VACCINE_SCHEDULE } from '@totoafya/business-logic';
import { Button, Badge, Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@totoafya/shared-ui';

export default function ImmunizationTracker({ child, nurse, facility, onUpdated }) {
  const [immunizations, setImmunizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [administeringVaccine, setAdministeringVaccine] = useState(null);
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (child?.id) {
      loadImmunizations();
    }
  }, [child?.id]);

  const loadImmunizations = async () => {
    setLoading(true);
    try {
      const records = await dataClient.immunizations.filter(
        { child_id: child.id },
        'scheduled_date',
        50
      );
      setImmunizations(records);
    } catch (err) {
      console.error('Failed to load immunizations', err);
    } finally {
      setLoading(false);
    }
  };

  const getRecordForSchedule = (schedItem) => {
    return immunizations.find(
      (im) =>
        im.vaccine_name?.toLowerCase().includes(schedItem.name.toLowerCase()) ||
        schedItem.name.toLowerCase().includes(im.vaccine_name?.toLowerCase() || '')
    );
  };

  const calculateDoseDate = (ageWeeks) => {
    if (!child?.date_of_birth) return '—';
    const dob = new Date(child.date_of_birth);
    const target = new Date(dob.getTime() + ageWeeks * 7 * 86400000);
    return target.toISOString().split('T')[0];
  };

  const handleAdministerClick = (schedItem, existingRecord) => {
    setAdministeringVaccine({ schedItem, existingRecord });
    setBatchNumber(existingRecord?.batch_number || `LOT-${Math.floor(100000 + Math.random() * 900000)}`);
    setNotes(existingRecord?.notes || 'Administered intramuscularly/orally per KEPI protocol');
  };

  const handleSaveAdministration = async () => {
    if (!administeringVaccine) return;
    setSubmitting(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        child_id: child.id,
        vaccine_name: administeringVaccine.schedItem.name,
        age_weeks: administeringVaccine.schedItem.age_weeks,
        scheduled_date: calculateDoseDate(administeringVaccine.schedItem.age_weeks),
        given_date: today,
        status: 'given',
        dose_number: 1,
        facility: facility?.name || 'Local Hospital',
        administered_by: nurse?.full_name || 'Nurse Joy Wambui',
        batch_number: batchNumber,
        notes: notes,
      };

      if (administeringVaccine.existingRecord?.id) {
        await dataClient.immunizations.update(
          administeringVaccine.existingRecord.id,
          payload
        );
      } else {
        await dataClient.immunizations.create(payload);
      }

      await loadImmunizations();
      if (onUpdated) onUpdated();
      setAdministeringVaccine(null);
    } catch (err) {
      alert('Failed to save vaccine administration: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!child) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
        <Syringe className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-bold text-slate-700">No Child Record Linked</p>
        <p className="text-xs text-slate-500 mt-1">
          Immunization schedules apply to registered infants and newborns.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#F0FAF5] rounded-xl border border-[#A3E0BF]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#006B5F] text-white flex items-center justify-center font-bold">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0A0A0A]">
              Kenya Expanded Programme on Immunization (KEPI)
            </h4>
            <p className="text-xs text-[#0E6835]">
              National Child Immunization Schedule for {child.full_name} (DOB: {child.date_of_birth || 'N/A'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span>Administered:</span>
          <Badge status="healthy" size="sm">
            {immunizations.filter((i) => i.status === 'given').length} / {KENYA_VACCINE_SCHEDULE.length} Doses
          </Badge>
        </div>
      </div>

      {/* KEPI Schedule Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Target Age</TableHead>
              <TableHead>Antigen / Vaccine Dose</TableHead>
              <TableHead>Protection / Disease</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Clinical Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {KENYA_VACCINE_SCHEDULE.map((item, idx) => {
              const record = getRecordForSchedule(item);
              const isGiven = record?.status === 'given';
              const dueDate = calculateDoseDate(item.age_weeks);
              const isPastDue = !isGiven && dueDate !== '—' && new Date(dueDate) < new Date();

              const statusBadge = isGiven ? (
                <Badge status="given" size="sm">
                  Given ({record.given_date})
                </Badge>
              ) : isPastDue ? (
                <Badge status="overdue" size="sm">
                  Overdue
                </Badge>
              ) : (
                <Badge status="due" size="sm">
                  Due ({dueDate})
                </Badge>
              );

              return (
                <TableRow key={idx}>
                  <TableCell className="font-bold text-slate-900 whitespace-nowrap">
                    {item.age_weeks === 0
                      ? 'Birth'
                      : item.age_weeks >= 52
                      ? `${Math.round(item.age_weeks / 4.3)} Months`
                      : `${item.age_weeks} Weeks`}
                  </TableCell>
                  <TableCell className="font-extrabold text-[#006B5F]">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-xs">
                    {item.description}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-mono whitespace-nowrap">
                    {dueDate}
                  </TableCell>
                  <TableCell>{statusBadge}</TableCell>
                  <TableCell className="text-right">
                    {isGiven ? (
                      <span className="text-xs font-bold text-[#0E6835] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Logged
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAdministerClick(item, record)}
                        icon={Syringe}
                      >
                        Administer
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Administer Vaccine Modal */}
      {administeringVaccine && (
        <div className="fixed inset-0 z-50 bg-[#0A0A0A]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-[#006B5F]" />
                <h4 className="text-base font-bold text-[#0A0A0A]">
                  Administer Vaccine Dose
                </h4>
              </div>
              <button
                onClick={() => setAdministeringVaccine(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200">
                <p className="text-xs font-bold uppercase tracking-wider text-[#006B5F]">
                  Selected Vaccine
                </p>
                <p className="text-base font-extrabold text-[#0A0A0A] mt-0.5">
                  {administeringVaccine.schedItem.name}
                </p>
                <p className="text-xs text-slate-600">
                  {administeringVaccine.schedItem.description}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Vaccine Batch / Lot Number *
                </label>
                <input
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="e.g. LOT-449102"
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-mono outline-none focus:border-[#006B5F]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Administering Clinician
                </label>
                <input
                  type="text"
                  disabled
                  value={`${nurse?.full_name || 'Nurse Joy Wambui'} (${facility?.name || 'Hospital'})`}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">
                  Clinical Administration Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D1D5DB] rounded-lg text-xs text-slate-800 outline-none focus:border-[#006B5F]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <Button
                variant="outline"
                size="md"
                onClick={() => setAdministeringVaccine(null)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={submitting}
                onClick={handleSaveAdministration}
                icon={ShieldCheck}
              >
                Confirm Dose Given
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
