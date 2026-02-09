-- M4 STEP 3: DB-level enforcement of plan limits (non-bypassable)
-- Triggers to enforce max_users and max_obras before INSERT

-- Helper function: get current plan for an org
CREATE OR REPLACE FUNCTION get_org_plan_limits(p_org_id UUID)
RETURNS TABLE (
    plan_slug TEXT,
    max_users INTEGER,
    max_obras INTEGER
) AS $$
BEGIN
    -- Try to get active/trialing subscription plan
    RETURN QUERY
    SELECT 
        p.slug,
        p.max_users,
        p.max_obras
    FROM subscriptions s
    INNER JOIN plans p ON s.plan_id = p.id
    WHERE s.org_id = p_org_id
      AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1;
    
    -- If no active subscription, return free plan limits
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT 
            p.slug,
            p.max_users,
            p.max_obras
        FROM plans p
        WHERE p.slug = 'free'
          AND p.is_active = true
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function: enforce max_users limit on org_members INSERT
CREATE OR REPLACE FUNCTION enforce_max_users_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_plan_slug TEXT;
    v_max_users INTEGER;
    v_current_count INTEGER;
BEGIN
    -- Get plan limits for this org
    SELECT plan_slug, max_users 
    INTO v_plan_slug, v_max_users
    FROM get_org_plan_limits(NEW.org_id);
    
    IF v_max_users IS NULL THEN
        RAISE EXCEPTION 'Cannot determine plan limits for org %', NEW.org_id;
    END IF;
    
    -- NULL means unlimited
    IF v_max_users IS NOT NULL THEN
        -- Count current active members
        SELECT COUNT(*)
        INTO v_current_count
        FROM org_members
        WHERE org_id = NEW.org_id
          AND status = 'active'
          AND id != NEW.id; -- exclude current insert if updating
        
        IF v_current_count >= v_max_users THEN
            RAISE EXCEPTION 'Plan limit reached: maximum % active users allowed (plan: %)', 
                v_max_users, v_plan_slug;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function: enforce max_obras limit on obras INSERT
CREATE OR REPLACE FUNCTION enforce_max_obras_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_plan_slug TEXT;
    v_max_obras INTEGER;
    v_current_count INTEGER;
BEGIN
    -- Get plan limits for this org
    SELECT plan_slug, max_obras 
    INTO v_plan_slug, v_max_obras
    FROM get_org_plan_limits(NEW.org_id);
    
    IF v_max_obras IS NULL THEN
        RAISE EXCEPTION 'Cannot determine plan limits for org %', NEW.org_id;
    END IF;
    
    -- NULL means unlimited
    IF v_max_obras IS NOT NULL THEN
        -- Count current obras
        SELECT COUNT(*)
        INTO v_current_count
        FROM obras
        WHERE org_id = NEW.org_id
          AND id != NEW.id; -- exclude current insert if updating
        
        IF v_current_count >= v_max_obras THEN
            RAISE EXCEPTION 'Plan limit reached: maximum % obras allowed (plan: %)', 
                v_max_obras, v_plan_slug;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_enforce_max_users ON org_members;
CREATE TRIGGER trigger_enforce_max_users
    BEFORE INSERT ON org_members
    FOR EACH ROW
    WHEN (NEW.status = 'active')
    EXECUTE FUNCTION enforce_max_users_limit();

DROP TRIGGER IF EXISTS trigger_enforce_max_obras ON obras;
CREATE TRIGGER trigger_enforce_max_obras
    BEFORE INSERT ON obras
    FOR EACH ROW
    EXECUTE FUNCTION enforce_max_obras_limit();

-- Grant EXECUTE on helper function to authenticated users
GRANT EXECUTE ON FUNCTION get_org_plan_limits(UUID) TO authenticated;
