import { createBrowserClient } from '@supabase/ssr'

// Hardcoded credentials to bypass invalid local environment variables
const supabaseUrl = 'https://kdxwjweqbsgxgtgxtkgi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkeHdqd2VxYnNneGd0Z3h0a2dpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDMxNDYsImV4cCI6MjA4NTI3OTE0Nn0.uJRRFwCb7alTJmmfTF6mKzZdv1aBqQ-3cQVGmvS6zjY';

export const supabase = createBrowserClient(supabaseUrl, supabaseKey);
