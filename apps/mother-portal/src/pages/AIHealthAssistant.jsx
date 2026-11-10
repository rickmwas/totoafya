import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Send,
  AlertTriangle,
  Phone,
  Bot,
  ArrowLeft,
  RefreshCw,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { dataClient } from '@totoafya/api-client';
import {
  calculateGestationalAgeInWeeks,
  evaluateDangerSigns,
} from '@totoafya/business-logic';
import { PillButton } from '@totoafya/shared-ui';
import AppShell from '@/components/layout/AppShell';
import { useLang } from '@/context/LanguageContext';

export default function AIHealthAssistant() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const isSw = lang === 'sw';

  const [mother, setMother] = useState(null);
  const [children, setChildren] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState(null);

  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome-01',
      sender: 'ai',
      text: isSw
        ? 'Jambo Mama! Mimi ni Msaidizi wako wa Afya ya Uzazi na Mtoto wa TotoAfya. Ninafuata miongozo rasmi ya Wizara ya Afya ya Kenya (MOH) na WHO. Una swali gani kuhusu afya yako au ya mtoto leo?'
        : 'Hello Mama! I am your TotoAfya Maternal & Child AI Health Assistant, grounded strictly in Kenya Ministry of Health (MOH) and WHO clinical guidelines. What health question can I help you with today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    loadScopedMotherProfile();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadScopedMotherProfile = async () => {
    try {
      const user = await dataClient.auth.me();
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }

      let m = null;
      if (user.mother_id) {
        m = await dataClient.mothers.get(user.mother_id);
      }
      if (!m) {
        const mothers = await dataClient.mothers.filter({ user_id: user.id });
        if (mothers.length > 0) m = mothers[0];
      }
      if (!m && dataClient.mode === 'mock') {
        const list = await dataClient.mothers.list();
        m = list.find((item) => item.user_id === user.id) || list[0];
      }

      setMother(m);

      if (m?.id) {
        const kids = await dataClient.children.filter({ mother_id: m.id });
        setChildren(kids);
      }
    } catch (e) {
      console.warn('Could not load mother profile in AI assistant:', e);
    }
  };

  const handleSend = async (customPrompt) => {
    const textToSend = (customPrompt || inputMessage).trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    // 1. Strict Server/Client Fail-Closed Regex Danger Sniffer
    const dangerEvaluation = evaluateDangerSigns(textToSend);
    if (dangerEvaluation.isEmergency) {
      // STRICT FAIL-CLOSED: Immediately halt LLM inference to protect maternal life
      const alertNotice = isSw
        ? `ONYO LA HARAKA LA KLINIKI: Dalili uliyotaja (${dangerEvaluation.redFlags.join(', ')}) ni dalili hatari ya uzazi. Usisubiri majibu ya AI. Nenda hospitalini mara moja.`
        : `CRITICAL CLINICAL ALERT: The symptom mentioned (${dangerEvaluation.redFlags.join(', ')}) indicates an acute obstetric emergency. Do not wait for AI advice. Proceed to the nearest hospital immediately.`;

      setEmergencyAlert({
        message: alertNotice,
        redFlags: dangerEvaluation.redFlags,
        facilityPhone: mother?.facility_emergency_phone || '1190',
      });

      const emergencyAiMsg = {
        id: 'msg-emergency-' + Date.now(),
        sender: 'ai',
        text: alertNotice,
        isEmergency: true,
        redFlags: dangerEvaluation.redFlags,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, emergencyAiMsg]);
      return; // Do NOT call dataClient.ai or LLM API!
    }

    setLoading(true);

    try {
      // 2. Prepare patient context
      const gestationalAge = mother?.lmp ? calculateGestationalAgeInWeeks(mother.lmp) : undefined;
      const context = {
        gestationalAge,
        childAgeMonths: children[0]?.date_of_birth ? 6 : undefined,
      };

      // 3. Call AI endpoint
      const res = await dataClient.ai.askClinicalQuestion(
        textToSend,
        context,
        lang
      );

      const isServerEmergency = res.isEmergency || res.emergencyDetected;
      if (isServerEmergency) {
        setEmergencyAlert({
          message: isSw
            ? 'Dharura ya afya imegunduliwa na mfumo wa usalama. Tafadhali tembelea kituo cha afya mara moja.'
            : 'Clinical danger detected by safety sniffer. Please visit a health facility immediately.',
          redFlags: res.redFlags || [],
          facilityPhone: res.facilityPhone || mother?.facility_emergency_phone || '1190',
        });
      }

      const aiMsg = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: res.response || (isSw ? 'Ushauri wa kliniki haukupatikana kwa sasa.' : 'Clinical advisory unavailable.'),
        isEmergency: isServerEmergency,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error invoking clinical AI:', err);
      const fallbackMsg = {
        id: 'msg-err-' + Date.now(),
        sender: 'ai',
        text: isSw
          ? 'Huduma ya AI haipatikani kwa muda. Ikiwa una dalili za hatari kama kuvuja damu au homa kali, fika kituo cha afya kilicho karibu mara moja.'
          : 'The AI assistant is momentarily unavailable. If experiencing acute symptoms such as bleeding or high fever, please proceed to your nearest health facility.',
        isEmergency: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = isSw
    ? [
        'Vyakula vinavyoongeza damu',
        'Dalili za leba halisi',
        'Jinsi ya kuhesabu mateke',
        'Chanjo za mtoto wiki ya 6',
      ]
    : [
        'Iron-rich foods during pregnancy',
        'Signs of true labor',
        'How to count fetal kicks',
        'Vaccines due at 6 weeks',
      ];

  return (
    <AppShell>
      <div className="bg-[#F9F8F5] min-h-screen flex flex-col font-sans text-[#1A202C] pb-24">
        {/* Top 36px Clinical Safety Banner (SCR-18) */}
        <div className="h-9 min-h-[36px] bg-[#E6F4F1] border-b border-[#CCE8E2] px-4 flex items-center justify-center text-center">
          <p className="font-sans text-[11px] font-medium text-[#004D44] tracking-tight leading-none">
            {isSw
              ? 'TotoAfya AI inatoa mwongozo wa kielimu. Ikiwa una dharura, nenda hospitalini mara moja.'
              : 'TotoAfya AI provides educational guidance. If experiencing an emergency, visit a hospital immediately.'}
          </p>
        </div>

        {/* Top Navigation Header */}
        <div className="px-4 py-3 bg-white border-b border-[#E2E8F0] sticky top-0 z-20 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="min-w-[48px] min-h-[48px] rounded-full hover:bg-[#F1EFEA] text-[#4A5568] flex items-center justify-center transition-colors active:scale-95"
              aria-label={isSw ? 'Rudi nyuma' : 'Go back'}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-[#E6F4F1] text-[#006B5F] flex items-center justify-center shrink-0">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#1A202C] leading-tight">
                {isSw ? 'Msaidizi wa Afya ya Uzazi' : 'TotoAfya AI Assistant'}
              </h1>
              <span className="text-[10px] text-[#006B5F] font-semibold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>Kenya MoH & WHO IMCI Active</span>
              </span>
            </div>
          </div>

          <Link
            to="/emergency"
            className="min-h-[48px] px-3 rounded-full bg-[#FEF2F2] border border-[#FCA5A5] text-[#DC2626] text-xs font-bold flex items-center gap-1.5 hover:bg-[#FEE2E2] transition-colors"
          >
            <AlertTriangle size={15} />
            <span>SOS 1190</span>
          </Link>
        </div>

        {/* Persistent Emergency Warning if triggered */}
        {emergencyAlert && (
          <div className="mx-4 mt-3 p-4 bg-[#FEF2F2] border-2 border-[#DC2626] rounded-2xl flex items-start gap-3 text-xs text-[#7F1D1D] shadow-md animate-fade-in">
            <ShieldAlert className="w-6 h-6 text-[#DC2626] shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block text-sm font-extrabold text-[#991B1B]">
                {isSw ? 'DHARURA YA KLINIKI — HATUA YA HARAKA' : 'CLINICAL EMERGENCY — IMMEDIATE ACTION'}
              </strong>
              <p className="mt-1 text-xs text-[#7F1D1D] leading-relaxed">
                {emergencyAlert.message}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={`tel:${emergencyAlert.facilityPhone || '1190'}`}
                  className="min-h-[48px] px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-full text-xs font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-95"
                >
                  <Phone size={16} />
                  <span>{isSw ? `Piga Simu (${emergencyAlert.facilityPhone || '1190'})` : `Call (${emergencyAlert.facilityPhone || '1190'})`}</span>
                </a>
                <button
                  onClick={() => navigate('/emergency')}
                  className="min-h-[48px] px-4 py-2.5 bg-white border border-[#DC2626] text-[#DC2626] rounded-full text-xs font-bold hover:bg-[#FEF2F2] transition-colors flex items-center gap-1"
                >
                  <span>{isSw ? 'Ukurasa wa Dharura' : 'Emergency Center'}</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto max-w-[430px] mx-auto w-full">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isAi ? 'items-start' : 'items-end justify-end'}`}
              >
                {isAi && (
                  <div className="w-8 h-8 rounded-xl bg-[#E6F4F1] text-[#006B5F] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={17} />
                  </div>
                )}

                <div
                  className={`text-xs leading-relaxed shadow-sm transition-all ${
                    isAi
                      ? m.isEmergency
                        ? 'max-w-[290px] bg-[#FEF2F2] border-2 border-[#F87171] text-[#7F1D1D] rounded-2xl rounded-bl-[4px] p-3.5'
                        : 'max-w-[290px] bg-[#FFFFFF] border border-[#E2E8F0] text-[#1A202C] rounded-2xl rounded-bl-[4px] p-3.5'
                      : 'max-w-[270px] bg-[#006B5F] text-[#FFFFFF] rounded-2xl rounded-br-[4px] p-3.5'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <div
                    className={`text-[9px] mt-1.5 text-right font-medium ${
                      isAi ? (m.isEmergency ? 'text-[#991B1B]' : 'text-[#718096]') : 'text-[#E6F4F1]'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2.5 text-xs text-[#4A5568] pl-2 py-2">
              <div className="w-8 h-8 rounded-xl bg-[#E6F4F1] text-[#006B5F] flex items-center justify-center shrink-0">
                <RefreshCw size={15} className="animate-spin" />
              </div>
              <span className="font-medium">
                {isSw
                  ? 'Inatathmini kulingana na miongozo ya Kenya MoH...'
                  : 'Evaluating Kenya MoH clinical guidelines...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Horizontal Quick-Prompt Carousel in #FFFFFF rounded-full pills (SCR-18) */}
        <div className="px-4 py-2 bg-transparent max-w-[430px] mx-auto w-full">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            {samplePrompts.map((promptText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(promptText)}
                className="min-h-[48px] px-4 py-2 rounded-full bg-[#FFFFFF] border border-[#E2E8F0] shadow-sm text-xs font-medium text-[#006B5F] hover:bg-[#F9F8F5] shrink-0 active:scale-95 transition-all flex items-center whitespace-nowrap"
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Input Bar (SCR-18) */}
        <div className="p-3 bg-white border-t border-[#E2E8F0] sticky bottom-0 z-20 shadow-lg">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2.5 max-w-[430px] mx-auto"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isSw
                  ? 'Andika swali lako la afya hapa...'
                  : 'Ask a maternal or child health question...'
              }
              className="flex-1 h-12 px-4 rounded-full bg-[#F9F8F5] border border-[#E2E8F0] text-xs text-[#1A202C] placeholder-[#718096] focus:outline-none focus:border-[#006B5F] focus:ring-2 focus:ring-[#006B5F]/20 transition-colors"
            />

            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="min-w-[48px] min-h-[48px] rounded-full bg-[#006B5F] hover:bg-[#004D44] text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-all active:scale-95 shadow-sm"
              aria-label={isSw ? 'Tuma ujumbe' : 'Send message'}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
