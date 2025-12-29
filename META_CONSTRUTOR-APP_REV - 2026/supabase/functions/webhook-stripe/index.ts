import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();
    console.log('Received webhook event');

    // Aqui será integrado com Stripe para verificar a assinatura do webhook
    // Por enquanto, processa como exemplo
    const event = JSON.parse(body);
    
    console.log('Event type:', event.type);

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Processar eventos do Stripe
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const planType = session.metadata?.plan_type;

        console.log('Checkout completed for user:', userId, 'plan:', planType);

        if (userId) {
          // Atualizar plano do usuário
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ plan_type: planType })
            .eq('id', userId);

          if (profileError) {
            console.error('Error updating profile:', profileError);
          }

          // Atualizar créditos para ilimitado (ou valor alto)
          const { error: creditsError } = await supabase
            .from('user_credits')
            .update({ 
              credits_balance: 999999,
              plan_type: planType,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

          if (creditsError) {
            console.error('Error updating credits:', creditsError);
          } else {
            console.log('User upgraded successfully');
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const userId = invoice.metadata?.user_id;
        
        console.log('Payment succeeded for user:', userId);
        
        // Renovar assinatura se necessário
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const userId = subscription.metadata?.user_id;
        
        console.log('Subscription cancelled for user:', userId);
        
        if (userId) {
          // Reverter para plano free
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ plan_type: 'free' })
            .eq('id', userId);

          if (profileError) {
            console.error('Error downgrading profile:', profileError);
          }

          // Resetar créditos para plano free
          const { error: creditsError } = await supabase
            .from('user_credits')
            .update({ 
              credits_balance: 7,
              plan_type: 'free',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

          if (creditsError) {
            console.error('Error resetting credits:', creditsError);
          }
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
