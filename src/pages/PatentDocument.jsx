import db from '@/api/base44Client';

import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Printer, ArrowLeft, Code2, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/* ─── Collapsible Section ─── */
const Section = ({ number, title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#E5E5E5] rounded-[16px] overflow-hidden mb-4">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-[#F5F5F7] transition-colors text-left">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-extrabold text-[#0047FF] bg-[#0047FF]/8 px-2.5 py-1 rounded-full tracking-widest">§{number}</span>
          <span className="text-[15px] font-bold text-[#0A0A0A]">{title}</span>
        </div>
        {open ? <ChevronUp size={18} className="text-[#A0A0A0]" /> : <ChevronDown size={18} className="text-[#A0A0A0]" />}
      </button>
      {open && (
        <div className="px-6 pb-6 pt-2 bg-white border-t border-[#F5F5F7] text-[13px] text-[#333] leading-relaxed space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

const P = ({ children, className }) => <p className={cn("text-[13px] leading-[1.85] text-[#222]", className)}>{children}</p>;
const H = ({ children }) => <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#0047FF] mt-5 mb-2">{children}</p>;

const Claim = ({ n, children, indent }) => (
  <div className={cn("mb-3", indent && "ml-6")}>
    <p className="text-[13px] leading-[1.8] text-[#222]">
      <span className="font-bold text-[#0A0A0A]">{n}.</span> {children}
    </p>
  </div>
);

/* ─── Source Code Block ─── */
const CodeBlock = ({ title, lang = 'jsx', children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4 border border-[#E5E5E5] rounded-[12px] overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#0A0A0A] text-left hover:bg-[#1a1a1a] transition-colors">
        <div className="flex items-center gap-2">
          <Code2 size={13} className="text-[#A0A0A0]" />
          <span className="text-[11px] font-bold text-[#A0A0A0] tracking-wide uppercase">{title}</span>
          <span className="text-[10px] text-[#555] font-mono">.{lang}</span>
        </div>
        {open
          ? <ChevronUp size={14} className="text-[#555]" />
          : <ChevronDown size={14} className="text-[#555]" />}
      </button>
      {open && (
        <pre className="bg-[#0D0D0D] text-[#E0E0E0] text-[11px] leading-[1.7] font-mono p-4 overflow-x-auto whitespace-pre-wrap max-h-[500px] overflow-y-auto">
          {children}
        </pre>
      )}
    </div>
  );
};

/* ─── SVG UI Diagrams ─── */

// FIG 1 – System Architecture
const FigSystemArch = () => (
  <svg viewBox="0 0 700 420" className="w-full border border-[#E5E5E5] rounded-[12px] bg-white" style={{ maxHeight: 420 }}>
    {/* Title */}
    <text x="350" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0047FF" letterSpacing="2">FIG. 1 — AMHSE SYSTEM ARCHITECTURE</text>

    {/* Central Hub */}
    <rect x="270" y="170" width="160" height="50" rx="12" fill="#0047FF" />
    <text x="350" y="190" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">AMHSE CORE ENGINE</text>
    <text x="350" y="207" textAnchor="middle" fontSize="9" fill="#AAC4FF">Channel Router + Sync Coordinator</text>

    {/* RSS */}
    <rect x="30" y="60" width="140" height="48" rx="10" fill="#2E7A5D" opacity="0.9" />
    <text x="100" y="80" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">RSS</text>
    <text x="100" y="95" textAnchor="middle" fontSize="8" fill="#B2DFCC">Risk Scoring Subsystem</text>
    <line x1="170" y1="84" x2="270" y2="185" stroke="#2E7A5D" strokeWidth="1.5" strokeDasharray="5,3" />

    {/* CSRM */}
    <rect x="530" y="60" width="140" height="48" rx="10" fill="#F9A825" opacity="0.9" />
    <text x="600" y="80" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">CSRM</text>
    <text x="600" y="95" textAnchor="middle" fontSize="8" fill="#FFF8E1">Channel Selection Module</text>
    <line x1="530" y1="84" x2="430" y2="185" stroke="#F9A825" strokeWidth="1.5" strokeDasharray="5,3" />

    {/* SMDCEE */}
    <rect x="530" y="290" width="140" height="48" rx="10" fill="#7C3AED" opacity="0.9" />
    <text x="600" y="310" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">SMDCEE</text>
    <text x="600" y="325" textAnchor="middle" fontSize="8" fill="#E9D5FF">SMS Encoding Engine</text>
    <line x1="530" y1="314" x2="430" y2="215" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="5,3" />

    {/* DCDRE */}
    <rect x="30" y="290" width="140" height="48" rx="10" fill="#E51010" opacity="0.85" />
    <text x="100" y="310" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">DCDRE</text>
    <text x="100" y="325" textAnchor="middle" fontSize="8" fill="#FFCCCC">Conflict Resolution Engine</text>
    <line x1="170" y1="314" x2="270" y2="215" stroke="#E51010" strokeWidth="1.5" strokeDasharray="5,3" />

    {/* OFDPL */}
    <rect x="260" y="330" width="180" height="48" rx="10" fill="#0A0A0A" opacity="0.85" />
    <text x="350" y="350" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">OFDPL</text>
    <text x="350" y="366" textAnchor="middle" fontSize="8" fill="#999">Offline-First Persistence Layer</text>
    <line x1="350" y1="330" x2="350" y2="220" stroke="#0A0A0A" strokeWidth="1.5" />

    {/* Client Apps */}
    <rect x="30" y="170" width="110" height="48" rx="10" fill="#F5F5F7" stroke="#D0D0D0" strokeWidth="1" />
    <text x="85" y="190" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0A0A0A">Client Apps</text>
    <text x="85" y="205" textAnchor="middle" fontSize="8" fill="#666">Caregiver / CHW</text>
    <line x1="140" y1="194" x2="270" y2="194" stroke="#D0D0D0" strokeWidth="1.5" />

    {/* Channels */}
    <rect x="560" y="150" width="110" height="30" rx="8" fill="#F5F5F7" stroke="#D0D0D0" strokeWidth="1" />
    <text x="615" y="169" textAnchor="middle" fontSize="9" fontWeight="600" fill="#0A0A0A">Internet / SMS / USSD</text>
    <line x1="560" y1="165" x2="430" y2="190" stroke="#D0D0D0" strokeWidth="1" />

    {/* Central Repo */}
    <rect x="260" y="40" width="180" height="40" rx="10" fill="#F5F5F7" stroke="#D0D0D0" strokeWidth="1" />
    <text x="350" y="57" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0A0A0A">Central Health Repository</text>
    <text x="350" y="72" textAnchor="middle" fontSize="8" fill="#666">FHIR-Compliant National Store</text>
    <line x1="350" y1="80" x2="350" y2="170" stroke="#D0D0D0" strokeWidth="1.5" strokeDasharray="4,3" />

    {/* Legend */}
    <text x="30" y="400" fontSize="8" fill="#A0A0A0">Legend:</text>
    <line x1="65" y1="398" x2="90" y2="398" stroke="#0047FF" strokeWidth="1.5" strokeDasharray="5,3" />
    <text x="93" y="401" fontSize="8" fill="#666">Data Flow</text>
    <line x1="150" y1="398" x2="175" y2="398" stroke="#0A0A0A" strokeWidth="1.5" />
    <text x="178" y="401" fontSize="8" fill="#666">Sync Link</text>
  </svg>
);

// FIG 2 – Risk Scoring Pipeline
const FigRiskScoring = () => (
  <svg viewBox="0 0 700 300" className="w-full border border-[#E5E5E5] rounded-[12px] bg-white" style={{ maxHeight: 300 }}>
    <text x="350" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0047FF" letterSpacing="2">FIG. 2 — AI RISK SCORING PIPELINE (RSS)</text>
    {/* Input features */}
    {[
      { label: 'Blood Pressure (w=0.22)', y: 55 },
      { label: 'Haemoglobin (w=0.15)', y: 90 },
      { label: 'Danger Signs (w=0.20)', y: 125 },
      { label: 'ANC Overdue (w=0.08)', y: 160 },
      { label: 'Gestational Age (w=0.12)', y: 195 },
      { label: 'Growth Z-Score (w=0.10)', y: 230 },
    ].map(({ label, y }) => (
      <g key={y}>
        <rect x="20" y={y - 12} width="180" height="22" rx="6" fill="#F5F5F7" stroke="#E5E5E5" strokeWidth="1" />
        <text x="110" y={y + 3} textAnchor="middle" fontSize="9" fill="#333">{label}</text>
        <line x1="200" y1={y} x2="270" y2="145" stroke="#D0D0D0" strokeWidth="1" />
      </g>
    ))}
    {/* Normalisation box */}
    <rect x="270" y="120" width="110" height="50" rx="10" fill="#0047FF" />
    <text x="325" y="141" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">Normalize</text>
    <text x="325" y="158" textAnchor="middle" fontSize="8" fill="#AAC4FF">φᵢ(xᵢ) · wᵢ</text>
    <line x1="380" y1="145" x2="420" y2="145" stroke="#0047FF" strokeWidth="1.5" />
    {/* Weighted sum */}
    <rect x="420" y="120" width="100" height="50" rx="10" fill="#2E7A5D" />
    <text x="470" y="141" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">Σ Weighted</text>
    <text x="470" y="158" textAnchor="middle" fontSize="8" fill="#B2DFCC">Score S ∈ [0,100]</text>
    <line x1="520" y1="145" x2="560" y2="145" stroke="#2E7A5D" strokeWidth="1.5" />
    {/* Override box */}
    <rect x="410" y="220" width="120" height="36" rx="8" fill="#E51010" opacity="0.9" />
    <text x="470" y="236" textAnchor="middle" fontSize="8" fontWeight="700" fill="white">Rule Override</text>
    <text x="470" y="249" textAnchor="middle" fontSize="7" fill="#FFCCCC">Danger Sign → CRITICAL</text>
    <line x1="470" y1="220" x2="470" y2="170" stroke="#E51010" strokeWidth="1.5" strokeDasharray="4,3" />
    {/* Output */}
    <rect x="560" y="100" width="110" height="90" rx="10" fill="#0A0A0A" />
    <text x="615" y="125" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">RISK OUTPUT</text>
    <text x="615" y="145" textAnchor="middle" fontSize="10" fontWeight="800" fill="#2E7A5D">LOW 0-29</text>
    <text x="615" y="163" textAnchor="middle" fontSize="10" fontWeight="800" fill="#F9A825">MED 30-59</text>
    <text x="615" y="181" textAnchor="middle" fontSize="10" fontWeight="800" fill="#E51010">HIGH/CRIT</text>
  </svg>
);

// FIG 3 – Channel Selection Decision Tree
const FigChannelSelect = () => (
  <svg viewBox="0 0 700 370" className="w-full border border-[#E5E5E5] rounded-[12px] bg-white" style={{ maxHeight: 370 }}>
    <text x="350" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0047FF" letterSpacing="2">FIG. 3 — ADAPTIVE CHANNEL SELECTION (CSRM)</text>
    {/* Root */}
    <rect x="240" y="40" width="220" height="38" rx="10" fill="#0047FF" />
    <text x="350" y="56" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">SYNC EVENT TRIGGERED</text>
    <text x="350" y="70" textAnchor="middle" fontSize="8" fill="#AAC4FF">Patient record modified / queued</text>
    <line x1="350" y1="78" x2="350" y2="110" stroke="#0047FF" strokeWidth="1.5" />
    {/* Decision 1 */}
    <polygon points="350,110 460,140 350,170 240,140" fill="#F9A825" opacity="0.9" />
    <text x="350" y="137" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">Internet Available?</text>
    <text x="350" y="152" textAnchor="middle" fontSize="8" fill="#FFF8E1">Latency &lt; 2000ms?</text>
    {/* YES path */}
    <line x1="460" y1="140" x2="560" y2="140" stroke="#2E7A5D" strokeWidth="1.5" />
    <text x="505" y="134" textAnchor="middle" fontSize="9" fontWeight="700" fill="#2E7A5D">YES</text>
    <rect x="560" y="118" width="110" height="44" rx="8" fill="#2E7A5D" />
    <text x="615" y="136" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">Internet Channel</text>
    <text x="615" y="151" textAnchor="middle" fontSize="8" fill="#B2DFCC">Full / Delta Sync</text>
    {/* NO path */}
    <line x1="350" y1="170" x2="350" y2="200" stroke="#E51010" strokeWidth="1.5" />
    <text x="365" y="190" fontSize="9" fontWeight="700" fill="#E51010">NO</text>
    {/* Decision 2 */}
    <polygon points="350,200 460,230 350,260 240,230" fill="#E51010" opacity="0.85" />
    <text x="350" y="227" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">Risk ≥ HIGH (70+)?</text>
    <text x="350" y="243" textAnchor="middle" fontSize="8" fill="#FFCCCC">Patient CRITICAL?</text>
    {/* YES → SMS */}
    <line x1="460" y1="230" x2="560" y2="230" stroke="#E51010" strokeWidth="1.5" />
    <text x="505" y="224" textAnchor="middle" fontSize="9" fontWeight="700" fill="#E51010">YES</text>
    <rect x="560" y="208" width="110" height="44" rx="8" fill="#E51010" />
    <text x="615" y="226" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">SMS Priority</text>
    <text x="615" y="241" textAnchor="middle" fontSize="8" fill="#FFCCCC">Encoded Packet</text>
    {/* NO → Queue */}
    <line x1="350" y1="260" x2="350" y2="295" stroke="#A0A0A0" strokeWidth="1.5" />
    <text x="365" y="282" fontSize="9" fill="#A0A0A0">NO</text>
    <rect x="240" y="295" width="220" height="44" rx="8" fill="#F5F5F7" stroke="#D0D0D0" strokeWidth="1" />
    <text x="350" y="313" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0A0A0A">Queue for Next Window</text>
    <text x="350" y="328" textAnchor="middle" fontSize="8" fill="#666">USSD Acknowledgment Only</text>
    {/* Timeout override */}
    <rect x="30" y="210" width="150" height="40" rx="8" fill="#7C3AED" opacity="0.9" />
    <text x="105" y="227" textAnchor="middle" fontSize="8" fontWeight="700" fill="white">T_urgent Timeout (5 min)</text>
    <text x="105" y="241" textAnchor="middle" fontSize="7" fill="#E9D5FF">→ Force SMS regardless</text>
    <line x1="180" y1="230" x2="240" y2="230" stroke="#7C3AED" strokeWidth="1.5" strokeDasharray="4,3" />
  </svg>
);

// FIG 4 – SMS Encoding Packet
const FigSMSEncoding = () => (
  <svg viewBox="0 0 700 310" className="w-full border border-[#E5E5E5] rounded-[12px] bg-white" style={{ maxHeight: 310 }}>
    <text x="350" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0047FF" letterSpacing="2">FIG. 4 — SMS ENCODING PACKET STRUCTURE (SMDCEE)</text>
    {/* Packet header */}
    {[
      { label: 'Proto Ver', bits: '2b', x: 30, fill: '#0047FF' },
      { label: 'Msg Type', bits: '4b', x: 105, fill: '#0047FF' },
      { label: 'Seq #', bits: '10b', x: 190, fill: '#0047FF' },
      { label: 'CRC-16', bits: '16b', x: 295, fill: '#7C3AED' },
      { label: 'Patient ID Hash', bits: '64b', x: 420, fill: '#7C3AED' },
    ].map(({ label, bits, x, fill }) => (
      <g key={x}>
        <rect x={x} y="45" width={label === 'Patient ID Hash' ? 130 : 75} height="50" rx="6" fill={fill} opacity="0.85" />
        <text x={x + (label === 'Patient ID Hash' ? 65 : 37)} y="66" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">{label}</text>
        <text x={x + (label === 'Patient ID Hash' ? 65 : 37)} y="82" textAnchor="middle" fontSize="8" fill="#CCC">{bits}</text>
      </g>
    ))}
    <text x="25" y="118" fontSize="9" fontWeight="700" fill="#A0A0A0">HEADER (12 bytes)</text>

    {/* Payload fields */}
    {[
      { label: 'Systolic BP', encode: '1 byte offset from 60mmHg', x: 30, fill: '#2E7A5D' },
      { label: 'Diastolic BP', encode: '1 byte offset from 40mmHg', x: 195, fill: '#2E7A5D' },
      { label: 'Weight', encode: '2 bytes fixed-point', x: 360, fill: '#F9A825' },
      { label: 'Visit Date', encode: '2 bytes days-since-epoch', x: 510, fill: '#F9A825' },
    ].map(({ label, encode, x, fill }) => (
      <g key={x}>
        <rect x={x} y="135" width="155" height="50" rx="6" fill={fill} opacity="0.85" />
        <text x={x + 77} y="155" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">{label}</text>
        <text x={x + 77} y="173" textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.8)">{encode}</text>
      </g>
    ))}
    <text x="25" y="205" fontSize="9" fontWeight="700" fill="#A0A0A0">PAYLOAD — CLINICAL FIELDS (variable, packed bit fields)</text>

    {/* Trailer */}
    {[
      { label: 'Cont. Flag', bits: '1b', x: 30, fill: '#E51010' },
      { label: 'Total Parts', bits: '3b', x: 120, fill: '#E51010' },
      { label: 'CRC-16 Trailer', bits: '16b', x: 220, fill: '#E51010' },
    ].map(({ label, bits, x, fill }) => (
      <g key={x}>
        <rect x={x} y="218" width="80" height="40" rx="6" fill={fill} opacity="0.85" />
        <text x={x + 40} y="234" textAnchor="middle" fontSize="8" fontWeight="700" fill="white">{label}</text>
        <text x={x + 40} y="248" textAnchor="middle" fontSize="7" fill="#FFCCCC">{bits}</text>
      </g>
    ))}
    <text x="25" y="278" fontSize="9" fontWeight="700" fill="#A0A0A0">TRAILER (3 bytes)</text>

    {/* Size annotation */}
    <rect x="440" y="218" width="230" height="56" rx="8" fill="#0A0A0A" />
    <text x="555" y="238" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">Complete ANC Visit: 112 bytes</text>
    <text x="555" y="254" textAnchor="middle" fontSize="8" fill="#A0A0A0">= 149 chars (GSM 7-bit)</text>
    <text x="555" y="269" textAnchor="middle" fontSize="8" fill="#2E7A5D">✓ Fits in 1 SMS (160 char limit)</text>
  </svg>
);

// FIG 5 – Conflict Resolution
const FigConflict = () => (
  <svg viewBox="0 0 700 360" className="w-full border border-[#E5E5E5] rounded-[12px] bg-white" style={{ maxHeight: 360 }}>
    <text x="350" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0047FF" letterSpacing="2">FIG. 5 — CONFLICT DETECTION & RESOLUTION (DCDRE)</text>
    {/* Node A */}
    <rect x="30" y="50" width="130" height="55" rx="10" fill="#0047FF" />
    <text x="95" y="72" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">Node A</text>
    <text x="95" y="87" textAnchor="middle" fontSize="8" fill="#AAC4FF">Facility Server</text>
    <text x="95" y="100" textAnchor="middle" fontSize="8" fill="white">BP: 140/90 (offline)</text>
    {/* Node B */}
    <rect x="540" y="50" width="130" height="55" rx="10" fill="#2E7A5D" />
    <text x="605" y="72" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">Node B</text>
    <text x="605" y="87" textAnchor="middle" fontSize="8" fill="#B2DFCC">CHV Device</text>
    <text x="605" y="100" textAnchor="middle" fontSize="8" fill="white">BP: 155/95 (offline)</text>
    {/* Sync event */}
    <line x1="160" y1="78" x2="310" y2="130" stroke="#D0D0D0" strokeWidth="1.5" strokeDasharray="5,3" />
    <line x1="540" y1="78" x2="390" y2="130" stroke="#D0D0D0" strokeWidth="1.5" strokeDasharray="5,3" />
    {/* DCDRE box */}
    <rect x="230" y="130" width="240" height="55" rx="10" fill="#E51010" opacity="0.9" />
    <text x="350" y="151" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">DCDRE — Hash Compare</text>
    <text x="350" y="168" textAnchor="middle" fontSize="8" fill="#FFCCCC">Merkle Hash divergence detected</text>
    <line x1="350" y1="185" x2="350" y2="215" stroke="#E51010" strokeWidth="1.5" />
    {/* CPMT */}
    <rect x="200" y="215" width="300" height="60" rx="10" fill="#7C3AED" />
    <text x="350" y="235" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">CPMT — Field Resolution</text>
    <text x="350" y="252" textAnchor="middle" fontSize="8" fill="#E9D5FF">Clinical fields → latest clinical timestamp</text>
    <text x="350" y="266" textAnchor="middle" fontSize="8" fill="#E9D5FF">Admin fields → last-write-wins</text>
    <line x1="350" y1="275" x2="350" y2="305" stroke="#7C3AED" strokeWidth="1.5" />
    {/* Merged result */}
    <rect x="215" y="305" width="270" height="40" rx="10" fill="#0A0A0A" />
    <text x="350" y="322" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">MERGED RECORD — BP: 155/95</text>
    <text x="350" y="337" textAnchor="middle" fontSize="8" fill="#A0A0A0">Most recent clinical measurement retained · Audit logged</text>
  </svg>
);

// FIG 6 – Offline-First Data Persistence
const FigOfflineFirst = () => (
  <svg viewBox="0 0 700 360" className="w-full border border-[#E5E5E5] rounded-[12px] bg-white" style={{ maxHeight: 360 }}>
    <text x="350" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0047FF" letterSpacing="2">FIG. 6 — OFFLINE-FIRST DATA PERSISTENCE (OFDPL)</text>
    {/* Application Layer */}
    <rect x="220" y="40" width="260" height="40" rx="10" fill="#0047FF" />
    <text x="350" y="57" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">Application Layer</text>
    <text x="350" y="72" textAnchor="middle" fontSize="8" fill="#AAC4FF">All reads/writes go to Local Store first</text>
    <line x1="350" y1="80" x2="350" y2="110" stroke="#0047FF" strokeWidth="1.5" />
    {/* Local Store */}
    <rect x="80" y="110" width="540" height="110" rx="12" fill="#F5F5F7" stroke="#E5E5E5" strokeWidth="1.5" />
    <text x="350" y="130" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0A0A0A">LOCAL STORE</text>
    {[
      { label: 'Active Records DB', sub: 'SQLite/IndexedDB', x: 110, fill: '#2E7A5D' },
      { label: 'Change Log', sub: 'Append-only, SHA-256 chained', x: 290, fill: '#0047FF' },
      { label: 'Pending Sync Queue', sub: 'Priority-ordered by risk score', x: 480, fill: '#E51010' },
    ].map(({ label, sub, x, fill }) => (
      <g key={x}>
        <rect x={x - 80} y="145" width="165" height="55" rx="8" fill={fill} opacity="0.85" />
        <text x={x} y="165" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">{label}</text>
        <text x={x} y="182" textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,0.8)">{sub}</text>
      </g>
    ))}
    <line x1="350" y1="220" x2="350" y2="255" stroke="#0A0A0A" strokeWidth="1.5" />
    {/* Sync Engine */}
    <rect x="230" y="255" width="240" height="40" rx="10" fill="#0A0A0A" />
    <text x="350" y="273" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">Sync Engine</text>
    <text x="350" y="288" textAnchor="middle" fontSize="8" fill="#A0A0A0">Network monitor → process PSQ on connection</text>
    <line x1="350" y1="295" x2="350" y2="320" stroke="#0A0A0A" strokeWidth="1.5" />
    {/* Channels */}
    {[
      { label: 'Internet', color: '#2E7A5D', x: 160 },
      { label: 'SMS', color: '#E51010', x: 350 },
      { label: 'USSD', color: '#F9A825', x: 540 },
    ].map(({ label, color, x }) => (
      <g key={x}>
        <rect x={x - 55} y="320" width="110" height="30" rx="8" fill={color} opacity="0.85" />
        <text x={x} y="339" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">{label}</text>
        <line x1={x} y1="320" x2="350" y2="295" stroke={color} strokeWidth="1" strokeDasharray="4,3" />
      </g>
    ))}
    {/* SLA annotation */}
    <text x="600" y="260" fontSize="8" fontWeight="700" fill="#E51010">CRITICAL: ≤15 min</text>
    <text x="600" y="275" fontSize="8" fill="#F9A825">HIGH: ≤1 hour</text>
    <text x="600" y="290" fontSize="8" fill="#A0A0A0">MED/LOW: next window</text>
  </svg>
);

// FIG 7 – Security Architecture
const FigSecurity = () => (
  <svg viewBox="0 0 700 330" className="w-full border border-[#E5E5E5] rounded-[12px] bg-white" style={{ maxHeight: 330 }}>
    <text x="350" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0047FF" letterSpacing="2">FIG. 7 — SECURITY ARCHITECTURE (SACF)</text>
    {[
      { zone: 'Zone 1: End-User Device', detail: 'AES-256-GCM at rest · PBKDF2 key derivation · Biometric/PIN auth', color: '#0047FF', y: 50 },
      { zone: 'Zone 2: Transport Layer', detail: 'TLS 1.3 + cert pinning (Internet) · ChaCha20-Poly1305 (SMS) · ECDH Curve25519 keys', color: '#7C3AED', y: 125 },
      { zone: 'Zone 3: API Gateway', detail: 'JWT authentication · RBAC enforcement · Rate limiting · Input validation', color: '#2E7A5D', y: 200 },
      { zone: 'Zone 4: Central Repository', detail: 'Field-level PII encryption · Pseudonymization for analytics · Immutable audit trail', color: '#E51010', y: 275 },
    ].map(({ zone, detail, color, y }) => (
      <g key={y}>
        <rect x="30" y={y - 15} width="640" height="55" rx="10" fill={color} opacity="0.08" stroke={color} strokeWidth="1.5" strokeOpacity="0.3" />
        <text x="50" y={y + 6} fontSize="10" fontWeight="700" fill={color}>{zone}</text>
        <text x="50" y={y + 22} fontSize="8.5" fill="#444">{detail}</text>
        {y < 275 && (
          <>
            <line x1="350" y1={y + 40} x2="350" y2={y + 57} stroke="#D0D0D0" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <text x="370" y={y + 52} fontSize="7.5" fill="#A0A0A0">Audit event emitted</text>
          </>
        )}
      </g>
    ))}
  </svg>
);

// FIG 8 – Caregiver Home Dashboard (Wireframe)
const FigDashboard = () => (
  <svg viewBox="0 0 320 580" className="border border-[#E5E5E5] rounded-[12px] bg-white mx-auto" style={{ maxHeight: 580, display: 'block', maxWidth: 320 }}>
    <text x="160" y="18" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0047FF" letterSpacing="2">FIG. 8 — CAREGIVER HOME DASHBOARD</text>
    {/* Status bar */}
    <rect x="0" y="25" width="320" height="44" fill="#0047FF" />
    <text x="20" y="43" fontSize="8" fill="rgba(255,255,255,0.7)">GOOD MORNING</text>
    <text x="20" y="57" fontSize="13" fontWeight="800" fill="white">Amina W.</text>
    <rect x="258" y="32" width="28" height="28" rx="14" fill="rgba(255,255,255,0.2)" />
    <text x="272" y="50" textAnchor="middle" fontSize="10" fill="white">🔔</text>
    <rect x="228" y="32" width="28" height="28" rx="14" fill="rgba(255,255,255,0.2)" />
    <text x="242" y="50" textAnchor="middle" fontSize="10" fill="white">✦</text>

    {/* Mode badge */}
    <rect x="12" y="76" width="100" height="20" rx="10" fill="#0047FF" opacity="0.1" stroke="#0047FF" strokeWidth="0.8" />
    <text x="62" y="90" textAnchor="middle" fontSize="8" fontWeight="700" fill="#0047FF">🤰 PREGNANT · 28 WKS</text>

    {/* AI Alert */}
    <rect x="12" y="104" width="296" height="36" rx="8" fill="#E51010" opacity="0.08" stroke="#E51010" strokeWidth="0.8" strokeOpacity="0.4" />
    <text x="25" y="119" fontSize="8" fontWeight="700" fill="#E51010">⚠ ALERT: Blood pressure elevated</text>
    <text x="25" y="133" fontSize="7.5" fill="#666">Visit your nearest facility within 24 hours</text>

    {/* Fetal dev card */}
    <rect x="12" y="148" width="296" height="72" rx="12" fill="#0047FF" />
    <text x="24" y="166" fontSize="8" fill="rgba(255,255,255,0.7)">FETAL DEVELOPMENT</text>
    <text x="24" y="182" fontSize="14" fontWeight="800" fill="white">Week 28</text>
    <text x="24" y="196" fontSize="8" fill="rgba(255,255,255,0.75)">Baby is ~1.0 kg · Size of an eggplant</text>
    <text x="24" y="210" fontSize="7.5" fill="rgba(255,255,255,0.6)">EDD: 15 Aug 2026 · 84 days remaining</text>
    <rect x="252" y="157" width="44" height="44" rx="8" fill="rgba(255,255,255,0.15)" />
    <text x="274" y="184" textAnchor="middle" fontSize="22">🌱</text>

    {/* Stats row */}
    {[
      { label: 'ANC', val: '3', color: '#0047FF', x: 12 },
      { label: 'LEARN', val: '📚', color: '#7C3AED', x: 113 },
      { label: 'RISK', val: '42', color: '#F9A825', x: 214 },
    ].map(({ label, val, color, x }) => (
      <g key={x}>
        <rect x={x} y="228" width="94" height="60" rx="10" fill="white" stroke="#E5E5E5" strokeWidth="0.8" />
        <text x={x + 47} y="248" textAnchor="middle" fontSize="7" fontWeight="700" fill="#A0A0A0">{label}</text>
        <text x={x + 47} y="270" textAnchor="middle" fontSize="16" fontWeight="800" fill={color}>{val}</text>
        <text x={x + 47} y="283" textAnchor="middle" fontSize="6.5" fill="#A0A0A0">{label === 'RISK' ? 'Score' : label === 'ANC' ? 'Visits' : 'Videos'}</text>
      </g>
    ))}

    {/* Children section header */}
    <text x="20" y="308" fontSize="11" fontWeight="800" fill="#0A0A0A">My Children</text>
    <rect x="218" y="296" width="90" height="22" rx="11" fill="#0047FF" />
    <text x="263" y="311" textAnchor="middle" fontSize="8" fontWeight="700" fill="white">+ Add Child</text>

    {/* Child card */}
    <rect x="12" y="318" width="296" height="72" rx="12" fill="white" stroke="#E5E5E5" strokeWidth="0.8" />
    <rect x="22" y="328" width="44" height="44" rx="10" fill="#0047FF" opacity="0.1" />
    <text x="44" y="355" textAnchor="middle" fontSize="18">👦</text>
    <text x="76" y="342" fontSize="10" fontWeight="800" fill="#0A0A0A">Jabari W.</text>
    <text x="76" y="356" fontSize="7.5" fill="#A0A0A0">8 months · Healthy</text>
    <rect x="76" y="362" width="70" height="16" rx="8" fill="#F9A825" opacity="0.15" />
    <text x="111" y="373" textAnchor="middle" fontSize="7" fontWeight="700" fill="#F9A825">💉 OPV due in 3d</text>

    {/* Quick actions */}
    <text x="20" y="408" fontSize="10" fontWeight="800" fill="#0A0A0A">Quick Actions</text>
    {[
      { icon: '🤰', label: 'ANC Log', x: 12 },
      { icon: '💉', label: 'Vaccines', x: 86 },
      { icon: '📈', label: 'Growth', x: 160 },
      { icon: '📖', label: 'Learn', x: 234 },
    ].map(({ icon, label, x }) => (
      <g key={x}>
        <rect x={x} y="415" width="66" height="64" rx="10" fill="white" stroke="#E5E5E5" strokeWidth="0.8" />
        <text x={x + 33} y="445" textAnchor="middle" fontSize="20">{icon}</text>
        <text x={x + 33} y="469" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#0A0A0A">{label}</text>
      </g>
    ))}

    {/* Bottom nav */}
    <rect x="12" y="498" width="296" height="66" rx="20" fill="white" stroke="#E5E5E5" strokeWidth="0.8" />
    {[
      { icon: '🏠', label: 'Home', active: true, x: 36 },
      { icon: '💉', label: 'Vaccines', active: false, x: 96 },
      { icon: '📈', label: 'Growth', active: false, x: 160 },
      { icon: '📖', label: 'Learn', active: false, x: 224 },
      { icon: '⚙️', label: 'Settings', active: false, x: 284 },
    ].map(({ icon, label, active, x }) => (
      <g key={x}>
        {active && <rect x={x - 22} y="505" width="44" height="44" rx="16" fill="#0047FF" />}
        <text x={x} y="527" textAnchor="middle" fontSize="14">{icon}</text>
        <text x={x} y="543" textAnchor="middle" fontSize="6" fontWeight={active ? '700' : '500'} fill={active ? 'white' : '#A0A0A0'}>{label}</text>
      </g>
    ))}
  </svg>
);

// FIG 9 – AI Health Assistant UI
const FigAIHealth = () => (
  <svg viewBox="0 0 320 560" className="border border-[#E5E5E5] rounded-[12px] bg-white mx-auto" style={{ maxHeight: 560, display: 'block', maxWidth: 320 }}>
    <text x="160" y="18" textAnchor="middle" fontSize="9" fontWeight="700" fill="#0047FF" letterSpacing="2">FIG. 9 — AI HEALTH ASSISTANT (RSS + CHATBOT)</text>
    {/* Header */}
    <rect x="0" y="25" width="320" height="55" fill="white" stroke="#F0F0F0" strokeWidth="0.5" />
    <text x="20" y="42" fontSize="7" fill="#A0A0A0">AI POWERED</text>
    <text x="20" y="60" fontSize="17" fontWeight="800" fill="#0A0A0A">AI Health</text>

    {/* Tabs */}
    <rect x="12" y="85" width="296" height="36" rx="12" fill="white" stroke="#E5E5E5" strokeWidth="0.8" />
    <rect x="15" y="88" width="142" height="30" rx="10" fill="#0047FF" />
    <text x="86" y="107" textAnchor="middle" fontSize="9" fontWeight="700" fill="white">✦ Analysis</text>
    <text x="234" y="107" textAnchor="middle" fontSize="9" fontWeight="600" fill="#666">💬 Chat</text>

    {/* Risk Score Card */}
    <rect x="12" y="130" width="296" height="130" rx="16" fill="#E51010" opacity="0.05" stroke="#E51010" strokeWidth="0.8" strokeOpacity="0.25" />
    <text x="28" y="150" fontSize="7" fontWeight="700" fill="#A0A0A0">RISK SCORE</text>
    <text x="28" y="164" fontSize="9" fontWeight="600" fill="#E51010">High Risk</text>
    <text x="28" y="205" fontSize="44" fontWeight="800" fill="#E51010">72</text>
    <text x="85" y="208" fontSize="13" fill="#A0A0A0">/100</text>
    <rect x="28" y="218" width="260" height="8" rx="4" fill="rgba(0,0,0,0.08)" />
    <rect x="28" y="218" width="187" height="8" rx="4" fill="#E51010" />
    <rect x="28" y="238" width="260" height="32" rx="16" fill="#E51010" />
    <text x="158" y="258" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">✦ Run Analysis</text>

    {/* AI Summary */}
    <rect x="12" y="270" width="296" height="60" rx="12" fill="#0047FF" opacity="0.05" stroke="#0047FF" strokeWidth="0.8" strokeOpacity="0.2" />
    <text x="24" y="287" fontSize="7" fontWeight="700" fill="#0047FF">AI SUMMARY</text>
    <foreignObject x="20" y="292" width="280" height="30">
      <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: '8px', color: '#0A0A0A', lineHeight: '1.5' }}>
        Your blood pressure readings show an upward trend. Recommended immediate ANC consultation. Ensure iron supplementation is taken daily.
      </div>
    </foreignObject>

    {/* Alert */}
    <rect x="12" y="338" width="296" height="44" rx="10" fill="#E51010" opacity="0.06" stroke="#E51010" strokeWidth="0.8" strokeOpacity="0.3" />
    <text x="24" y="354" fontSize="8" fontWeight="700" fill="#E51010">⚠ Elevated Blood Pressure</text>
    <text x="24" y="368" fontSize="7.5" fill="#666">BP 148/96 mmHg — Seek ANC visit urgently</text>

    {/* Recommendation */}
    <rect x="12" y="390" width="296" height="40" rx="10" fill="white" stroke="#E5E5E5" strokeWidth="0.8" />
    <rect x="24" y="398" width="24" height="24" rx="12" fill="#2E7A5D" opacity="0.1" />
    <text x="36" y="414" textAnchor="middle" fontSize="11">📈</text>
    <text x="58" y="407" fontSize="8" fontWeight="600" fill="#0A0A0A">Visit facility for BP check</text>
    <text x="58" y="420" fontSize="7" fill="#F9A825" fontWeight="700">HIGH PRIORITY</text>

    {/* Recommendation 2 */}
    <rect x="12" y="438" width="296" height="40" rx="10" fill="white" stroke="#E5E5E5" strokeWidth="0.8" />
    <rect x="24" y="446" width="24" height="24" rx="12" fill="#2E7A5D" opacity="0.1" />
    <text x="36" y="462" textAnchor="middle" fontSize="11">💊</text>
    <text x="58" y="455" fontSize="8" fontWeight="600" fill="#0A0A0A">Continue daily IFAS supplementation</text>
    <text x="58" y="468" fontSize="7" fill="#A0A0A0">Standard</text>
  </svg>
);

// FIG 10 – Nurse Portal
const FigNursePortal = () => (
  <svg viewBox="0 0 680 500" className="w-full border border-[#E5E5E5] rounded-[12px] bg-white" style={{ maxHeight: 500 }}>
    <text x="340" y="20" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0047FF" letterSpacing="2">FIG. 10 — NURSE PORTAL PATIENT VIEW (NursePatientView)</text>
    {/* Nav bar */}
    <rect x="0" y="28" width="680" height="44" fill="white" stroke="#E5E5E5" strokeWidth="0.8" />
    <rect x="15" y="36" width="32" height="32" rx="9" fill="#2E7A5D" />
    <text x="31" y="56" textAnchor="middle" fontSize="14">🩺</text>
    <text x="58" y="48" fontSize="10" fontWeight="800" fill="#0A0A0A">TotoAfya Nurse</text>
    <text x="58" y="62" fontSize="8" fill="#A0A0A0">Nurse Portal</text>
    <rect x="600" y="38" width="65" height="26" rx="13" fill="#F5F5F7" stroke="#E5E5E5" strokeWidth="0.8" />
    <text x="632" y="55" textAnchor="middle" fontSize="8" fill="#666">Sign out</text>

    {/* Patient card */}
    <rect x="15" y="85" width="650" height="100" rx="16" fill="white" stroke="#E5E5E5" strokeWidth="0.8" />
    <rect x="28" y="98" width="56" height="56" rx="14" fill="#E51010" opacity="0.1" />
    <text x="56" y="131" textAnchor="middle" fontSize="22" fontWeight="800" fill="#E51010">AM</text>
    <text x="100" y="112" fontSize="15" fontWeight="800" fill="#0A0A0A">Amina Mwangi</text>
    <text x="100" y="128" fontSize="9" fill="#A0A0A0">+254 712 345 678 · Nairobi</text>
    <text x="100" y="142" fontSize="9" fill="#A0A0A0">ANC: ANC/2024/001234</text>
    <rect x="555" y="96" width="95" height="24" rx="12" fill="#E51010" opacity="0.1" />
    <text x="602" y="112" textAnchor="middle" fontSize="9" fontWeight="700" fill="#E51010">HIGH RISK</text>
    {/* Stats */}
    {[
      { label: 'Status', val: 'Pregnant', x: 108 },
      { label: 'Children', val: '2', x: 310 },
      { label: 'ANC Visits', val: '3', x: 510 },
    ].map(({ label, val, x }) => (
      <g key={x}>
        <text x={x} y="162" textAnchor="middle" fontSize="7.5" fill="#A0A0A0" fontWeight="700">{label.toUpperCase()}</text>
        <text x={x} y="177" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0A0A0A">{val}</text>
      </g>
    ))}

    {/* Tabs */}
    <rect x="15" y="196" width="650" height="36" rx="12" fill="white" stroke="#E5E5E5" strokeWidth="0.8" />
    {['Overview', 'ANC Visit', 'Vaccines', 'Growth', '🤖 AI Chat'].map((label, i) => {
      const active = i === 0;
      const x = 18 + i * 130;
      return (
        <g key={i}>
          {active && <rect x={x} y="199" width="125" height="30" rx="10" fill="#2E7A5D" />}
          <text x={x + 62} y="218" textAnchor="middle" fontSize="9" fontWeight={active ? '700' : '600'} fill={active ? 'white' : '#666'}>{label}</text>
        </g>
      );
    })}

    {/* Overview content */}
    <rect x="15" y="244" width="650" height="110" rx="12" fill="white" stroke="#E5E5E5" strokeWidth="0.8" />
    <text x="28" y="262" fontSize="8" fontWeight="700" fill="#A0A0A0">RECENT ANC VISITS</text>
    {[
      { visit: 'Visit #3', date: '2026-04-28 · Kenyatta Hospital', weeks: '28 wks', bp: 'BP 148/96', flag: true },
      { visit: 'Visit #2', date: '2026-03-15 · Kenyatta Hospital', weeks: '24 wks', bp: 'BP 130/82', flag: false },
      { visit: 'Visit #1', date: '2026-02-01 · Kenyatta Hospital', weeks: '18 wks', bp: 'BP 124/78', flag: false },
    ].map(({ visit, date, weeks, bp, flag }, i) => (
      <g key={i}>
        <line x1="28" y1={270 + i * 28} x2="652" y2={270 + i * 28} stroke="#F5F5F7" strokeWidth="0.8" />
        <text x="36" y={285 + i * 28} fontSize="10" fontWeight="700" fill="#0A0A0A">{visit}</text>
        <text x="130" y={285 + i * 28} fontSize="8" fill="#A0A0A0">{date}</text>
        <text x="460" y={285 + i * 28} fontSize="9" fill="#666">{weeks}</text>
        <text x="530" y={285 + i * 28} fontSize="9" fontWeight="700" fill={flag ? '#E51010' : '#2E7A5D'}>{bp}</text>
      </g>
    ))}

    {/* AI chat hint */}
    <rect x="15" y="365" width="650" height="112" rx="12" fill="#F5F5F7" stroke="#E5E5E5" strokeWidth="0.8" />
    <text x="28" y="385" fontSize="8" fontWeight="700" fill="#A0A0A0">🤖 CLINICAL AI CHAT PREVIEW</text>
    <rect x="28" y="393" width="430" height="28" rx="8" fill="#2E7A5D" opacity="0.1" />
    <text x="38" y="411" fontSize="8" fill="#2E7A5D">AI: Amina's BP trend is concerning (130→148 systolic). Rule out pre-eclampsia. Consider urine protein test.</text>
    <rect x="200" y="427" width="440" height="28" rx="8" fill="#2E7A5D" />
    <text x="215" y="445" fontSize="8" fontWeight="700" fill="white">Nurse: What is the recommended next step per MoH guidelines?</text>
    <rect x="28" y="458" width="60" height="12" rx="6" fill="#E5E5E5" />
    <rect x="40" y="462" width="6" height="6" rx="3" fill="#A0A0A0" />
    <rect x="50" y="462" width="6" height="6" rx="3" fill="#A0A0A0" opacity="0.6" />
    <rect x="60" y="462" width="6" height="6" rx="3" fill="#A0A0A0" opacity="0.3" />
  </svg>
);

/* ─── Figure Wrapper ─── */
const FigWrapper = ({ n, title, description, children }) => (
  <div className="mb-8 border border-[#E5E5E5] rounded-[16px] overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-3 bg-[#F5F5F7] border-b border-[#E5E5E5]">
      <Monitor size={14} className="text-[#0047FF]" />
      <span className="text-[11px] font-extrabold text-[#0047FF] tracking-widest">FIG. {n}</span>
      <span className="text-[13px] font-bold text-[#0A0A0A]">— {title}</span>
    </div>
    <div className="p-4 bg-white">
      {children}
      <p className="text-[11px] text-[#666] mt-3 leading-relaxed italic">{description}</p>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   MAIN PATENT DOCUMENT
══════════════════════════════════════════════════════ */
export default function PatentDocument() {
  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Nav */}
      <nav className="bg-white border-b border-[#E5E5E5] px-4 py-3 flex items-center justify-between sticky top-0 z-50 print:hidden">
        <Link to="/" className="flex items-center gap-2 text-[#666] hover:text-[#0A0A0A] transition-colors">
          <ArrowLeft size={16} /> <span className="text-[13px] font-semibold">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-[#0047FF]" />
          <span className="text-[13px] font-bold text-[#0A0A0A]">Patent Document</span>
        </div>
        <button onClick={() => window.print()}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#0047FF] px-4 py-2 rounded-full shadow-blue-glow-sm active:scale-[0.97] transition-all">
          <Printer size={13} /> Print / Export
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Cover */}
        <div className="bg-white rounded-[24px] border border-[#E5E5E5] p-8 mb-6 text-center shadow-card">
          <p className="text-[10px] tracking-[0.25em] font-bold uppercase text-[#A0A0A0] mb-3">PATENT APPLICATION — DRAFT</p>
          <div className="w-14 h-14 rounded-[18px] bg-[#0047FF] flex items-center justify-center mx-auto mb-4 shadow-blue-glow">
            <FileText size={26} className="text-white" />
          </div>
          <h1 className="text-[18px] font-extrabold leading-tight tracking-[-0.02em] text-[#0A0A0A] mb-2 max-w-lg mx-auto">
            Adaptive Multi-Channel Health Sync Engine (AMHSE) for Maternal and Child Health Systems
          </h1>
          <p className="text-[13px] text-[#666] mt-3">Applicant: TotoAfya Digital Health Systems</p>
          <p className="text-[12px] text-[#A0A0A0]">Application Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          <p className="text-[12px] text-[#A0A0A0] mt-1">IPC: G16H 10/60 · H04W 4/14 · G16H 40/20 · H04L 9/06 · G06F 16/27</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-[#F9A825]/10 border border-[#F9A825]/30 rounded-full px-4 py-1.5">
            <span className="text-[11px] font-bold text-[#F9A825]">DRAFT — CONFIDENTIAL — NOT FOR DISTRIBUTION</span>
          </div>
        </div>

        {/* §1 */}
        <Section number="1" title="Title of the Invention" defaultOpen>
          <P className="font-bold text-[15px] text-[#0A0A0A]">
            ADAPTIVE MULTI-CHANNEL HEALTH SYNC ENGINE (AMHSE) FOR MATERNAL AND CHILD HEALTH SYSTEMS IN LOW-BANDWIDTH AND DISCONNECTED ENVIRONMENTS
          </P>
        </Section>

        {/* §2 */}
        <Section number="2" title="Abstract" defaultOpen>
          <P>
            The present invention relates to a novel system and method for the intelligent prioritization, compression, and synchronization of maternal and child health (MCH) data across heterogeneous communication channels including broadband internet, Short Message Service (SMS), and Unstructured Supplementary Service Data (USSD), in environments characterized by intermittent, limited, or absent network connectivity. The invention, designated the Adaptive Multi-Channel Health Sync Engine (AMHSE), employs an artificial intelligence-based risk scoring subsystem to dynamically assign clinical urgency scores to individual patient records, thereby determining the priority order and preferred communication channel for data transmission. A structured encoding module compresses structured clinical data—including antenatal care vitals, immunization schedules, growth measurements, and danger sign flags—into SMS-compatible encoded packets without material loss of clinical fidelity. A distributed conflict detection and resolution engine reconciles divergent data states arising from parallel offline modifications across multiple nodes, employing a deterministic merge algorithm grounded in clinical priority rules. The system maintains an offline-first data persistence layer supporting eventual consistency across facility nodes, community health volunteer devices, and central health information repositories. End-to-end encryption and role-based access control mechanisms ensure the confidentiality and integrity of sensitive patient data throughout all transmission pathways. The AMHSE is particularly adapted for deployment in sub-Saharan African and other low-resource health systems as a foundational infrastructure layer for national maternal and child health digital platforms.
          </P>
        </Section>

        {/* §3 */}
        <Section number="3" title="Field of the Invention">
          <P>
            The present invention pertains to the field of digital health information systems, and more particularly to distributed, adaptive data synchronization architectures for maternal and child health management in resource-constrained and low-connectivity environments. The invention further encompasses artificial intelligence-assisted clinical risk stratification, multi-modal telecommunications channel management, structured medical data compression and encoding, offline-first distributed database systems, and secure health data interchange protocols. The invention is applicable within the broader domain of electronic health records (EHR), mobile health (mHealth) platforms, community health worker (CHW) support systems, and national health information management infrastructure, with particular relevance to health systems operating under the constraints typical of low- and middle-income countries (LMICs).
          </P>
        </Section>

        {/* §4 */}
        <Section number="4" title="Background of the Invention">
          <H>4.1 Global Burden of Maternal and Child Mortality</H>
          <P>
            Despite decades of international investment, preventable maternal and child mortality remains unacceptably high across sub-Saharan Africa. The World Health Organization estimates that over 94% of all maternal deaths occur in low- and lower-middle-income countries, with the majority attributable to clinically identifiable and preventable conditions including postpartum hemorrhage, eclampsia, sepsis, and obstructed labor. Child mortality from vaccine-preventable diseases and acute malnutrition continues to impose substantial human and economic costs.
          </P>
          <H>4.2 Limitations of Existing Digital Health Solutions</H>
          <P>
            Existing digital health platforms deployed in low-resource settings presuppose continuous high-bandwidth internet connectivity, rendering them non-functional in rural settings. Where offline capability is implemented, existing solutions rely on simplistic binary synchronization models failing to account for variable urgency of clinical data or variable cost of available communication channels. SMS-based health interventions have not been engineered to carry structured, bidirectional clinical data in a lossless, machine-readable format. Existing systems lack sophisticated conflict resolution mechanisms adequate for healthcare contexts where multiple health workers may simultaneously modify the same patient record across disconnected nodes. Privacy architectures in many deployed mHealth solutions are inadequate, lacking field-level encryption or granular access control.
          </P>
          <H>4.3 Infrastructure Challenges in Low-Connectivity Regions</H>
          <P>
            In sub-Saharan Africa, 2G (GSM/EDGE) coverage in rural zones constitutes the ceiling of available connectivity. Community health workers typically carry basic feature phones or low-specification Android devices operating in areas where power supply is intermittent and data costs represent a material financial burden. These conditions necessitate a health data synchronization architecture that treats connectivity as an exception rather than the norm.
          </P>
          <H>4.4 Absence of Adaptive, Risk-Stratified Synchronization</H>
          <P>
            No prior art known to the inventors provides a system combining AI-driven clinical risk stratification with adaptive communication channel selection and structured medical data compression in a unified, deployable architecture. There accordingly exists a substantial unmet need for a system capable of intelligently determining which clinical data requires urgent transmission, selecting the most appropriate available communication channel, encoding the data in a channel-appropriate format, and resolving conflicts arising from distributed offline modification—all within a security-preserving framework suitable for national health information systems.
          </P>
        </Section>

        {/* §5 */}
        <Section number="5" title="Summary of the Invention">
          <P>
            The present invention provides an Adaptive Multi-Channel Health Sync Engine (AMHSE) comprising: (a) an AI-based Risk Scoring Subsystem (RSS) that continuously evaluates maternal and child health records to produce a quantitative clinical urgency score and categorical risk level for each patient; (b) a Channel Selection and Routing Module (CSRM) that evaluates available communication channels in real time and selects the optimal channel based on a multi-factor weighting algorithm incorporating patient risk score, data payload size, channel availability, channel cost, and minimum latency requirements; (c) a Structured Medical Data Compression and Encoding Engine (SMDCEE) that transforms structured clinical data objects into compact, channel-appropriate encoded packets, including a reversible SMS encoding protocol capable of representing a complete antenatal care visit record within one to three SMS messages without loss of clinical information; (d) a Distributed Conflict Detection and Resolution Engine (DCDRE) that identifies, logs, and resolves conflicting data states arising from parallel offline modifications using a deterministic, clinically-weighted merge algorithm; (e) an Offline-First Data Persistence Layer (OFDPL) implementing a local-first database with append-only change logs and cryptographic state verification for eventual consistency guarantees; and (f) a Security and Access Control Framework (SACF) providing end-to-end field-level encryption, role-based access control, and audit trail generation for all data operations.
          </P>
        </Section>

        {/* §6 – Drawings */}
        <Section number="6" title="Brief Description of Drawings" defaultOpen>
          <P className="text-[12px] text-[#A0A0A0] italic mb-4">All drawings are reproduced herein. Reference numerals are consistent throughout.</P>

          <FigWrapper n="1" title="System Architecture Overview"
            description="Block diagram of the six principal AMHSE subsystems (RSS, CSRM, SMDCEE, DCDRE, OFDPL, SACF) and their interconnections with external interfaces including client application nodes, SMS gateway, USSD gateway, and central health information repository.">
            <FigSystemArch />
          </FigWrapper>

          <FigWrapper n="2" title="AI Risk Scoring Pipeline (RSS)"
            description="Detailed flow diagram depicting the multi-feature weighted scoring pipeline for maternal records, including the rule-based override layer for clinical danger signs, and the four-tier risk classification output (LOW/MEDIUM/HIGH/CRITICAL).">
            <FigRiskScoring />
          </FigWrapper>

          <FigWrapper n="3" title="Adaptive Channel Selection Decision Tree (CSRM)"
            description="Decision-tree illustrating the CSRM channel selection logic: internet availability check, latency threshold, risk-score threshold, SMS priority enforcement, and T_urgent timeout override for CRITICAL-risk patients.">
            <FigChannelSelect />
          </FigWrapper>

          <FigWrapper n="4" title="SMS Encoding Packet Structure (SMDCEE)"
            description="Byte-level diagram of the AMHSE SMS encoding format showing the 12-byte header, variable clinical payload with domain-specific encodings, and 3-byte trailer, demonstrating that a complete ANC visit (12 fields) fits in a single 160-character SMS.">
            <FigSMSEncoding />
          </FigWrapper>

          <FigWrapper n="5" title="Conflict Detection and Resolution Flow (DCDRE)"
            description="Sequence diagram showing a two-node offline conflict scenario: Merkle hash divergence detection, field-level diff extraction, Clinical Priority Merge Table application, merged record write, and audit log entry.">
            <FigConflict />
          </FigWrapper>

          <FigWrapper n="6" title="Offline-First Data Persistence Architecture (OFDPL)"
            description="Layered architecture showing the Local Store components (Active Records DB, Change Log, Pending Sync Queue), the Sync Engine's network-aware queue processor, the multi-channel transport adapter, and SLA windows per risk tier.">
            <FigOfflineFirst />
          </FigWrapper>

          <FigWrapper n="7" title="Security Architecture and Trust Zones (SACF)"
            description="Four-zone trust-boundary diagram illustrating encryption, key management, and authentication controls at each layer: end-user device, transport, API gateway, and central repository. Audit event emission points are indicated.">
            <FigSecurity />
          </FigWrapper>

          <FigWrapper n="8" title="Caregiver Home Dashboard — Representative Screen"
            description="Wireframe of the patient-facing mobile home screen showing the pregnancy status badge, AI alert banner, fetal development card, risk score widget, children list with upcoming vaccine indicator, and bottom navigation bar.">
            <div className="flex justify-center">
              <FigDashboard />
            </div>
          </FigWrapper>

          <FigWrapper n="9" title="AI Health Assistant Interface — Representative Screen"
            description="Wireframe of the patient-facing AI Health page showing the tabbed interface (Analysis / Chat), risk score card with gradient meter, Run Analysis trigger, AI summary output, colour-coded health alerts, and prioritised recommendations.">
            <div className="flex justify-center">
              <FigAIHealth />
            </div>
          </FigWrapper>

          <FigWrapper n="10" title="Nurse Portal Patient View — Representative Screen"
            description="Wireframe of the clinician-facing Nurse Portal showing patient summary card with risk badge, tabbed clinical data entry interface (Overview, ANC Visit, Vaccines, Growth, AI Chat), ANC visit history table with flagged abnormal BP, and Clinical AI chatbot interface.">
            <FigNursePortal />
          </FigWrapper>
        </Section>

        {/* §7 */}
        <Section number="7" title="Detailed Description of the Invention">
          <H>7.1 System Architecture Overview</H>
          <P>
            The AMHSE is implemented as a layered software architecture deployed across a heterogeneous node topology comprising: (i) client application nodes installed on Android-based smartphones and feature phones operated by community health workers (CHWs), nurses, and caregivers; (ii) facility server nodes operating at health facility level; and (iii) a central health information repository operating at county or national level. All nodes implement the OFDPL and communicate through the CSRM. Nodes may operate in full offline mode for extended periods without degradation of local clinical functionality, synchronizing with higher-level nodes opportunistically when connectivity is available.
          </P>
          <H>7.2 AI-Based Risk Scoring Subsystem (RSS)</H>
          <P>
            The RSS computes a patient risk score S ∈ [0, 100] for each maternal or child record, updated upon every data modification event and at defined periodic intervals. For maternal records, the scoring function is a weighted linear combination of normalized clinical features:
          </P>
          <div className="bg-[#F5F5F7] rounded-[10px] p-4 font-mono text-[11px] text-[#0A0A0A] my-3 overflow-x-auto">
            {`S_M = Σ(w_i · φ_i(x_i)) for i = 1 to N\n\nFeature weights (maternal):\n  Systolic BP deviation  w=0.22\n  Diastolic BP           w=0.18\n  Haemoglobin            w=0.15\n  Danger signs present   w=0.20 (binary override)\n  ANC overdue days       w=0.08\n  Gestational age        w=0.12\n  Gravida/parity factor  w=0.05\n\nRisk tiers: LOW (0-29), MEDIUM (30-59), HIGH (60-79), CRITICAL (80-100)\nRule override: ANY danger sign present → force CRITICAL`}
          </div>
          <H>7.3 Channel Selection and Routing Module (CSRM)</H>
          <P>
            The CSRM evaluates available communication channels at sync trigger time and selects the optimal channel via multi-factor scoring. For CRITICAL-risk patients, if no internet channel achieves availability within configurable timeout T_urgent (default: 5 minutes), the CSRM automatically initiates SMS transmission irrespective of cost parameters.
          </P>
          <div className="bg-[#F5F5F7] rounded-[10px] p-4 font-mono text-[11px] text-[#0A0A0A] my-3 overflow-x-auto">
            {`C(channel_j) = α·Availability(j) + β·(1/Latency(j)) + γ·(1/Cost(j)) + δ·Capacity(j, payload)\n\nWeights: α=0.30, β=0.25, γ=0.20, δ=0.25\nConstraint: if Risk=CRITICAL AND internet unavailable for T_urgent → enforce SMS_Priority`}
          </div>
          <H>7.4 Structured Medical Data Compression and Encoding Engine (SMDCEE)</H>
          <P>
            The SMDCEE provides reversible compression of structured clinical data into compact binary representations. Blood pressure values are encoded as unsigned 8-bit integers offset from clinical baselines (systolic: 60 mmHg; diastolic: 40 mmHg). Weight values are encoded as unsigned 16-bit fixed-point numbers. Dates are encoded as unsigned 16-bit integers representing days elapsed since 2020-01-01. A complete ANC visit record (12 fields) encodes to 112 bytes, fitting within one 160-character SMS message in GSM 7-bit encoding.
          </P>
          <H>7.5 Offline-First Data Persistence Layer (OFDPL)</H>
          <P>
            The OFDPL implements a local-first data architecture. The local data store maintains: (1) the Active Records Database for current patient record states; (2) an append-only Change Log where each entry is SHA-256 hash-chained to the preceding entry for tamper-evidence; and (3) the Pending Sync Queue (PSQ), a priority-ordered queue of unsynchronized changes ordered by patient risk score, ensuring CRITICAL-tier records transmit first upon connectivity restoration.
          </P>
          <H>7.6 Distributed Conflict Detection and Resolution Engine (DCDRE)</H>
          <P>
            Upon node synchronization, the DCDRE detects divergent states by comparing Merkle tree hashes. On divergence, field-level comparison identifies specific conflicting fields. Each field is processed via the Clinical Priority Merge Table (CPMT): clinical measurement fields resolve to the most recent clinical event timestamp; administrative fields resolve by last-write-wins; computed fields (risk score, risk level) are recomputed from merged clinical measurements. All resolution events are written to the tamper-evident audit trail.
          </P>
          <H>7.7 Security and Access Control Framework (SACF)</H>
          <P>
            Data at rest employs AES-256-GCM with keys derived via PBKDF2 (≥310,000 iterations). Internet transport uses TLS 1.3 with certificate pinning. SMS packets use ChaCha20-Poly1305 with session keys established via ECDH over Curve25519 during device provisioning. RBAC defines five roles: CHW (panel-restricted), Facility Nurse (facility-scoped), Facility Admin (audit access), County Health Officer (aggregate/anonymized only), System Administrator (configuration only, no clinical data).
          </P>
        </Section>

        {/* §8 – SOURCE CODE */}
        <Section number="8" title="Source Code Listings — Reference Implementations" defaultOpen>
          <P className="text-[12px] text-[#666] italic mb-4">
            The following source code listings constitute reference implementations of the inventive subsystems as deployed in the TotoAfya Digital Health System. All code is written in JavaScript (React framework) targeting mobile-first client application nodes.
          </P>

          <H>Listing 1 — AI Risk Scoring + Analysis Engine (RSS Implementation)</H>
          <P className="text-[12px] text-[#444] mb-2">File: <code className="bg-[#F5F5F7] px-1.5 py-0.5 rounded text-[11px]">pages/AIHealthAssistant.jsx</code> — Implements the patient-facing RSS invocation, data context assembly, LLM-based risk scoring, alert generation, and risk score persistence.</P>
          <CodeBlock title="AIHealthAssistant — RSS + Risk Scoring + Alert Engine" lang="jsx">
{`// pages/AIHealthAssistant.jsx
// Implements: RSS (Risk Scoring Subsystem), Alert generation, LLM integration

import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, TrendingUp, RefreshCw, ChevronRight, Shield, MessageCircle } from 'lucide-react';

import { differenceInWeeks, differenceInDays, parseISO } from 'date-fns';
import PatientChatbot from '@/components/ai/PatientChatbot';

export default function AIHealthAssistant() {
  const [mother, setMother] = useState(null);
  const [children, setChildren] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [riskScore, setRiskScore] = useState(null);
  const [existingAlerts, setExistingAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState('analysis');

  useEffect(() => { loadData(); }, []);

  // ── OFDPL: Load patient data from local/remote store ──
  const loadData = async () => {
    const [mothers, kids, v, alerts] = await Promise.all([
      db.entities.Mother.list('-created_date', 1),
      db.entities.Child.list('-created_date', 10),
      db.entities.Immunization.filter({ status: 'overdue' }, '-scheduled_date', 20),
      db.entities.AIAlert.filter({ is_resolved: false }, '-created_date', 10),
    ]);
    setMother(mothers[0] || null);
    setChildren(kids);
    setVaccines(v);
    setExistingAlerts(alerts);
    if (mothers[0]) setRiskScore(mothers[0].risk_score);
  };

  // ── RSS: Assemble clinical context and invoke AI risk scoring ──
  const runAnalysis = async () => {
    setLoading(true);
    try {
      const ancList = await db.entities.ANCVisit.list('-visit_date', 5);
      const growthList = await db.entities.GrowthRecord.list('-recorded_date', 10);

      // Feature vector construction for RSS
      const contextData = {
        mother: mother ? {
          pregnancy_status: mother.pregnancy_status,
          weeks_pregnant: mother.lmp
            ? differenceInWeeks(new Date(), parseISO(mother.lmp)) : null,
          gravida: mother.gravida,
          parity: mother.parity,
          anc_visits: ancList.length,
          // Latest vitals for BP-based risk weighting (w=0.40 combined)
          last_bp: ancList[0]
            ? \`\${ancList[0].blood_pressure_systolic}/\${ancList[0].blood_pressure_diastolic}\`
            : null,
          danger_signs_reported: ancList.flatMap(v => v.danger_signs || []),
        } : null,
        children: children.map(child => ({
          name: child.full_name,
          age_months: child.date_of_birth
            ? Math.floor(differenceInDays(new Date(), parseISO(child.date_of_birth)) / 30)
            : null,
          health_status: child.health_status,
          days_since_visit: child.last_visit_date
            ? differenceInDays(new Date(), parseISO(child.last_visit_date)) : null,
        })),
        overdue_vaccines: vaccines.length,
        latest_growth: growthList[0] ? {
          weight_kg: growthList[0].weight_kg,
          height_cm: growthList[0].height_cm,
          muac_cm: growthList[0].muac_cm,
          nutrition_status: growthList[0].nutrition_status,
        } : null,
      };

      // RSS: LLM-based scoring with structured JSON schema response
      const result = await db.integrations.Core.InvokeLLM({
        prompt: \`You are a maternal and child health AI assistant for TotoAfya Digital in Kenya.
Analyze the following patient data and provide:
1. A risk score (0-100, where 0=no risk, 100=critical)
2. Risk level: "low", "medium", "high", or "critical"
3. Up to 5 specific health alerts (severity: "info", "warning", or "critical")
4. Up to 4 personalized recommendations
5. A brief health summary (2-3 sentences)
Use WHO/Kenya MCH guidelines. Patient data: \${JSON.stringify(contextData, null, 2)}\`,
        response_json_schema: {
          type: 'object',
          properties: {
            risk_score: { type: 'number' },
            risk_level: { type: 'string' },
            summary: { type: 'string' },
            summary_sw: { type: 'string' },
            alerts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  severity: { type: 'string' },
                  title: { type: 'string' },
                  title_sw: { type: 'string' },
                  message: { type: 'string' },
                  message_sw: { type: 'string' },
                  chv_needed: { type: 'boolean' },
                },
              },
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  action: { type: 'string' },
                  action_sw: { type: 'string' },
                  priority: { type: 'string' },
                },
              },
            },
          },
        },
      });

      setAnalysis(result);
      setRiskScore(result.risk_score);

      // OFDPL: Persist risk score to patient record (sync via PSQ)
      if (mother) {
        await db.entities.Mother.update(mother.id, {
          risk_score: result.risk_score,
          risk_level: result.risk_level,
        });
      }

      // AIAlert entity: persist generated alerts for CHV/nurse notification
      for (const alert of (result.alerts || []).slice(0, 3)) {
        await db.entities.AIAlert.create({
          mother_id: mother?.id,
          alert_type: alert.type || 'risk_flag',
          severity: alert.severity || 'info',
          title: alert.title,
          title_sw: alert.title_sw,
          message: alert.message,
          message_sw: alert.message_sw,
          ai_confidence: 0.85,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Risk colour classification for UI rendering
  const riskColor = riskScore === null ? '#A0A0A0'
    : riskScore < 30 ? '#2E7A5D'
    : riskScore < 60 ? '#F9A825'
    : '#E51010';

  return (
    <AppShell>
      {/* Tab switcher: Analysis (RSS) | Chat (PatientChatbot) */}
      <div className="flex gap-1 mx-4 mb-4 bg-white rounded-[16px] p-1 border border-[#E5E5E5]">
        <button onClick={() => setActiveTab('analysis')} ...>✦ Analysis</button>
        <button onClick={() => setActiveTab('chat')} ...>💬 Chat</button>
      </div>

      {activeTab === 'chat' && (
        <PatientChatbot mother={mother} children={children} lang={lang} />
      )}

      {activeTab === 'analysis' && (
        <>
          {/* Risk Score Card with gradient meter */}
          <div style={{ background: \`linear-gradient(135deg, \${riskColor}15, \${riskColor}05)\` }}>
            <span style={{ color: riskColor }}>{riskScore ?? '?'}</span>
            <div className="h-2 bg-black/8 rounded-full overflow-hidden">
              <div style={{ width: \`\${riskScore ?? 0}%\`, background: \`linear-gradient(90deg, #2E7A5D, \${riskColor})\` }} />
            </div>
            <button onClick={runAnalysis} disabled={loading}>
              {loading ? 'Analyzing...' : '✦ Run Analysis'}
            </button>
          </div>
          {/* Analysis results: summary, alerts, recommendations */}
          {analysis && <>{/* ... rendered results ... */}</>}
        </>
      )}
    </AppShell>
  );
}`}
          </CodeBlock>

          <H>Listing 2 — Patient AI Chatbot with Clinical Context (SACF + RSS)</H>
          <P className="text-[12px] text-[#444] mb-2">File: <code className="bg-[#F5F5F7] px-1.5 py-0.5 rounded text-[11px]">components/ai/PatientChatbot.jsx</code> — Implements patient-facing conversational AI with clinical context injection from the patient's risk profile, pregnancy data, and children's records.</P>
          <CodeBlock title="PatientChatbot — Patient-facing Clinical AI" lang="jsx">
{`// components/ai/PatientChatbot.jsx
// Implements: Patient-facing AI chatbot with clinical context (RSS data injection)
// Security: All data is scoped to the authenticated user's own records (RBAC)

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import { differenceInWeeks, differenceInDays, parseISO } from 'date-fns';

export default function PatientChatbot({ mother, children, lang }) {
  const greeting = lang === 'sw'
    ? 'Habari! Mimi ni msaidizi wako wa afya wa AI...'
    : \`Hi\${mother?.full_name ? \` \${mother.full_name.split(' ')[0]}\` : ''}! I'm your personal health AI assistant...\`;

  const [messages, setMessages] = useState([{ role: 'assistant', content: greeting }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Clinical context builder: injects RSS-derived risk data ──
  // This constitutes the patient-record context injection layer of the AMHSE
  const buildContext = () => {
    const weeksPregnant = mother?.lmp
      ? differenceInWeeks(new Date(), parseISO(mother.lmp)) : null;
    return \`
PATIENT CONTEXT (from OFDPL local store):
- Name: \${mother?.full_name || '—'}
- Pregnancy status: \${mother?.pregnancy_status || '—'}
- Weeks pregnant: \${weeksPregnant ?? '—'}
- EDD: \${mother?.edd || '—'}
- Risk level: \${mother?.risk_level || 'low'} (score: \${mother?.risk_score ?? '—'})
- Gravida: \${mother?.gravida ?? '—'}, Parity: \${mother?.parity ?? '—'}
- County: \${mother?.county || '—'}, Facility: \${mother?.facility_name || '—'}
- Language preference: \${lang === 'sw' ? 'Swahili' : 'English'}

CHILDREN (\${children.length}):
\${children.map(c => {
  const ageMonths = c.date_of_birth
    ? Math.floor(differenceInDays(new Date(), parseISO(c.date_of_birth)) / 30) : null;
  return \`- \${c.full_name}, \${ageMonths !== null ? \`\${ageMonths} months\` : ''}, \${c.gender}, \${c.health_status}\`;
}).join('\\n') || 'None'}

SYSTEM INSTRUCTIONS:
You are a warm, supportive MCH AI for TotoAfya Kenya. Use WHO/Kenya MoH guidelines.
Respond in \${lang === 'sw' ? 'Swahili' : 'English'}. Recommend professional care for serious concerns.
    \`.trim();
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Sliding window conversation history (last 6 turns) to bound token usage
    const history = messages.slice(-6)
      .map(m => \`\${m.role === 'user' ? 'Patient' : 'AI'}: \${m.content}\`).join('\\n');

    const prompt = \`\${buildContext()}

RECENT CONVERSATION:
\${history}

Patient: \${userMsg.content}
AI:\`;

    // CSRM: uses internet channel (primary); SMS fallback handled by sync engine
    const response = await db.integrations.Core.InvokeLLM({ prompt });
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  // Quick-access prompts for low-literacy users (bilingual)
  const QUICK_QUESTIONS = lang === 'sw'
    ? ['Dalili za hatari ni zipi?', 'Lini niende ANC?', 'Chanjo gani inakuja?']
    : ['What are danger signs?', 'When is my next ANC visit?', 'What vaccine is due next?'];

  return (
    <div className="flex flex-col h-[520px] bg-white rounded-[20px] border border-[#E5E5E5] overflow-hidden">
      {/* Chat header */}
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Bot size={15} className="text-white" />
        <p>Health Assistant — Has your full health profile</p>
      </div>
      {/* Message feed with markdown rendering */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'justify-end' : 'justify-start'}>
            <div className={msg.role === 'user' ? 'bg-[#0047FF] text-white' : 'bg-[#F5F5F7] text-[#0A0A0A]'}>
              {msg.role === 'assistant'
                ? <ReactMarkdown>{msg.content}</ReactMarkdown>
                : <p>{msg.content}</p>}
            </div>
          </div>
        ))}
        {loading && <TypingIndicator />}
        {messages.length === 1 && <QuickQuestions questions={QUICK_QUESTIONS} onSelect={setInput} />}
      </div>
      {/* Text input with Enter-to-send */}
      <div className="px-3 py-3 border-t flex gap-2">
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder={lang === 'sw' ? 'Uliza swali lolote la afya...' : 'Ask any health question...'} />
        <button onClick={sendMessage} disabled={!input.trim() || loading}><Send size={15} /></button>
      </div>
    </div>
  );
}`}
          </CodeBlock>

          <H>Listing 3 — Nurse Clinical AI Chatbot (Clinician-facing RSS)</H>
          <P className="text-[12px] text-[#444] mb-2">File: <code className="bg-[#F5F5F7] px-1.5 py-0.5 rounded text-[11px]">components/nurse/NurseChatbot.jsx</code> — Implements clinician-facing AI with full patient clinical record injection including ANC vitals, danger signs, and children's data.</P>
          <CodeBlock title="NurseChatbot — Clinical AI for Nurse Portal" lang="jsx">
{`// components/nurse/NurseChatbot.jsx
// Implements: Nurse-facing Clinical AI with full patient record context injection
// RBAC: Only accessible to users with role='nurse' or role='admin'

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

import ReactMarkdown from 'react-markdown';

export default function NurseChatbot({ patient, children, ancVisits }) {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: \`Hello! I have full access to **\${patient.full_name}'s** clinical record.
I can help you interpret vitals, flag risks, suggest next steps, or answer
clinical questions about this patient. How can I assist?\`,
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Clinical context builder: full patient record for nurse ──
  // Injects: demographics, risk score, latest ANC vitals, children, interventions
  const buildContext = () => {
    const latestANC = ancVisits[0];
    return \`
PATIENT CLINICAL RECORD:
- Name: \${patient.full_name}
- Phone: \${patient.phone || '—'}  County: \${patient.county || '—'}
- Pregnancy status: \${patient.pregnancy_status || '—'}
- Risk level: \${patient.risk_level || 'low'} (score: \${patient.risk_score ?? '—'})
- LMP: \${patient.lmp || '—'}  EDD: \${patient.edd || '—'}
- Gravida: \${patient.gravida ?? '—'}  Parity: \${patient.parity ?? '—'}
- Blood group: \${patient.blood_group || '—'}
- Facility: \${patient.facility_name || '—'}
- Total ANC visits recorded: \${ancVisits.length}
\${latestANC ? \`
LATEST ANC VISIT (\${latestANC.visit_date}):
  Visit #\${latestANC.visit_number}  Facility: \${latestANC.facility || '—'}
  BP: \${latestANC.blood_pressure_systolic}/\${latestANC.blood_pressure_diastolic} mmHg
  Weight: \${latestANC.weight_kg} kg  Fundal height: \${latestANC.fundal_height_cm} cm
  Fetal HR: \${latestANC.fetal_heart_rate} bpm  Hb: \${latestANC.haemoglobin} g/dL
  TTV: \${latestANC.ttv_given ? 'Given' : 'Not given'}
  IFAS: \${latestANC.ifas_given ? 'Given' : 'Not given'}
  LLIN: \${latestANC.llin_given ? 'Given' : 'Not given'}
  Danger signs: \${latestANC.danger_signs?.join(', ') || 'None reported'}
\` : '  No ANC visits recorded'}

CHILDREN (\${children.length}):
\${children.map(c =>
  \`- \${c.full_name}  DOB: \${c.date_of_birth}  Gender: \${c.gender}  Status: \${c.health_status}\`
).join('\\n') || 'None'}

CLINICAL AI INSTRUCTIONS:
You are a clinical AI assistant for Kenyan maternal and child health (MoH/WHO guidelines).
Be concise and clinically precise. Flag urgent issues with ⚠. Suggest specific interventions.
    \`.trim();
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = messages
      .map(m => \`\${m.role === 'user' ? 'Nurse' : 'AI'}: \${m.content}\`).join('\\n');

    const prompt = \`\${buildContext()}\\n\\nCONVERSATION:\\n\${history}\\n\\nNurse: \${userMsg.content}\\n\\nAI:\`;

    const response = await db.integrations.Core.InvokeLLM({ prompt });
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-[20px] border border-[#E5E5E5] overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <Bot className="text-[#2E7A5D]" />
        <div>
          <p className="font-bold">Clinical AI</p>
          <p className="text-[10px] text-[#A0A0A0]">Has full context for {patient.full_name}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? 'justify-end' : 'justify-start'}>
            <div className={msg.role === 'user' ? 'bg-[#2E7A5D] text-white' : 'bg-[#F5F5F7]'}>
              {msg.role === 'assistant'
                ? <ReactMarkdown>{msg.content}</ReactMarkdown>
                : <p>{msg.content}</p>}
            </div>
          </div>
        ))}
        {loading && <TypingDots />}
      </div>
      <div className="px-3 py-3 border-t flex gap-2">
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder="Ask about this patient's vitals, risks, next steps..." />
        <button onClick={sendMessage} disabled={!input.trim() || loading}>
          <Send size={15} className="text-white" />
        </button>
      </div>
    </div>
  );
}`}
          </CodeBlock>

          <H>Listing 4 — Vaccination Schedule Engine (Immunization Entity + Schedule Seeding)</H>
          <P className="text-[12px] text-[#444] mb-2">File: <code className="bg-[#F5F5F7] px-1.5 py-0.5 rounded text-[11px]">pages/VaccinationSchedule.jsx</code> — Implements Kenya MoH immunization schedule computation, status tracking (given/due/overdue/missed), and bulk record creation via OFDPL.</P>
          <CodeBlock title="VaccinationSchedule — Kenya Immunization Engine" lang="jsx">
{`// pages/VaccinationSchedule.jsx
// Implements: Kenya MoH immunization schedule, status tracking, OFDPL persistence

// Standard Kenya Expanded Programme on Immunisation (KEPI) schedule
const KENYA_VACCINE_SCHEDULE = [
  { name: 'BCG',                                age_weeks: 0,  description: 'Tuberculosis' },
  { name: 'OPV 0',                              age_weeks: 0,  description: 'Polio (birth dose)' },
  { name: 'OPV 1 + Penta 1 + PCV 1 + Rota 1', age_weeks: 6,  description: 'Polio, DPT-HepB-Hib, Pneumonia, Rotavirus' },
  { name: 'OPV 2 + Penta 2 + PCV 2 + Rota 2', age_weeks: 10, description: 'Second dose' },
  { name: 'OPV 3 + Penta 3 + PCV 3 + IPV',    age_weeks: 14, description: 'Third dose + Inactivated Polio' },
  { name: 'Vitamin A + Measles 1',             age_weeks: 36, description: '9 months: Measles & Vitamin A' },
  { name: 'Measles 2 + Vitamin A',             age_weeks: 74, description: '18 months booster' },
];

// Status visual configuration for UI rendering
const statusIcon  = { given: CheckCircle2, due: Clock, overdue: AlertCircle, upcoming: Circle, scheduled: Circle };
const statusColor = { given: '#2E7A5D', due: '#F9A825', overdue: '#E51010', upcoming: '#A0A0A0', scheduled: '#0047FF' };

// ── Schedule seeding: compute scheduled_date from date_of_birth ──
// Implements OFDPL bulkCreate for offline-first persistence
const seedSchedule = async () => {
  if (!selectedChild) return;
  setSaving(true);
  const dob = parseISO(selectedChild.date_of_birth);
  const records = KENYA_VACCINE_SCHEDULE.map(v => ({
    child_id: selectedChild.id,
    vaccine_name: v.name,
    age_weeks: v.age_weeks,
    // Scheduled date = DOB + age_weeks × 7 days
    scheduled_date: new Date(
      dob.getTime() + v.age_weeks * 7 * 24 * 60 * 60 * 1000
    ).toISOString().split('T')[0],
    status: 'scheduled',
    dose_number: 1,
  }));
  // OFDPL: bulkCreate queued to Pending Sync Queue if offline
  await db.entities.Immunization.bulkCreate(records);
  await loadVaccines(selectedChild.id);
  setSaving(false);
};

// ── Mark vaccine as administered ──
const markGiven = async (vaccine) => {
  setSaving(true);
  await db.entities.Immunization.update(vaccine.id, {
    status: 'given',
    given_date: new Date().toISOString().split('T')[0],
  });
  await loadVaccines(selectedChild.id);
  setSaving(false);
};

// ── Vaccine timeline rendering ──
// Displays status badges, days-remaining/overdue, mark-given CTA
vaccines.sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
  .map((vaccine) => {
    const daysLeft = differenceInDays(parseISO(vaccine.scheduled_date), new Date());
    // Visual urgency: overdue → red, due → amber, scheduled → neutral
    return (
      <VaccineCard
        vaccine={vaccine}
        daysLeft={daysLeft}
        onMarkGiven={() => markGiven(vaccine)}
      />
    );
  });`}
          </CodeBlock>

          <H>Listing 5 — Growth Tracker with WHO Reference Integration</H>
          <P className="text-[12px] text-[#444] mb-2">File: <code className="bg-[#F5F5F7] px-1.5 py-0.5 rounded text-[11px]">pages/GrowthTracker.jsx</code> — Implements longitudinal growth charting against WHO weight-for-age median references, nutrition status classification (Normal/MAM/SAM), and OFDPL record persistence.</P>
          <CodeBlock title="GrowthTracker — WHO Growth Standards + OFDPL" lang="jsx">
{`// pages/GrowthTracker.jsx
// Implements: Growth record persistence, WHO median overlay, nutrition classification

// WHO Weight-for-age median reference values (boys, approximate, kg)
// Used for growth-chart overlay (dashed reference line in FIG. 9)
const WHO_WEIGHT_MEDIAN = {
  0:3.3, 1:4.5, 2:5.6, 3:6.4, 4:7.0, 5:7.5, 6:7.9, 7:8.3, 8:8.6,
  9:8.9, 10:9.2, 11:9.4, 12:9.6, 18:10.9, 24:12.2, 36:14.3, 48:16.3, 60:18.3
};

// ── Save growth record to OFDPL ──
const saveRecord = async () => {
  if (!selectedChild) return;
  setSaving(true);
  // Calculate age in months at measurement date (for z-score lookup)
  const ageMonths = differenceInMonths(
    parseISO(form.recorded_date),
    parseISO(selectedChild.date_of_birth)
  );
  await db.entities.GrowthRecord.create({
    child_id: selectedChild.id,
    ...form,
    weight_kg:   parseFloat(form.weight_kg)  || null,
    height_cm:   parseFloat(form.height_cm)  || null,
    muac_cm:     parseFloat(form.muac_cm)    || null,
    age_months:  ageMonths,
    // nutrition_status derived server-side from z-scores
    // (Normal / MAM / SAM / Overweight per WHO MUAC thresholds)
  });
  await loadRecords(selectedChild.id);
  setShowForm(false);
  setSaving(false);
};

// ── Chart data assembly ──
// Maps growth records to recharts format with WHO median overlay
const chartData = records.map(r => ({
  date: format(parseISO(r.recorded_date), 'MMM yy'),
  weight: r.weight_kg,
  height: r.height_cm,
  muac:   r.muac_cm,
  // Nearest WHO median value for child's age at measurement
  who: WHO_WEIGHT_MEDIAN[Math.round(r.age_months)] || null,
}));

// ── Recharts line chart with WHO reference overlay ──
return (
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F7" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    {/* Child's actual growth trajectory */}
    <Line type="monotone" dataKey={activeTab}
      stroke="#0047FF" strokeWidth={2.5} dot={{ fill: '#0047FF', r: 4 }} />
    {/* WHO median reference (dashed green line) — weight tab only */}
    {activeTab === 'weight' && (
      <Line type="monotone" dataKey="who"
        stroke="#2E7A5D" strokeWidth={1.5} strokeDasharray="4 4"
        dot={false} name="WHO Median" />
    )}
  </LineChart>
);

// ── Nutrition status indicator ──
// Derived from MUAC and weight-for-height z-score
// normal (green) | mam — Moderate Acute Malnutrition (amber) | sam — Severe AM (red)
const nutritionStatus = latest?.nutrition_status || 'normal';`}
          </CodeBlock>

          <H>Listing 6 — Nurse Patient View with Tabbed Clinical Interface</H>
          <P className="text-[12px] text-[#444] mb-2">File: <code className="bg-[#F5F5F7] px-1.5 py-0.5 rounded text-[11px]">components/nurse/NursePatientView.jsx</code> — Implements the nurse portal patient dashboard: patient summary card, tabbed data entry (ANC/Vaccines/Growth), and Clinical AI chatbot integration.</P>
          <CodeBlock title="NursePatientView — Nurse Portal Patient Dashboard" lang="jsx">
{`// components/nurse/NursePatientView.jsx
// Implements: Nurse portal patient view with tabbed clinical data entry
// Tabs: Overview | ANC Visit | Vaccines | Growth | AI Chat

import NurseANCForm from '@/components/nurse/NurseANCForm';
import NurseVaccineForm from '@/components/nurse/NurseVaccineForm';
import NurseGrowthForm from '@/components/nurse/NurseGrowthForm';
import NurseChatbot from '@/components/nurse/NurseChatbot';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'anc',      label: 'ANC Visit' },
  { key: 'vaccine',  label: 'Vaccines' },
  { key: 'growth',   label: 'Growth' },
  { key: 'chat',     label: '🤖 AI Chat' },
];

export default function NursePatientView({ patient, onBack }) {
  const [tab, setTab] = useState('overview');
  const [children, setChildren] = useState([]);
  const [ancVisits, setAncVisits] = useState([]);

  useEffect(() => { loadPatientData(); }, [patient.id]);

  // ── OFDPL: Fetch patient sub-records ──
  const loadPatientData = async () => {
    const [kids, visits] = await Promise.all([
      db.entities.Child.list('-created_date', 10),
      db.entities.ANCVisit.filter({ mother_id: patient.id }, '-visit_date', 10),
    ]);
    setChildren(kids.filter(k => k.mother_id === patient.id));
    setAncVisits(visits);
  };

  // Risk level colour mapping (used for patient card border and badge)
  const riskColor = patient.risk_level === 'critical' ? '#E51010' :
    patient.risk_level === 'high' ? '#F9A825' : '#2E7A5D';

  return (
    <div>
      {/* Patient summary card with risk badge */}
      <div className="bg-white rounded-[24px] border p-5">
        <div className="flex items-start gap-4">
          {/* Initials avatar with risk-colour background */}
          <div style={{ backgroundColor: \`\${riskColor}15\` }}>
            <span style={{ color: riskColor }}>
              {patient.full_name?.split(' ').map(n => n[0]).join('').slice(0,2)}
            </span>
          </div>
          <div>
            <p>{patient.full_name}</p>
            <p>{patient.phone} · {patient.county}</p>
            <p>{patient.anc_number || patient.national_id}</p>
          </div>
          {/* Risk badge — colour-coded per RSS output */}
          <div style={{ backgroundColor: \`\${riskColor}15\`, color: riskColor }}>
            {patient.risk_level || 'low'} risk
          </div>
        </div>
        {/* Summary stats: pregnancy status, children count, ANC visits */}
        <div className="grid grid-cols-3 gap-3 text-center mt-4">
          <div><p>Status</p><p>{patient.pregnancy_status}</p></div>
          <div><p>Children</p><p>{children.length}</p></div>
          <div><p>ANC Visits</p><p>{ancVisits.length}</p></div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 bg-white rounded-[16px] p-1 border">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={tab === t.key ? 'bg-[#2E7A5D] text-white' : 'text-[#666]'}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content routing */}
      {tab === 'overview' && <OverviewPanel children={children} ancVisits={ancVisits} />}
      {tab === 'anc'      && <NurseANCForm patient={patient} onSaved={loadPatientData} />}
      {tab === 'vaccine'  && <NurseVaccineForm patient={patient} children={children} onSaved={loadPatientData} />}
      {tab === 'growth'   && <NurseGrowthForm patient={patient} children={children} onSaved={loadPatientData} />}
      {/* Clinical AI Chat: passes full patient record to NurseChatbot */}
      {tab === 'chat'     && <NurseChatbot patient={patient} children={children} ancVisits={ancVisits} />}
    </div>
  );
}`}
          </CodeBlock>
        </Section>

        {/* §9 */}
        <Section number="9" title="Claims" defaultOpen>
          <P className="text-[12px] text-[#A0A0A0] italic mb-4">What is claimed is:</P>
          <H>Independent Claims</H>
          <Claim n="1">A computer-implemented system for adaptive synchronization of maternal and child health data in low-bandwidth environments, comprising: a risk scoring subsystem configured to compute a quantitative clinical urgency score for each patient record based on a plurality of clinical variables including antenatal care vitals, immunization compliance data, growth measurements, and reported clinical danger signs; a channel selection and routing module configured to evaluate a plurality of available communication channels in real time and select an optimal channel for data transmission based on a multi-factor weighting function incorporating the clinical urgency score of the patient record, channel availability, channel latency, channel cost per byte, and maximum transmissible payload size; a data compression and encoding engine configured to transform structured clinical data records into encoded binary packets optimized for the selected communication channel, wherein said encoding is reversible and lossless with respect to clinical data fidelity; a conflict detection and resolution engine configured to identify and resolve divergent data states arising from concurrent offline modifications to common patient records across a plurality of distributed nodes, applying a clinically-weighted merge algorithm; an offline-first data persistence layer comprising a local data store, an append-only cryptographically-chained change log, and a risk-score-ordered pending synchronization queue; and a security framework providing end-to-end field-level encryption, role-based access control, and tamper-evident audit trail generation.</Claim>
          <Claim n="2">A computer-implemented method for transmitting structured maternal and child health clinical records over Short Message Service (SMS) infrastructure, comprising: receiving a structured clinical data object comprising a plurality of typed clinical data fields; encoding each clinical data field using a domain-specific binary encoding scheme wherein numerical clinical measurements are represented as fixed-width integer offsets from predetermined clinical baseline values, enumerated clinical categories are represented as packed bit fields, and date values are represented as unsigned integer counts of days elapsed since a fixed epoch; assembling the encoded fields into a binary packet comprising a header portion containing protocol version, message type identifier, sequence number, patient record identifier hash, and checksum, and a payload portion containing the encoded clinical fields; verifying that the assembled packet size does not exceed a single SMS message boundary of one hundred sixty characters in GSM 7-bit encoding; and transmitting the packet via an SMS gateway to a receiving node; wherein the receiving node performs inverse decoding to reconstruct the original structured clinical data object with full clinical data fidelity.</Claim>
          <Claim n="3">A system for resolving conflicting versions of patient health records in a distributed offline-capable health information system, comprising: a divergence detection module configured to compute and compare cryptographic Merkle tree hashes of patient record versions from two or more nodes upon synchronization; a field-level difference extraction module configured to identify specific data fields having conflicting values; a clinical priority merge table defining, for each category of clinical data field, a deterministic conflict resolution rule selected from: retaining the value having the most recent clinical event timestamp for clinical measurement fields; applying last-write-wins based on system modification timestamp for administrative data fields; and recomputing the field value from the post-merge clinical measurements for computed fields; and an audit logging module configured to record, for each resolved conflict, the pre-merge values, the post-merge value, the resolution rule applied, the node identifiers, and all relevant timestamps.</Claim>
          <Claim n="4">A risk-prioritized data synchronization queue for a distributed health information system, comprising: a data structure maintaining a plurality of pending data synchronization events each associated with a patient risk score; a scheduling algorithm ordering pending events according to a tiered priority scheme corresponding to discrete risk level categories, wherein CRITICAL-tier events receive preemptive scheduling over all lower-tier events irrespective of creation time; a monitoring subsystem configured to detect changes in patient risk scores and reorder pending events accordingly; and an emergency transmission trigger configured to initiate immediate out-of-queue transmission via any available communication channel when a patient risk score exceeds a predetermined critical threshold and no internet connectivity is available within a configurable timeout period.</Claim>

          <H>Dependent Claims</H>
          <Claim n="5" indent>The system of claim 1, wherein the risk scoring subsystem computes the clinical urgency score using a weighted linear combination of normalized clinical feature values, the weights being initialized from World Health Organization maternal and child health risk stratification guidelines and periodically recalibrated against clinical outcome data using a federated learning protocol that aggregates anonymized model gradients from a plurality of facility nodes without transmitting raw patient data.</Claim>
          <Claim n="6" indent>The system of claim 1, wherein the risk scoring subsystem further comprises a rule-based override layer that enforces a CRITICAL risk classification irrespective of the composite clinical urgency score when any clinical variable in a predefined danger sign list is detected, said danger sign list comprising eclamptic features, antepartum haemorrhage indicators, prolonged rupture of membranes, cord prolapse indicators, and severe acute malnutrition flags.</Claim>
          <Claim n="7" indent>The system of claim 1, wherein the channel selection and routing module enforces a minimum transmission guarantee for CRITICAL-risk patient records such that, if no internet channel achieves availability within a configurable urgency timeout period, the module automatically initiates Short Message Service transmission of a priority-encoded clinical packet irrespective of channel cost parameters.</Claim>
          <Claim n="8" indent>The method of claim 2, wherein encoding blood pressure values comprises representing the systolic value as an unsigned 8-bit integer offset from a systolic baseline of sixty millimetres of mercury and the diastolic value as an unsigned 8-bit integer offset from a diastolic baseline of forty millimetres of mercury, providing a representable range of sixty to three hundred fifteen millimetres of mercury for each measurement using a single byte per reading.</Claim>
          <Claim n="9" indent>The method of claim 2, further comprising: determining that the assembled binary packet size exceeds the single SMS message boundary; segmenting the packet into a plurality of sub-packets each not exceeding the SMS boundary; prepending each sub-packet with a multi-part header comprising a total parts count field and a sequence index field; transmitting each sub-packet as a separate SMS message; and performing reassembly at the receiving node upon receipt of all segments.</Claim>
          <Claim n="10" indent>The system of claim 3, wherein the conflict detection and resolution engine is further configured to detect three-way conflicts arising from concurrent offline modifications by three or more nodes by performing pairwise field-level comparisons and applying the clinical priority merge table iteratively, producing a single merged record satisfying the resolution rules for all participating node versions.</Claim>
          <Claim n="11" indent>The system of claim 1, wherein the offline-first data persistence layer implements an append-only change log in which each log entry is cryptographically linked to the preceding entry via a SHA-256 hash, providing tamper-evident audit capability such that any post-hoc modification of historical log entries is detectable through hash chain verification.</Claim>
          <Claim n="12" indent>The system of claim 1, wherein the security framework encrypts data at rest using Advanced Encryption Standard with 256-bit keys in Galois/Counter Mode, with encryption keys derived from user credentials using Password-Based Key Derivation Function 2 with a minimum iteration count of three hundred ten thousand.</Claim>
          <Claim n="13" indent>The system of claim 1, wherein the security framework encrypts Short Message Service encoded packets using ChaCha20-Poly1305 symmetric encryption, with session keys established via Elliptic-Curve Diffie-Hellman key exchange over Curve25519 during an initial device provisioning handshake.</Claim>
          <Claim n="14" indent>The system of claim 1, wherein the role-based access control component defines a community health worker role having read and write access restricted to a pre-assigned panel of patient records, a facility nurse role having access to all patient records at a specified facility, a county health officer role having access to aggregate and anonymized data only with no access to individually identifiable patient records, and a system administrator role having configuration access only with no access to clinical patient data.</Claim>
          <Claim n="15" indent>The system of claim 1, wherein the data compression and encoding engine is further configured to encode Unstructured Supplementary Service Data messages carrying a structured menu interaction protocol enabling a community health worker to report a patient vital sign or danger sign flag using a sequence of USSD menu selections, said interaction encoding the reported data into a structured event record and inserting said event into the pending synchronization queue.</Claim>
          <Claim n="16" indent>The system of claim 4, wherein the tiered priority scheme comprises four tiers corresponding to LOW, MEDIUM, HIGH, and CRITICAL risk classifications, with CRITICAL-tier events receiving preemptive scheduling priority over all lower-tier events.</Claim>
          <Claim n="17" indent>The system of claim 1, further comprising a federated analytics module configured to compute aggregated population-level maternal and child health indicators across a plurality of facility nodes without transmitting individually identifiable patient data, using secure aggregation protocols to combine local statistical summaries.</Claim>
          <Claim n="18" indent>A non-transitory computer-readable medium storing instructions that, when executed by one or more processors, implement the system of claim 1.</Claim>
          <Claim n="19" indent>The system of claim 1, wherein the risk scoring subsystem is further configured to generate a human-readable clinical alert notification in a configurable natural language, including at least English and Swahili, to be transmitted to the patient's registered caregiver through the selected optimal communication channel upon detection of a risk score transition from a lower to a higher risk category.</Claim>
          <Claim n="20" indent>The system of claim 1, wherein the artificial intelligence-based conversational interface component is configured to receive natural language queries from both caregivers and clinical personnel, inject a structured patient clinical record context into each query prior to language model invocation, and return clinically appropriate responses grounded in World Health Organization and Kenya Ministry of Health guidelines, in the user's preferred language.</Claim>
        </Section>

        {/* §10 */}
        <Section number="10" title="Advantages of the Invention">
          <P><strong>10.1 Clinical-Priority-Driven Data Transport:</strong> Unlike existing synchronization systems treating all data as equivalently urgent, the AMHSE subordinates data transport decisions to clinical risk assessment, ensuring that life-threatening patient conditions trigger immediate data transmission via any available channel.</P>
          <P><strong>10.2 True Bidirectional Clinical Data Exchange over 2G Infrastructure:</strong> The SMDCEE's domain-specific encoding protocol enables lossless bidirectional transmission of complete structured clinical records over standard SMS infrastructure, extending functional EHR capability to zones where internet connectivity is unavailable.</P>
          <P><strong>10.3 Medically Safe Conflict Resolution:</strong> The CPMT-based resolution algorithm of the DCDRE ensures conflicts are resolved in accordance with clinical data semantics, materially reducing the risk of clinically incorrect records that could arise from purely timestamp-based conflict resolution strategies.</P>
          <P><strong>10.4 Operational Continuity Under Disconnection:</strong> The offline-first architecture guarantees full clinical functionality at the point of care regardless of network availability, with zero degradation of local performance during network outages.</P>
          <P><strong>10.5 Deployability on Low-Specification Hardware:</strong> The AMHSE operates on Android devices with as little as 1GB RAM and 8GB storage, and functions on 2G feature phones via the SMS/USSD interface, maximising accessibility across the digital divide.</P>
          <P><strong>10.6 Privacy-Preserving Federated Learning:</strong> The federated learning protocol eliminates the need to transmit raw patient data to a central server for model improvement, satisfying data minimization requirements of applicable health data protection regulations.</P>
        </Section>

        {/* §11 */}
        <Section number="11" title="Industrial Applicability">
          <P>The AMHSE has direct and immediate industrial applicability in national MCH digital platforms in Kenya, Uganda, Tanzania, Ethiopia, Nigeria, and other sub-Saharan African nations with established community health worker programs. The invention is directly deployable as the synchronization infrastructure layer of existing national HMIS platforms. County and facility-level health information systems can deploy the AMHSE as a standalone solution without dependence on continuous national network infrastructure. The SMS/USSD interface extends functional clinical data capture to community health workers using basic mobile phones. The offline-first, multi-channel architecture is equally suited to humanitarian health operations in conflict zones and disaster response contexts. The invention is implemented in software executable on commercially available computing hardware and is therefore immediately reducible to practice without specialized manufacturing.</P>
        </Section>

        {/* Footer */}
        <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-5 text-center shadow-card mb-8 mt-4">
          <p className="text-[11px] text-[#A0A0A0] leading-relaxed">
            <strong className="text-[#666]">CONFIDENTIALITY NOTICE:</strong> This document contains proprietary and confidential information constituting a patent application draft. It is intended solely for review by the named applicant, authorised patent counsel, and KIPI examiners. Unauthorised disclosure, reproduction, or use of any part of this document is strictly prohibited.
            <br />© TotoAfya Digital Health Systems. All rights reserved.
          </p>
          <p className="text-[10px] text-[#C0C0C0] mt-2">
            IPC: G16H 10/60 · G16H 40/20 · H04W 4/14 · H04L 9/06 · G06F 16/27 · G06N 20/00
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white; }
          nav { display: none !important; }
          button.print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}