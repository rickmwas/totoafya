import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = ['#2E5B47', '#2E5B47', '#F9A825', '#E51010', '#7C3AED'];

export default function FacilityAnalytics({ data }) {
  const { mothers, children, immunizations, growthRecords } = data;

  // Risk distribution
  const riskData = ['low', 'medium', 'high', 'critical'].map(r => ({
    name: r.charAt(0).toUpperCase() + r.slice(1),
    value: mothers.filter(m => m.risk_level === r).length,
  })).filter(d => d.value > 0);

  // Vaccine status distribution
  const vaccineData = ['given', 'scheduled', 'due', 'overdue', 'missed'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    count: immunizations.filter(i => i.status === s).length,
  }));

  // Registrations by county
  const countyMap = {};
  mothers.forEach(m => { if (m.county) countyMap[m.county] = (countyMap[m.county] || 0) + 1; });
  const countyData = Object.entries(countyMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  // Nutrition status
  const nutritionMap = {};
  growthRecords.forEach(g => { if (g.nutrition_status) nutritionMap[g.nutrition_status] = (nutritionMap[g.nutrition_status] || 0) + 1; });
  const nutritionData = Object.entries(nutritionMap).map(([name, value]) => ({ name, value }));

  // Pregnancy status
  const pregnancyData = ['pregnant', 'postpartum', 'not_pregnant'].map(s => ({
    name: s.replace('_', ' '),
    value: mothers.filter(m => m.pregnancy_status === s).length,
  })).filter(d => d.value > 0);

  // Children by gender
  const genderData = [
    { name: 'Male', value: children.filter(c => c.gender === 'male').length },
    { name: 'Female', value: children.filter(c => c.gender === 'female').length },
  ].filter(d => d.value > 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold text-[#0A0A0A] tracking-[-0.02em]">Analytics</h1>
        <p className="text-[14px] text-[#A0A0A0] mt-1">Population health insights across all registered patients</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Vaccine Status */}
        <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-6 shadow-card">
          <h3 className="text-[14px] font-bold text-[#0A0A0A] mb-4">Vaccine Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={vaccineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#2E5B47" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-6 shadow-card">
          <h3 className="text-[14px] font-bold text-[#0A0A0A] mb-4">Mother Risk Distribution</h3>
          {riskData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={riskData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {riskData.map((_, i) => <Cell key={i} fill={['#2E5B47', '#F9A825', '#E51010', '#7C3AED'][i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-[13px] text-[#A0A0A0] text-center py-16">No data yet</p>}
        </div>

        {/* County distribution */}
        <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-6 shadow-card">
          <h3 className="text-[14px] font-bold text-[#0A0A0A] mb-4">Registrations by County</h3>
          {countyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={countyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
                <Tooltip />
                <Bar dataKey="count" fill="#2E5B47" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-[13px] text-[#A0A0A0] text-center py-16">No data yet</p>}
        </div>

        {/* Nutrition Status */}
        <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-6 shadow-card">
          <h3 className="text-[14px] font-bold text-[#0A0A0A] mb-4">Child Nutrition Status</h3>
          {nutritionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={nutritionData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {nutritionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-[13px] text-[#A0A0A0] text-center py-16">No growth records yet</p>}
        </div>

        {/* Pregnancy Status + Gender side by side */}
        <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-6 shadow-card">
          <h3 className="text-[14px] font-bold text-[#0A0A0A] mb-4">Pregnancy Status</h3>
          {pregnancyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pregnancyData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pregnancyData.map((_, i) => <Cell key={i} fill={['#2E5B47', '#2E5B47', '#A0A0A0'][i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-[13px] text-[#A0A0A0] text-center py-16">No data yet</p>}
        </div>

        <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-6 shadow-card">
          <h3 className="text-[14px] font-bold text-[#0A0A0A] mb-4">Children by Gender</h3>
          {genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {genderData.map((_, i) => <Cell key={i} fill={['#2E5B47', '#D946A8'][i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-[13px] text-[#A0A0A0] text-center py-16">No children yet</p>}
        </div>
      </div>
    </div>
  );
}
