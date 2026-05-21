import React from 'react';
import { Sparkles, Bell, Heart, Shield, TrendingUp, Settings, Home, Plus, Activity, Calendar, CheckCircle } from 'lucide-react';

export function HomeDashboard() {
  return (
    <div className="w-[390px] min-h-[844px] bg-[#F7F5F0] overflow-hidden relative flex flex-col font-sans text-slate-800 pb-24 mx-auto shadow-2xl rounded-[40px] border-[8px] border-white">
      {/* Header */}
      <div className="pt-12 px-6 pb-4 flex justify-between items-center">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">Good morning</p>
          <h1 className="text-3xl font-bold text-[#1B6B5A]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Amina</h1>
        </div>
        <div className="flex gap-3 items-center">
          <button className="w-10 h-10 rounded-full bg-[#1B6B5A] text-white flex items-center justify-center shadow-md shadow-[#1B6B5A]/20 transition-transform active:scale-95">
            <Sparkles size={18} />
          </button>
          <div className="relative">
            <button className="w-10 h-10 rounded-full bg-white text-slate-600 flex items-center justify-center shadow-sm transition-transform active:scale-95">
              <Bell size={20} />
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold border-2 border-[#F7F5F0]">2</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 no-scrollbar flex flex-col gap-6" style={{ scrollbarWidth: 'none' }}>
        
        {/* Pregnancy Banner */}
        <div className="bg-gradient-to-br from-[#1B6B5A] to-[#2A8C77] rounded-[24px] p-6 text-white shadow-lg shadow-[#1B6B5A]/15 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
          
          <div className="relative z-10 flex justify-between items-start">
            <div className="flex-1">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-3 backdrop-blur-sm">Week 24 • Second Trimester</span>
              <h2 className="text-xl font-bold mb-1 leading-tight">Baby is the size of an ear of corn 🌽</h2>
              <p className="text-teal-100 text-sm mt-3 font-medium">112 days to go</p>
            </div>
            
            <div className="ml-4 relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-white drop-shadow-md"
                  strokeDasharray="60, 100"
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-white">60%</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3 justify-between">
          <div className="bg-white rounded-[20px] p-3 flex-1 shadow-[0_2px_8px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center border border-white">
            <Activity className="text-[#1B6B5A] mb-1.5" size={18} />
            <span className="text-[11px] text-slate-500 font-medium">3 ANC Visits</span>
          </div>
          <div className="bg-white rounded-[20px] p-3 flex-1 shadow-[0_2px_8px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center border border-white">
            <CheckCircle className="text-[#1B6B5A] mb-1.5" size={18} />
            <span className="text-[11px] text-slate-500 font-medium">Risk: Low ✓</span>
          </div>
          <div className="bg-white rounded-[20px] p-3 flex-1 shadow-[0_2px_8px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center text-center border border-white">
            <Calendar className="text-[#1B6B5A] mb-1.5" size={18} />
            <span className="text-[11px] text-slate-500 font-medium">EDD: Sep 14</span>
          </div>
        </div>

        {/* Today's Reminders */}
        <section>
          <h3 className="text-lg font-bold text-[#1B6B5A] mb-3 px-1">Today's Reminders</h3>
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_8px_rgb(0,0,0,0.04)] flex items-center gap-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#84A98C]"></div>
              <div className="w-10 h-10 rounded-full bg-[#84A98C]/10 flex items-center justify-center text-xl">🩺</div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-sm">Iron supplement due</h4>
                <p className="text-xs text-slate-500 mt-0.5">After breakfast</p>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded-full border-slate-300 text-[#1B6B5A] focus:ring-[#1B6B5A]" />
            </div>
            
            <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_8px_rgb(0,0,0,0.04)] flex items-center gap-4 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-400"></div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-xl">💧</div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800 text-sm">Drink 8 glasses of water</h4>
                <p className="text-xs text-slate-500 mt-0.5">3/8 completed</p>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded-full border-slate-300 text-[#1B6B5A] focus:ring-[#1B6B5A]" />
            </div>
          </div>
        </section>

        {/* Your Children */}
        <section>
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-lg font-bold text-[#1B6B5A]">Your Children</h3>
            <button className="text-[#1B6B5A] text-sm font-semibold flex items-center gap-1 bg-[#1B6B5A]/10 px-3 py-1 rounded-full transition-colors hover:bg-[#1B6B5A]/20">
              Add <Plus size={14} />
            </button>
          </div>
          
          <div className="bg-white rounded-[24px] p-4 shadow-[0_2px_8px_rgb(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
                  J
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Jabari</h4>
                  <p className="text-xs text-slate-500">8 months</p>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 rounded-[16px] p-3 border border-amber-100/50 flex items-start gap-2">
              <Shield size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-800 leading-tight mb-1">BCG booster due in 3 days</p>
                <p className="text-[11px] text-amber-600/80 leading-tight">Book an appointment at your facility</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Bottom Nav */}
      <div className="absolute bottom-6 left-6 right-6 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-6 py-4 flex justify-between items-center border border-slate-100/50 backdrop-blur-md">
        <button className="flex flex-col items-center gap-1 text-[#1B6B5A]">
          <Home size={22} fill="currentColor" />
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#1B6B5A] transition-colors">
          <Heart size={22} />
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#1B6B5A] transition-colors">
          <Shield size={22} />
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#1B6B5A] transition-colors">
          <TrendingUp size={22} />
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#1B6B5A] transition-colors">
          <Settings size={22} />
        </button>
      </div>
    </div>
  );
}
