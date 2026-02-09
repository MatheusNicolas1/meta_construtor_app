drop extension if exists "pg_net";

drop policy "Usuários podem atualizar suas atividades" on "public"."atividades";

drop policy "Usuários podem criar atividades" on "public"."atividades";

drop policy "Usuários podem deletar suas atividades" on "public"."atividades";

drop policy "Usuários podem ver suas próprias atividades" on "public"."atividades";

drop policy "Gestores podem aprovar primeiro nível" on "public"."expenses";

drop policy "Usuários podem criar despesas" on "public"."expenses";

drop policy "Usuários podem ver despesas de suas obras" on "public"."expenses";

drop policy "Apenas administradores podem deletar obras" on "public"."obras";

drop policy "Usuários autenticados podem criar obras" on "public"."obras";

drop policy "Usuários podem atualizar obras que criaram ou admin/gerente po" on "public"."obras";

drop policy "Usuários podem ver apenas suas próprias obras" on "public"."obras";

drop policy "org_members_delete_policy" on "public"."org_members";

drop policy "org_members_insert_policy" on "public"."org_members";

drop policy "org_members_select_policy" on "public"."org_members";

drop policy "org_members_update_policy" on "public"."org_members";

drop policy "orgs_delete_policy" on "public"."orgs";

drop policy "orgs_insert_policy" on "public"."orgs";

drop policy "orgs_select_policy" on "public"."orgs";

drop policy "orgs_update_policy" on "public"."orgs";

drop policy "Criador pode atualizar RDO em elaboração" on "public"."rdos";

drop policy "Gerentes e Admins podem aprovar/rejeitar RDOs" on "public"."rdos";

drop policy "Usuários podem criar RDOs" on "public"."rdos";

drop policy "Usuários podem ver apenas seus próprios RDOs" on "public"."rdos";

drop policy "Atividades: Delete" on "public"."atividades";

drop policy "Atividades: Insert" on "public"."atividades";

drop policy "Atividades: Update" on "public"."atividades";

drop policy "Atividades: View" on "public"."atividades";

drop policy "Expenses: Delete" on "public"."expenses";

drop policy "Expenses: Insert" on "public"."expenses";

drop policy "Expenses: Update" on "public"."expenses";

drop policy "Expenses: View" on "public"."expenses";

drop policy "Obras: Delete" on "public"."obras";

drop policy "Obras: Insert" on "public"."obras";

drop policy "Obras: Update" on "public"."obras";

drop policy "Obras: View" on "public"."obras";

drop policy "Members: Delete" on "public"."org_members";

drop policy "Members: Insert" on "public"."org_members";

drop policy "Members: Update" on "public"."org_members";

drop policy "Members: View" on "public"."org_members";

drop policy "Orgs: Insert" on "public"."orgs";

drop policy "Orgs: Update" on "public"."orgs";

drop policy "Orgs: View" on "public"."orgs";

drop policy "RDOs: Delete" on "public"."rdos";

drop policy "RDOs: Insert" on "public"."rdos";

drop policy "RDOs: Update" on "public"."rdos";

drop policy "RDOs: View" on "public"."rdos";


  create table "public"."user_interactions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "interaction_type" text not null,
    "target_id" text not null,
    "metadata" jsonb default '{}'::jsonb,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."user_interactions" enable row level security;

alter table "public"."coupons" add column "discount_type" text;

alter table "public"."coupons" add column "discount_value" numeric;

alter table "public"."coupons" alter column "discount_percentage" drop not null;

CREATE UNIQUE INDEX user_interactions_pkey ON public.user_interactions USING btree (id);

alter table "public"."user_interactions" add constraint "user_interactions_pkey" PRIMARY KEY using index "user_interactions_pkey";

alter table "public"."coupons" add constraint "coupons_discount_type_check" CHECK ((discount_type = ANY (ARRAY['percent'::text, 'fixed'::text]))) not valid;

alter table "public"."coupons" validate constraint "coupons_discount_type_check";

alter table "public"."user_interactions" add constraint "user_interactions_interaction_type_check" CHECK ((interaction_type = ANY (ARRAY['click'::text, 'page_view'::text, 'view_item'::text, 'access'::text]))) not valid;

alter table "public"."user_interactions" validate constraint "user_interactions_interaction_type_check";

alter table "public"."user_interactions" add constraint "user_interactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."user_interactions" validate constraint "user_interactions_user_id_fkey";

create or replace view "public"."admin_users_view" as  SELECT id,
    name,
    email,
    company,
    phone,
    plan_type,
    avatar_url,
    created_at,
    COALESCE(( SELECT (array_agg(ur.role))::text[] AS array_agg
           FROM public.user_roles ur
          WHERE (ur.user_id = p.id)), ARRAY[]::text[]) AS roles
   FROM public.profiles p;


