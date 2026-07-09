import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, User, PhoneCall, MessageSquare, Globe, LogOut, ShieldCheck, Heart, Landmark } from 'lucide-react';
import db from '@/api/totoafyaClient';
import { useLang } from '@/context/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import AppShell from '@/components/layout/AppShell';

export default function Profile() {
  const { lang, setLang } = useLang();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mother, setMother] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMother = async () => {
      try {
        const mothers = await db.entities.Mother.list('-created_date', 1);
        if (mothers && mothers.length > 0) {
          setMother(mothers[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMother();
  }, []);

  const handleLangToggle = () => {
    const nextLang = lang === 'sw' ? 'en' : 'sw';
    setLang(nextLang);
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-8 h-8 border-2 border-toto-teal border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  const menuItems = [
    {
      to: '/emergency',
      icon: PhoneCall,
      label: lang === 'sw' ? 'Namba za Dharura' : 'Emergency Contacts',
      sub: lang === 'sw' ? 'SOS na namba za dharura' : 'SOS & clinical contacts',
      color: 'text-toto-red bg-rose-50 border-rose-100',
    },
    {
      to: '/community',
      icon: MessageSquare,
      label: lang === 'sw' ? 'Jumuiya ya Wazazi' : 'Community Forum',
      sub: lang === 'sw' ? 'Soga na wazazi wengine' : 'Chat with other caregivers',
      color: 'text-toto-teal bg-emerald-50 border-emerald-100',
    },
  ];

  return (
    <AppShell>
      <div className="bg-[#f7f9f7] min-h-screen pb-12 font-sans text-[#131714]">
        
        {/* Page Title */}
        <div className="px-6 pt-6 pb-4">
          <h1 className="text-[24px] font-extrabold text-[#131714]">
            {lang === 'sw' ? 'Wasifu & Mipangilio' : 'Profile & Settings'}
          </h1>
        </div>

        {/* Profile Card Info Box (Screen 13) */}
        <div className="mx-4 mb-6">
          <div className="bg-white border border-[#e5e7eb] rounded-[32px] p-6 shadow-sm flex items-center gap-4.5">
            <div className="w-16 h-16 rounded-full bg-toto-teal/5 border border-toto-teal/15 flex items-center justify-center text-toto-teal font-extrabold text-[22px] shadow-inner">
              {(mother?.full_name || 'A').charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="text-[17px] font-black text-toto-black leading-tight truncate">
                {mother?.full_name || 'Amina Ouma'}
              </h2>
              <p className="text-[11.5px] text-toto-gray font-semibold mt-1">
                {lang === 'sw' ? 'ID ya Taifa: ' : 'National ID: '} <span className="text-[#131714] font-bold">{mother?.national_id || '38291047'}</span>
              </p>
              <p className="text-[11px] text-toto-teal font-bold mt-1 uppercase bg-toto-teal/5 px-2 py-0.5 rounded-md inline-block border border-toto-teal/10">
                {mother?.caregiver_type === 'mother' ? (lang === 'sw' ? 'Mama' : 'Mother') : (lang === 'sw' ? 'Baba / Mlezi' : 'Caregiver')}
              </p>
            </div>
          </div>
        </div>

        {/* Facility Info Card */}
        {mother?.facility_name && (
          <div className="mx-4 mb-6">
            <div className="bg-[#f0fbf6]/50 border border-emerald-100 rounded-[24px] p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <Landmark size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-toto-gray uppercase tracking-wider">
                  {lang === 'sw' ? 'KITUO CHAKO CHA AFYA' : 'REGISTERED CLINIC'}
                </p>
                <p className="text-[13.5px] font-bold text-[#131714] truncate mt-0.5">
                  {mother.facility_name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Menu Navigation Links */}
        <div className="mx-4 mb-6 flex flex-col gap-3">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                to={item.to}
                className="bg-white border border-[#e5e7eb] rounded-[24px] p-4.5 shadow-sm flex items-center justify-between hover:border-toto-teal/15 active:scale-[0.99] transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-inner flex-shrink-0 ${item.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[14px] font-extrabold text-[#131714]">
                      {item.label}
                    </h4>
                    <p className="text-[11.5px] text-toto-gray font-semibold mt-0.5">
                      {item.sub}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-toto-gray" />
              </Link>
            );
          })}

          {/* Inline Lang Switcher Button */}
          <button
            onClick={handleLangToggle}
            className="bg-white border border-[#e5e7eb] rounded-[24px] p-4.5 shadow-sm flex items-center justify-between hover:border-toto-teal/15 active:scale-[0.99] transition-all w-full text-left"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shadow-inner flex-shrink-0">
                <Globe size={16} />
              </div>
              <div className="min-w-0">
                <h4 className="text-[14px] font-extrabold text-[#131714]">
                  {lang === 'sw' ? 'Badilisha Lugha' : 'Change Language'}
                </h4>
                <p className="text-[11.5px] text-toto-gray font-semibold mt-0.5">
                  {lang === 'sw' ? 'Kilinganishwa: Kiingereza' : 'Active language: English'}
                </p>
              </div>
            </div>
            <div className="text-[11px] font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full uppercase border border-amber-200">
              {lang === 'sw' ? 'English' : 'Kiswahili'}
            </div>
          </button>

        </div>

        {/* Sign Out Button */}
        <div className="mx-4 mt-8">
          <button
            onClick={handleSignOut}
            className="w-full h-14 bg-white hover:bg-rose-50 border border-rose-200 text-toto-red rounded-full font-bold text-[14.5px] shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <LogOut size={16} />
            {lang === 'sw' ? 'Ondoka kwenye Akaunti' : 'Sign Out'}
          </button>
        </div>

      </div>
    </AppShell>
  );
}
