import React, { useState } from 'react';
import { 
  Heart, 
  Shield, 
  TrendingUp, 
  ChevronRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  BookOpen, 
  MapPin, 
  CalendarCheck, 
  Smartphone, 
  Lock, 
  Globe, 
  Syringe, 
  CheckCircle,
  HelpCircle,
  Play
} from 'lucide-react';

// Custom SVG Logo for TotoAfya
function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const isLg = size === 'lg';
  const isSm = size === 'sm';
  return (
    <div className="flex items-center gap-2">
      <div className={`rounded-2xl bg-gradient-to-br from-[#1B6B5A] to-[#145244] flex items-center justify-center shadow-md ${
        isLg ? 'w-16 h-16' : isSm ? 'w-8 h-8' : 'w-12 h-12'
      }`}>
        <svg viewBox="0 0 24 24" className={`fill-white ${isLg ? 'w-9 h-9' : isSm ? 'w-5 h-5' : 'w-7 h-7'}`}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`font-bold tracking-tight text-[#0A0A0A] ${isLg ? 'text-2xl' : isSm ? 'text-sm' : 'text-xl'}`}>
          <span className="text-[#1B6B5A]">Toto</span>
          <span className="text-[#C8813A]">Afya</span>
        </span>
        <span className={`font-semibold tracking-[0.2em] text-[#1B6B5A] uppercase ${isLg ? 'text-[10px]' : isSm ? 'text-[6px]' : 'text-[8px]'}`}>
          Digital
        </span>
      </div>
    </div>
  );
}

