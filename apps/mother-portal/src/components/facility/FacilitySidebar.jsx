import React from 'react';
import { LayoutDashboard, Users, Baby, Shield, BarChart2, Bell, Heart, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { key: 'overview',   icon: LayoutDashboard, label: 'Overview' },
  { key: 'mothers',    icon: Users,           label: 'Mothers' },
  { key: 'children',   icon: Baby,            label: 'Children' },
  { key: 'vaccines',   icon: Shield,          label: 'Vaccines' },
  { key: 'analytics',  icon: BarChart2,       label: 'Analytics' },
  { key: 'alerts',     icon: Bell,            label: 'Alerts' },
];

export default function FacilitySidebar({ activeTab, setActiveTab, alertCount, isOpen, onClose }) {
  return (
    <aside className={cn(
      'bg-white border-r border-[#E5E5E5] flex flex-col h-screen',
      // Desktop: always visible, sticky
      'lg:w-60 lg:sticky lg:top-0 lg:flex',
      // Mobile: fixed overlay drawer
      'fixed top-0 left-0 z-50 w-72 transition-transform duration-300 ease-out',
      'lg:translate-x-0',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    )}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#E5E5E5] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[12px] bg-[#0047FF] flex items-center justify-center shadow-teal-glow-sm">
            <Heart size={16} className="text-white" fill="white" />
          </div>
          <div>
            <p className="text-[15px] font-extrabold text-[#0A0A0A] leading-none">TotoAfya</p>
            <p className="text-[10px] text-[#A0A0A0] font-medium mt-0.5">Facility Portal</p>
          </div>
        </div>
        {/* Close button on mobile */}
        <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F7] transition-colors">
          <X size={16} className="text-[#666666]" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(({ key, icon: Icon, label }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-[12px] w-full text-left transition-all duration-150 min-h-[44px]',
                active ? 'bg-[#0047FF] text-white shadow-teal-glow-sm' : 'text-[#666666] hover:bg-[#F5F5F7]'
              )}
            >
              <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[13px] font-semibold">{label}</span>
              {key === 'alerts' && alertCount > 0 && (
                <span className={cn('ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                  active ? 'bg-white text-[#0047FF]' : 'bg-[#E51010] text-white')}>
                  {alertCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-[#E5E5E5]">
        <p className="text-[10px] text-[#A0A0A0]">Kenya MCH Digital Platform</p>
        <p className="text-[10px] text-[#C0C0C0] mt-0.5">v1.0 · Facility Staff</p>
      </div>
    </aside>
  );
}
