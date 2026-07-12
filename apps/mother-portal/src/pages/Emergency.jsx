import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, MoreVertical, PhoneCall, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useLang } from '@/context/LanguageContext';
import AppShell from '@/components/layout/AppShell';

export default function Emergency() {
  const { lang } = useLang();
  const navigate = useNavigate();

  const contacts = [
    {
      name: lang === 'sw' ? 'Nambari ya Dharura ya Kitaifa' : 'National Health Helpline',
      phone: '1199',
      desc: lang === 'sw' ? 'Bure kabisa, masaa 24/7' : 'Toll-free, available 24/7',
      isPrimary: true,
    },
    {
      name: lang === 'sw' ? 'Kituo cha Afya cha Kibera' : 'Kibera Health Centre',
      phone: '+254712345678',
      desc: lang === 'sw' ? 'Huduma ya dharura ya wilaya' : 'Local facility emergency line',
      isPrimary: false,
    },
    {
      name: lang === 'sw' ? 'Mhudumu wa Afya (CHV)' : 'Community Health Volunteer (CHV)',
      phone: '+254789012345',
      desc: 'Sarah Kamau - Kibera Ward',
      isPrimary: false,
    },
  ];

  const handleSOS = () => {
    // Prompt real dialer with national helpline
    window.location.href = 'tel:1199';
  };

  return (
    <AppShell>
      <div className="bg-[#FFF6F0] min-h-screen pb-12 font-sans text-[#17201D]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 bg-white border-b border-[#EEF2EF] mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white rounded-full border border-[#EEF2EF] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} className="text-[#17201D]" />
          </button>
          <h1 className="text-[18px] font-extrabold text-D64545">
            {lang === 'sw' ? 'Dharura' : 'Emergency SOS'}
          </h1>
          <button 
            className="w-10 h-10 bg-white rounded-full border border-[#EEF2EF] flex items-center justify-center shadow-sm active:scale-95 transition-transform"
            onClick={() => alert(lang === 'sw' ? 'Chaguo' : 'Options')}
          >
            <MoreVertical size={20} className="text-[#17201D]" />
          </button>
        </div>

        {/* SOS Heartbeat Button (Screen 11) */}
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <button
            onClick={handleSOS}
            className="relative w-44 h-44 rounded-full bg-D64545 flex flex-col items-center justify-center text-white active:scale-95 transition-all duration-300 shadow-[0_12px_36px_rgba(255,95,88,0.36)] group overflow-hidden"
          >
            {/* Background ripple animations */}
            <span className="absolute inset-0 rounded-full bg-white opacity-10 animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />
            <PhoneCall size={38} className="mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[16px] font-black uppercase tracking-wider">
              {lang === 'sw' ? 'Piga Simu' : 'Call SOS'}
            </span>
            <span className="text-[11px] font-bold opacity-80 mt-1">1199</span>
          </button>
          
          <p className="text-D64545 font-extrabold text-[13.5px] mt-6 text-center max-w-xs leading-relaxed">
            {lang === 'sw' 
              ? 'Bonyeza hapo juu kupiga simu ya dharura ya matibabu mara moja.' 
              : 'Press the button above to initiate a direct medical emergency call.'}
          </p>
        </div>

        {/* Danger Signs warning banner */}
        <div className="mx-4 mb-6">
          <div className="bg-red-50/70 border border-red-100/50 rounded-[24px] p-5 flex items-start gap-4">
            <ShieldAlert size={22} className="text-D64545 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[13px] font-black text-D64545 tracking-wider uppercase">
                {lang === 'sw' ? 'DALILI KUU ZA HATARI' : 'CRITICAL DANGER SIGNS'}
              </h4>
              <p className="text-[12.5px] text-[#17201D] font-semibold mt-1 leading-relaxed">
                {lang === 'sw'
                  ? 'Kutoka damu, maumivu makali ya kichwa, kuvimba ghafla kwa mikono au uso, kupungua kwa mateke ya mtoto, au homa kali. Usisubiri—tafuta msaada mara moja!'
                  : 'Vaginal bleeding, severe headache, sudden swelling of face/hands, reduced fetal movement, or high fever. Do not wait—seek immediate attention!'}
              </p>
            </div>
          </div>
        </div>

        {/* Contact List */}
        <div className="px-4">
          <h3 className="text-[15px] font-bold text-17201D mb-3">
            {lang === 'sw' ? 'Namba Muhimu za Simu' : 'Emergency Contacts'}
          </h3>
          <div className="flex flex-col gap-3">
            {contacts.map((contact, idx) => (
              <a 
                key={idx}
                href={`tel:${contact.phone}`}
                className={`bg-white border rounded-[24px] p-5 shadow-sm flex items-center justify-between gap-4 transition-all ${
                  contact.isPrimary ? 'border-D64545/20 hover:border-D64545/40' : 'border-[#EEF2EF] hover:border-006B4F/20'
                }`}
              >
                <div className="min-w-0">
                  <h4 className="text-[14px] font-extrabold text-[#17201D] truncate">
                    {contact.name}
                  </h4>
                  <p className="text-[13px] text-D64545 font-bold mt-0.5">
                    {contact.phone}
                  </p>
                  <p className="text-[11px] text-5F6C66 font-semibold mt-0.5">
                    {contact.desc}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  contact.isPrimary ? 'bg-red-50 text-D64545' : 'bg-006B4F/5 text-006B4F'
                }`}>
                  <PhoneCall size={16} />
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
