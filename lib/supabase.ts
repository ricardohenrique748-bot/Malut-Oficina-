import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xhfukexobxdgwknrlbzt.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZnVrZXhvYnhkZ3drbnJsYnp0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxOTgxNDAsImV4cCI6MjA4NDc3NDE0MH0.Pi18-NK-Gg7waUhdRMMxINC8gDEJylIKeImQEndqRzM'

)