create or replace view "public"."view_analytics_top_buttons" as  SELECT target_id AS button_id,
    count(*) AS click_count
   FROM public.user_interactions
  WHERE (interaction_type = 'click'::text)
  GROUP BY target_id
  ORDER BY (count(*)) DESC
 LIMIT 10;


create or replace view "public"."view_analytics_top_items" as  SELECT (metadata ->> 'item_name'::text) AS item_name,
    count(*) AS view_count
   FROM public.user_interactions
  WHERE (interaction_type = 'view_item'::text)
  GROUP BY (metadata ->> 'item_name'::text)
  ORDER BY (count(*)) DESC
 LIMIT 10;


create or replace view "public"."view_analytics_top_pages" as  SELECT target_id AS page_path,
    count(*) AS view_count
   FROM public.user_interactions
  WHERE (interaction_type = 'page_view'::text)
  GROUP BY target_id
  ORDER BY (count(*)) DESC
 LIMIT 10;


grant delete on table "public"."user_interactions" to "anon";

grant insert on table "public"."user_interactions" to "anon";

grant references on table "public"."user_interactions" to "anon";

grant select on table "public"."user_interactions" to "anon";

grant trigger on table "public"."user_interactions" to "anon";

grant truncate on table "public"."user_interactions" to "anon";

grant update on table "public"."user_interactions" to "anon";

grant delete on table "public"."user_interactions" to "authenticated";

grant insert on table "public"."user_interactions" to "authenticated";

grant references on table "public"."user_interactions" to "authenticated";

grant select on table "public"."user_interactions" to "authenticated";

grant trigger on table "public"."user_interactions" to "authenticated";

grant truncate on table "public"."user_interactions" to "authenticated";

grant update on table "public"."user_interactions" to "authenticated";

grant delete on table "public"."user_interactions" to "service_role";

grant insert on table "public"."user_interactions" to "service_role";

grant references on table "public"."user_interactions" to "service_role";

grant select on table "public"."user_interactions" to "service_role";

grant trigger on table "public"."user_interactions" to "service_role";

grant truncate on table "public"."user_interactions" to "service_role";

grant update on table "public"."user_interactions" to "service_role";


  create policy "Admins can view audit logs"
  on "public"."admin_audit_logs"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'Administrador'::public.app_role)))));



  create policy "Admins can manage coupons"
  on "public"."coupons"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'Administrador'::public.app_role)))));



  create policy "Admins can view all equipamentos"
  on "public"."equipamentos"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'Administrador'::public.app_role)))));



  create policy "Orgs: Delete"
  on "public"."orgs"
  as permissive
  for delete
  to authenticated
using ((owner_user_id = auth.uid()));



  create policy "Admins can view all profiles"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'Administrador'::public.app_role)))));



  create policy "Admins view activity"
  on "public"."user_activity"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'Administrador'::public.app_role)))));



  create policy "Users read own activity"
  on "public"."user_activity"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Admins manage credits"
  on "public"."user_credits"
  as permissive
  for all
  to public
using ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'Administrador'::public.app_role)))));



  create policy "Users read own credits"
  on "public"."user_credits"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Admins can view interactions"
  on "public"."user_interactions"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'Administrador'::public.app_role)))));



  create policy "Users can insert interactions"
  on "public"."user_interactions"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Atividades: Delete"
  on "public"."atividades"
  as permissive
  for delete
  to authenticated
using (((user_id = auth.uid()) OR public.has_org_role(org_id, ARRAY['Administrador'::public.app_role])));



  create policy "Atividades: Insert"
  on "public"."atividades"
  as permissive
  for insert
  to authenticated
with check ((public.is_org_member(org_id) AND (user_id = auth.uid())));



  create policy "Atividades: Update"
  on "public"."atividades"
  as permissive
  for update
  to authenticated
using ((public.is_org_member(org_id) AND ((user_id = auth.uid()) OR public.has_org_role(org_id, ARRAY['Administrador'::public.app_role, 'Gerente'::public.app_role]))))
with check ((public.is_org_member(org_id) AND ((user_id = auth.uid()) OR public.has_org_role(org_id, ARRAY['Administrador'::public.app_role, 'Gerente'::public.app_role]))));



  create policy "Atividades: View"
  on "public"."atividades"
  as permissive
  for select
  to authenticated
using (public.is_org_member(org_id));



  create policy "Expenses: Delete"
  on "public"."expenses"
  as permissive
  for delete
  to authenticated
using (public.has_org_role(org_id, ARRAY['Administrador'::public.app_role]));



  create policy "Expenses: Insert"
  on "public"."expenses"
  as permissive
  for insert
  to authenticated
with check ((public.is_org_member(org_id) AND (user_submitting_id = auth.uid())));



  create policy "Expenses: Update"
  on "public"."expenses"
  as permissive
  for update
  to authenticated
