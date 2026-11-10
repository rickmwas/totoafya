import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldAlert,
  Heart,
  Info,
} from 'lucide-react';
import { evaluateKickCountSession } from '@totoafya/business-logic';
import { StatusBadge, PillButton } from '@totoafya/shared-ui';

export function SCR10KickCounter({
  lang = 'en',
  onNavigate,
  onEmergency,
  targetKicks = 10,
  windowMinutes = 120,
  className = '',
}) {
  const isSw = lang === 'sw';
  const [kickTimestamps, setKickTimestamps] = useState([]);
  const [startTime, setStartTime] = useState(() => Date.now());
  const [secondsRemaining, setSecondsRemaining] = useState(windowMinutes * 60);
  const [isRippling, setIsRippling] = useState(false);
  const [sessionActive, setSessionActive] = useState(true);

  // Timer interval countdown
  useEffect(() => {
    if (!sessionActive || secondsRemaining <= 0) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSessionActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionActive, secondsRemaining]);

  // Current session evaluation
  const evaluation = evaluateKickCountSession({
    kickTimestamps,
    sessionStartTime: startTime,
    currentTime: Date.now(),
    windowMinutes,
    targetKicks,
  });

  const handleRecordKick = () => {
    // Trigger haptic vibration if supported on mobile device
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(60);
      } catch (e) {
        // Ignored in non-supporting browsers
      }
    }

    // Trigger visual ripple state
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 400);

    const now = Date.now();
    setKickTimestamps((prev) => [...prev, now]);

    // Check if 10 kicks reached
    if (kickTimestamps.length + 1 >= targetKicks) {
      setSessionActive(false);
    }
  };

  const handleResetSession = () => {
    setKickTimestamps([]);
    setStartTime(Date.now());
    setSecondsRemaining(windowMinutes * 60);
    setSessionActive(true);
  };

  const handleEmergencyClick = () => {
    if (typeof onEmergency === 'function') {
      onEmergency();
    } else if (typeof onNavigate === 'function') {
      onNavigate('/emergency');
    }
  };

  // Format countdown mm:ss
  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isComplete = evaluation.isComplete;
  const isAlert = evaluation.alertTriggered || secondsRemaining === 0 && !isComplete;

  return (
    <div
      data-testid="scr10-kick-counter"
      className={`w-full flex flex-col gap-5 px-4 pt-3 pb-12 text-left bg-[#F9F8F5] min-h-screen ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('/dashboard')}
              aria-label={isSw ? 'Rudi nyumbani' : 'Back to dashboard'}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-[#E2E8F0] text-[#1A202C] hover:bg-[#F1EFEA] active:scale-95 transition-all"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-serif text-[#1A202C] tracking-tight">
              {isSw ? 'Hesabu Mateke ya Mtoto' : 'Fetal Kick Counter'}
            </h1>
            <p className="text-xs text-[#718096] font-medium">
              {isSw ? 'Mwongozo wa mateke 10 ndani ya masaa 2' : 'Track 10 movements in a 2-hour window'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetSession}
          aria-label={isSw ? 'Anza upya' : 'Reset session'}
          className="min-h-[48px] px-3.5 py-2 rounded-full bg-white border border-[#E2E8F0] text-xs font-semibold text-[#4A5568] hover:bg-[#F1EFEA] active:scale-95 transition-all flex items-center gap-1.5"
        >
          <RotateCcw className="w-4 h-4 text-[#718096]" aria-hidden="true" />
          <span>{isSw ? 'Upya' : 'Reset'}</span>
        </button>
      </div>

      {/* Clinical Guidance Box */}
      <div className="p-4 rounded-2xl bg-[#E6F4F1] border border-[#BCE1DB] text-xs text-[#004D44] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#006B5F] shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex flex-col gap-0.5">
          <span className="font-bold">
            {isSw ? 'Jinsi ya kuhesabu mateke:' : 'Clinical counting protocol:'}
          </span>
          <span>
            {isSw
              ? 'Lala kwa upande wa kushoto au keti kwa utulivu. Kila wakati unapohisi mtoto akisogea, akipiga teke au akigeuka, bonyeza kitufe kikubwa hapa chini.'
              : 'Rest comfortably on your left side in a quiet room. Each time you feel a kick, flutter, or roll, tap the large button below.'}
          </span>
        </div>
      </div>

      {/* Countdown Timer & Progress Badge */}
      <div className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#B45309]" aria-hidden="true" />
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider">
              {isSw ? 'Muda Uliosalia' : 'Time Remaining'}
            </span>
            <span className="text-xl font-bold font-mono text-[#1A202C]">
              {formatTime(secondsRemaining)}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider block">
            {isSw ? 'Mateke Yaliyorekodiwa' : 'Kicks Counted'}
          </span>
          <span className="text-2xl font-black font-display text-[#006B5F]">
            {evaluation.count} <span className="text-sm font-semibold text-[#718096]">/ {targetKicks}</span>
          </span>
        </div>
      </div>

      {/* Reassurance State Banner (10 kicks reached) */}
      {isComplete && (
        <section
          aria-label={isSw ? 'Uthibitisho wa Afya' : 'Health Reassurance'}
          className="w-full rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] p-4 flex items-start gap-3 animate-fadeIn"
        >
          <CheckCircle2 className="w-6 h-6 text-[#15803D] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex flex-col gap-1 text-left">
            <h3 className="text-sm font-bold text-[#166534]">
              {isSw ? 'Hongera! Mtoto Yuko Salama' : 'Reassurance: Baby is Active & Healthy'}
            </h3>
            <p className="text-xs text-[#15803D] leading-relaxed">
              {isSw
                ? `Mtoto wako ametimiza mateke ${evaluation.count} ndani ya dakika ${evaluation.elapsedMinutes}. Mwendo huu unaashiria afya bora ya kijusi.`
                : `Your baby recorded ${evaluation.count} movements in ${evaluation.elapsedMinutes} minutes. This is a reassuring sign of healthy fetal well-being.`}
            </p>
          </div>
        </section>
      )}

      {/* Movement Drop Alert Banner */}
      {isAlert && (
        <section
          aria-label={isSw ? 'Tahadhari ya Kupungua kwa Mwendo' : 'Movement Drop Alert'}
          className="w-full rounded-2xl bg-[#FEF2F2] border-2 border-[#DC2626] p-4 flex flex-col gap-3 animate-shake"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-[#DC2626] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex flex-col gap-1 text-left">
              <h3 className="text-sm font-bold text-[#991B1B]">
                {isSw ? 'Tahadhari: Mtoto Amecheza Chini ya Mara 10' : 'Alert: Fewer than 10 Kicks Detected'}
              </h3>
              <p className="text-xs text-[#7F1D1D] leading-relaxed">
                {isSw
                  ? 'Muda wa masaa 2 umekamilika bila kufikisha mateke 10, au mtoto amepunguza mchezo sana. Unashauriwa kufika kliniki mara moja kufanyiwa uchunguzi wa mapigo ya moyo wa mtoto.'
                  : 'The 2-hour window passed with fewer than 10 movements. Reduced fetal movement warrants immediate clinical assessment at your health facility.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleEmergencyClick}
            className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md"
          >
            <ShieldAlert className="w-5 h-5 text-white" aria-hidden="true" />
            <span>{isSw ? 'Piga Simu ya Dharura ya Hospitali Sasa' : 'Immediate Emergency Facility Triage'}</span>
          </button>
        </section>
      )}

      {/* Large Circular Interactive Tap Button (Natural Thumb Zone) */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="relative flex items-center justify-center">
          {/* Ripple Ring Animation */}
          {isRippling && (
            <span
              className="absolute w-56 h-56 rounded-full bg-[#006B5F]/20 animate-ping pointer-events-none"
              aria-hidden="true"
            />
          )}

          <button
            type="button"
            onClick={handleRecordKick}
            aria-label={isSw ? `Rekodi teke la mtoto. Jumla ni ${evaluation.count}` : `Record baby kick. Current count is ${evaluation.count}`}
            className={`w-44 h-44 rounded-full flex flex-col items-center justify-center text-white font-bold select-none shadow-lg active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#006B5F] focus-visible:ring-offset-4 ${
              isComplete
                ? 'bg-gradient-to-br from-[#15803D] to-[#166534] shadow-[#15803D]/25'
                : 'bg-gradient-to-br from-[#006B5F] to-[#004D44] shadow-[#006B5F]/30 hover:brightness-105'
            }`}
          >
            <Heart className="w-10 h-10 text-[#FEF3C7] mb-2 animate-pulse" aria-hidden="true" />
            <span className="text-base font-bold tracking-tight">
              {isSw ? 'Bonyeza Teke' : 'Tap Kick'}
            </span>
            <span className="text-xs text-[#E6F4F1] font-medium mt-0.5">
              {isSw ? `${evaluation.count} Yamefikiwa` : `${evaluation.count} Recorded`}
            </span>
          </button>
        </div>
      </div>

      {/* Kick History Log (Timestamps) */}
      <div className="w-full rounded-2xl bg-white border border-[#E2E8F0] p-4 flex flex-col gap-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#1A202C]">
            {isSw ? 'Orodha ya Mateke ya Kikao Hiki' : 'Session Movement Log'}
          </span>
          <span className="text-[11px] text-[#718096]">
            {kickTimestamps.length} {isSw ? 'yaliyosajiliwa' : 'recorded'}
          </span>
        </div>

        {kickTimestamps.length === 0 ? (
          <p className="text-xs text-[#718096] italic py-2">
            {isSw ? 'Bado hakuna teke lililorekodiwa katika kikao hiki.' : 'No movements recorded yet for this session. Tap the button above when baby moves.'}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {kickTimestamps.map((ts, idx) => {
              const date = new Date(ts);
              const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              return (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F1EFEA] text-[#1A202C] border border-[#E2E8F0]"
                >
                  <Activity className="w-3 h-3 text-[#006B5F]" aria-hidden="true" />
                  <span>#{idx + 1}: {timeStr}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Fail-Closed Emergency SOS Trigger Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleEmergencyClick}
          className="w-full min-h-[48px] px-4 py-3 rounded-2xl bg-white border border-[#FCA5A5] hover:bg-[#FEF2F2] text-[#DC2626] font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <ShieldAlert className="w-4 h-4 text-[#DC2626]" aria-hidden="true" />
          <span>{isSw ? 'Je, una wasiwasi kuhusu mchezo wa mtoto? Piga Simu ya Kliniki' : 'Worried about baby movement? Emergency SOS Takeover'}</span>
        </button>
      </div>
    </div>
  );
}
