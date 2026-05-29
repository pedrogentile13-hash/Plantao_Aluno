-- Adiciona coluna subtype para subcategorias de atividades
-- Execute no SQL Editor do Supabase
ALTER TABLE public.boletim_atividades_rows
ADD COLUMN IF NOT EXISTS subtype text;