using ((public.is_org_member(org_id) AND ((user_submitting_id = auth.uid()) OR public.has_org_role(org_id, ARRAY['Administrador'::public.app_role, 'Gerente'::public.app_role]))))
with check ((public.is_org_member(org_id) AND ((user_submitting_id = auth.uid()) OR public.has_org_role(org_id, ARRAY['Administrador'::public.app_role, 'Gerente'::public.app_role]))));



  create policy "Expenses: View"
  on "public"."expenses"
  as permissive
  for select
  to authenticated
using (public.is_org_member(org_id));



  create policy "Obras: Delete"
  on "public"."obras"
  as permissive
  for delete
  to authenticated
using (public.has_org_role(org_id, ARRAY['Administrador'::public.app_role]));



  create policy "Obras: Insert"
  on "public"."obras"
  as permissive
  for insert
  to authenticated
with check ((public.is_org_member(org_id) AND (user_id = auth.uid())));



  create policy "Obras: Update"
  on "public"."obras"
  as permissive
  for update
  to authenticated
using ((public.is_org_member(org_id) AND ((user_id = auth.uid()) OR public.has_org_role(org_id, ARRAY['Administrador'::public.app_role, 'Gerente'::public.app_role]))))
with check ((public.is_org_member(org_id) AND ((user_id = auth.uid()) OR public.has_org_role(org_id, ARRAY['Administrador'::public.app_role, 'Gerente'::public.app_role]))));



  create policy "Obras: View"
  on "public"."obras"
  as permissive
  for select
  to authenticated
using (public.is_org_member(org_id));



  create policy "Members: Delete"
  on "public"."org_members"
  as permissive
  for delete
  to authenticated
using (public.has_org_role(org_id, ARRAY['Administrador'::public.app_role]));



  create policy "Members: Insert"
  on "public"."org_members"
  as permissive
  for insert
  to authenticated
with check (public.has_org_role(org_id, ARRAY['Administrador'::public.app_role]));



  create policy "Members: Update"
  on "public"."org_members"
  as permissive
  for update
  to authenticated
using (public.has_org_role(org_id, ARRAY['Administrador'::public.app_role]))
with check (public.has_org_role(org_id, ARRAY['Administrador'::public.app_role]));



  create policy "Members: View"
  on "public"."org_members"
  as permissive
  for select
  to authenticated
using (public.is_org_member(org_id));



  create policy "Orgs: Insert"
  on "public"."orgs"
  as permissive
  for insert
  to authenticated
with check ((owner_user_id = auth.uid()));



  create policy "Orgs: Update"
  on "public"."orgs"
  as permissive
  for update
  to authenticated
using (((owner_user_id = auth.uid()) OR public.has_org_role(id, ARRAY['Administrador'::public.app_role])))
with check (((owner_user_id = auth.uid()) OR public.has_org_role(id, ARRAY['Administrador'::public.app_role])));



  create policy "Orgs: View"
  on "public"."orgs"
  as permissive
  for select
  to authenticated
using (((owner_user_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.org_members m
  WHERE ((m.org_id = orgs.id) AND (m.user_id = auth.uid()) AND (m.status = 'active'::public.org_member_status))))));



  create policy "RDOs: Delete"
  on "public"."rdos"
  as permissive
  for delete
  to authenticated
using (public.has_org_role(org_id, ARRAY['Administrador'::public.app_role, 'Gerente'::public.app_role]));



  create policy "RDOs: Insert"
  on "public"."rdos"
  as permissive
  for insert
  to authenticated
with check ((public.is_org_member(org_id) AND (criado_por_id = auth.uid())));



  create policy "RDOs: Update"
  on "public"."rdos"
  as permissive
  for update
  to authenticated
using ((public.is_org_member(org_id) AND ((criado_por_id = auth.uid()) OR public.has_org_role(org_id, ARRAY['Administrador'::public.app_role, 'Gerente'::public.app_role]))))
with check ((public.is_org_member(org_id) AND ((criado_por_id = auth.uid()) OR public.has_org_role(org_id, ARRAY['Administrador'::public.app_role, 'Gerente'::public.app_role]))));



  create policy "RDOs: View"
  on "public"."rdos"
  as permissive
  for select
  to authenticated
using (public.is_org_member(org_id));





-- Storage policies commented out to prevent migration errors
-- These are managed by Supabase and should not be in project migrations
--   create policy "Allow authenticated uploads"
--   on "storage"."objects"
--   as permissive
--   for insert
--   to authenticated
-- with check (((bucket_id = 'avatars'::text) OR (bucket_id = 'community_media'::text)));
-- 
-- 
-- 
--   create policy "Public Access"
--   on "storage"."objects"
--   as permissive
--   for select
--   to public
-- using (((bucket_id = 'avatars'::text) OR (bucket_id = 'community_media'::text)));


-- Storage triggers commented out to prevent migration errors with missing storage functions
-- These triggers are managed by Supabase and should not be in project migrations
-- CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();
-- CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();
-- CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();
-- CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();
-- CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


