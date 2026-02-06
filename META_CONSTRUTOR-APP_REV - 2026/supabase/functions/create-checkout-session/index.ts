import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { corsHeaders } from '../_shared/cors.ts'
import { createScopedClient } from '../_shared/supabase-client.ts'
import { requireAuth, logRequest } from '../_shared/guards.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

// Price ID mapping
const PRICE_IDS: Record<string, Record<string, string>> = {
  basic: {
    monthly: 'price_1Spd6ICHfNdO9jxNRYj10lkA',
    yearly: 'price_1SpdABCHfNdO9jxNzVu49NDP',
  },
  professional: {
    monthly: 'price_1Spd7HCHfNdO9jxN3PKJJdyv',
    yearly: 'price_1Spd9UCHfNdO9jxNMXy1MQs4',
  },
  master: {
    monthly: 'price_1Spd7xCHfNdO9jxNiUbb0PKG',
    yearly: 'price_1Spd8ZCHfNdO9jxNIcxjZJBm',
  },
}

serve(async (req) => {
  const requestId = crypto.randomUUID();

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  let user_id: string | undefined;

  try {
    const supabaseClient = createScopedClient(req)

    // Guard: Auth
    const user = await requireAuth(supabaseClient)
    user_id = user.id;

    const { plan, billing = 'monthly' } = await req.json()

    // Get or validate price ID
    const priceId = PRICE_IDS[plan]?.[billing]
    if (!priceId) {
      throw new Error(`Invalid plan: ${plan} or billing: ${billing}`)
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    if (profileError) throw profileError

    let customerId = profile.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile.email || user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Update profile with customer ID
      await supabaseClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/checkout/cancel`,
      metadata: {
        request_id: requestId,
        user_id: user.id,
        plan: plan,
        billing: billing,
      },
    })

    logRequest(requestId, user_id, null, 'create-checkout-session', 'success', `Session created: ${session.id}`);

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    logRequest(requestId, user_id, null, 'create-checkout-session', 'error', error.message);

    const status = error.message.includes('Unauthorized') ? 401 :
      error.message.includes('Forbidden') ? 403 : 400;

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status,
      }
    )
  }
})
