import { dataClient } from '@totoafya/api-client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export async function askAiAssistant(prompt: string, history: ChatMessage[] = [], language: 'en' | 'sw' = 'en'): Promise<string> {
  try {
    const res = await dataClient.ai.askClinicalQuestion(prompt, undefined, language);
    return res.response;
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
