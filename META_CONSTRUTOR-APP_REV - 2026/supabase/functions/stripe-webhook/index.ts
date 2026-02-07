import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

// Credit mapping based on plan
const PLAN_CREDITS: Record<string, number> = {
    basic: 100,
    professional: 500,
    master: -1, // -1 means unlimited
}

serve(async (req) => {
    const signature = req.headers.get('Stripe-Signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!signature || !webhookSecret) {
        return new Response('Webhook signature or secret missing', { status: 400 })
    }

    try {
        const body = await req.text()
        const event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            webhookSecret,
            undefined,
            cryptoProvider
        )

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const userId = session.client_reference_id || session.metadata?.user_id

                if (!userId) {
                    console.error('No user ID found in session')
                    break
                }

                const subscription = await stripe.subscriptions.retrieve(
                    session.subscription as string
                )

                const plan = session.metadata?.plan || 'basic'

                // Update profile with subscription info
                const { error: profileError } = await supabaseAdmin
                    .from('profiles')
                    .update({
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: subscription.id,
                        subscription_status: subscription.status,
                        plan_type: plan,
                    })
                    .eq('id', userId)

                if (profileError) {
                    console.error('Error updating profile:', profileError)
                    throw profileError
                }

                // Add credits based on plan
                const credits = PLAN_CREDITS[plan] || 0
                if (credits > 0) {
                    const { error: creditsError } = await supabaseAdmin
                        .from('user_credits')
                        .upsert(
                            {
                                user_id: userId,
                                credits_balance: credits,
                                updated_at: new Date().toISOString(),
                            },
                            { onConflict: 'user_id' }
                        )

                    if (creditsError) {
                        console.error('Error adding credits:', creditsError)
                    }
                }

                console.log(`✅ Subscription activated for user ${userId}`)
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                // Find user by stripe_customer_id
                const { data: profile, error: findError } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('stripe_customer_id', customerId)
                    .single()

                if (findError || !profile) {
                    console.error('User not found for customer:', customerId)
                    break
                }

                // Update subscription status
                await supabaseAdmin
                    .from('profiles')
                    .update({
                        subscription_status: subscription.status,
                    })
                    .eq('id', profile.id)

                console.log(`✅ Subscription updated for customer ${customerId}`)
                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                // Find user by stripe_customer_id
                const { data: profile, error: findError } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('stripe_customer_id', customerId)
                    .single()

                if (findError || !profile) {
                    console.error('User not found for customer:', customerId)
                    break
                }

                // Update subscription status to canceled, downgrade to free
                await supabaseAdmin
                    .from('profiles')
                    .update({
                        subscription_status: 'canceled',
                        plan_type: 'free',
                        stripe_subscription_id: null,
                    })
                    .eq('id', profile.id)

                console.log(`✅ Subscription canceled for customer ${customerId}`)
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        console.error('Webhook error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
