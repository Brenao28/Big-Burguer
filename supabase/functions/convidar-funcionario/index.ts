// supabase/functions/convidar-funcionario/index.ts
// ─────────────────────────────────────────────────────────────
// Gerente convida funcionário.
// Usa signUp normal (igual ao fluxo do gerente) para contornar
// limitações da Admin API no plano gratuito do Supabase.
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

    // Cliente com anon key para validar o token do usuário logado
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) return json({ error: 'Token inválido' }, 401);

    // Cliente service role para consultas administrativas
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
      return json({ error: 'Apenas o gerente pode convidar funcionários' }, 403);
    }

    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return json({ error: 'Email inválido' }, 400);
    }

    // Verifica se email já existe
    const { data: existente } = await supabase
      .from('perfis')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (existente) {
      return json({ error: 'Este email já está cadastrado no sistema' }, 409);
    }

    // Senha temporária aleatória — funcionário vai trocar via "esqueci a senha"
    const senhaTemp = crypto.randomUUID();

    // Usa signUp normal com anon key (mesmo fluxo que funciona para o gerente)
    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email,
      password: senhaTemp,
      options: {
        data: {
          perfil: 'funcionario',
          nome: email.split('@')[0],
        },
        emailRedirectTo:  `${Deno.env.get('SITE_URL') ?? 'https://brenao28.github.io/Big-Burguer'}/#/redefinir-senha`,
      },
    });

    if (signUpError) {
      console.error('Erro no signUp:', signUpError);
      return json({ error: 'Erro ao criar funcionário: ' + signUpError.message }, 500);
    }

    // Garante perfil como 'funcionario' via service role (fallback do trigger)
    if (signUpData?.user?.id) {
      const { error: upsertError } = await supabase
        .from('perfis')
        .upsert({
          id: signUpData.user.id,
          email,
          nome: email.split('@')[0],
          perfil: 'funcionario',
          ativo: true,
          plano_ativo: false,
        }, { onConflict: 'id' });

      if (upsertError) {
        console.error('Erro no upsert do perfil:', upsertError);
      }
    }

    // Envia email de recuperação de senha para o funcionário definir a própria senha
    const { error: resetError } = await supabaseAnon.auth.resetPasswordForEmail(email, {
      redirectTo: `${Deno.env.get('SITE_URL') ?? 'https://brenao28.github.io/Big-Burguer'}/#/redefinir-senha`,
    });

    if (resetError) {
      console.error('Erro ao enviar email de recuperação:', resetError);
      return json({
        ok: true,
        email,
        aviso: 'Conta criada! O email de convite falhou — peça ao funcionário para usar "Esqueci a senha" no login.',
      });
    }

    return json({ ok: true, email });

  } catch (err) {
    console.error('Erro inesperado:', err?.message ?? err);
    return json({ error: 'Erro interno: ' + (err?.message ?? 'desconhecido') }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
