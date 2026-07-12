import db from '@/api/totoafyaClient';

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Heart, Shield, TrendingUp, Wifi, Brain, Lock, Users, Globe, ChevronRight } from 'lucide-react';

const IMAGES = {
  motherBaby: 'https://media.db.com/images/public/69c4579d9f4908700d8b0fc9/f21df2103_generated_image.png',
  chw: 'https://media.db.com/images/public/69c4579d9f4908700d8b0fc9/b61d8a101_generated_image.png',
  nurse: 'https://media.db.com/images/public/69c4579d9f4908700d8b0fc9/634f1328b_generated_image.png',
  aiTech: 'https://media.db.com/images/public/69c4579d9f4908700d8b0fc9/a76eaca8f_generated_image.png',
  children: 'https://media.db.com/images/public/69c4579d9f4908700d8b0fc9/7440babc4_generated_image.png',
  phoneApp: 'https://media.db.com/images/public/69c4579d9f4908700d8b0fc9/de4e77bf3_generated_image.png',
};

const handlePrint = () => window.print();

export default function PitchDeck() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        @page { size: A4 landscape; margin: 0; }
        @media print {
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .slide { page-break-after: always; break-after: page; min-height: 100vh; }
        }
        .slide { font-family: 'Inter', sans-serif; }
        .hero-text-shadow { text-shadow: 0 2px 40px rgba(0,0,0,0.4); }
        .card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.12); }
        .gradient-text-blue { background: linear-gradient(90deg, #4DA3FF, #ffffff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .gradient-text-green { background: linear-gradient(90deg, #52D9A0, #ffffff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* ── Toolbar ── */}
      <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#E5E5E5] px-5 py-3 flex items-center justify-between shadow-sm">
        <Link to="/" className="flex items-center gap-2 text-[#666] hover:text-[#0A0A0A] text-[13px] font-semibold transition-colors">
          <ArrowLeft size={16} /> Back to App
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[8px] bg-[#0047FF] flex items-center justify-center shadow-sm">
            <Heart size={13} className="text-white" fill="white" />
          </div>
          <span className="text-[13px] font-bold text-[#0A0A0A]">TotoAfya Digital · Investor Deck 2026</span>
        </div>
        <button onClick={handlePrint}
          className="flex items-center gap-2 bg-[#0047FF] text-white px-5 py-2.5 rounded-full text-[13px] font-bold shadow-[0_4px_14px_rgba(0,71,255,0.35)] hover:shadow-[0_6px_24px_rgba(0,71,255,0.45)] hover:-translate-y-0.5 transition-all">
          <Download size={14} /> Download PDF
        </button>
      </div>

      <div className="pt-[52px]">

        {/* ════════════════════════
            SLIDE 1 — COVER
        ════════════════════════ */}
        <div className="slide relative w-full min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #001060 0%, #0047FF 60%, #0A2AE0 100%)' }}>
          {/* Background image with overlay */}
          <div className="absolute inset-0">
            <img src={IMAGES.motherBaby} alt="" className="w-full h-full object-cover opacity-25" style={{ objectPosition: 'center top' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,16,96,0.85) 0%, rgba(0,71,255,0.7) 100%)' }} />
          </div>

          {/* Decorative circles */}
          <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute top-[-50px] right-[-50px] w-[350px] h-[350px] rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full border border-white/10 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 py-20 text-center max-w-4xl mx-auto">
            {/* Logo badge */}
            <div className="flex items-center gap-3 mb-10 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-3 rounded-full">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Heart size={15} className="text-white" fill="white" />
              </div>
              <span className="text-white/90 text-[13px] font-bold tracking-[0.08em]">TOTOAFYA DIGITAL HEALTH</span>
            </div>

            <h1 className="text-[48px] sm:text-[68px] font-black text-white leading-[1.0] tracking-[-0.035em] mb-6 hero-text-shadow">
              The Digital Health<br />
              Companion Every<br />
              <span className="gradient-text-blue">Kenyan Mother</span><br />
              Deserves.
            </h1>

            <p className="text-[18px] text-white/65 leading-relaxed max-w-2xl mb-10">
              AI-powered maternal & child health tracking. Works offline. Bilingual. Free for caregivers.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-14">
              {['🇰🇪 Built for Kenya', '⚡ Works on 2G', '🤖 AI-Powered', '🌍 WHO Aligned', '💬 EN + Swahili'].map(t => (
                <span key={t} className="px-4 py-2 rounded-full bg-white/12 border border-white/20 text-white text-[12px] font-semibold backdrop-blur">
                  {t}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 text-white/35 text-[12px]">
              <span>Investor Deck · May 2026</span>
              <span className="hidden sm:block">·</span>
              <span>Confidential & Proprietary</span>
              <span className="hidden sm:block">·</span>
              <span>contact@totoafya.digital</span>
            </div>
          </div>

          {/* Slide number */}
          <div className="absolute bottom-6 right-8 text-white/25 text-[11px] font-bold tracking-widest">01 / 10</div>
        </div>

        {/* ════════════════════════
            SLIDE 2 — THE PROBLEM
        ════════════════════════ */}
        <div className="slide relative w-full min-h-screen overflow-hidden bg-[#080810]">
          <div className="absolute right-0 top-0 w-1/2 h-full">
            <img src={IMAGES.chw} alt="Community health worker in rural Kenya" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #080810 30%, transparent 100%)' }} />
          </div>

          <div className="relative z-10 flex flex-col justify-center min-h-screen px-8 sm:px-16 py-20 max-w-5xl">
            <span className="inline-block text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#E51010]/70 mb-4">02 — The Problem</span>
            <h2 className="text-[38px] sm:text-[54px] font-black text-white leading-[1.05] tracking-[-0.03em] mb-4 max-w-2xl">
              Kenyan mothers are dying<br />from <span className="text-[#E51010]">preventable causes.</span>
            </h2>
            <p className="text-[15px] text-white/45 mb-12 max-w-lg leading-relaxed">
              The warning signs exist. The interventions exist. The tragedy is that nobody sees the data in time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              {[
                { value: '362', unit: 'deaths', label: 'per 100,000 live births', sub: 'Kenya maternal mortality rate', color: '#E51010', icon: '🩸' },
                { value: '1 in 3', unit: '', label: 'children miss a vaccine', sub: 'KEPI coverage data 2024', color: '#F9A825', icon: '💉' },
                { value: '67%', unit: '', label: 'CHVs have no digital tool', sub: 'Kenya MoH survey', color: '#A0A0A0', icon: '📵' },
              ].map(s => (
                <div key={s.label} className="rounded-[22px] p-6 border border-white/8 backdrop-blur-sm"
                  style={{ background: `linear-gradient(135deg, ${s.color}12, ${s.color}06)` }}>
                  <span className="text-3xl mb-3 block">{s.icon}</span>
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-[44px] font-black leading-none" style={{ color: s.color }}>{s.value}</span>
                    {s.unit && <span className="text-white/40 text-[14px] mb-1">{s.unit}</span>}
                  </div>
                  <p className="text-[13px] font-bold text-white mb-1">{s.label}</p>
                  <p className="text-[11px] text-white/35">{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { icon: '📡', text: 'No connectivity in rural areas' },
                { icon: '📋', text: 'Paper records lost in transit' },
                { icon: '⏰', text: 'Danger signs detected too late' },
              ].map(c => (
                <div key={c.text} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/10 bg-white/5 text-[12px] text-white/60 font-medium">
                  <span>{c.icon}</span>{c.text}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-6 right-8 text-white/20 text-[11px] font-bold tracking-widest">02 / 10</div>
        </div>

        {/* ════════════════════════
            SLIDE 3 — SOLUTION
        ════════════════════════ */}
        <div className="slide relative w-full min-h-screen overflow-hidden bg-white">
          {/* Top strip image */}
          <div className="absolute top-0 left-0 right-0 h-[45%]">
            <img src={IMAGES.phoneApp} alt="TotoAfya app" className="w-full h-full object-cover object-center opacity-90" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, #ffffff 100%)' }} />
          </div>

          <div className="relative z-10 flex flex-col justify-end min-h-screen px-8 sm:px-16 pb-14 pt-[48vh]">
            <div className="max-w-5xl mx-auto w-full">
              <span className="inline-block text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#0047FF]/60 mb-4">03 — The Solution</span>
              <h2 className="text-[36px] sm:text-[50px] font-black text-[#0A0A0A] leading-tight tracking-[-0.03em] mb-3">
                TotoAfya bridges the gap<br /><span className="text-[#0047FF]">between care and caregivers.</span>
              </h2>
              <p className="text-[15px] text-[#666] mb-10 max-w-2xl leading-relaxed">
                One platform for mothers, nurses, CHVs, and facilities — working even without internet, in English and Swahili.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { icon: '🤰', title: 'Pregnancy Tracker', color: '#0047FF', desc: 'Week-by-week fetal development & danger sign monitoring' },
                  { icon: '💉', title: 'Vaccine Scheduler', color: '#2E7A5D', desc: 'Auto-generated KEPI schedule from date of birth' },
                  { icon: '📈', title: 'Growth Charts', color: '#F9A825', desc: 'WHO reference curves, MAM/SAM malnutrition flags' },
                  { icon: '🤖', title: 'AI Assistant', color: '#7C3AED', desc: 'Bilingual chatbot with full patient context' },
                ].map(f => (
                  <div key={f.title} className="rounded-[20px] p-5 border-2 card-hover cursor-default"
                    style={{ borderColor: `${f.color}20`, background: `linear-gradient(135deg, ${f.color}08, ${f.color}03)` }}>
                    <span className="text-3xl">{f.icon}</span>
                    <p className="text-[13px] font-extrabold mt-3 mb-1" style={{ color: f.color }}>{f.title}</p>
                    <p className="text-[11px] text-[#666] leading-snug">{f.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[18px] p-5 flex items-center gap-5 border border-[#0047FF]/15 bg-[#0047FF]/4">
                <div className="w-12 h-12 rounded-[14px] bg-[#0047FF] flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(0,71,255,0.3)]">
                  <Wifi size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-extrabold text-[#0A0A0A]">AMHSE — Offline-First Sync Engine (Patent Pending)</p>
                  <p className="text-[12px] text-[#666]">Internet → SMS → USSD fallback. Zero data loss. Critical patients synced in &lt;15 minutes.</p>
                </div>
                <span className="flex-shrink-0 px-3 py-1.5 bg-[#0047FF]/10 text-[#0047FF] text-[10px] font-extrabold rounded-full border border-[#0047FF]/20">PATENT PENDING</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-6 right-8 text-[#A0A0A0] text-[11px] font-bold tracking-widest">03 / 10</div>
        </div>

        {/* ════════════════════════
            SLIDE 4 — HOW IT WORKS
        ════════════════════════ */}
        <div className="slide relative w-full min-h-screen overflow-hidden" style={{ background: '#F7F8FF' }}>
          <div className="absolute top-0 bottom-0 right-0 w-2/5">
            <img src={IMAGES.nurse} alt="Nurse using TotoAfya" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #F7F8FF 0%, transparent 40%)' }} />
          </div>

          <div className="relative z-10 flex flex-col justify-center min-h-screen px-8 sm:px-16 py-20 max-w-5xl">
            <span className="inline-block text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#666]/60 mb-4">04 — How It Works</span>
            <h2 className="text-[38px] sm:text-[52px] font-black text-[#0A0A0A] leading-tight tracking-[-0.03em] mb-3">
              Simple for families.<br /><span className="text-[#2E7A5D]">Powerful for clinicians.</span>
            </h2>
            <p className="text-[14px] text-[#666] mb-10 max-w-md">Two distinct experiences, one connected platform.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl">
              <div>
                <div className="flex items-center gap-2 mb-5 pb-3 border-b-2 border-[#0047FF]/20">
                  <div className="w-8 h-8 rounded-full bg-[#0047FF] flex items-center justify-center text-white text-[13px]">👩</div>
                  <p className="text-[14px] font-extrabold text-[#0047FF]">For Caregivers</p>
                </div>
                {[
                  { n: '1', t: 'Register in 3 minutes', d: 'Pick role, choose EN or Swahili' },
                  { n: '2', t: 'Build your profile', d: 'Pregnancy or child details — AI personalises immediately' },
                  { n: '3', t: 'Track daily health', d: 'Vitals, vaccines, growth. Real-time AI insights.' },
                  { n: '4', t: 'Get life-saving alerts', d: 'Danger signs, reminders — before it\'s too late' },
                ].map(s => (
                  <div key={s.n} className="flex gap-3 mb-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-[#0047FF] text-white flex items-center justify-center text-[12px] font-bold flex-shrink-0 shadow-[0_2px_8px_rgba(0,71,255,0.3)]">{s.n}</div>
                    <div><p className="text-[13px] font-bold text-[#0A0A0A]">{s.t}</p><p className="text-[11px] text-[#888]">{s.d}</p></div>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-5 pb-3 border-b-2 border-[#2E7A5D]/20">
                  <div className="w-8 h-8 rounded-full bg-[#2E7A5D] flex items-center justify-center text-white text-[13px]">🩺</div>
                  <p className="text-[14px] font-extrabold text-[#2E7A5D]">For Nurses & CHVs</p>
                </div>
                {[
                  { n: '1', t: 'Request clinical access', d: 'RBAC-secured role assignment' },
                  { n: '2', t: 'Search any patient', d: 'By name, ANC number, national ID' },
                  { n: '3', t: 'Enter clinical data', d: 'ANC vitals, vaccines, growth — offline-capable' },
                  { n: '4', t: 'Use Clinical AI', d: 'WHO/MoH-aligned answers in real time' },
                ].map(s => (
                  <div key={s.n} className="flex gap-3 mb-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-[#2E7A5D] text-white flex items-center justify-center text-[12px] font-bold flex-shrink-0 shadow-[0_2px_8px_rgba(46,122,93,0.3)]">{s.n}</div>
                    <div><p className="text-[13px] font-bold text-[#0A0A0A]">{s.t}</p><p className="text-[11px] text-[#888]">{s.d}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute bottom-6 right-8 text-[#A0A0A0] text-[11px] font-bold tracking-widest">04 / 10</div>
        </div>

        {/* ════════════════════════
            SLIDE 5 — AI TECHNOLOGY
        ════════════════════════ */}
        <div className="slide relative w-full min-h-screen overflow-hidden" style={{ background: 'linear-gradient(135deg, #0A0A1A 0%, #0D0D30 100%)' }}>
          <div className="absolute inset-0">
            <img src={IMAGES.aiTech} alt="AI technology" className="w-full h-full object-cover opacity-20" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,10,26,0.9) 0%, rgba(13,13,48,0.85) 100%)' }} />
          </div>

          <div className="relative z-10 flex flex-col justify-center min-h-screen px-8 sm:px-16 py-20 max-w-5xl mx-auto w-full">
            <span className="inline-block text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#7C3AED]/70 mb-4">05 — Technology</span>
            <h2 className="text-[38px] sm:text-[54px] font-black text-white leading-tight tracking-[-0.03em] mb-4">
              AI that works in<br />
              <span style={{ background: 'linear-gradient(90deg, #A78BFA, #60A5FA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                the real world.
              </span>
            </h2>
            <p className="text-[15px] text-white/45 mb-12 max-w-lg">Not a research project. Deployed today on 2G phones in rural Kenya.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {[
                {
                  color: '#7C3AED', icon: Brain, title: 'AI Risk Scoring (RSS)',
                  points: ['0–100 clinical urgency score', 'Analyses BP, Hb, danger signs, vaccines', '4 tiers: LOW · MEDIUM · HIGH · CRITICAL', 'Any danger sign → instant CRITICAL flag'],
                },
                {
                  color: '#0047FF', icon: Wifi, title: 'AMHSE Sync Engine',
                  points: ['Internet → SMS → USSD fallback', 'Critical patients synced in ≤15 min', 'Offline-first: zero downtime', 'Patent pending — ARIPO/KIPI'],
                },
                {
                  color: '#2E7A5D', icon: Lock, title: 'Security (SACF)',
                  points: ['AES-256-GCM encryption at rest', 'TLS 1.3 + certificate pinning', 'RBAC: 5 roles, field-level scoping', 'SHA-256 tamper-evident audit trail'],
                },
              ].map(card => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="rounded-[22px] p-6 border backdrop-blur-sm card-hover"
                    style={{ borderColor: `${card.color}30`, background: `linear-gradient(135deg, ${card.color}12, ${card.color}05)` }}>
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center mb-4" style={{ backgroundColor: `${card.color}20` }}>
                      <Icon size={20} style={{ color: card.color }} />
                    </div>
                    <p className="text-[14px] font-extrabold mb-4" style={{ color: card.color }}>{card.title}</p>
                    <ul className="flex flex-col gap-2.5">
                      {card.points.map(p => (
                        <li key={p} className="flex items-start gap-2 text-[12px] text-white/55">
                          <ChevronRight size={12} className="mt-0.5 flex-shrink-0" style={{ color: card.color }} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="rounded-[16px] p-4 border border-white/8 bg-white/4 flex flex-wrap gap-4 items-center">
              <p className="text-[11px] font-bold text-white/30 tracking-widest uppercase">Aligned With</p>
              {['WHO MCH Guidelines', 'Kenya MoH Protocols', 'KEPI Schedule', 'FHIR Interoperability', 'ARIPO Patent Filed'].map(s => (
                <span key={s} className="px-3 py-1.5 rounded-full bg-white/8 border border-white/12 text-white/60 text-[11px] font-semibold">{s}</span>
              ))}
            </div>
          </div>
          <div className="absolute bottom-6 right-8 text-white/20 text-[11px] font-bold tracking-widest">05 / 10</div>
        </div>

        {/* ════════════════════════
            SLIDE 6 — MARKET
        ════════════════════════ */}
        <div className="slide relative w-full min-h-screen overflow-hidden bg-white">
          <div className="absolute bottom-0 right-0 w-2/5 h-3/5">
            <img src={IMAGES.children} alt="Kenyan children" className="w-full h-full object-cover rounded-tl-[60px] opacity-90" />
            <div className="absolute inset-0 rounded-tl-[60px]" style={{ background: 'linear-gradient(to bottom-left, transparent 50%, #ffffff 100%)' }} />
          </div>

          <div className="relative z-10 flex flex-col justify-center min-h-screen px-8 sm:px-16 py-20 max-w-5xl">
            <span className="inline-block text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#0047FF]/50 mb-4">06 — Market Opportunity</span>
            <h2 className="text-[36px] sm:text-[50px] font-black text-[#0A0A0A] leading-tight tracking-[-0.03em] mb-4">
              A massive, underserved market<br /><span className="text-[#0047FF]">with no adequate solution.</span>
            </h2>
            <p className="text-[15px] text-[#666] mb-10 max-w-lg">Kenya is the beachhead. Sub-Saharan Africa is the prize.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8 max-w-2xl">
              {[
                { label: 'TAM', title: 'Sub-Saharan Africa MCH', value: '$4.2B', desc: '50M+ pregnancies annually · 54 countries', color: '#0A0A0A' },
                { label: 'SAM', title: 'East Africa Digital Health', value: '$820M', desc: 'Kenya, Uganda, Tanzania, Ethiopia', color: '#0047FF' },
                { label: 'SOM', title: 'Kenya MCH (5yr)', value: '$47M', desc: '47 counties · CHVs, facilities, families', color: '#2E7A5D' },
              ].map(m => (
                <div key={m.label} className="rounded-[22px] p-6 border-2 card-hover" style={{ borderColor: `${m.color}20` }}>
                  <p className="text-[10px] font-extrabold tracking-[0.2em] uppercase mb-2" style={{ color: m.color }}>{m.label}</p>
                  <p className="text-[12px] font-bold text-[#666] mb-2">{m.title}</p>
                  <p className="text-[40px] font-black leading-none tracking-[-0.04em] mb-2" style={{ color: m.color }}>{m.value}</p>
                  <p className="text-[11px] text-[#999] leading-snug">{m.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-5 max-w-2xl">
              {[
                { n: '15M+', l: 'Women of reproductive age' },
                { n: '1.1M', l: 'Annual live births' },
                { n: '100K+', l: 'Community Health Volunteers' },
                { n: '4,700+', l: 'Public health facilities' },
              ].map(s => (
                <div key={s.l} className="flex items-center gap-3 bg-[#F5F5F7] rounded-[16px] px-4 py-3">
                  <p className="text-[22px] font-black text-[#0047FF]">{s.n}</p>
                  <p className="text-[11px] text-[#666] leading-tight max-w-[100px]">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-6 right-8 text-[#A0A0A0] text-[11px] font-bold tracking-widest">06 / 10</div>
        </div>

        {/* ════════════════════════
            SLIDE 7 — BUSINESS MODEL
        ════════════════════════ */}
        <div className="slide relative w-full min-h-screen overflow-hidden bg-[#F5F5F7]">
          <div className="relative z-10 flex flex-col justify-center min-h-screen px-8 sm:px-16 py-20 max-w-5xl mx-auto w-full">
            <span className="inline-block text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#666]/50 mb-4">07 — Business Model</span>
            <h2 className="text-[36px] sm:text-[50px] font-black text-[#0A0A0A] leading-tight tracking-[-0.03em] mb-4">
              Free at point of care.<br /><span className="text-[#2E7A5D]">Institutional revenue at scale.</span>
            </h2>
            <p className="text-[15px] text-[#666] mb-10 max-w-xl">Caregivers always free. Revenue from facilities, counties, and governments.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
              {[
                {
                  tier: 'Caregiver', price: 'Free', priceNote: 'Always & forever', color: '#0047FF', icon: '👨👩👧',
                  target: 'Mothers, Fathers, Guardians',
                  features: ['Pregnancy tracking', 'Vaccine scheduler', 'Growth charts', 'AI Health Chatbot', 'Danger sign alerts'],
                },
                {
                  tier: 'Health Facility', price: 'KES 4,500', priceNote: 'per month', color: '#2E7A5D', icon: '🏥', popular: true,
                  target: 'Level 2–5 Health Facilities',
                  features: ['All caregiver features', 'Unlimited nurse accounts', 'Clinical AI for staff', 'Patient search & records', 'Analytics dashboard'],
                },
                {
                  tier: 'County / Gov', price: 'Custom', priceNote: 'enterprise contract', color: '#7C3AED', icon: '🏛️',
                  target: 'County health departments',
                  features: ['All facility features', 'County-wide analytics', 'FHIR data export', 'Aggregate MCH reporting', 'Dedicated SLA & support'],
                },
              ].map(t => (
                <div key={t.tier} className="rounded-[24px] p-7 bg-white border-2 relative overflow-hidden card-hover"
                  style={{ borderColor: `${t.color}20`, boxShadow: t.popular ? `0 8px 32px ${t.color}18` : undefined }}>
                  {t.popular && (
                    <div className="absolute top-0 right-0 px-3 py-1.5 text-[10px] font-extrabold text-white rounded-bl-[16px]"
                      style={{ backgroundColor: t.color }}>MOST POPULAR</div>
                  )}
                  <span className="text-3xl">{t.icon}</span>
                  <p className="text-[11px] font-bold mt-3 mb-1 tracking-widest uppercase" style={{ color: t.color }}>{t.tier}</p>
                  <div className="flex items-end gap-1.5 mb-1">
                    <p className="text-[32px] font-black text-[#0A0A0A] leading-none">{t.price}</p>
                  </div>
                  <p className="text-[11px] text-[#A0A0A0] mb-4">{t.priceNote} · {t.target}</p>
                  <ul className="flex flex-col gap-2">
                    {t.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-[12px] text-[#444]">
                        <span className="font-bold" style={{ color: t.color }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="rounded-[16px] p-4 bg-white border border-[#E5E5E5] flex flex-wrap gap-3 items-center">
              <p className="text-[11px] font-extrabold text-[#A0A0A0] tracking-widest uppercase">Additional Streams</p>
              {['SMS/USSD data bundles (MNO)', 'Training & onboarding', 'Anonymised data insights', 'NGO & donor grants'].map(i => (
                <span key={i} className="px-3 py-1.5 bg-[#F5F5F7] rounded-full text-[11px] font-semibold text-[#555] border border-[#E5E5E5]">{i}</span>
              ))}
            </div>
          </div>
          <div className="absolute bottom-6 right-8 text-[#A0A0A0] text-[11px] font-bold tracking-widest">07 / 10</div>
        </div>

        {/* ════════════════════════
            SLIDE 8 — TRACTION
        ════════════════════════ */}
        <div className="slide relative w-full min-h-screen overflow-hidden bg-[#080810]">
          <div className="absolute top-0 right-0 w-2/5 h-full opacity-30">
            <img src={IMAGES.chw} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #080810 20%, transparent)' }} />
          </div>

          <div className="relative z-10 flex flex-col justify-center min-h-screen px-8 sm:px-16 py-20 max-w-5xl">
            <span className="inline-block text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#2E7A5D]/70 mb-4">08 — Traction & Roadmap</span>
            <h2 className="text-[38px] sm:text-[54px] font-black text-white leading-tight tracking-[-0.03em] mb-12">
              Built. Deployed. <span className="text-[#2E7A5D]">Scaling.</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-10">
              <div>
                <p className="text-[11px] font-extrabold text-white/30 tracking-widest uppercase mb-5">What We've Built ✅</p>
                <div className="flex flex-col gap-3">
                  {[
                    'Full-stack mobile app (offline-first)',
                    'AI risk scoring engine (RSS) — live',
                    'Kenya KEPI vaccine schedule — automated',
                    'WHO growth standard charts — integrated',
                    'Bilingual AI chatbot (EN + Swahili)',
                    'Nurse portal with Clinical AI',
                    'AMHSE patent application filed (KIPI)',
                    'ANC visit log with danger sign tracking',
                  ].map(t => (
                    <div key={t} className="flex items-center gap-3 text-[13px] text-white/65">
                      <span className="text-[#2E7A5D] flex-shrink-0 text-[16px]">✓</span>{t}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-extrabold text-white/30 tracking-widest uppercase mb-5">2026 Roadmap</p>
                <div className="flex flex-col gap-5">
                  {[
                    { q: 'Q2 2026', color: '#0047FF', items: ['Pilot: 2 Nairobi sub-counties', '50 CHV onboarding', 'County MoH MOU signing'] },
                    { q: 'Q3 2026', color: '#2E7A5D', items: ['USSD channel launch', 'SMS sync production deploy', 'Expand to 5 counties'] },
                    { q: 'Q4 2026', color: '#F9A825', items: ['National rollout plan', 'Uganda/Tanzania expansion', 'Series A fundraise'] },
                  ].map(r => (
                    <div key={r.q} className="flex gap-4 items-start">
                      <span className="text-[12px] font-extrabold w-16 flex-shrink-0 pt-0.5" style={{ color: r.color }}>{r.q}</span>
                      <div className="flex flex-wrap gap-2">
                        {r.items.map(i => (
                          <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-white/60 border border-white/10">{i}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { n: '47', l: 'Counties designed to serve', c: '#0047FF' },
                { n: '8', l: 'WHO ANC visits per pregnancy', c: '#2E7A5D' },
                { n: '1', l: 'Patent pending (AMHSE)', c: '#7C3AED' },
              ].map(s => (
                <div key={s.l} className="rounded-[16px] p-5 border border-white/8 bg-white/4 text-center">
                  <p className="text-[40px] font-black leading-none mb-2" style={{ color: s.c }}>{s.n}</p>
                  <p className="text-[11px] text-white/35">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-6 right-8 text-white/20 text-[11px] font-bold tracking-widest">08 / 10</div>
        </div>

        {/* ════════════════════════
            SLIDE 9 — TESTIMONIALS
        ════════════════════════ */}
        <div className="slide relative w-full min-h-screen overflow-hidden bg-white">
          <div className="absolute top-0 left-0 right-0 h-2/5">
            <img src={IMAGES.children} alt="Kenyan children" className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 90%)' }} />
          </div>

          <div className="relative z-10 flex flex-col justify-end min-h-screen px-8 sm:px-16 pb-14 pt-[38vh]">
            <div className="max-w-5xl mx-auto w-full">
              <span className="inline-block text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#0047FF]/50 mb-3">09 — Voices from the Field</span>
              <h2 className="text-[36px] sm:text-[46px] font-black text-[#0A0A0A] leading-tight tracking-[-0.03em] mb-8">
                Real families. <span className="text-[#0047FF]">Real impact.</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {[
                  { q: "I knew my baby's vaccine was overdue before the nurse even called. TotoAfya alerted me three days early.", name: 'Amina Waweru', role: 'Mother, 27', county: 'Nakuru County', color: '#0047FF' },
                  { q: "The Clinical AI saves me 20 minutes per patient. I get MoH protocol answers instantly at the bedside.", name: 'Nurse Grace Omondi', role: 'Facility Nurse', county: 'Kisumu County Hospital', color: '#2E7A5D' },
                  { q: "I used to carry paper forms in the rain. Now I enter everything on my phone and it syncs when I reach the road.", name: 'John Mwangi', role: 'Community Health Volunteer', county: 'Garissa County', color: '#7C3AED' },
                ].map(t => (
                  <div key={t.name} className="rounded-[20px] p-6 border-l-4 bg-[#F5F5F7] card-hover" style={{ borderColor: t.color }}>
                    <p className="text-[14px] text-[#0A0A0A] leading-relaxed font-medium mb-5">"{t.q}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-extrabold" style={{ backgroundColor: t.color }}>
                        {t.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-[#0A0A0A]">{t.name}</p>
                        <p className="text-[11px] text-[#A0A0A0]">{t.role} · {t.county}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { n: '47', l: 'Counties', c: '#0047FF' },
                  { n: '100K+', l: 'CHVs can benefit', c: '#2E7A5D' },
                  { n: '1.1M', l: 'Annual births', c: '#E51010' },
                  { n: '2', l: 'Languages EN+SW', c: '#7C3AED' },
                ].map(s => (
                  <div key={s.l} className="rounded-[14px] p-4 bg-white border border-[#E5E5E5] text-center shadow-sm">
                    <p className="text-[26px] font-black leading-none mb-1" style={{ color: s.c }}>{s.n}</p>
                    <p className="text-[11px] text-[#666]">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute bottom-6 right-8 text-[#A0A0A0] text-[11px] font-bold tracking-widest">09 / 10</div>
        </div>

        {/* ════════════════════════
            SLIDE 10 — THE ASK
        ════════════════════════ */}
        <div className="slide relative w-full min-h-screen overflow-hidden text-center"
          style={{ background: 'linear-gradient(135deg, #001060 0%, #0047FF 50%, #0026CC 100%)' }}>
          <div className="absolute inset-0">
            <img src={IMAGES.motherBaby} alt="" className="w-full h-full object-cover opacity-15" style={{ objectPosition: 'center' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,16,96,0.9) 0%, rgba(0,71,255,0.75) 100%)' }} />
          </div>

          {/* decorative rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/8 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-8 py-20 max-w-4xl mx-auto">
            <span className="inline-block text-[10px] font-extrabold tracking-[0.22em] uppercase text-white/40 mb-6">10 — The Ask</span>

            <h2 className="text-[48px] sm:text-[66px] font-black text-white leading-[1.0] tracking-[-0.035em] mb-6 hero-text-shadow">
              Give every mother<br />the care she<br /><span className="gradient-text-blue">deserves.</span>
            </h2>

            <p className="text-[18px] text-white/60 leading-relaxed mb-12 max-w-2xl">
              We are raising <strong className="text-white font-extrabold">$500,000 Seed</strong> to deploy TotoAfya across 5 pilot counties, onboard 500 CHVs, and sign our first county government contract.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12 w-full max-w-3xl text-left">
              {[
                { pct: '40%', label: 'Product & Engineering', desc: 'SMS/USSD channel, feature phone build, FHIR integration' },
                { pct: '35%', label: 'County Pilots & Operations', desc: 'CHV onboarding, facility training, MoH engagement' },
                { pct: '25%', label: 'Sales, Legal & Marketing', desc: 'IP protection, regulatory compliance, county sales' },
              ].map(u => (
                <div key={u.label} className="rounded-[20px] p-5 bg-white/10 border border-white/20 backdrop-blur">
                  <p className="text-[36px] font-black text-white leading-none mb-2">{u.pct}</p>
                  <p className="text-[13px] font-bold text-white mb-1">{u.label}</p>
                  <p className="text-[11px] text-white/45 leading-snug">{u.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
              <div className="px-8 py-4 rounded-full bg-white text-[#0047FF] text-[15px] font-extrabold shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
                contact@totoafya.digital
              </div>
              <div className="px-8 py-4 rounded-full bg-white/12 border border-white/25 text-white text-[15px] font-bold backdrop-blur">
                +254 700 000 000
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              {['🌍 WHO SDG 3', '🇰🇪 Kenya MoH', '📋 KEPI', '🔗 FHIR', '⚖️ ARIPO Patent'].map(b => (
                <span key={b} className="px-3 py-1.5 rounded-full bg-white/10 text-white text-[11px] font-semibold border border-white/20">{b}</span>
              ))}
            </div>

            <div className="border-t border-white/10 pt-6 w-full">
              <p className="text-white/25 text-[11px]">© 2026 TotoAfya Digital Health Systems · Nairobi, Kenya · Confidential & Proprietary</p>
            </div>
          </div>
          <div className="absolute bottom-6 right-8 text-white/20 text-[11px] font-bold tracking-widest">10 / 10</div>
        </div>

      </div>
    </>
  );
}
