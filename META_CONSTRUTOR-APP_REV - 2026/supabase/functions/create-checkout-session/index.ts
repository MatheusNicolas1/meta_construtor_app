import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { corsHeaders } from '../_shared/cors.ts'
import { createScopedClient } from '../_shared/supabase-client.ts'
import { requireAuth, logRequest } from '../_shared/guards.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

// M4.3: Price IDs now come from database (plans table)

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

    const { plan, billing = 'monthly', org_id } = await req.json()

    // M4.3: Get price ID from plans table
    const priceField = billing === 'monthly' ? 'stripe_price_id_monthly' : 'stripe_price_id_yearly'
    const { data: planData, error: planError } = await supabaseClient
      .from('plans')
      .select(`id, ${priceField}`)
      .eq('slug', plan)
      .eq('is_active', true)
      .single()

    if (planError || !planData) {
      throw new Error(`Plan not found or inactive: ${plan}`)
    }

    const priceId = planData[priceField as keyof typeof planData] as string
    if (!priceId) {
      throw new Error(`Stripe price ID not configured for plan ${plan} (${billing})`)
    }

    // M4.3: Get user's org_id (use provided org_id or fallback to personal org)
    let targetOrgId = org_id
    if (!targetOrgId) {
      // Get user's personal org (where they are owner)
      const { data: personalOrg } = await supabaseClient
        .from('orgs')
        .select('id')
        .eq('owner_user_id', user.id)
        .single()

      if (personalOrg) {
        targetOrgId = personalOrg.id
      } else {
        throw new Error('No org found for user')
      }
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
        org_id: targetOrgId,
        plan_id: planData.id,
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
