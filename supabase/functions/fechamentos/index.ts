// supabase/functions/fechamentos/index.ts
// ─────────────────────────────────────────────────────────────
// Backend para fechamentos de caixa.
// O frontend NUNCA acessa o banco diretamente — tudo passa aqui.
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
    // Cria cliente com a chave de serviço (acesso total ao banco)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Identifica o usuário pelo token JWT enviado pelo frontend
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Não autenticado' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return json({ error: 'Token inválido' }, 401);
    }

    const body = await req.json();
    const { action } = body;

    // ── Criar fechamento ──────────────────────────────────────
    if (action === 'criar') {
      const {
        sistSalao, realSalao, excedente, difSalao,
        sistDeliv, realDelivLiq, totalGasEnt, difDeliv,
        totalGeral, dataFechamento, motoboys,
        trocoInicial, maqSalao, dinheiroGaveta,
        vendaWeb, vendaBundi, maqRetirada,
      } = body;

      // Validações básicas no backend
      if (!sistSalao || sistSalao <= 0) {
        return json({ error: 'Vendas do salão inválidas' }, 400);
      }
      if (!sistDeliv || sistDeliv <= 0) {
        return json({ error: 'Vendas de delivery inválidas' }, 400);
      }

      const { data, error } = await supabase
        .from('fechamentos')
        .insert([{
          criado_por:      user.id,
          data_referencia: dataFechamento,
          data_fechamento: new Date().toISOString().split('T')[0],
          venda_sist:      sistSalao,
          troco_inicial:   trocoInicial ?? 0,
          maq_salao:       maqSalao ?? 0,
          dinheiro_gaveta: dinheiroGaveta ?? 0,
          excedente,
          real_salao:      realSalao,
          dif_salao:       difSalao,
          venda_web:       vendaWeb ?? 0,
          venda_app:       vendaBundi ?? 0,
          maq_retirada:    maqRetirada ?? 0,
          total_gas:       totalGasEnt ?? 0,
          real_deliv_liq:  realDelivLiq,
          dif_deliv:       difDeliv,
          total_geral:     totalGeral,
          motoboys:        motoboys ?? [],
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar fechamento:', error);
        return json({ error: 'Erro ao salvar. Tente novamente.' }, 500);
      }

      return json({ ok: true, id: data.id });
    }

    // ── Listar fechamentos ────────────────────────────────────
    if (action === 'listar') {
      const pagina = Number(body.pagina ?? 0);
      const limite = Math.min(Number(body.limite ?? 20), 100);

      // Busca perfil do usuário para saber se é admin/gerente
      const { data: perfil } = await supabase
        .from('perfis')
        .select('perfil')
        .eq('id', user.id)
        .single();

      const isAdminOuGerente = perfil?.perfil === 'admin' || perfil?.perfil === 'gerente';

      let query = supabase
        .from('fechamentos_resumo')
        .select('*')
        .order('criado_em', { ascending: false })
        .range(pagina * limite, (pagina + 1) * limite - 1);

      // Funcionário comum só vê os próprios
      if (!isAdminOuGerente) {
        query = query.eq('criado_por', user.id);
      }

      const { data, error } = await query;

      if (error) {
        return json({ error: 'Erro ao buscar fechamentos' }, 500);
      }

      return json({ fechamentos: data ?? [] });
    }

    // ── Deletar fechamento ────────────────────────────────────
    if (action === 'deletar') {
      const { id } = body;
      if (!id) return json({ error: 'ID do fechamento é obrigatório' }, 400);

      // Busca perfil do usuário
      const { data: perfil } = await supabase
        .from('perfis')
        .select('perfil')
        .eq('id', user.id)
        .single();

      const isAdminOuGerente = perfil?.perfil === 'admin' || perfil?.perfil === 'gerente';

      // Busca o fechamento para validação
      const { data: fechamento } = await supabase
        .from('fechamentos')
        .select('criado_por, data_fechamento')
        .eq('id', id)
        .single();

      if (!fechamento) {
        return json({ error: 'Fechamento não encontrado' }, 404);
      }

      // Funcionário: só pode deletar o próprio e do dia atual
      if (!isAdminOuGerente) {
        if (fechamento.criado_por !== user.id) {
          return json({ error: 'Você não pode deletar fechamentos de outros funcionários' }, 403);
        }
        const hoje = new Date().toISOString().split('T')[0];
        if (fechamento.data_fechamento !== hoje) {
          return json({ error: 'Você só pode deletar fechamentos do dia atual' }, 403);
        }
      }

      const { error: deleteError } = await supabase
        .from('fechamentos')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Erro ao deletar fechamento:', deleteError);
        return json({ error: 'Erro ao deletar. Tente novamente.' }, 500);
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
