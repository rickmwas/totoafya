import db from '@/api/totoafyaClient';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

export default function NurseChatbot({ patient, children, ancVisits }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I have full access to **${patient.full_name}'s** clinical record. I can help you interpret vitals, flag risks, suggest next steps, or answer clinical questions about this patient. How can I assist?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildContext = () => {
    const latestANC = ancVisits[0];
    return `
PATIENT CONTEXT:
- Name: ${patient.full_name}
- Phone: ${patient.phone || '—'}
- County: ${patient.county || '—'}
- Pregnancy status: ${patient.pregnancy_status || '—'}
- Risk level: ${patient.risk_level || 'low'} (score: ${patient.risk_score ?? '—'})
- LMP: ${patient.lmp || '—'}, EDD: ${patient.edd || '—'}
- Gravida: ${patient.gravida ?? '—'}, Parity: ${patient.parity ?? '—'}
- Blood group: ${patient.blood_group || '—'}
- Caregiver type: ${patient.caregiver_type || 'mother'}
- Facility: ${patient.facility_name || '—'}
- ANC visits recorded: ${ancVisits.length}
${latestANC ? `
LATEST ANC VISIT (${latestANC.visit_date}):
- Visit #${latestANC.visit_number}, Facility: ${latestANC.facility || '—'}
- BP: ${latestANC.blood_pressure_systolic || '—'}/${latestANC.blood_pressure_diastolic || '—'} mmHg
- Weight: ${latestANC.weight_kg || '—'} kg, Fundal height: ${latestANC.fundal_height_cm || '—'} cm
- Fetal HR: ${latestANC.fetal_heart_rate || '—'} bpm, Hb: ${latestANC.haemoglobin || '—'} g/dL
- TTV: ${latestANC.ttv_given ? 'Yes' : 'No'}, IFAS: ${latestANC.ifas_given ? 'Yes' : 'No'}, LLIN: ${latestANC.llin_given ? 'Yes' : 'No'}
- Danger signs: ${latestANC.danger_signs?.length ? latestANC.danger_signs.join(', ') : 'None'}
` : ''}
CHILDREN (${children.length}):
${children.map(c => `- ${c.full_name}, DOB: ${c.date_of_birth}, Gender: ${c.gender}, Status: ${c.health_status || 'healthy'}`).join('\n') || 'None'}

You are a clinical AI assistant for Kenyan maternal and child health. Use WHO/Kenya MoH guidelines. Be concise and practical. Flag urgent issues clearly.
`.trim();
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = messages.map(m => `${m.role === 'user' ? 'Nurse' : 'AI'}: ${m.content}`).join('\n');

    const prompt = `${buildContext()}

CONVERSATION HISTORY:
${history}

Nurse: ${userMsg.content}

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

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-[20px] border border-[#E5E5E5] shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#F5F5F7] flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-full bg-[#2E7A5D]/10 flex items-center justify-center">
          <Bot size={14} className="text-[#2E7A5D]" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-[#0A0A0A] leading-none">Clinical AI</p>
          <p className="text-[10px] text-[#A0A0A0]">Has full context for {patient.full_name}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-[#2E7A5D]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={12} className="text-[#2E7A5D]" />
              </div>
            )}
            <div className={cn(
              'max-w-[80%] rounded-[16px] px-4 py-2.5 text-[13px] leading-relaxed',
              msg.role === 'user'
                ? 'bg-[#2E7A5D] text-white rounded-tr-[4px]'
                : 'bg-[#F5F5F7] text-[#0A0A0A] rounded-tl-[4px]'
            )}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown
                  className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 prose-p:text-[13px] prose-strong:text-[#0A0A0A]"
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-[#2E7A5D] flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={12} className="text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-[#2E7A5D]/10 flex items-center justify-center flex-shrink-0">
              <Bot size={12} className="text-[#2E7A5D]" />
            </div>
            <div className="bg-[#F5F5F7] rounded-[16px] rounded-tl-[4px] px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#A0A0A0] animate-pulse-dot"
                  style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-[#F5F5F7] flex gap-2 flex-shrink-0">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about this patient's vitals, risks, next steps..."
          rows={1}
          className="flex-1 resize-none px-4 py-2.5 bg-[#F5F5F7] rounded-[14px] text-[13px] text-[#0A0A0A] placeholder:text-[#A0A0A0] outline-none focus:ring-1 focus:ring-[#2E7A5D] max-h-24 leading-relaxed"
          style={{ fontSize: '16px' }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-full bg-[#2E7A5D] flex items-center justify-center flex-shrink-0 shadow-green-glow active:scale-[0.92] transition-all disabled:opacity-30 self-end"
        >
          <Send size={15} className="text-white" />
        </button>
      </div>
    </div>
  );
}
