import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  Scale,
  Plus,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { dataClient } from '@totoafya/api-client';
import { classifyNutritionStatus, getClosestWhoWeight } from '@totoafya/business-logic';
import { Button, Input, Badge, Card, Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@totoafya/shared-ui';

export default function GrowthMonitoring({ child, nurse, facility, onUpdated }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Measurement Form State
  const [recordedDate, setRecordedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [muacCm, setMuacCm] = useState('');
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (child?.id) {
      loadGrowthRecords();
    }
  }, [child?.id]);

  const loadGrowthRecords = async () => {
    setLoading(true);
    try {
      const list = await dataClient.growthRecords.filter(
        { child_id: child.id },
        '-recorded_date',
        20
      );
      setRecords(list);
    } catch (err) {
      console.error('Failed to load growth records', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate age in months
  const calculateAgeMonths = (dateStr) => {
    if (!child?.date_of_birth) return 0;
    const dob = new Date(child.date_of_birth);
    const rec = new Date(dateStr || new Date());
    const diffMonths = (rec.getFullYear() - dob.getFullYear()) * 12 + (rec.getMonth() - dob.getMonth());
    return Math.max(0, diffMonths);
  };

  // Live nutritional classification based on entered values
  const currentAgeMonths = calculateAgeMonths(recordedDate);
  const liveStatus = classifyNutritionStatus(
    weightKg ? parseFloat(weightKg) : null,
    currentAgeMonths,
    muacCm ? parseFloat(muacCm) : null
  );

  const handleSaveMeasurement = async (e) => {
    e?.preventDefault();
    if (!weightKg && !muacCm) {
      setError('Please provide at least Weight (kg) or MUAC (cm)');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        child_id: child.id,
        recorded_date: recordedDate,
        age_months: currentAgeMonths,
        weight_kg: weightKg ? parseFloat(weightKg) : undefined,
        height_cm: heightCm ? parseFloat(heightCm) : undefined,
        muac_cm: muacCm ? parseFloat(muacCm) : undefined,
        head_circumference_cm: headCircumferenceCm ? parseFloat(headCircumferenceCm) : undefined,
        nutrition_status: liveStatus,
        recorded_by: nurse?.full_name || 'Nurse Joy Wambui',
        facility: facility?.name || 'Local Hospital',
        notes: notes || undefined,
      };

      await dataClient.growthRecords.create(payload);

      // Reset form and reload
      setWeightKg('');
      setHeightCm('');
      setMuacCm('');
      setHeadCircumferenceCm('');
      setNotes('');
      setShowAddForm(false);

      await loadGrowthRecords();
      if (onUpdated) onUpdated();
    } catch (err) {
      setError(err.message || 'Failed to record growth measurement');
    } finally {
      setSubmitting(false);
    }
  };

  if (!child) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
        <Scale className="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-bold text-slate-700">No Child Record Selected</p>
        <p className="text-xs text-slate-500 mt-1">
          Select an infant to track weight, height, and MUAC nutritional status.
        </p>
      </div>
    );
  }

  const latestRecord = records[0];

  return (
    <div className="space-y-5">
      {/* Overview & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-[#006B5F] flex items-center justify-center font-bold">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-extrabold text-[#0A0A0A]">
                Growth & Nutrition Assessment
              </h4>
              {latestRecord && (
                <Badge
                  status={latestRecord.nutrition_status || 'normal'}
                  size="sm"
                />
              )}
            </div>
            <p className="text-xs text-[#6B7280] mt-0.5">
              WHO Growth Standards • Weight, Height, and Mid-Upper Arm Circumference (MUAC)
            </p>
          </div>
        </div>

        <Button
          variant={showAddForm ? 'outline' : 'primary'}
          size="md"
          icon={showAddForm ? undefined : Plus}
          onClick={() => setShowAddForm((v) => !v)}
        >
          {showAddForm ? 'Close Measurement Form' : 'Add Measurement'}
        </Button>
      </div>

      {/* Add Measurement Modal / Card */}
      {showAddForm && (
        <Card className="border-teal-200 bg-teal-50/10 p-5">
          <form onSubmit={handleSaveMeasurement} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
              <h4 className="text-sm font-bold text-[#0A0A0A] uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#006B5F]" />
                <span>Record New Measurement</span>
              </h4>
              <span className="text-xs text-slate-500">
                Child Age: <strong>{currentAgeMonths} Months</strong>
              </span>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-[#DC2626]">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Recorded Date
                </label>
                <input
                  type="date"
                  value={recordedDate}
                  onChange={(e) => setRecordedDate(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-semibold outline-none focus:border-[#006B5F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.05"
                  placeholder="e.g. 7.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-[#006B5F]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  Height / Length (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="e.g. 65"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-medium text-slate-900 outline-none focus:border-[#006B5F]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                  MUAC (cm) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 13.5"
                  value={muacCm}
                  onChange={(e) => setMuacCm(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#D1D5DB] rounded-lg text-sm font-bold text-slate-900 outline-none focus:border-[#006B5F]"
                />
              </div>
            </div>

            {/* Real-time Nutritional Classification Feedback */}
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-slate-600">WHO Nutrition Evaluation:</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  MUAC: &lt;11.5cm (SAM), 11.5-12.4cm (MAM), &ge;12.5cm (Normal)
                </p>
              </div>
              <Badge status={liveStatus} size="md" />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                Feeding & Growth Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Exclusive breastfeeding status, complementary feeding remarks..."
                className="w-full p-2.5 bg-white border border-[#D1D5DB] rounded-lg text-xs text-slate-800 outline-none focus:border-[#006B5F]"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowAddForm(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submitting}
                icon={Save}
              >
                Save Measurement
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Historical Measurements Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Weight (kg)</TableHead>
              <TableHead>Height (cm)</TableHead>
              <TableHead>MUAC (cm)</TableHead>
              <TableHead>WHO Nutrition Status</TableHead>
              <TableHead>Recorded By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((rec) => (
              <TableRow key={rec.id}>
                <TableCell className="font-bold text-slate-900 whitespace-nowrap">
                  {rec.recorded_date}
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  {rec.age_months ? `${rec.age_months} Mos` : '—'}
                </TableCell>
                <TableCell className="font-extrabold text-[#006B5F]">
                  {rec.weight_kg ? `${rec.weight_kg} kg` : '—'}
                </TableCell>
                <TableCell className="text-slate-700">
                  {rec.height_cm ? `${rec.height_cm} cm` : '—'}
                </TableCell>
                <TableCell className="font-bold text-slate-800">
                  {rec.muac_cm ? `${rec.muac_cm} cm` : '—'}
                </TableCell>
                <TableCell>
                  <Badge status={rec.nutrition_status || 'normal'} size="sm" />
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {rec.recorded_by || 'Nurse'}
                </TableCell>
              </TableRow>
            ))}

            {records.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                  No growth records logged yet for this infant. Click "+ Add Measurement" above.
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
