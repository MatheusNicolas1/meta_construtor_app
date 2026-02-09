select relname, 
       relrowsecurity as rls_enabled, 
       relforcerowsecurity as force_rls 
from pg_class 
where relname in ('profiles','orgs','org_members','user_settings','user_credits','user_roles') 
order by relname;
