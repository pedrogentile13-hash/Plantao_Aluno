-- ============================================================
-- Tabela de Resumos (PDFs por matéria/bimestre)
-- Execute no SQL Editor do Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS public.resumos (
  id uuid default gen_random_uuid() primary key,
  subject_slug text not null,
  bimestre int not null,
  title text not null,
  description text,
  pdf_url text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

ALTER TABLE public.resumos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resumos: public read"
  ON public.resumos FOR SELECT USING (true);

CREATE POLICY "resumos: admin write"
  ON public.resumos FOR ALL USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_resumos_subject_bimestre
  ON public.resumos(subject_slug, bimestre);

-- ============================================================
-- IMPORTANTE: Criar bucket "resumos" no Supabase Storage
-- Dashboard → Storage → New Bucket → Name: "resumos" → Public: ON
-- ============================================================
