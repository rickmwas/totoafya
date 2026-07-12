import db from '@/api/totoafyaClient';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { differenceInWeeks, differenceInDays, parseISO } from 'date-fns';

export default function PatientChatbot({ mother, children, lang, className, initialInput }) {
  const caregiverType = mother?.caregiver_type || 'mother';
  const roleLabel = caregiverType === 'father' ? (lang === 'sw' ? 'baba' : 'Dad') 
                  : caregiverType === 'guardian' ? (lang === 'sw' ? 'mlezi' : 'Guardian')
                  : (lang === 'sw' ? 'mama' : 'Mum');

  const greeting = lang === 'sw'
    ? `Habari! Mimi ni msaidizi wako wa afya wa AI. Nina taarifa zenu zote za afya na ninaweza kukusaidia na maswali yoyote kuhusu afya ya ${caregiverType === 'mother' ? 'ujauzito wako, ' : ''}watoto wako, au afya kwa ujumla kama ${roleLabel}. Unaweza kuniuliza nini?`
    : `Hi${mother?.full_name ? ` ${mother.full_name.split(' ')[0]}` : ''}! I'm your personal health AI assistant. I have your full health profile and can answer questions about ${caregiverType === 'mother' ? 'your pregnancy, ' : ''}your children's health, upcoming vaccines, danger signs, and more as their ${roleLabel}. What would you like to know?`;

  const [messages, setMessages] = useState([{ role: 'assistant', content: greeting }]);
  const [input, setInput] = useState(initialInput || '');

  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
    }
  }, [initialInput]);
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
    <div className={cn("flex flex-col h-[520px] bg-white rounded-[32px] border border-[#e5e7eb] shadow-sm overflow-hidden animate-slide-up", className)}>
      {/* Mini Info Header */}
      <div className="px-5 py-4 border-b border-[#e5e7eb] flex items-center gap-3 bg-gradient-to-r from-toto-teal/5 to-transparent flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-toto-teal flex items-center justify-center shadow-sm">
          <Bot size={18} className="text-white" />
        </div>
        <div>
          <p className="text-[13.5px] font-extrabold text-[#131714] leading-none">
            {lang === 'sw' ? 'Msaidizi wa Afya' : 'Health Assistant'}
          </p>
          <p className="text-[10px] text-toto-gray font-semibold mt-0.5">
            {lang === 'sw' ? 'Ana taarifa zako zote' : 'Has your full health profile'}
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-2.5', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-toto-teal/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={13} className="text-toto-teal" />
              </div>
            )}
            <div className={cn(
              'max-w-[78%] rounded-[20px] px-5 py-3 text-[13.5px] leading-relaxed font-medium',
              msg.role === 'user'
                ? 'bg-toto-teal text-white rounded-tr-[4px]'
                : 'bg-[#f0f2f0] text-[#131714] rounded-tl-[4px]'
            )}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown className="prose prose-sm max-w-none prose-p:text-[13.5px] prose-p:text-[#131714] prose-p:leading-relaxed">
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-toto-teal flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm text-white font-extrabold text-[10px]">
                U
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-toto-teal/10 flex items-center justify-center flex-shrink-0">
              <Bot size={13} className="text-toto-teal" />
            </div>
            <div className="bg-[#f0f2f0] rounded-[20px] rounded-tl-[4px] px-5 py-3.5 flex gap-1.5 items-center">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-toto-gray/50 animate-pulse-dot"
                  style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Quick questions (Suggestive chips) */}
        {messages.length === 1 && !loading && (
          <div className="flex flex-wrap gap-2 mt-1">
            {QUICK_QUESTIONS.map(q => (
              <button 
                key={q} 
                onClick={() => setInput(q)}
                className="text-[12.5px] font-bold text-toto-teal bg-toto-teal/5 border border-toto-teal/20 px-3.5 py-1.5 rounded-full active:scale-95 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Bottom Message Input Bar */}
      <div className="px-4 py-3.5 border-t border-[#e5e7eb] flex flex-col gap-2 bg-white flex-shrink-0">
        <div className="flex gap-2.5">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={lang === 'sw' ? 'Uliza swali lolote la afya...' : 'Ask any health question...'}
            rows={1}
            className="flex-1 resize-none px-4 py-3 bg-[#f7f9f7] rounded-[16px] text-[14px] text-[#131714] placeholder:text-toto-gray/70 border border-[#e5e7eb] outline-none focus:border-toto-teal max-h-24 leading-relaxed font-medium"
            style={{ fontSize: '16px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-full bg-toto-teal hover:bg-toto-teal-dark flex items-center justify-center flex-shrink-0 shadow-sm active:scale-90 transition-all disabled:opacity-35 self-end text-white"
          >
            <Send size={16} />
          </button>
        </div>
        <span className="text-[10px] text-toto-gray text-center font-semibold">
          {lang === 'sw' ? 'AI inaweza kufanya makosa. Thibitisha ushauri muhimu wa matibabu.' : 'AI can make mistakes. Verify important medical advice.'}
        </span>
      </div>
    </div>
  );
}
