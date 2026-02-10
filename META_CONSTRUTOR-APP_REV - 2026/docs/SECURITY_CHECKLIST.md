# Checklist de Segurança e Produção (M8.4)

## 1. Environment Variables & Secrets
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is ONLY used in Edge Functions/Backend. NEVER in Frontend.
- [ ] `STRIPE_SECRET_KEY` is secure in Edge Functions.
- [ ] `.env` is gitignored.

## 2. Row Level Security (RLS)
- [x] All tables have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- [x] "Enable All" policies replaced by strict `org_id` / `user_id` checks.
- [x] `audit_logs` is INSERT-only (no update/delete for users).
- [x] Validated via `scripts/test-rls-regression.cjs`.

## 3. Rate Limiting (M8.1)
- [x] Edge Functions (`create-checkout-session`, `stripe-webhook`, `health-check`) protected by `rate_limits`.
- [x] DB Function `check_rate_limit` is `SECURITY DEFINER`.
- [x] Validated via `scripts/test-rate-limit-rpc.cjs`.

## 4. Input Validation
- [x] Triggers enforce valid enums/states (`obras`, `rdos`).
- [x] Plan limits (`max_users`, `max_obras`) enforced by triggered.

## 5. Maintenance
- [x] `scripts/maintenance-prune.sql` created for weekly cleanup.
- [x] `health-check` endpoint available for monitoring.

## 6. Access Control
- [x] `org_members` roles ('Administrador', 'Colaborador') enforced in policies.
- [x] Cross-org access blocked (Verified by `scripts/attack-rls.js`).
- [x] Soft Delete implemented for Obras/Expenses (Verified by `scripts/test-soft-delete.cjs`).
