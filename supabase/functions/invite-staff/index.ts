import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are missing on the function container.');
    }

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not configured.');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Parse invitation body
    const { email, redirectTo } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    // 1. Call Supabase Admin Auth API to generate a signup/invite confirmation link (WITHOUT sending email automatically)
    const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
      type: 'invite',
      email: email,
      options: {
        redirectTo: redirectTo || undefined
      }
    });

    if (linkError) throw linkError;

    const actionLink = linkData?.properties?.action_link;
    if (!actionLink) {
      throw new Error('Failed to generate invitation action link from Supabase Auth.');
    }

    // 2. Dispatch a beautiful, premium, customized HTML email using Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "TotoAfya Onboarding <totoafya@terraseptsolutions.com>",
        to: [email],
        subject: "Activate Your TotoAfya Staff Account 🌿",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Activate Your TotoAfya Account</title>
              <style>
                body {
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  background-color: #F7F5F0;
                  margin: 0;
                  padding: 40px 20px;
                }
                .card {
                  max-width: 500px;
                  margin: 0 auto;
                  background-color: #FFFFFF;
                  border: 1px solid #E5E5E5;
                  border-radius: 20px;
                  padding: 40px;
                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
                }
                .logo {
                  font-size: 26px;
                  font-weight: 800;
                  color: #006B5F;
                  text-align: center;
                  margin-bottom: 24px;
                  letter-spacing: -0.03em;
                }
                .welcome-title {
                  font-size: 22px;
                  font-weight: 800;
                  color: #0A0A0A;
                  text-align: center;
                  margin-bottom: 12px;
                  letter-spacing: -0.02em;
                }
                .description {
                  font-size: 14px;
                  color: #555555;
                  line-height: 1.6;
                  text-align: center;
                  margin-bottom: 32px;
                }
                .button-container {
                  text-align: center;
                  margin-bottom: 32px;
                }
                .btn {
                  display: inline-block;
                  background-color: #006B5F;
                  color: #FFFFFF !important;
                  padding: 14px 28px;
                  font-size: 14px;
                  font-weight: 700;
                  text-decoration: none;
                  border-radius: 12px;
                  box-shadow: 0 4px 12px rgba(0, 107, 95, 0.2);
                  transition: all 0.2s ease;
                }
                .footer {
                  border-top: 1px solid #E5E5E5;
                  padding-top: 24px;
                  font-size: 12px;
                  color: #A0A0A0;
                  line-height: 1.6;
                  text-align: center;
                }
                .fallback-link {
                  color: #006B5F;
                  word-break: break-all;
                  text-decoration: none;
                }
              </style>
            </head>
            <body>
              <div class="card">
                <div class="logo">🌿 TotoAfya Digital</div>
                <h2 class="welcome-title">Welcome to TotoAfya!</h2>
                <p class="description">
                  You have been pre-registered as a staff member on the TotoAfya Digital platform. 
                  Please click the secure button below to set up your password and activate your account.
                </p>
                <div class="button-container">
                  <a href="${actionLink}" class="btn" target="_blank">Activate Account</a>
                </div>
                <div class="footer">
                  This invitation is sent automatically. If you did not request this, please ignore this email.<br/><br/>
                  If the button does not work, copy and paste this link in your browser:<br/>
                  <a href="${actionLink}" class="fallback-link">${actionLink}</a>
                </div>
              </div>
            </body>
          </html>
        `
      })
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      throw new Error(`Resend API dispatch failed: ${resendError}`);
    }

    const resendData = await resendResponse.json();

    return new Response(JSON.stringify({
      message: 'Invitation generated and sent via Resend successfully',
      link: actionLink,
      resend: resendData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});
