-- Temporary diagnostic version of handle_new_user with detailed error logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id uuid;
  v_referral_code text;
BEGIN
  RAISE LOG 'handle_new_user START for user: %', NEW.id;
  
  BEGIN
    -- 1. Create Profile
    v_referral_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NEW.id::TEXT) FROM 1 FOR 8));
    RAISE LOG 'Generated referral_code: %', v_referral_code;
    
    INSERT INTO public.profiles (
      id, name, email, phone, cpf_cnpj, plan_type, referral_code, created_at, updated_at
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', ''),
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'cpf_cnpj',
      COALESCE(NEW.raw_user_meta_data->>'plan_type', 'free'),
      v_referral_code,
      NOW(),
      NOW()
    ) ON CONFLICT (id) DO NOTHING;
    RAISE LOG 'Profile created successfully';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'ERROR creating profile: % %', SQLERRM, SQLSTATE;
      RAISE;
  END;
  
  BEGIN
    --2. Create Org
    INSERT INTO public.orgs (
      name, slug, owner_user_id, created_at, updated_at
    ) VALUES (
      COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), 'My Organization'),
      public.generate_org_slug(COALESCE(NULLIF(NEW.raw_user_meta_data->>'name', ''), 'My-Org'), NEW.id),
      NEW.id,
      NOW(),
      NOW()
    ) RETURNING id INTO v_org_id;
    RAISE LOG 'Org created: %', v_org_id;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'ERROR creating org: % %', SQLERRM, SQLSTATE;
      RAISE;
  END;
  
  IF v_org_id IS NOT NULL THEN
    BEGIN
      -- 3. Create Org Member
      INSERT INTO public.org_members (
        org_id, user_id, role, status, joined_at, created_at, updated_at
      ) VALUES (
        v_org_id, NEW.id, 'Administrador'::app_role, 'active', NOW(), NOW(), NOW()
      ) ON CONFLICT (org_id, user_id) DO NOTHING;
      RAISE LOG 'Org member created';
    EXCEPTION
      WHEN OTHERS THEN
        RAISE LOG 'ERROR creating org_member: % %', SQLERRM, SQLSTATE;
        RAISE;
    END;
  END IF;
  
  BEGIN
    -- 4. user_roles
    INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
    VALUES (NEW.id, 'Administrador'::app_role, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
    RAISE LOG 'user_roles created';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'ERROR creating user_roles: % %', SQLERRM, SQLSTATE;
      RAISE;
  END;
  
  BEGIN
    -- 5. user_settings
    INSERT INTO public.user_settings (user_id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
    RAISE LOG 'user_settings created';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'ERROR creating user_settings: % %', SQLERRM, SQLSTATE;
      RAISE;
  END;
  
  BEGIN
    -- 6. user_credits
    INSERT INTO public.user_credits (user_id, credits_balance, plan_type, created_at, updated_at)
    VALUES (NEW.id, 7, COALESCE(NEW.raw_user_meta_data->>'plan_type', 'free'), NOW(), NOW())
    ON CONFLICT (user_id) DO NOTHING;
    RAISE LOG 'user_credits created';
  EXCEPTION
    WHEN OTHERS THEN
      RAISE LOG 'ERROR creating user_credits: % %', SQLERRM, SQLSTATE;
      RAISE;
  END;
  
  RAISE LOG 'handle_new_user COMPLETE for user: %', NEW.id;
  RETURN NEW;
END;
$$;
