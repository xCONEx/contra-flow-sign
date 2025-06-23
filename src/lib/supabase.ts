
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tmxbgvlijandyvjwstsx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRteGJndmxpamFuZHl2andzdHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NDM0MTQsImV4cCI6MjA2NjIxOTQxNH0.z5lvkJC_dG-TCE5D26ae-7_wImq5BnGNRctYIWgtyiQ';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Credenciais do Supabase não configuradas');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Verificar conexão simples
supabase.auth.getSession().then(({ error }) => {
  if (error && !error.message.includes('Invalid Refresh Token')) {
    console.error('Erro na conexão com Supabase:', error);
  } else {
    console.log('✅ Supabase conectado');
  }
}).catch(err => {
  console.error('❌ Erro ao conectar Supabase:', err);
});
