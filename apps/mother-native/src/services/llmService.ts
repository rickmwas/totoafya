import { db } from '@totoafya/api-client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export async function askAiAssistant(prompt: string, history: ChatMessage[] = [], language: 'en' | 'sw' = 'en'): Promise<string> {
  // Format history for context
  const historyText = history
    .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');

  const systemInstructions = `
You are TotoAfya's premium Digital Maternal & Child Health Assistant. 
Your goal is to guide mothers in Kenya with accurate, empathetic, and clinical advice based on WHO and Kenyan Ministry of Health guidelines.
Always respond in the selected language: ${language === 'sw' ? 'Swahili (Kiswahili)' : 'English'}.
Keep your advice clear, actionable, and formatted nicely in bullet points using markdown.
If danger signs (like severe fever, bleeding, or reduced fetal movement) are mentioned, highlight them in bold and advise the user to visit their nearest clinic immediately.
Use this conversation history to keep context:
${historyText}
  `;

  const finalPrompt = `${systemInstructions}\n\nUser: ${prompt}\nAssistant:`;

  try {
    const response = await db.integrations.Core.InvokeLLM({
      prompt: finalPrompt,
    });
    return typeof response === 'string' ? response : JSON.stringify(response);
  } catch (error) {
    console.error('LLM service failed, using fallback mock response:', error);
    // fallback simulation
    if (prompt.toLowerCase().includes('fever') || prompt.toLowerCase().includes('homa') || prompt.toLowerCase().includes('danger') || prompt.toLowerCase().includes('hatari')) {
      return language === 'sw' 
        ? '**Tahadhari:** Homa kali au dalili za hatari zinahitaji uchunguzi wa daktari haraka. Tafadhali nenda kliniki iliyo karibu mara moja!'
        : '**Warning:** High fever or potential danger signs require immediate clinical assessment. Please visit your nearest health facility immediately!';
    }
    return language === 'sw'
      ? 'Asante kwa swali lako. Hakikisha mtoto anapata chanjo zote kwa wakati na unyonyeshaji unaendelea. Je, ungependa kujua nini kingine?'
      : 'Thank you for your question. Please ensure your child receives all vaccines on time and exclusive breastfeeding is maintained. How else can I assist you?';
  }
}
