-- Fix function search_path for security best practices
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, name, email, phone, cpf_cnpj, plan_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'cpf_cnpj',
    COALESCE(NEW.raw_user_meta_data->>'plan_type', 'free')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'Colaborador');
  
  IF COALESCE(NEW.raw_user_meta_data->>'plan_type', 'free') = 'free' THEN
    INSERT INTO public.user_credits (user_id, credits_balance, plan_type)
    VALUES (NEW.id, 5, 'free')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$function$;