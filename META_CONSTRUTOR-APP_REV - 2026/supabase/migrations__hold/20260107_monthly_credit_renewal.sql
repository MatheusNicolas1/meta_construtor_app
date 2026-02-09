-- Function to reset credits to 7 for all free plan users
-- This should be run on the 1st of every month
CREATE OR REPLACE FUNCTION public.renew_free_plan_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log the start of renewal
  RAISE LOG 'Starting monthly credit renewal for free plan users at %', NOW();

  -- Update user_credits balance for all 'free' plan users
  UPDATE public.user_credits
  SET 
    credits_balance = 7,
    updated_at = NOW()
  WHERE 
    plan_type = 'free';

  -- Log the completion
  RAISE LOG 'Completed monthly credit renewal for free plan users at %', NOW();
END;
$$;

-- Comment for documentation
COMMENT ON FUNCTION public.renew_free_plan_credits() IS 
'Resets credits_balance to 7 for all users with plan_type = ''free''. 
Intended to be scheduled as a cron job on the 1st of every month.';
