import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') || '*';

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
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
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are missing on the function container.');
    }

    // 1. Authenticate caller via JWT Token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user: callerUser }, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !callerUser) {
      return new Response(JSON.stringify({ error: `Unauthorized: ${callerError?.message || 'Invalid or expired caller session token'}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // 2. Authorize caller role from verified database record or app_metadata
    const { data: callerNurse } = await supabaseAdmin
      .from('nurses')
      .select('role, facility_id, status')
      .eq('user_id', callerUser.id)
      .maybeSingle();

    const verifiedRole = callerNurse?.role || callerUser.app_metadata?.role;
    const isAuthorized = ['facility_admin', 'admin', 'super_admin', 'county_admin'].includes(verifiedRole);

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: 'Forbidden: Insufficient privileges to invite clinical staff' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    // Parse invitation body
    const { email, redirectTo, full_name, role, facility_id, employee_id, phone, designation } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Staff email address is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 3. Multi-Tenant Facility Isolation Enforcement
    // If caller is facility_admin, force assigned facility_id to match caller's facility
    let targetFacilityId = facility_id;
    if (verifiedRole === 'facility_admin' || verifiedRole === 'admin') {
      if (!callerNurse?.facility_id) {
        return new Response(JSON.stringify({ error: 'Forbidden: Caller is not assigned to an active healthcare facility' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        });
      }
      targetFacilityId = callerNurse.facility_id;
    }

    const targetPortalUrl = redirectTo || (role === 'admin' ? 'https://facility.totoafya.co.ke/login' : 'https://nurse.totoafya.co.ke/login');

    // 4. Secure GoTrue Invitation: Generate cryptographic action link (No plaintext passwords)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: cleanEmail,
      options: {
        redirectTo: targetPortalUrl,
        data: {
          role: role || 'nurse',
          full_name: full_name || 'Staff Member',
          facility_id: targetFacilityId || null,
        },
      },
    });

    if (linkError) {
      throw linkError;
    }

    const secureActivationLink = linkData?.properties?.action_link;
    const newUserId = linkData?.user?.id;

    // 5. Upsert public.nurses record
    const { data: nurseRecord, error: nurseError } = await supabaseAdmin
      .from('nurses')
      .upsert({
        user_id: newUserId || null,
        facility_id: targetFacilityId || null,
        full_name: full_name || 'Staff Member',
        email: cleanEmail,
        role: role || 'nurse',
        employee_id: employee_id || null,
        phone: phone || null,
        designation: designation || null,
        status: 'pending_activation',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' })
      .select()
      .single();

    if (nurseError) {
      console.warn('Failed to upsert nurses table record:', nurseError.message);
    }

    // 6. Dispatch transactional email via Resend if API key is configured
    let emailSent = false;
    let emailError = null;

    if (resendApiKey && secureActivationLink) {
      try {
        const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'TotoAfya Onboarding <onboarding@resend.dev>';
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [cleanEmail],
            subject: 'Activate Your TotoAfya Clinical Account 🌿',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Activate Your TotoAfya Account</title>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #F7F5F0; margin: 0; padding: 40px 20px; }
                    .card { max-width: 500px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E5E5; border-radius: 24px; padding: 40px; box-shadow: 0 8px 30px rgba(0, 107, 95, 0.04); }
                    .welcome-title { font-size: 22px; font-weight: 800; color: #0A0A0A; text-align: center; margin-top: 10px; margin-bottom: 12px; }
                    .description { font-size: 14px; color: #555555; line-height: 1.6; text-align: center; margin-bottom: 28px; }
                    .btn-box { text-align: center; margin-bottom: 28px; }
                    .btn { display: inline-block; background-color: #006B5F; color: #FFFFFF !important; padding: 14px 32px; font-size: 14px; font-weight: 700; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(0, 107, 95, 0.2); }
                    .notice { font-size: 12px; color: #777777; text-align: center; line-height: 1.5; }
                    .footer { border-top: 1px solid #EEEEEE; padding-top: 20px; margin-top: 28px; font-size: 11px; color: #999999; text-align: center; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <h2 class="welcome-title">Welcome to TotoAfya Digital, ${full_name || 'Staff Member'}!</h2>
                    <p class="description">
                      You have been registered as an authorized healthcare provider. Click the secure button below to set your confidential password and activate your account.
                    </p>
                    <div class="btn-box">
                      <a href="${secureActivationLink}" class="btn" target="_blank">Set Password & Activate</a>
                    </div>
                    <p class="notice">
                      This one-time activation link is cryptographically protected and expires in 24 hours. For security reasons, do not share this link with anyone.
                    </p>
                    <div class="footer">
                      TotoAfya Digital Health Platform • Protecting Mothers & Children Across Kenya
                    </div>
                  </div>
                </body>
              </html>
            `,
          }),
        });

        if (resendRes.ok) {
          emailSent = true;
        } else {
          emailError = await resendRes.text();
          console.warn('Resend email error:', emailError);
        }
      } catch (mailErr: any) {
        emailError = mailErr.message;
        console.warn('Failed to send email via Resend:', mailErr);
      }
    }

    // 7. Secure response: NO plaintext passwords, NO secret query params
    return new Response(
      JSON.stringify({
        success: true,
        message: emailSent
          ? 'Staff invitation dispatched securely via email'
          : 'Staff user provisioned. Email delivery queued or manual activation link available.',
        email: cleanEmail,
        staff_id: nurseRecord?.id || null,
        facility_id: targetFacilityId,
        emailSent,
        emailError,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
