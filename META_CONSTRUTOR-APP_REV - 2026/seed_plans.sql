-- Seed plans com bypass de RLS
SET role TO postgres;

INSERT INTO public.plans (slug, name, monthly_price_cents, yearly_price_cents, description, features, is_active, is_popular, display_order, max_users, max_obras, trial_days) VALUES
('free', 'FREE', 0, 0, 'Teste gratuito de 14 dias', '["Teste gratuito de 14 dias", "1 usuário", "1 obra", "RDO básico", "Suporte por email", "Sem cartão de crédito"]'::jsonb, true, false, 1, 1, 1, 14),
('basic', 'BÁSICO', 12990, 10392, 'Perfeito para pequenas construtoras', '["Até 3 usuários", "Armazenamento ilimitado", "RDO digital completo", "Relatórios básicos", "Suporte por email", "Backup automático"]'::jsonb, true, false, 2, 3, NULL, 0),
('professional', 'PROFISSIONAL', 19990, 15992, 'Ideal para construtoras em crescimento', '["Até 5 usuários", "Obras ilimitadas", "Relatórios avançados", "Integrações WhatsApp", "Suporte via chat 24h", "Dashboard avançado", "Controle de estoque"]'::jsonb, true, true, 3, 5, NULL, 0),
('master', 'MASTER', 49990, 39992, 'Para construtoras que precisam de mais', '["Até 10 usuários", "Obras ilimitadas", "Todos recursos PRO", "Gestão de equipes", "Integração com Gmail", "Dashboard executivo", "API de integração", "Gestor de obras dedicado"]'::jsonb, true, false, 4, 10, NULL, 0),
('premium', 'PREMIUM', 74990, 59992, 'Solução completa empresarial', '["Até 20 usuários", "Todas funcionalidades", "Suporte prioritário 24/7", "Treinamento dedicado", "SLA garantido", "Customizações incluídas", "Migração assistida"]'::jsonb, true, false, 5, 20, NULL, 0),
('business', 'BUSINESS', NULL, NULL, 'Para o plano Business, entre em contato conosco para uma proposta personalizada.', '["Usuários ilimitados", "Infraestrutura dedicada", "Customização completa", "Integrações sob medida", "Suporte VIP", "Consultoria estratégica"]'::jsonb, true, false, 6, NULL, NULL, 0)
ON CONFLICT (slug) DO NOTHING;

RESET role;
