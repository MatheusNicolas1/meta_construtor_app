-- ============================================================================
-- MILESTONE 4.2: Subscriptions Table (org-scoped)
-- ============================================================================

CREATE TYPE IF NOT EXISTS subscription_status AS ENUM (
  'active', 'trialing', 'past_due', 'canceled', 
  'unpaid', 'incomplete', 'incomplete_expired', 'paused'
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE RESTRICT,
  
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  
  status subscription_status NOT NULL DEFAULT 'incomplete',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Unique partial index: apenas 1 subscription ativa/trialing por org
CREATE UNIQUE INDEX idx_subscriptions_one_active_per_org 
  ON public.subscriptions(org_id) 
  WHERE status IN ('active', 'trialing');

-- Outros índices
CREATE INDEX idx_subscriptions_org_id ON public.subscriptions(org_id);
CREATE INDEX idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_sub ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_cust ON public.subscriptions(stripe_customer_id);

-- Trigger updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read org subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM public.org_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Org admins can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (
    org_id IN (
      SELECT om.org_id FROM public.org_members om
      WHERE om.user_id = auth.uid() 
        AND om.status = 'active'
        AND om.role = 'Administrador'::app_role
    )
  );

COMMENT ON TABLE public.subscriptions IS 'M4.2: Subscriptions org-scoped (Stripe sync)';
COMMENT ON INDEX idx_subscriptions_one_active_per_org 
  IS 'Garante apenas 1 subscription ativa/trialing por org (UNIQUE partial index)';
