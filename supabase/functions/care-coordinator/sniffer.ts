/**
 * Pure TypeScript Obstetric & Neonatal Danger Sniffer and KDPA 2019 PII Redactor
 * Zero external dependencies — compatible with Deno Edge Functions and Node/Vitest.
 */

export const EMERGENCY_REGEX_PATTERNS = [
  { pattern: /\b(damu|bleeding|haemorrhage|spotting|(\w*tokwa\s+na\s+damu)|\w*toka\s+damu)\b/i, label: 'Vaginal Bleeding (Kutokwa na Damu)' },
  { pattern: /\b(kifafa|convulsions?|fits?|seizures?|degedege|eclampsia|\w*kakamaa)\b/i, label: 'Convulsions / Fits (Kifafa cha Mimba)' },
  { pattern: /\b(severe\s+headache|headache|(\w*umwa\s+na\s+kichwa(\s+sana)?)|(kichwa\s+(\w+\s+)?\w*uma(\s+sana)?))\b/i, label: 'Severe Headache (Kuumwa na Kichwa Sana)' },
  { pattern: /\b(blurred\s+vision|vision\s+loss|(kutoona|haoni|sioni)\s+vizuri|macho\s+(\w+\s+)?(hayaoni|kutoona\s+vizuri|sioni))\b/i, label: 'Blurred Vision (Kutoona Vizuri)' },
  { pattern: /\b(haisikiki|hasikiki|baby\s+stops?\s+moving|moves?\s+less|\w*acha\s+kucheza|hachezi|reduced\s+fetal\s+movement)\b/i, label: 'Reduced/Absent Fetal Movement (Mtoto Haisikiki)' },
  { pattern: /\b(unconscious(ness)?|(\w*poteza\s+fahamu)|\w*zirai|\w*zimia|fainting|collapse)\b/i, label: 'Loss of Consciousness (Kupoteza Fahamu)' },
  { pattern: /\b(severe\s+chest\s+pain|chest\s+pain|maumivu\s+(makali\s+ya\s+)?kifua|kifua\s+\w*uma(\s+sana)?)\b/i, label: 'Severe Chest Pain (Maumivu Makali ya Kifua)' },
  { pattern: /\b(high\s+fever|homa\s+kali|homa\s+ya\s+juu|chills|\w*tetemeka)\b/i, label: 'High Fever / Chills (Homa Kali)' },
  { pattern: /\b(severe\s+abdominal\s+pain|maumivu\s+makali\s+ya\s+tumbo|tumbo\s+\w*uma\s+sana)\b/i, label: 'Severe Abdominal Pain (Maumivu Makali ya Tumbo)' },
  { pattern: /\b(water\s+broke|maji\s+(\w*vunjika|\w*toka|\w*mwagika)|leaking\s+fluid|ruptured\s+membranes)\b/i, label: 'Leaking Fluid / Water Broke (Maji Kuvunjika)' },
  { pattern: /\b((\w*vimba\s+(uso|mikono))|((uso|mikono)\s+\w*vimba)|swelling\s+of\s+(face|hands)|facial\s+(edema|swelling))\b/i, label: 'Facial/Hand Swelling (Kuvimba Uso na Mikono)' },
  { pattern: /\b(difficulty\s+breathing|\w*pumua\s+kwa\s+shida|shindwa\s+kupumua|\w*shindwa\s+kupumua|shortness\s+of\s+breath)\b/i, label: 'Difficulty Breathing (Kupumua kwa Shida)' },
];

/**
 * KDPA 2019 Compliant PII Tokenization & Redaction
 * Converts names, national IDs, and telephone numbers to ephemeral tokens (tok_m_...)
 */
export function redactPII(
  prompt: string,
  context?: Record<string, any>
): { sanitizedPrompt: string; sanitizedContext: Record<string, any> } {
  let sanitizedPrompt = prompt;

  // Redact Kenyan telephone numbers (+2547..., 07..., 01...)
  sanitizedPrompt = sanitizedPrompt.replace(/(\+?254|0)[17]\d{8}\b/g, 'tok_m_phone_9832');

  // Redact 6 to 8-digit national identifiers
  sanitizedPrompt = sanitizedPrompt.replace(/\b(id|national\s*id|kitambulisho)?\s*:?\s*(\d{6,8})\b/gi, 'tok_m_id_7411');

  const sanitizedContext: Record<string, any> = {};
  if (context && typeof context === 'object') {
    for (const [key, value] of Object.entries(context)) {
      const lowerKey = key.toLowerCase();
      if (['full_name', 'name', 'mother_name', 'caregiver_name'].includes(lowerKey)) {
        sanitizedContext[key] = 'tok_m_name_3108';
      } else if (['phone', 'telephone', 'mobile', 'emergency_phone'].includes(lowerKey)) {
        sanitizedContext[key] = 'tok_m_phone_9832';
      } else if (['national_id', 'id_number', 'anc_number'].includes(lowerKey)) {
        sanitizedContext[key] = 'tok_m_id_7411';
      } else if (typeof value === 'string') {
        sanitizedContext[key] = value
          .replace(/(\+?254|0)[17]\d{8}\b/g, 'tok_m_phone_9832')
          .replace(/\b\d{7,8}\b/g, 'tok_m_id_7411');
      } else {
        sanitizedContext[key] = value;
      }
    }
  }

  return { sanitizedPrompt, sanitizedContext };
}

/**
 * Deterministic Server-Side Regex Emergency Sniffer
 */
export function snifferDangerSigns(text: string): { isEmergency: boolean; redFlags: string[] } {
  const redFlags: string[] = [];
  for (const { pattern, label } of EMERGENCY_REGEX_PATTERNS) {
    if (pattern.test(text)) {
      redFlags.push(label);
    }
  }
  return {
    isEmergency: redFlags.length > 0,
    redFlags,
  };
}
