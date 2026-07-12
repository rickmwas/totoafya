import React from 'react';
import { CreditCard, CheckCircle, Zap, Shield, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

export default function FacilityBilling({ data }) {
  const { user } = useAuth();
  
  // Calculate current usage
  const totalMothers = data.mothers?.length || 0;
  
  // Example subscription tiers (In a real system, fetch from DB)
  const currentPlan = user?.subscription_tier || 'basic';
  const limits = {
    free: 5,
    basic: 50,
    premium: 500,
    enterprise: 'Unlimited'
  };
  
  const currentLimit = limits[currentPlan] || 50;
  const usagePercentage = currentLimit === 'Unlimited' ? 0 : Math.min(100, (totalMothers / currentLimit) * 100);
  
  const isNearLimit = currentLimit !== 'Unlimited' && usagePercentage > 80;
  const isAtLimit = currentLimit !== 'Unlimited' && usagePercentage >= 100;

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-[28px] font-extrabold text-[#0A0A0A] tracking-[-0.02em]">Billing & Quota</h1>
        <p className="text-[14px] text-[#666666] mt-1">Manage your facility's subscription and patient limits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Usage Card */}
        <div className="col-span-1 lg:col-span-2 bg-white rounded-[24px] border border-[#E5E5E5] p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#2E5B47]/10 flex items-center justify-center">
              <CreditCard size={20} className="text-[#2E5B47]" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#0A0A0A]">Current Subscription</h2>
              <p className="text-[13px] text-[#A0A0A0] capitalize">Plan: {currentPlan}</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                Active
              </span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-end mb-2">
              <p className="text-[14px] font-semibold text-[#0A0A0A]">Patient Quota (Mothers)</p>
              <p className="text-[14px] font-bold text-[#666666]">
                <span className={cn("text-[20px] text-[#0A0A0A]", isAtLimit ? "text-rose-600" : "")}>{totalMothers}</span> 
                {' '}/ {currentLimit}
              </p>
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isAtLimit ? "bg-rose-500" : isNearLimit ? "bg-amber-400" : "bg-[#2E5B47]"
                )}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>

          {isAtLimit && (
            <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl flex gap-3">
              <AlertTriangle className="text-rose-600 shrink-0" size={20} />
              <div>
                <p className="text-rose-900 font-bold text-sm">Quota Reached</p>
                <p className="text-rose-700 text-xs mt-1">You have reached the maximum number of mothers allowed on your current plan. Please upgrade to continue registering new patients.</p>
              </div>
            </div>
          )}
          {isNearLimit && !isAtLimit && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
              <AlertTriangle className="text-amber-600 shrink-0" size={20} />
              <div>
                <p className="text-amber-900 font-bold text-sm">Approaching Quota Limit</p>
                <p className="text-amber-700 text-xs mt-1">You are close to your maximum patient allowance. Consider upgrading your plan soon.</p>
              </div>
            </div>
          )}
        </div>

        {/* Upgrade Card */}
        <div className="col-span-1 bg-gradient-to-br from-[#2E5B47] to-[#002FB3] rounded-[24px] p-6 text-white shadow-xl shadow-blue-900/20 flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 backdrop-blur-sm">
            <Zap size={24} className="text-white" />
          </div>
          <h3 className="text-[20px] font-extrabold mb-2">Upgrade Plan</h3>
          <p className="text-blue-100 text-[13px] mb-6 leading-relaxed">
            Get more capacity and advanced analytics to provide better care for your community.
          </p>
          
          <ul className="space-y-3 mb-8 flex-1">
            <li className="flex items-center gap-2 text-[13px] font-medium text-blue-50">
              <CheckCircle size={16} className="text-emerald-400" /> Up to 500 Mothers
            </li>
            <li className="flex items-center gap-2 text-[13px] font-medium text-blue-50">
              <CheckCircle size={16} className="text-emerald-400" /> Priority Support
            </li>
            <li className="flex items-center gap-2 text-[13px] font-medium text-blue-50">
              <CheckCircle size={16} className="text-emerald-400" /> Advanced Analytics
            </li>
          </ul>

          <button className="w-full py-3.5 bg-white text-[#2E5B47] font-bold text-[14px] rounded-xl hover:bg-blue-50 transition-colors active:scale-95 shadow-lg">
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
}
