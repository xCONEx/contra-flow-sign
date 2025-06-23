
import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase
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
    flowType: 'pkce',
    debug: false
  },
  global: {
    headers: {
      'X-Client-Info': 'contratpro-web@1.0.7'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Verificar conexão com Supabase de forma mais robusta
let connectionChecked = false;

const checkConnection = async () => {
  if (connectionChecked) return;
  
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error && error.message !== 'Invalid Refresh Token: Refresh Token Not Found') {
      console.error('Erro na conexão com Supabase:', error);
    } else {
      console.log('✅ Conexão com Supabase estabelecida');
      connectionChecked = true;
    }
  } catch (err) {
    console.error('❌ Erro ao verificar conexão com Supabase:', err);
  }
};

// Verificar conexão apenas uma vez
checkConnection();
