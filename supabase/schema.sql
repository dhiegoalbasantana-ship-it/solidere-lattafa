-- ==========================================================================
-- SOLIDERE ATACADISTA x LATTAFA BRASIL - SCHEMA DO BANCO DE DADOS (SUPABASE)
-- ==========================================================================

-- Tabela para armazenar leads, orçamentos e pedidos gerados no site
CREATE TABLE IF NOT EXISTS public.leads_solidere (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    order_code TEXT NOT NULL,
    customer_name TEXT DEFAULT 'Cliente Web',
    customer_phone TEXT,
    order_type TEXT NOT NULL DEFAULT 'ATACADO', -- 'ATACADO' ou 'VAREJO'
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    items_count INTEGER DEFAULT 1,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_destination TEXT DEFAULT 'Consultar Frete',
    status TEXT NOT NULL DEFAULT 'novo', -- 'novo', 'em_atendimento', 'finalizado', 'cancelado'
    source TEXT DEFAULT 'site_solidere_lattafa',
    notes TEXT
);

-- Ativa Row Level Security (RLS)
ALTER TABLE public.leads_solidere ENABLE ROW LEVEL SECURITY;

-- Política de inserção pública (qualquer visitante pode enviar pedido pelo site)
CREATE POLICY "Permitir insercao anonima de pedidos" 
ON public.leads_solidere 
FOR INSERT 
TO anon 
WITH CHECK (true);

-- Política de leitura (somente autenticado/admin)
CREATE POLICY "Permitir leitura para equipe" 
ON public.leads_solidere 
FOR SELECT 
TO authenticated 
USING (true);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_solidere_order_code ON public.leads_solidere(order_code);
CREATE INDEX IF NOT EXISTS idx_leads_solidere_created_at ON public.leads_solidere(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_solidere_status ON public.leads_solidere(status);
