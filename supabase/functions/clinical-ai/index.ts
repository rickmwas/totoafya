import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') || '*';

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory rate limiting map: userId -> timestamps array
const rateLimitMap = new Map<string, number[]>();
const MAX_REQUESTS_PER_HOUR = 60;
const ONE_HOUR_MS = 60 * 60 * 1000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowStart = now - ONE_HOUR_MS;
  const timestamps = (rateLimitMap.get(userId) || []).filter((t) => t > windowStart);

  if (timestamps.length >= MAX_REQUESTS_PER_HOUR) {
    return false;
  }

  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);
  return true;
}

const KENYA_MOH_SYSTEM_PROMPT = `
You are the TotoAfya AI Clinical Health Assistant, an expert digital advisory system grounded strictly in Kenya Ministry of Health (MOH) maternal, newborn, and child health guidelines, WHO Integrated Management of Childhood Illness (IMCI), and the Kenya Expanded Programme on Immunization (KEPI).

Your role is to support Kenyan mothers, caregivers, and community health volunteers with accurate, empathetic, and culturally competent health information in English and Kiswahili.

CRITICAL CLINICAL SAFETY RULES:
1. NEVER diagnose acute medical emergencies or prescribe prescription medications (such as antibiotics, antihypertensives, or oxytocics).
2. ALWAYS screen for and flag the 7 Kenya Maternal Danger Signs:
   - Severe headache or blurred vision (Dalili za kifafa cha mimba / Pre-eclampsia)
   - Vaginal bleeding (Kutokwa na damu ukeni)
   - Convulsions or fits (Kifafa cha mimba)
   - High fever (Homa kali)
   - Reduced or absent fetal movements (Mtoto kuacha kucheza)
   - Severe abdominal pain (Maumivu makali ya tumbo)
   - Severe swelling of face and hands (Kuvimba uso na mikono)
3. ALWAYS check the Kenyan KEPI vaccine schedule:
   - Birth: BCG, OPV 0
   - 6 Weeks: OPV 1, Pentavalent 1, PCV 1, Rotavirus 1
   - 10 Weeks: OPV 2, Pentavalent 2, PCV 2, Rotavirus 2
   - 14 Weeks: OPV 3, Pentavalent 3, PCV 3, IPV
   - 9 Months: Measles-Rubella 1, Yellow Fever, Vitamin A
   - 18 Months: Measles-Rubella 2, Vitamin A
4. ALWAYS append a mandatory emergency disclaimer in the appropriate language:
   "Ujumbe huu ni ushauri wa jumla wa afya na hauwezi kuchukua nafasi ya uchunguzi wa daktari au muuguzi hospitalini. Ukiona dalili za hatari, tembelea kituo cha afya kilicho karibu mara moja."
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the function container.');
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase environment variables are missing.');
    }

    // 1. Authenticate caller Bearer JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired session' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // 2. Check rate limit
    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded: Please wait before sending more questions.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      });
    }

    // 3. Parse and sanitize prompt
    const { prompt, context, response_json_schema } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const sanitizedPrompt = prompt.slice(0, 1500).trim();

    // 4. Call Google Gemini 2.5 Flash via Serverless REST
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `${KENYA_MOH_SYSTEM_PROMPT}\n\nPatient Context:\n${JSON.stringify(context || {})}\n\nCaregiver Question:\n${sanitizedPrompt}`,
          },
        ],
      },
    ];

    const geminiPayload: Record<string, any> = { contents };

    if (response_json_schema) {
      geminiPayload.generationConfig = {
        responseMimeType: 'application/json',
        responseSchema: response_json_schema,
      };
    }

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API Error:', geminiRes.status, errText);
      throw new Error(`AI inference service temporarily unavailable (${geminiRes.status})`);
    }

    const geminiData = await geminiRes.json();
    const responseText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No candidate content received from AI service.');
    }

    let parsedResponse = responseText;
    if (response_json_schema) {
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (e) {
        console.warn('Failed to parse structured JSON, returning raw text');
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedResponse,
        model: 'gemini-2.5-flash',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