export function Onboarding() {
  const [activeScreen, setActiveScreen] = useState<number>(1);
  
  // Interactive states
  const [selectedRole, setSelectedRole] = useState<'mother' | 'father' | 'guardian'>('mother');
  const [selectedMotherMode, setSelectedMotherMode] = useState<'pregnant' | 'child' | 'both'>('pregnant');
  const [authType, setAuthType] = useState<'national_id' | 'anc_number'>('national_id');
  const [identifier, setIdentifier] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [simulatedName, setSimulatedName] = useState<string>('Amina');

  // Keypad actions
  const handleKeypadPress = (val: string) => {
    if (pin.length < 4) {
      const newPin = pin + val;
      setPin(newPin);
      // Auto success transition for simulation
      if (newPin === '1234') {
        setTimeout(() => {
          setActiveScreen(10);
        }, 600);
      }
    }
  };

  const handleKeypadDelete = () => {
    setPin(pin.slice(0, -1));
  };

  // Reset demo
  const resetDemo = () => {
    setPin('');
    setIdentifier('');
    setActiveScreen(1);
  };

  const screensInfo = [
    { num: 1, name: "Splash Screen" },
    { num: 2, name: "Welcome" },
    { num: 3, name: "Our Promise" },
    { num: 4, name: "Who is it for?" },
    { num: 5, name: "What you can do" },
    { num: 6, name: "Stay Connected" },
    { num: 7, name: "Sign-in Options" },
    { num: 8, name: "Enter Identifier" },
    { num: 9, name: "Enter PIN" },
    { num: 10, name: "Success!" }
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center py-8 px-4 font-sans select-none">
      
      {/* Top Demo Controller */}
      <div className="w-full max-w-[950px] bg-white rounded-3xl p-6 shadow-sm border border-gray-150 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1B6B5A] animate-pulse"></span>
              TotoAfya Onboarding Flow Mockup
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Click through the screens using the device button or select a screen directly to inspect the premium design.
            </p>
          </div>
          <button 
            onClick={resetDemo}
            className="px-4 py-2 border border-gray-200 rounded-full text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all self-start md:self-auto"
          >
            Reset Simulation
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-5 border-t border-gray-100 pt-4">
          {screensInfo.map((s) => (
            <button
              key={s.num}
              onClick={() => {
                setActiveScreen(s.num);
                if (s.num !== 9) setPin('');
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeScreen === s.num
                  ? 'bg-[#1B6B5A] text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s.num.toString().padStart(2, '0')}. {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Device frame container */}
      <div className="relative w-[390px] h-[844px] bg-[#FDFCF8] rounded-[52px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] border-[10px] border-[#1A1A1A] overflow-hidden flex flex-col">
        
        {/* Device Notch & Status Bar Simulation */}
        <div className="absolute top-0 inset-x-0 h-10 bg-transparent z-50 flex justify-between items-center px-8 text-black text-xs font-semibold select-none">
          <span>9:41</span>
          <div className="w-28 h-6 bg-black rounded-b-2xl mx-auto absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center">
            <div className="w-12 h-1 bg-[#2C2C2C] rounded-full"></div>
          </div>
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17 5H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-1 12H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V7h8v2z"/></svg>
          </div>
        </div>

        {/* Outer Content Display */}
        <div className="flex-1 pt-10 flex flex-col overflow-hidden relative">

          {/* SCREEN 1: SPLASH SCREEN */}
          {activeScreen === 1 && (
            <div className="flex-1 flex flex-col justify-between pb-12 animate-fade-in">
              {/* Mother and Child hero */}
              <div className="h-[480px] w-full relative rounded-b-[40px] overflow-hidden shadow-lg">
                <img 
                  src="/splash.jpg" 
                  alt="Mother and Child" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#FDFCF8] via-transparent to-black/10"></div>
              </div>

              {/* Brand Branding Info */}
              <div className="px-8 flex flex-col items-center text-center mt-6">
                <BrandLogo size="lg" />
                <p className="text-base text-gray-500 font-medium italic mt-6 leading-relaxed">
                  "Healthy mother. Thriving baby. Stronger future."
                </p>

                {/* Loading Simulation Bar */}
                <div className="w-40 h-1.5 bg-gray-100 rounded-full mt-10 overflow-hidden relative">
                  <div className="absolute top-0 left-0 h-full bg-[#1B6B5A] w-2/3 rounded-full animate-[pulse-dot_1.5s_infinite]"></div>
                </div>
              </div>

              {/* Fake navigation trigger */}
              <button 
                onClick={() => setActiveScreen(2)}
                className="absolute inset-0 w-full h-full cursor-pointer bg-transparent"
              />
            </div>
          )}

          {/* SCREEN 2: WELCOME */}
          {activeScreen === 2 && (
            <div className="flex-1 flex flex-col justify-between px-6 pb-10 pt-4 animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between">
                <BrandLogo size="sm" />
                <span className="text-xs font-semibold text-gray-400">English</span>
              </div>

              {/* Welcome text */}
              <div className="mt-6">
                <h1 className="text-3xl font-extrabold text-[#0A0A0A] leading-tight tracking-tight">
                  Welcome to <br />
                  <span className="text-[#1B6B5A]">TotoAfya</span> <span className="text-[#C8813A]">Digital</span>
                </h1>
                <p className="text-gray-500 text-sm font-medium mt-2 leading-relaxed">
                  Your trusted companion through pregnancy, child growth and family health.
                </p>
              </div>

              {/* Center Pregnant mother Image */}
              <div className="my-4 h-[340px] w-full rounded-[32px] overflow-hidden border border-[#F5F5F7] shadow-sm relative">
                <img 
                  src="/onboarding_welcome.png" 
                  alt="Welcome Mother" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => setActiveScreen(3)}
                  className="w-full h-14 bg-[#1B6B5A] text-white rounded-full font-bold flex items-center justify-between px-6 active:scale-[0.98] transition-transform shadow-teal-glow"
                >
                  <span className="text-base">Get Started</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <ChevronRight size={18} className="text-white" />
                  </div>
                </button>

                <button 
                  onClick={() => setActiveScreen(7)}
                  className="text-center text-xs font-semibold text-[#1B6B5A] hover:underline"
                >
                  Already have an account? <span className="underline">Sign in</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 3: OUR PROMISE */}
          {activeScreen === 3 && (
            <div className="flex-1 flex flex-col justify-between px-6 pb-10 pt-4 animate-fade-in">
              {/* Header */}
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1B6B5A]">Our Mission</span>
                <h2 className="text-2xl font-extrabold text-[#0A0A0A] leading-tight tracking-tight mt-1">
                  We're with you every step of the way
                </h2>
              </div>

              {/* Left Details and Right image side-by-side split */}
              <div className="flex gap-4 items-center my-6 flex-1">
                {/* Checklist Column */}
                <div className="flex-1 flex flex-col gap-4.5">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#1B6B5A]/10 flex items-center justify-center text-[#1B6B5A] flex-shrink-0">
                      <Heart size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0a0a0a]">Personalized Care</h4>
                      <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Tailored health guides for you</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#1B6B5A]/10 flex items-center justify-center text-[#1B6B5A] flex-shrink-0">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0a0a0a]">Track Growth</h4>
                      <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Fetal timeline & milestones</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#1B6B5A]/10 flex items-center justify-center text-[#1B6B5A] flex-shrink-0">
                      <CalendarCheck size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0a0a0a]">Appointments</h4>
                      <p className="text-[10px] text-gray-500 leading-tight mt-0.5">Automated SMS reminders</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#1B6B5A]/10 flex items-center justify-center text-[#1B6B5A] flex-shrink-0">
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0a0a0a]">Trusted Info</h4>
                      <p className="text-[10px] text-gray-500 leading-tight mt-0.5">MOH approved content</p>
                    </div>
                  </div>
                </div>

                {/* Right Cropped Pill Image */}
                <div className="w-[120px] h-[320px] rounded-[60px] overflow-hidden border border-[#F5F5F7] shadow-lg flex-shrink-0">
                  <img 
                    src="/mother-child.jpg" 
                    alt="Caring" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Progress and Buttons */}
              <div className="flex items-center justify-between">
                {/* Dots indicator (page 1 of 3) */}
                <div className="flex gap-1.5">
                  <div className="w-6 h-2 rounded-full bg-[#1B6B5A]"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                </div>

                <button 
                  onClick={() => setActiveScreen(4)}
                  className="w-28 h-12 bg-[#1B6B5A] text-white rounded-full font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <span className="text-sm">Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 4: WHO IS IT FOR? (TARGET GROUP SELECTION) */}
          {activeScreen === 4 && (
            <div className="flex-1 flex flex-col justify-between px-6 pb-10 pt-4 animate-fade-in">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1B6B5A]">Target Group</span>
                <h2 className="text-2xl font-extrabold text-[#0A0A0A] leading-tight tracking-tight mt-1">
                  Who are you?
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  Select your role so we can personalize your health timeline.
                </p>
              </div>

              {/* Roles Option Stack */}
              <div className="flex flex-col gap-3 my-4">
                {[
                  {
                    key: 'mother',
                    img: '/onboarding_role_mother.png',
                    title: 'Mother',
                    desc: 'Pregnant or postpartum caregiver'
                  },
                  {
                    key: 'father',
                    img: '/onboarding_role_father.png',
                    title: 'Father',
                    desc: 'Co-parent or primary caregiver'
                  },
                  {
                    key: 'guardian',
                    img: '/onboarding_role_guardian.png',
                    title: 'Guardian / Relative',
                    desc: 'Grandparent, aunt, or caregiver'
                  }
                ].map((item) => {
                  const isSelected = selectedRole === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setSelectedRole(item.key as any)}
                      className={`w-full rounded-[20px] p-3 border-2 text-left flex items-center transition-all ${
                        isSelected 
                          ? 'border-[#1B6B5A] bg-[#1B6B5A]/[0.02] shadow-teal-glow-sm' 
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl overflow-hidden mr-4 border border-gray-100 flex-shrink-0">
                        <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 leading-tight">{item.title}</h4>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{item.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-[#1B6B5A] bg-[#1B6B5A] text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <Check size={12} className="stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mother specific sub-toggles inside flow if selected */}
              {selectedRole === 'mother' && (
                <div className="bg-[#1B6B5A]/5 rounded-2xl p-3 mb-2 animate-slide-up">
                  <p className="text-[10px] font-bold text-[#1B6B5A] uppercase tracking-wider mb-2">My Current Journey Status:</p>
                  <div className="flex gap-2">
                    {['pregnant', 'child', 'both'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSelectedMotherMode(mode as any)}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold capitalize transition-all border ${
                          selectedMotherMode === mode
                            ? 'bg-[#1B6B5A] border-[#1B6B5A] text-white'
                            : 'bg-white border-gray-200 text-gray-600'
                        }`}
                      >
                        {mode === 'both' ? 'Both' : mode}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => setActiveScreen(3)}
                  className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center active:scale-95 transition-transform"
                >
                  <ArrowLeft size={16} className="text-gray-600" />
                </button>

                <button 
                  onClick={() => setActiveScreen(5)}
                  className="w-28 h-12 bg-[#1B6B5A] text-white rounded-full font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <span className="text-sm">Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 5: WHAT YOU CAN DO (VALUE GRID) */}
          {activeScreen === 5 && (
            <div className="flex-1 flex flex-col justify-between px-6 pb-10 pt-4 animate-fade-in">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1B6B5A]">What you can do</span>
                <h2 className="text-2xl font-extrabold text-[#0A0A0A] leading-tight tracking-tight mt-1">
                  Everything you need, <br />in one place
                </h2>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-3 my-4">
                {[
                  { title: 'Antenatal Care', icon: Heart, color: '#C8813A', bg: 'bg-[#C8813A]/10' },
                  { title: 'Growth Tracking', icon: TrendingUp, color: '#1B6B5A', bg: 'bg-[#1B6B5A]/10' },
                  { title: 'Vaccine Reminders', icon: Syringe, color: '#7C3AED', bg: 'bg-[#7C3AED]/10' },
                  { title: 'Health Education', icon: BookOpen, color: '#2E7A5D', bg: 'bg-[#2E7A5D]/10' },
                  { title: 'AI Assistant', icon: Sparkles, color: '#E51010', bg: 'bg-[#E51010]/10' },
                  { title: 'Nearby Facilities', icon: MapPin, color: '#1B6B5A', bg: 'bg-[#1B6B5A]/10' }
                ].map((f, i) => (
                  <div 
                    key={i}
                    className="bg-white p-3 rounded-2xl border border-gray-100 flex flex-col gap-2 items-center text-center shadow-card hover:border-[#1B6B5A]/25"
                  >
                    <div className={`w-10 h-10 rounded-full ${f.bg} flex items-center justify-center`}>
                      <f.icon size={18} style={{ color: f.color }} />
                    </div>
                    <span className="text-[11px] font-bold text-gray-800 leading-tight">{f.title}</span>
                  </div>
                ))}
              </div>

              {/* Progress and Buttons */}
              <div className="flex items-center justify-between">
                {/* Dots indicator (page 2 of 3) */}
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                  <div className="w-6 h-2 rounded-full bg-[#1B6B5A]"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                </div>

                <button 
                  onClick={() => setActiveScreen(6)}
                  className="w-28 h-12 bg-[#1B6B5A] text-white rounded-full font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <span className="text-sm">Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 6: STAY CONNECTED */}
          {activeScreen === 6 && (
            <div className="flex-1 flex flex-col justify-between px-6 pb-10 pt-4 animate-fade-in">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1B6B5A]">Stay Connected</span>
                <h2 className="text-2xl font-extrabold text-[#0A0A0A] leading-tight tracking-tight mt-1">
                  Stay connected to what matters
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  Get automated reminders for checkups, medicines and vaccines.
                </p>
              </div>

              {/* Split Content: list on left, crop mother phone image on right */}
              <div className="flex gap-4 items-center my-6 flex-1">
                {/* Reminders List */}
                <div className="flex-1 flex flex-col gap-4">
                  {[
                    { title: 'Appointments', desc: 'Timely SMS alerts', color: '#1B6B5A' },
                    { title: 'Medications', desc: 'Never miss a dose', color: '#2E7A5D' },
                    { title: 'Vaccinations', desc: 'On schedules', color: '#7C3AED' }
                  ].map((item, index) => (
                    <div key={index} className="flex gap-2.5 items-start">
                      <div className="w-4 h-4 rounded-full bg-[#1B6B5A]/10 border border-[#1B6B5A] flex items-center justify-center mt-0.5">
                        <Check size={8} className="text-[#1B6B5A] stroke-[4]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 leading-tight">{item.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Image */}
                <div className="w-[130px] h-[280px] rounded-[48px] overflow-hidden border border-[#F5F5F7] shadow-lg flex-shrink-0">
                  <img 
                    src="/onboarding_journey_both.png" 
                    alt="Stay Connected" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Progress and Buttons */}
              <div className="flex items-center justify-between">
                {/* Dots indicator (page 3 of 3) */}
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                  <div className="w-6 h-2 rounded-full bg-[#1B6B5A]"></div>
                </div>

                <button 
                  onClick={() => setActiveScreen(7)}
                  className="w-28 h-12 bg-[#1B6B5A] text-white rounded-full font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <span className="text-sm">Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 7: SIGN-IN OPTIONS */}
          {activeScreen === 7 && (
            <div className="flex-1 flex flex-col justify-between px-6 pb-10 pt-4 animate-fade-in">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#1B6B5A]">Authentication</span>
                <h2 className="text-2xl font-extrabold text-[#0A0A0A] leading-tight tracking-tight mt-1">
                  Let's sign you in
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  Choose a convenient way to access your health portal.
                </p>
              </div>

              {/* Sign in card options */}
              <div className="flex flex-col gap-3 my-4">
                <button 
                  onClick={() => { setAuthType('national_id'); setActiveScreen(8); }}
                  className="w-full rounded-2xl p-4 border-2 border-[#1B6B5A] bg-[#1B6B5A]/[0.02] text-left flex items-start gap-4 transition-all shadow-teal-glow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-[#1B6B5A]/10 text-[#1B6B5A] flex items-center justify-center flex-shrink-0">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 leading-tight">National ID / ANC Booklet</h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-normal">Use the standard credentials printed on your clinic registration forms.</p>
                  </div>
                </button>

                <button 
                  onClick={() => { setAuthType('anc_number'); setActiveScreen(8); }}
                  className="w-full rounded-2xl p-4 border border-gray-150 bg-white text-left flex items-start gap-4 transition-all hover:border-gray-200"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0">
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 leading-tight">Mobile Number Login</h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-normal">Authenticate using a 6-digit OTP code sent directly to your phone.</p>
                  </div>
                </button>
              </div>

              <div className="text-center text-xs font-semibold text-gray-400">
                — Or continue with social accounts —
              </div>

              {/* Social Login buttons */}
              <div className="grid grid-cols-2 gap-3 my-3">
                <button 
                  onClick={() => setActiveScreen(8)}
                  className="h-12 border border-gray-200 bg-white rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all text-xs font-bold text-gray-700"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.137 4.114-3.466 0-6.277-2.81-6.277-6.277 0-3.466 2.81-6.277 6.277-6.277 1.488 0 2.85.52 3.924 1.39l3.056-3.056C18.82 2.21 15.75 1.15 12.24 1.15c-5.99 0-10.84 4.85-10.84 10.85 0 5.99 4.85 10.84 10.84 10.84 6.25 0 11.23-4.51 11.23-11.24 0-.48-.04-.95-.12-1.41l-11.11.09z"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button 
                  onClick={() => setActiveScreen(8)}
                  className="h-12 border border-gray-200 bg-white rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-95 transition-all text-xs font-bold text-gray-700"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.09 2.48-1.36.03-1.8-.8-3.36-.8-1.56 0-2.04.77-3.34.82-1.33.05-2.33-1.32-3.17-2.53-1.72-2.5-3.03-7.06-1.25-10.15.88-1.53 2.45-2.5 4.16-2.53 1.29-.02 2.5.87 3.29.87.78 0 2.24-1.07 3.79-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.99.08 2.16-.52 2.82-1.33z"/>
                  </svg>
                  <span>Apple</span>
                </button>
              </div>

              {/* Create account trigger */}
              <button 
                onClick={() => setActiveScreen(8)}
                className="w-full text-center text-xs font-semibold text-gray-500 hover:text-[#1B6B5A] mt-2"
              >
                New here? <span className="text-[#1B6B5A] underline">Create an account</span>
              </button>
            </div>
          )}

          {/* SCREEN 8: ENTER ID / ANC BOOK NUMBER */}
          {activeScreen === 8 && (
            <div className="flex-1 flex flex-col justify-between px-6 pb-10 pt-4 animate-fade-in">
              <div>
                {/* Back link */}
                <button 
                  onClick={() => setActiveScreen(7)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#1B6B5A] mb-3 hover:underline"
                >
                  <ArrowLeft size={14} />
                  <span>Choose Authentication</span>
                </button>

                <h2 className="text-xl font-extrabold text-[#0A0A0A] leading-snug tracking-tight">
                  Enter your credentials
                </h2>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                  Provide your National ID number or your green MCH clinic booklet serial.
                </p>
              </div>

              {/* Sub-selector tabs */}
              <div className="flex bg-gray-100 p-1 rounded-xl mt-4">
                <button
                  onClick={() => { setAuthType('national_id'); setIdentifier(''); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all ${
                    authType === 'national_id' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  National ID
                </button>
                <button
                  onClick={() => { setAuthType('anc_number'); setIdentifier(''); }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all ${
                    authType === 'anc_number' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  ANC Book Number
                </button>
              </div>

              {/* Text input with dynamic prompt */}
              <div className="flex flex-col gap-1.5 mt-5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  {authType === 'national_id' ? 'National ID Number' : 'ANC Book Number'}
                </label>
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={authType === 'national_id' ? 'e.g. 12345678' : 'e.g. ANC-2026-0041'}
                  className="w-full h-13 px-4 border border-gray-200 bg-white rounded-xl text-sm font-semibold focus:outline-none focus:border-[#1B6B5A] text-gray-800"
                />
              </div>

              {/* Kenya MCH booklet visual representation */}
              <div className="bg-[#1B6B5A]/5 rounded-2xl p-4 border border-[#1B6B5A]/10 flex gap-4 items-center mt-5 mb-auto">
                <div className="w-[60px] h-[84px] rounded-lg overflow-hidden border border-gray-200 shadow-md flex-shrink-0">
                  <img src="/mch_booklet.jpg" alt="MOH Booklet" className="w-full h-full object-cover" />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#1B6B5A]">MOH Clinic Booklet</h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                    You can find your custom registration serial printed on the front cover of your prenatal guide book.
                  </p>
                </div>
              </div>

              {/* Continue button */}
              <button 
                onClick={() => {
                  if (!identifier) {
                    alert('Please enter a mock ID or ANC book number to continue.');
                    return;
                  }
                  setActiveScreen(9);
                }}
                className="w-full h-14 bg-[#1B6B5A] text-white rounded-full font-bold text-base flex items-center justify-center active:scale-[0.98] transition-transform shadow-teal-glow"
              >
                Continue
              </button>
            </div>
          )}

          {/* SCREEN 9: ENTER PIN (KEYPAD SIMULATION) */}
          {activeScreen === 9 && (
            <div className="flex-1 flex flex-col justify-between pb-10 pt-4 animate-fade-in">
              <div className="px-6">
                <button 
                  onClick={() => setActiveScreen(8)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#1B6B5A] mb-3 hover:underline"
                >
                  <ArrowLeft size={14} />
                  <span>Edit ID / ANC Number</span>
                </button>

                <h2 className="text-xl font-extrabold text-[#0A0A0A] leading-snug tracking-tight">
                  Enter your PIN
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  Enter the 4-digit security PIN linked to your account.
                </p>
              </div>

              {/* Code display dots */}
              <div className="flex justify-center gap-4 my-6">
                {[0, 1, 2, 3].map((index) => (
                  <div 
                    key={index} 
                    className={`w-4 h-4 rounded-full border transition-all ${
                      pin.length > index 
                        ? 'bg-[#1B6B5A] border-[#1B6B5A] scale-110' 
                        : 'bg-transparent border-gray-300'
                    }`}
                  ></div>
                ))}
              </div>

              {/* Helper guide */}
              <div className="px-6 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Hint: Type <span className="text-[#1B6B5A] font-bold">1 2 3 4</span> to verify
              </div>

              {/* Forgot link */}
              <button className="text-center text-xs font-bold text-[#C8813A] my-2 hover:underline">
                Forgot PIN?
              </button>

              {/* Custom Numeric Grid Keypad */}
              <div className="bg-gray-50 border-t border-gray-100 p-4 mt-auto">
                <div className="grid grid-cols-3 gap-y-3 gap-x-6 text-center max-w-[280px] mx-auto">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((val) => (
                    <button 
                      key={val}
                      onClick={() => handleKeypadPress(val)}
                      className="h-12 rounded-xl flex items-center justify-center text-lg font-bold text-gray-700 hover:bg-gray-200/50 active:bg-gray-200 transition-colors"
                    >
                      {val}
                    </button>
                  ))}
                  {/* Bottom keypad row */}
                  <button className="h-12 flex items-center justify-center text-gray-400"></button>
                  <button 
                    onClick={() => handleKeypadPress('0')}
                    className="h-12 rounded-xl flex items-center justify-center text-lg font-bold text-gray-700 hover:bg-gray-200/50 active:bg-gray-200 transition-colors"
                  >
                    0
                  </button>
                  <button 
                    onClick={handleKeypadDelete}
                    className="h-12 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-200/50 active:bg-gray-200 transition-colors"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 10: SUCCESS SCREEN */}
          {activeScreen === 10 && (
            <div className="flex-1 flex flex-col justify-between px-6 pb-10 pt-8 animate-[bounce-in_0.5s_ease-out]">
              {/* Checkmark Animation */}
              <div className="flex flex-col items-center text-center mt-4">
                <div className="w-20 h-20 rounded-full bg-[#1B6B5A]/10 flex items-center justify-center text-[#1B6B5A] mb-6">
                  <CheckCircle size={56} className="stroke-[1.5]" />
                </div>
                
                <h2 className="text-2xl font-extrabold text-[#0A0A0A] leading-tight tracking-tight">
                  Welcome back, <br />
                  <span className="text-[#1B6B5A]">{simulatedName}!</span> 👋
                </h2>
                <p className="text-gray-500 text-sm font-semibold mt-2">
                  You're doing great.
                </p>
              </div>

              {/* Bottom mother and baby image */}
              <div className="w-full h-[280px] rounded-[32px] overflow-hidden shadow-md my-4 border border-[#F5F5F7]">
                <img 
                  src="/mother-child.jpg" 
                  alt="Amina dashboard banner" 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Success navigation */}
              <button 
                onClick={resetDemo}
                className="w-full h-14 bg-[#1B6B5A] text-white rounded-full font-bold flex items-center justify-between px-6 active:scale-[0.98] transition-transform shadow-teal-glow"
              >
                <span className="text-base">Go to Dashboard</span>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ChevronRight size={18} className="text-white" />
                </div>
              </button>
            </div>
          )}

        </div>

        {/* Bottom bar indicator */}
        <div className="absolute bottom-1 inset-x-0 h-1.5 flex justify-center pb-2 z-50">
          <div className="w-32 h-1 bg-[#1A1A1A] rounded-full"></div>
        </div>

      </div>

      {/* Guide details below */}
      <div className="mt-8 text-center text-xs text-gray-400 max-w-sm">
        <p>Built with ❤️ using TailwindCSS & Lucide Icons.</p>
        <p className="mt-1">Design references and assets align with the official TotoAfya local codebase.</p>
      </div>

    </div>
  );
}

