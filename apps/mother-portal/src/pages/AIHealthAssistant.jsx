import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  AlertTriangle,
  Shield,
  Phone,
  Baby,
  Heart,
  Bot,
  User,
  ArrowLeft,
  RefreshCw,
  HelpCircle,
  Stethoscope,
} from 'lucide-react';
import { dataClient } from '@totoafya/api-client';
import {
  calculateGestationalAgeInWeeks,
  DANGER_SIGNS_EN,
  DANGER_SIGNS_SW,
} from '@totoafya/business-logic';
import { Button, Input, Badge, Card, CardHeader, CardTitle, CardContent } from '@totoafya/shared-ui';
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
        ? 'Jambo Mama! Mimi ni Msaidizi wako wa Afya ya Uzazi na Mtoto wa TotoAfya. Ninafuata miongozo ya Wizara ya Afya (MOH) na WHO. Una swali gani kuhusu afya yako au ya mtoto leo?'
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

  /**
   * Check for Kenya MOH danger signs in input
   */
  const checkDangerSigns = (text) => {
    const lower = text.toLowerCase();
    const dangerKeywords = [
      'bleeding',
      'damu',
      'severe headache',
      'kichwa kinauma sana',
      'blurred vision',
      'kutoona vizuri',
      'convulsion',
      'fits',
      'kifafa',
      'high fever',
      'homa kali',
      'swollen face',
      'kuvimba uso',
      'stopped moving',
      'kuacha kucheza',
      'severe pain',
      'maumivu makali',
    ];

    return dangerKeywords.some((k) => lower.includes(k));
  };

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    // 1. Intercept Kenya MOH danger signs
    const isDangerDetected = checkDangerSigns(textToSend);
    if (isDangerDetected) {
      setEmergencyAlert(
        isSw
          ? 'ONYO LA HATARI: Dalili uliyotaja inahitaji tathmini ya haraka hospitalini. Tafadhali tembelea kituo cha afya au piga nambari ya dharura mara moja.'
          : 'CLINICAL ALERT: The symptom you mentioned represents a potential maternal or neonatal emergency. Please proceed to the nearest healthcare center or call the emergency hotline immediately.'
      );
    }

    try {
      // 2. Prepare patient context
      const gestationalAge = mother?.lmp ? calculateGestationalAgeInWeeks(mother.lmp) : undefined;
      const context = {
        gestationalAge,
        childAgeMonths: children[0]?.date_of_birth ? 6 : undefined,
      };

      // 3. Secure call via dataClient.ai.askClinicalQuestion proxy
      const res = await dataClient.ai.askClinicalQuestion(
        textToSend.trim(),
        context,
        lang
      );

      const aiMsg = {
        id: 'msg-ai-' + Date.now(),
        sender: 'ai',
        text: res.response || (isSw ? 'Ushauri wa kliniki haukupatikana kwa sasa.' : 'Clinical advisory unavailable.'),
        isEmergency: res.emergencyDetected || isDangerDetected,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error invoking clinical AI:', err);
      const fallbackMsg = {
        id: 'msg-err-' + Date.now(),
        sender: 'ai',
        text: isSw
          ? 'Huduma ya AI haipatikani kwa muda. Ikiwa una dalili za hatari (kama homa kali, kuvuja damu, au maumivu makali), fika kituo cha afya kilicho karibu mara moja.'
          : 'The AI assistant is momentarily offline. If experiencing acute symptoms such as bleeding, high fever, or severe pain, please proceed to your nearest health facility.',
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
        'Je, ni vyakula gani bora wakati wa ujauzito?',
        'Mtoto wangu anapaswa kupokea chanjo gani wiki ya 6?',
        'Dalili za kifafa cha mimba (pre-eclampsia) ni zipi?',
        'Je, mtoto anapaswa kunyonya maziwa mara ngapi kwa siku?',
      ]
    : [
        'What foods are recommended during pregnancy?',
        'Which KEPI vaccines are due at 6 weeks?',
        'What are the warning signs of pre-eclampsia?',
        'How many kicks per day are considered healthy?',
      ];

  return (
    <AppShell>
      <div className="bg-[#F8FAFC] min-h-screen flex flex-col font-sans text-slate-900 pb-20">
        {/* Top Header */}
        <div className="px-4 py-3 bg-white border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#006B5F] flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 leading-none">
                {isSw ? 'Msaidizi wa Afya ya Uzazi' : 'TotoAfya AI Assistant'}
              </h1>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Kenya MOH & WHO IMCI Active</span>
              </span>
            </div>
          </div>

          <Badge variant="secondary">Gemini 2.5</Badge>
        </div>

        {/* Emergency Alert Banner if triggered */}
        {emergencyAlert && (
          <div className="mx-4 mt-3 p-3.5 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2.5 text-xs text-rose-900 animate-fade-in shadow-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="block font-bold uppercase tracking-wider text-rose-950">
                {isSw ? 'HATUA YA HARAKA INAHITAJIKA' : 'URGENT CLINICAL ASSESSMENT REQUIRED'}
              </strong>
              <p className="mt-0.5 text-rose-800 leading-relaxed">{emergencyAlert}</p>
              <div className="mt-2 flex items-center gap-2">
                <a
                  href={`tel:${mother?.facility_emergency_phone || '1190'}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  <Phone size={13} />
                  <span>{isSw ? 'Piga 1190 Sasa' : 'Call 1190 Hotline'}</span>
                </a>
                <button
                  onClick={() => setEmergencyAlert(null)}
                  className="px-2.5 py-1.5 text-rose-700 text-xs font-semibold hover:underline"
                >
                  {isSw ? 'Funga' : 'Dismiss'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 space-y-3.5 overflow-y-auto max-w-[430px] mx-auto w-full">
          {messages.map((m) => {
            const isAi = m.sender === 'ai';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isAi ? 'items-start' : 'items-end justify-end'}`}
              >
                {isAi && (
                  <div className="w-7 h-7 rounded-xl bg-teal-50 text-[#006B5F] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={15} />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                    isAi
                      ? m.isEmergency
                        ? 'bg-rose-50 border border-rose-200 text-rose-950'
                        : 'bg-white border border-slate-200/80 text-slate-800'
                      : 'bg-[#006B5F] text-white rounded-br-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <div
                    className={`text-[9px] mt-1.5 text-right font-medium ${
                      isAi ? 'text-slate-400' : 'text-teal-200'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2.5 text-xs text-slate-500 pl-2">
              <div className="w-7 h-7 rounded-xl bg-teal-50 text-[#006B5F] flex items-center justify-center shrink-0">
                <RefreshCw size={14} className="animate-spin" />
              </div>
              <span>{isSw ? 'Inatathmini kulingana na miongozo ya MOH...' : 'Evaluating Kenya MOH clinical guidelines...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Pill Carousel */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-slate-100 bg-white">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              {isSw ? 'Maswali ya Kawaida:' : 'Frequently Asked:'}
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(p)}
                  className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium shrink-0 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 sticky bottom-0 z-20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 max-w-[430px] mx-auto"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={isSw ? 'Andika swali lako la afya hapa...' : 'Ask a maternal or child health question...'}
              className="flex-1 h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#006B5F] transition-colors"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading || !inputMessage.trim()}
              className="h-12 w-12 !px-0 rounded-xl shrink-0 flex items-center justify-center"
            >
              <Send size={16} />
            </Button>
          </form>
          <p className="text-[9.5px] text-slate-400 text-center mt-1.5">
            {isSw
              ? 'TotoAfya AI hutoa ushauri wa jumla. Ukiona dalili za hatari, tembelea hospitali.'
              : 'TotoAfya AI provides general guidance. In acute emergencies, visit your hospital immediately.'}
          </p>
        </div>
      </div>
    </AppShell>
  );
}
