const { createClient } = require('@supabase/supabase-js');
>> 
>> // Replace with your project details from Settings -> API
>> const SUPABASE_URL = 'https://icobvzpesnfrudjvtzyl.supabase.co';     
>> const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljb2J2enBlc25mcnVkanZ0enlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzMwNTAwNywiZXhwIjoyMDk4ODgxMDA3fQ.B8sHQQEZYlaGODxoutWzYqSQfLRkaPcdL-zBK-nmNZg'; // MUST be the service_role key, NOT the anon key
>> const USER_UID = '14e7a265-2aea-4806-a755-ef3b72e2eed0'; // From your screenshot
>>
>> const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
>> auth: { autoRefreshToken: false, persistSession: false }
>> });
>>
>> async function run() {
>>   const { data, error } = await supabase.auth.admin.updateUserById(USER_UID, {
>> password: '@2024Rickmwas' // Enter your chosen password here
>>   });
>>
>>   if (error) {
>> console.error("Failed to update password:", error.message);
>>   } else {
>> console.log("Password updated successfully for:", data.user.email);
>>   }
>> }
>>       
>> run();