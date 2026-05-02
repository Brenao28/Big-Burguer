-- ─────────────────────────────────────────────────────────────
-- Big Burguer — Schema do Banco de Dados
-- Execute no SQL Editor do Supabase
-- ─────────────────────────────────────────────────────────────

-- ── Funções Auxiliares ────────────────────────────────────────
-- Resolve o problema de infinite recursion nas policies
CREATE OR REPLACE FUNCTION get_user_perfil()
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT perfil FROM perfis WHERE id = auth.uid() LIMIT 1;
$$;

-- ── Tabela de perfis ──────────────────────────────────────────
-- Espelha auth.users com dados extras do negócio.
CREATE TABLE IF NOT EXISTS perfis (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome        TEXT,
  email       TEXT,
  perfil      TEXT NOT NULL DEFAULT 'funcionario'
                CHECK (perfil IN ('admin', 'gerente', 'funcionario')),
  gerente_id  UUID REFERENCES perfis(id) ON DELETE SET NULL,
  ativo       BOOLEAN NOT NULL DEFAULT true,
  plano_ativo BOOLEAN NOT NULL DEFAULT false,
  criado_em   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Tabela de fechamentos ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS fechamentos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criado_por       UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  criado_em        TIMESTAMPTZ DEFAULT NOW(),
  data_referencia  TEXT,
  data_fechamento  DATE,

  -- Salão
  venda_sist       NUMERIC(12,2) DEFAULT 0,
  troco_inicial    NUMERIC(12,2) DEFAULT 0,
  maq_salao        NUMERIC(12,2) DEFAULT 0,
  dinheiro_gaveta  NUMERIC(12,2) DEFAULT 0,
  excedente        NUMERIC(12,2) DEFAULT 0,
  real_salao       NUMERIC(12,2) DEFAULT 0,
  dif_salao        NUMERIC(12,2) DEFAULT 0,

  -- Delivery
  venda_web        NUMERIC(12,2) DEFAULT 0,
  venda_app        NUMERIC(12,2) DEFAULT 0,
  maq_retirada     NUMERIC(12,2) DEFAULT 0,
  total_gas        NUMERIC(12,2) DEFAULT 0,
  real_deliv_liq   NUMERIC(12,2) DEFAULT 0,
  dif_deliv        NUMERIC(12,2) DEFAULT 0,

  -- Totais
  total_geral      NUMERIC(12,2) DEFAULT 0,

  -- Detalhes dos motoboys (JSON)
  motoboys         JSONB DEFAULT '[]'
);

-- ── Tabela de Entregadores ────────────────────────────────────
CREATE TABLE IF NOT EXISTS nomes_entregadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gerente_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gerente_id, nome)
);

-- ── RLS (Row Level Security) ──────────────────────────────────
ALTER TABLE perfis     ENABLE ROW LEVEL SECURITY;
ALTER TABLE fechamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE nomes_entregadores ENABLE ROW LEVEL SECURITY;

-- Perfis: cada usuário vê/edita só o próprio; admin vê todos
CREATE POLICY "perfis_leitura" ON perfis
  FOR SELECT USING (
    auth.uid() = id
    OR get_user_perfil() = 'admin'
  );

CREATE POLICY "perfis_atualizacao_proprio" ON perfis
  FOR UPDATE USING (auth.uid() = id);

-- Fechamentos: funcionário vê só os próprios; admin/gerente vê todos
CREATE POLICY "fechamentos_leitura" ON fechamentos
  FOR SELECT USING (
    auth.uid() = criado_por
    OR get_user_perfil() IN ('admin', 'gerente')
  );

CREATE POLICY "fechamentos_criacao" ON fechamentos
  FOR INSERT WITH CHECK (auth.uid() = criado_por);

CREATE POLICY "fechamentos_delete_admin" ON fechamentos
  FOR DELETE USING (
    get_user_perfil() = 'admin'
  );

-- Nomes Entregadores
CREATE POLICY "nomes_entregadores_leitura" ON nomes_entregadores
  FOR SELECT USING (
    auth.uid() = gerente_id
    OR auth.uid() IN (SELECT id FROM perfis WHERE gerente_id = nomes_entregadores.gerente_id)
  );

CREATE POLICY "nomes_entregadores_modificacao" ON nomes_entregadores
  FOR ALL USING (
    auth.uid() = gerente_id
    OR auth.uid() IN (SELECT id FROM perfis WHERE gerente_id = nomes_entregadores.gerente_id)
  );

-- ── View para listagem com nome do criador ────────────────────
CREATE OR REPLACE VIEW fechamentos_resumo AS
  SELECT
    f.*,
    p.nome  AS criador_nome,
    p.email AS criador_email
  FROM fechamentos f
  JOIN perfis p ON p.id = f.criado_por;

-- ── Trigger: cria perfil automaticamente ao registrar ────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO perfis (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── Índices ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_fechamentos_criado_por ON fechamentos(criado_por);
CREATE INDEX IF NOT EXISTS idx_fechamentos_criado_em  ON fechamentos(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_fechamentos_data        ON fechamentos(data_fechamento DESC);
