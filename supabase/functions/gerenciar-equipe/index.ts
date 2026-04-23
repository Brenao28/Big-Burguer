// supabase/functions/gerenciar-equipe/index.ts
// ─────────────────────────────────────────────────────────────
// Gerente lista e remove funcionários da equipe.
// ─────────────────────────────────────────────────────────────

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Não autenticado' }, 401);

    // Cliente com anon key para validar o token do usuário
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) return json({ error: 'Token inválido' }, 401);

    // Cliente service role para operações administrativas
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verifica se quem chama é gerente
    const { data: perfil } = await supabase
      .from('perfis')
      .select('perfil')
      .eq('id', user.id)
      .single();

    if (perfil?.perfil !== 'gerente') {
      return json({ error: 'Acesso restrito ao gerente' }, 403);
    }

    const body = await req.json();
    const { action } = body;

    // ── Listar funcionários ───────────────────────────────────
    if (action === 'listar') {
      const { data, error } = await supabase
        .from('perfis')
        .select('id, nome, email, perfil, ativo, criado_em')
        .eq('perfil', 'funcionario')
        .order('criado_em', { ascending: false });

      if (error) return json({ error: 'Erro ao listar funcionários' }, 500);

      return json({ funcionarios: data ?? [] });
    }

    // ── Remover funcionário ───────────────────────────────────
    if (action === 'remover') {
      const { funcionarioId } = body;

      if (!funcionarioId) return json({ error: 'ID do funcionário é obrigatório' }, 400);

      // Não pode remover a si mesmo
      if (funcionarioId === user.id) {
        return json({ error: 'Você não pode remover a si mesmo' }, 400);
      }

      // Confirma que o alvo é realmente um funcionário
      const { data: alvo } = await supabase
        .from('perfis')
        .select('perfil')
        .eq('id', funcionarioId)
        .single();

      if (alvo?.perfil !== 'funcionario') {
        return json({ error: 'Usuário não é um funcionário' }, 400);
      }

      // Remove do auth (cascata deleta o perfil também via ON DELETE CASCADE)
      const { error: removeError } = await supabase.auth.admin.deleteUser(funcionarioId);

      if (removeError) {
        console.error('Erro ao remover usuário:', removeError);
        return json({ error: 'Erro ao remover funcionário' }, 500);
      }

      return json({ ok: true });
    }

    return json({ error: 'Ação desconhecida' }, 400);

  } catch (err) {
    console.error('Erro inesperado:', err);
    return json({ error: 'Erro interno do servidor' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
