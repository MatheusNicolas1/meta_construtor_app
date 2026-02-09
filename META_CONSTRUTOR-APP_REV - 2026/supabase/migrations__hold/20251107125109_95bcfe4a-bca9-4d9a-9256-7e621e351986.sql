-- Corrigir trigger de consumo de crédito para usar campo correto
-- A tabela rdos usa 'criado_por_id' não 'user_id'

DROP TRIGGER IF EXISTS consume_credit_on_rdo_creation ON public.rdos;

CREATE OR REPLACE FUNCTION public.consume_credit_for_rdo()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se usuário tem créditos suficientes (apenas para plano free)
  IF EXISTS (
    SELECT 1 FROM public.user_credits 
    WHERE user_id = NEW.criado_por_id 
    AND plan_type = 'free' 
    AND credits_balance <= 0
  ) THEN
    RAISE EXCEPTION 'Créditos insuficientes. Compartilhe nas redes sociais para ganhar mais créditos!';
  END IF;
  
  -- Consumir 1 crédito se for plano free
  UPDATE public.user_credits
  SET credits_balance = GREATEST(credits_balance - 1, 0),
      updated_at = now()
  WHERE user_id = NEW.criado_por_id AND plan_type = 'free';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recriar trigger
CREATE TRIGGER consume_credit_on_rdo_creation
  BEFORE INSERT ON public.rdos
  FOR EACH ROW
  EXECUTE FUNCTION public.consume_credit_for_rdo();