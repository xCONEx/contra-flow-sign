
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tmxbgvlijandyvjwstsx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRteGJndmxpamFuZHl2andzdHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NDM0MTQsImV4cCI6MjA2NjIxOTQxNH0.z5lvkJC_dG-TCE5D26ae-7_wImq5BnGNRctYIWgtyiQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})
