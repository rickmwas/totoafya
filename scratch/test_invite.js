const SUPABASE_URL = 'https://mhzlvjosaazheyowmdom.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oemx2am9zYWF6aGV5b3dtZG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNTg2MDksImV4cCI6MjEwMzkzNDYwOX0.HqkLil2eBIidn7kZVDhSRLnoG1i6dzhED8avWvlgZHk';

async function run() {
  console.log('1. Attempting login as Super Admin via REST API...');
  const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'rickmwasswiz@gmail.com',
      password: '2024Rickmwas'
    })
  });

  const authData = await authRes.json();
  if (!authRes.ok) {
    console.error('Login failed:', authData);
    return;
  }

  const token = authData.access_token;
  console.log('Login successful! User ID:', authData.user.id);
  console.log('User metadata:', authData.user.user_metadata);

  console.log('\n2. Fetching facilities...');
  const facRes = await fetch(`${SUPABASE_URL}/rest/v1/facilities?select=*&limit=1`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`
    }
  });
  const facilities = await facRes.json();
  console.log('Facility found:', facilities[0]?.id, facilities[0]?.name);
  const facilityId = facilities[0]?.id;

  console.log('\n3. Testing insert into public.nurses table with Super Admin token...');
  const testEmail = `testnurse_${Date.now()}@totoafya.org`;
  const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/nurses`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      facility_id: facilityId,
      full_name: 'Test Diagnosis Nurse',
      email: testEmail,
      role: 'nurse',
      status: 'pending_activation'
    })
  });

  const nurseData = await insertRes.json();
  if (!insertRes.ok) {
    console.error('Insert nurse FAILED:', insertRes.status, nurseData);
  } else {
    console.log('Insert nurse SUCCESS:', nurseData);
  }

  console.log('\n4. Testing invite-staff Edge Function with Super Admin token...');
  const fnRes = await fetch(`${SUPABASE_URL}/functions/v1/invite-staff`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: testEmail,
      redirectTo: 'https://nurse.totoafya.co.ke/login',
      full_name: 'Test Diagnosis Nurse',
      role: 'nurse'
    })
  });

  const fnData = await fnRes.text();
  console.log('Edge Function Status:', fnRes.status);
  console.log('Edge Function Response Body:', fnData);
}

run();
