const { createClient } = require('@supabase/supabase-js');

const URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(URL, SERVICE_KEY);

async function run() {
    console.log('Checking plans table...');

    // Check if free plan exists
    const { data: plans, error } = await supabase.from('plans').select('*').eq('slug', 'free');

    if (error) {
        console.error('Error fetching plans:', error);
        return;
    }

    if (plans && plans.length > 0) {
        console.log('✅ Free plan exists:', plans[0].id);
        if (!plans[0].is_active) {
            console.log('⚠️ Free plan is inactive. Activating...');
            const { error: activeError } = await supabase.from('plans').update({ is_active: true }).eq('id', plans[0].id);
            if (activeError) console.error('Error activating:', activeError);
            else console.log('✅ Activated.');
        }
    } else {
        console.log('❌ Free plan missing. Inserting...');
        const { data: newPlan, error: insertError } = await supabase.from('plans').insert({
            slug: 'free',
            name: 'FREE',
            monthly_price_cents: 0,
            yearly_price_cents: 0,
            description: 'Teste gratuito de 14 dias',
            features: JSON.parse('["Teste gratuito de 14 dias", "1 usuário", "1 obra", "RDO básico", "Suporte por email", "Sem cartão de crédito"]'),
            is_active: true,
            is_popular: false,
            display_order: 1,
            max_users: 1,
            max_obras: 1,
            trial_days: 14
        }).select();

        if (insertError) {
            console.error('Error inserting free plan:', insertError);
        } else {
            console.log('✅ Free plan created:', newPlan);
        }
    }

    // Check MASTER plan
    const { data: masterPlans } = await supabase.from('plans').select('*').eq('slug', 'master');
    if (!masterPlans || masterPlans.length === 0) {
        console.log('❌ Master plan missing. Inserting...');
        const { error: masterErr } = await supabase.from('plans').insert({
            slug: 'master',
            name: 'MASTER',
            monthly_price_cents: 49990,
            yearly_price_cents: 39992,
            description: 'Para construtoras que precisam de mais',
            features: JSON.parse('["Até 10 usuários", "Obras ilimitadas", "Todos recursos PRO", "Gestão de equipes", "Integração com Gmail", "Dashboard executivo", "API de integração", "Gestor de obras dedicado"]'),
            is_active: true,
            is_popular: false,
            display_order: 4,
            max_users: 10,
            max_obras: 9999,
            trial_days: 0
        });
        if (masterErr) console.error('Error inserting master plan:', masterErr);
        else console.log('✅ Master plan created');
    } else {
        console.log('✅ Master plan exists');
    }
}

run();
