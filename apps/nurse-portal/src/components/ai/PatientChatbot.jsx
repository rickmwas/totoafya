import db from '@/api/totoafyaClient';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { differenceInWeeks, differenceInDays, parseISO } from 'date-fns';

export default function PatientChatbot({ mother, children, lang }) {
  const caregiverType = mother?.caregiver_type || 'mother';
  const roleLabel = caregiverType === 'father' ? (lang === 'sw' ? 'baba' : 'Dad') 
                  : caregiverType === 'guardian' ? (lang === 'sw' ? 'mlezi' : 'Guardian')
                  : (lang === 'sw' ? 'mama' : 'Mum');


  const greeting = lang === 'sw'
    ? `Habari! Mimi ni msaidizi wako wa afya wa AI. Nina taarifa zenu zote za afya na ninaweza kukusaidia na maswali yoyote kuhusu afya ya ${caregiverType === 'mother' ? 'ujauzito wako, ' : ''}watoto wako, au afya kwa ujumla kama ${roleLabel}. Unaweza kuniuliza nini?`
    : `Hi${mother?.full_name ? ` ${mother.full_name.split(' ')[0]}` : ''}! I'm your personal health AI assistant. I have your full health profile and can answer questions about ${caregiverType === 'mother' ? 'your pregnancy, ' : ''}your children's health, upcoming vaccines, danger signs, and more as their ${roleLabel}. What would you like to know?`;

  const [messages, setMessages] = useState([{ role: 'assistant', content: greeting }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContext = () => {
    const weeksPregnant = mother?.lmp ? differenceInWeeks(new Date(), parseISO(mother.lmp)) : null;
    return `
PATIENT CONTEXT:
- Name: ${mother?.full_name || '—'}
- Caregiver Type: ${caregiverType}
- Pregnancy status: ${mother?.pregnancy_status || '—'}
- Weeks pregnant: ${weeksPregnant ?? '—'}
- EDD: ${mother?.edd || '—'}
- Risk level: ${mother?.risk_level || 'low'} (score: ${mother?.risk_score ?? '—'})
- Gravida: ${mother?.gravida ?? '—'}, Parity: ${mother?.parity ?? '—'}
- County: ${mother?.county || '—'}, Facility: ${mother?.facility_name || '—'}
- Language preference: ${lang === 'sw' ? 'Swahili' : 'English'}

CHILDREN (${children.length}):
${children.map(c => {
  const ageMonths = c.date_of_birth ? Math.floor(differenceInDays(new Date(), parseISO(c.date_of_birth)) / 30) : null;
  return `- ${c.full_name}, ${ageMonths !== null ? `${ageMonths} months old` : ''}, gender: ${c.gender}, status: ${c.health_status || 'healthy'}`;
}).join('\n') || 'None'}

You are a warm, supportive maternal and child health AI assistant for TotoAfya Digital in Kenya. Use WHO/Kenya MoH guidelines. Respond in ${lang === 'sw' ? 'Swahili' : 'English'}. Be clear, empathetic, and practical. Always recommend seeking professional care for serious concerns. Keep responses concise.

CRITICAL INSTRUCTIONS regarding Caregiver Type:
- The caregiver is a "${caregiverType}". 
- If caregiver_type is "father" or "guardian", they CANNOT be pregnant/postpartum. Do NOT mention their own pregnancy status, antenatal care visits for themselves, or postpartum status (such as "your postpartum recovery" or "since you gave birth"). Talk to them as a father or guardian who is caring for and supporting the children listed, and answer questions from the perspective of how they can ensure the health of their children or support the mother.
`.trim();
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = messages.slice(-6).map(m => `${m.role === 'user' ? 'Patient' : 'AI'}: ${m.content}`).join('\n');

    const prompt = `${buildContext()}

RECENT CONVERSATION:
${history}

Patient: ${userMsg.content}

AI:`;

    const response = await db.integrations.Core.InvokeLLM({ prompt });
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const QUICK_QUESTIONS = caregiverType === 'mother'
    ? (lang === 'sw'
        ? ['Dalili za hatari ni zipi?', 'Lini niende ANC?', 'Chanjo gani inakuja?']
        : ['What are danger signs?', 'When is my next ANC visit?', 'What vaccine is due next?'])
    : (lang === 'sw'
        ? ['Dalili za hatari ni zipi?', 'Chanjo gani inakuja?', 'Mlo kamili wa mtoto ni upi?']
        : ['What are danger signs?', 'What vaccine is due next?', 'What is a balanced diet for a child?']);

  return (
    <div className="flex flex-col h-[520px] bg-white rounded-[20px] border border-[#E5E5E5] shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#F4F6F8] flex items-center gap-2 bg-gradient-to-r from-[#0047FF]/5 to-transparent flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#0047FF] flex items-center justify-center shadow-teal-glow-sm">
          <Bot size={15} className="text-white" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#0A0A0A] leading-none">
            {lang === 'sw' ? 'Msaidizi wa Afya' : 'Health Assistant'}
          </p>
          <p className="text-[10px] text-[#A0A0A0]">
            {lang === 'sw' ? 'Ana taarifa zako zote' : 'Has your full health profile'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-[#0047FF] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-teal-glow-sm">
                <Bot size={11} className="text-white" />
              </div>
            )}
            <div className={cn(
              'max-w-[82%] rounded-[16px] px-4 py-2.5 text-[13px] leading-relaxed',
              msg.role === 'user'
                ? 'bg-[#0047FF] text-white rounded-tr-[4px]'
                : 'bg-[#F4F6F8] text-[#0A0A0A] rounded-tl-[4px]'
            )}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:text-[13px]">
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-[#0047FF] flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={11} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-[#0047FF] flex items-center justify-center flex-shrink-0 shadow-teal-glow-sm">
              <Bot size={11} className="text-white" />
            </div>
            <div className="bg-[#F4F6F8] rounded-[16px] rounded-tl-[4px] px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#A0A0A0] animate-pulse-dot"
                  style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Quick questions — show only at start */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 mt-1">
            {QUICK_QUESTIONS.map(q => (
              <button key={q} onClick={() => { setInput(q); }}
                className="text-[12px] font-semibold text-[#0047FF] bg-[#0047FF]/8 border border-[#0047FF]/20 px-3 py-1.5 rounded-full active:scale-[0.96] transition-all">
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-[#F4F6F8] flex gap-2 flex-shrink-0">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={lang === 'sw' ? 'Uliza swali lolote la afya...' : 'Ask any health question...'}
          rows={1}
          className="flex-1 resize-none px-4 py-2.5 bg-[#F4F6F8] rounded-[14px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:ring-1 focus:ring-[#0047FF] max-h-24 leading-relaxed"
          style={{ fontSize: '16px' }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-full bg-[#0047FF] flex items-center justify-center flex-shrink-0 shadow-teal-glow-sm active:scale-[0.92] transition-all disabled:opacity-30 self-end"
        >
          <Send size={15} className="text-white" />
        </button>
      </div>
    </div>
  );
}
