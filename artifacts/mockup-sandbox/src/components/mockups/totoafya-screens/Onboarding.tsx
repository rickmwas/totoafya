import React from 'react';
import { Heart, Shield, TrendingUp } from 'lucide-react';

export function Onboarding() {
  return (
    <div className="w-[390px] min-h-[844px] bg-[#FDFCF8] overflow-hidden relative flex flex-col font-sans text-gray-800">
      {/* Header Area */}
      <div className="relative h-[380px] w-full bg-gradient-to-b from-[#F5F1E6] to-[#E9F0EC] flex flex-col items-center justify-start pt-14 px-6 rounded-b-[40px]">
        {/* Brand Pill */}
        <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm mb-12">
          <div className="w-5 h-5 bg-[#1B6B5A] text-white rounded-full flex items-center justify-center text-xs font-bold">
            T
          </div>
          <span className="text-sm font-semibold text-[#1B6B5A]">TotoAfya</span>
        </div>

        {/* Image Placeholder */}
        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg relative z-10">
          <img 
            src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80" 
            alt="Mother and baby" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 pt-10 pb-8 flex flex-col relative z-20">
        <h1 className="text-4xl font-['Playfair_Display'] font-bold text-[#1a1a1a] leading-tight mb-3">
          Better Health<br />Starts Here
        </h1>
        <p className="text-[#5c605a] text-[15px] leading-relaxed mb-8 pr-4">
          Your trusted companion for pregnancy & child health in Kenya
        </p>

        {/* Language Toggle */}
        <div className="flex gap-3 mb-10">
          <button className="flex-1 bg-[#1B6B5A] text-white py-2.5 rounded-full text-[13px] font-medium shadow-sm transition-all">
            🇬🇧 English
          </button>
          <button className="flex-1 bg-white border border-[#e2e8f0] text-[#5c605a] py-2.5 rounded-full text-[13px] font-medium hover:bg-gray-50 transition-all">
            🇰🇪 Kiswahili
          </button>
        </div>

        {/* Features Row */}
        <div className="flex justify-between gap-3 mb-auto">
          <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm border border-[#f0eee4] flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#fdece4] flex items-center justify-center text-[#C8813A]">
              <Heart size={20} />
            </div>
            <span className="text-[11px] font-semibold text-[#4a4d48]">Prenatal Care</span>
          </div>
          <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm border border-[#f0eee4] flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#e6f4f1] flex items-center justify-center text-[#1B6B5A]">
              <Shield size={20} />
            </div>
            <span className="text-[11px] font-semibold text-[#4a4d48]">Vaccines</span>
          </div>
          <div className="flex-1 bg-white p-3 rounded-2xl shadow-sm border border-[#f0eee4] flex flex-col items-center text-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#f3f4fd] flex items-center justify-center text-[#4b6bfb]">
              <TrendingUp size={20} />
            </div>
            <span className="text-[11px] font-semibold text-[#4a4d48]">Growth Tracking</span>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 flex flex-col items-center">
          <button className="w-full bg-[#1B6B5A] text-white py-4 rounded-full text-[17px] font-semibold shadow-[0_8px_20px_-6px_rgba(27,107,90,0.5)] flex items-center justify-center gap-2 hover:bg-[#145244] transition-colors">
            Get Started <span className="text-xl">→</span>
          </button>
          <p className="mt-4 text-[13px] text-[#8e948c] font-medium">
            Takes just 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
