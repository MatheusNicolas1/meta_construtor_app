import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { writeAuditLog } from '../_shared/audit.ts'

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

        // M4.4: Check idempotency via stripe_events table
        const { data: existingEvent } = await supabaseAdmin
            .from('stripe_events')
            .select('id, processed')
            .eq('stripe_event_id', event.id)
            .single()

        if (existingEvent?.processed) {
            console.log(`Event ${event.id} already processed, skipping`)
            return new Response(JSON.stringify({ received: true, skipped: true }), {
                headers: { 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        // M4.4: Record event for idempotency
        const { error: insertError } = await supabaseAdmin
            .from('stripe_events')
            .insert({
                stripe_event_id: event.id,
                event_type: event.type,
                payload: event as any,
                api_version: event.api_version,
                processed: false,
            })

        if (insertError && !insertError.message.includes('duplicate')) {
            console.error('Error recording event:', insertError)
        }

        // M5.3: Audit log webhook received
        // Note: org_id from event metadata where available

        let processError: string | null = null
        try {
            switch (event.type) {
                case 'checkout.session.completed': {
                    const session = event.data.object as Stripe.Checkout.Session
                    const userId = session.client_reference_id || session.metadata?.user_id
                    const orgId = session.metadata?.org_id

                    if (!userId || !orgId) {
                        console.error('Missing user_id or org_id in checkout session metadata')
                        break
                    }

                    const subscription = await stripe.subscriptions.retrieve(
                        session.subscription as string
                    )

                    // M4 STEP 2: Map Stripe price_id to plan_id (do not trust metadata alone)
                    const priceId = subscription.items.data[0]?.price.id
                    if (!priceId) {
                        console.error('No price_id found in subscription items')
                        break
                    }

                    // Find plan by matching stripe_price_id_monthly or stripe_price_id_yearly
                    const { data: monthlyPlan } = await supabaseAdmin
                        .from('plans')
                        .select('id, slug, stripe_price_id_monthly, stripe_price_id_yearly')
                        .eq('stripe_price_id_monthly', priceId)
                        .eq('is_active', true)
                        .single()

                    const { data: yearlyPlan } = await supabaseAdmin
                        .from('plans')
                        .select('id, slug, stripe_price_id_monthly, stripe_price_id_yearly')
                        .eq('stripe_price_id_yearly', priceId)
                        .eq('is_active', true)
                        .single()

                    const plan = monthlyPlan || yearlyPlan
                    const billingCycle = monthlyPlan ? 'monthly' : 'yearly'

                    if (!plan) {
                        console.error(`Plan not found for price_id: ${priceId}`)
                        break
                    }

                    console.log(`✓ Mapped price_id ${priceId} → plan ${plan.slug} (${plan.id}) [${billingCycle}]`)

                    // M4.5: Write subscription truth to DB
                    const { error: subError } = await supabaseAdmin
                        .from('subscriptions')
                        .upsert({
                            org_id: orgId,
                            plan_id: plan.id, // from price_id mapping, not metadata
                            stripe_subscription_id: subscription.id,
                            stripe_customer_id: session.customer as string,
                            status: subscription.status as any,
                            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
                            billing_cycle: billingCycle,
                        }, { onConflict: 'stripe_subscription_id' })

                    if (subError) {
                        console.error('Error creating subscription:', subError)
                        throw subError
                    }

                    // Legacy: Update profile for compatibility
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            stripe_customer_id: session.customer as string,
                            stripe_subscription_id: subscription.id,
                            subscription_status: subscription.status,
                            plan_type: plan.slug, // from mapping, not metadata
                        })
                        .eq('id', userId)

                    console.log(`✅ Subscription activated for org ${orgId}`)

                    // M5.3: Audit subscription creation
                    await writeAuditLog(supabaseAdmin, {
                        org_id: orgId,
                        actor_user_id: userId,
                        action: 'billing.subscription_created',
                        entity: 'subscription',
                        entity_id: subscription.id,
                        metadata: {
                            plan_slug: plan.slug,
                            billing_cycle: billingCycle,
                            status: subscription.status,
                            stripe_event_id: event.id,
                        },
                    });

                    break
                }

                case 'customer.subscription.updated': {
                    const subscription = event.data.object as Stripe.Subscription

                    // M4.5: Update subscription status in DB
                    const { error: updateError } = await supabaseAdmin
                        .from('subscriptions')
                        .update({
                            status: subscription.status as any,
                            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
                            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
                        })
                        .eq('stripe_subscription_id', subscription.id)

                    if (updateError) {
                        console.error('Error updating subscription:', updateError)
                    }

                    // Legacy: keep profiles in sync
                    const customerId = subscription.customer as string
                    await supabaseAdmin
                        .from('profiles')
                        .update({ subscription_status: subscription.status })
                        .eq('stripe_customer_id', customerId)

                    console.log(`✅ Subscription updated: ${subscription.id}`)
                    break
                }

                case 'customer.subscription.deleted': {
                    const subscription = event.data.object as Stripe.Subscription

                    // M4.5: Mark subscription as canceled in DB
                    const { error: cancelError } = await supabaseAdmin
                        .from('subscriptions')
                        .update({
                            status: 'canceled',
                            canceled_at: new Date().toISOString(),
                        })
                        .eq('stripe_subscription_id', subscription.id)

                    if (cancelError) {
                        console.error('Error canceling subscription:', cancelError)
                    }

                    // Legacy: downgrade profile to free
                    const customerId = subscription.customer as string
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_status: 'canceled',
                            plan_type: 'free',
                            stripe_subscription_id: null,
                        })
                        .eq('stripe_customer_id', customerId)

                    console.log(`✅ Subscription canceled: ${subscription.id}`)
                    break
                }


                case 'invoice.payment_failed': {
                    const invoice = event.data.object as Stripe.Invoice
                    if (invoice.subscription) {
                        await supabaseAdmin
                            .from('subscriptions')
                            .update({ status: 'past_due' })
                            .eq('stripe_subscription_id', invoice.subscription as string)
                    }
                    console.log(`⚠️ Payment failed for invoice: ${invoice.id}`)
                    break
                }

                default:
                    console.log(`Unhandled event type: ${event.type}`)
            }
        } catch (error: any) {
            processError = error.message
            console.error(`Error processing ${event.type}:`, error)
        }

        // M4.4: Mark event as processed
        await supabaseAdmin
            .from('stripe_events')
            .update({
                processed: true,
                processed_at: new Date().toISOString(),
                error: processError,
            })
            .eq('stripe_event_id', event.id)

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error: any) {
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
