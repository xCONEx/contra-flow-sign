import express from 'express';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(express.json());

const SUPABASE_URL = 'https://tmxbgvlijandyvjwstsx.supabase.co'; // substitua
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRteGJndmxpamFuZHl2andzdHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2NDM0MTQsImV4cCI6MjA2NjIxOTQxNH0.z5lvkJC_dG-TCE5D26ae-7_wImq5BnGNRctYIWgtyiQ'; // substitua

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const WEBHOOK_KEY = '27a5317b-248f-47e8-9c4b-70aff176e556';
const ENTERPRISE_PRODUCT_ID = 'aa70149b-d1e8-465b-b62e-d651afe9204f';

app.post('/webhook/cakto', async (req, res) => {
  try {
    const webhookKey = req.headers['x-webhook-key'] || req.body.key;
    if (webhookKey !== WEBHOOK_KEY) {
      return res.status(401).json({ error: 'Invalid webhook key' });
    }

    const event = req.body;

    // Exemplo básico: evento de assinatura ativa e cancelada
    const email = event.customer_email;
    const productId = event.product_id;
    const subscriptionStatus = event.subscription_status; // ex: 'active', 'cancelled'

    if (!email || productId !== ENTERPRISE_PRODUCT_ID) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    let hasAccess = false;
    if (subscriptionStatus === 'active') {
      hasAccess = true;
    } else if (subscriptionStatus === 'cancelled') {
      hasAccess = false;
    } else {
      // outros status podem ser tratados aqui, se quiser
      return res.status(200).json({ message: 'Status não altera acesso' });
    }

    // Atualiza no Supabase
    const { error } = await supabase
      .from('user_profiles')
      .update({ has_contratpro: hasAccess })
      .eq('email', email);

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }

    return res.status(200).json({ message: `Acesso atualizado para ${email}: ${hasAccess}` });
  } catch (err) {
    console.error('Erro no webhook:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook rodando na porta ${PORT}`);
});
