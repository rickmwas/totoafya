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
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables are missing on the function container.');
    }

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY environment variable is not configured.');
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Parse invitation body
    const { email, redirectTo, full_name, role } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Generate a secure random temporary password (e.g. Toto@ followed by 6 random chars)
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    const tempPassword = `Toto@${randomChars}`;

    // Check if the nurse profile exists and already has a user_id
    const { data: nurseRecord, error: nurseFetchError } = await supabaseClient
      .from('nurses')
      .select('user_id, id')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (nurseFetchError) throw nurseFetchError;

    let authUser = null;

    if (nurseRecord && nurseRecord.user_id) {
      // If a user_id is already linked, update the password for the existing auth user
      const { data: updateData, error: updateError } = await supabaseClient.auth.admin.updateUserById(
        nurseRecord.user_id,
        { password: tempPassword }
      );
      if (updateError) throw updateError;
      authUser = updateData?.user;
    } else {
      // Create a new auth user
      const { data: createData, error: createError } = await supabaseClient.auth.admin.createUser({
        email: cleanEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          role: role || 'nurse',
          full_name: full_name || 'Staff Member'
        }
      });

      if (createError) {
        // Handle user already exists in auth.users but not linked to public.nurses
        if (createError.message?.includes('already exists') || createError.status === 422) {
          const { data: { users }, error: listError } = await supabaseClient.auth.admin.listUsers();
          if (listError) throw listError;
          const existingUser = users.find(u => u.email?.toLowerCase() === cleanEmail);
          if (existingUser) {
            const { data: updateData, error: updateError } = await supabaseClient.auth.admin.updateUserById(
              existingUser.id,
              { password: tempPassword }
            );
            if (updateError) throw updateError;
            authUser = updateData?.user;

            // Link the auth user ID to the nurse record explicitly
            const { error: linkError } = await supabaseClient
              .from('nurses')
              .update({ user_id: existingUser.id })
              .ilike('email', cleanEmail);
            if (linkError) throw linkError;
          } else {
            throw createError;
          }
        } else {
          throw createError;
        }
      } else {
        authUser = createData?.user;
      }
    }

    if (!authUser) {
      throw new Error('Failed to resolve or create auth user.');
    }

    const activationLink = `${redirectTo || 'https://nursetotoafya.vercel.app/login'}?email=${encodeURIComponent(cleanEmail)}&code=${encodeURIComponent(tempPassword)}`;

    // 2. Dispatch a beautiful, premium, customized HTML email using Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "TotoAfya Onboarding <totoafya@terraseptsolutions.com>",
        to: [cleanEmail],
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
                .credentials-box {
                  background-color: #F7F5F0;
                  border-radius: 16px;
                  padding: 24px;
                  margin-bottom: 32px;
                  border: 1px solid #E5E5E5;
                  text-align: left;
                }
                .credential-row {
                  margin-bottom: 12px;
                  font-size: 14px;
                  color: #555555;
                }
                .credential-row:last-child {
                  margin-bottom: 0;
                }
                .credential-value {
                  font-family: monospace;
                  font-weight: bold;
                  color: #006B5F;
                  font-size: 15px;
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
                <h2 class="welcome-title">Welcome to TotoAfya, ${full_name || 'Staff Member'}!</h2>
                <p class="description">
                  You have been pre-registered as a staff member on the TotoAfya Digital platform. 
                  Please log in with the temporary credentials below to activate your account.
                </p>
                <div class="credentials-box">
                  <div class="credential-row">
                    <strong>Email:</strong> <span class="credential-value" style="color: #0A0A0A;">${cleanEmail}</span>
                  </div>
                  <div class="credential-row">
                    <strong>Temporary Password:</strong> <span class="credential-value" style="font-size: 16px;">${tempPassword}</span>
                  </div>
                </div>
                <div class="button-container">
                  <a href="${activationLink}" class="btn" target="_blank">Activate Account</a>
                </div>
                <p style="font-size: 12px; color: #555555; text-align: center; margin-top: -16px; margin-bottom: 32px;">
                  <em>Note: You will be prompted to choose a new secure password and complete your profile immediately after logging in.</em>
                </p>
                <div class="footer">
                  This invitation is sent automatically. If you did not request this, please ignore this email.<br/><br/>
                  If the button does not work, copy and paste this link in your browser:<br/>
                  <a href="${activationLink}" class="fallback-link">${activationLink}</a>
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
