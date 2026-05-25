-- Remover constraint antiga e adicionar nova
ALTER TABLE public.profiles DROP CONSTRAINT profiles_plan_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check
CHECK (plan in ('free', 'premium', 'lite', 'gratis'));
