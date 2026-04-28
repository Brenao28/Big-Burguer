// src/lib/api.js
// ─────────────────────────────────────────────────────────────
// Camada de API: todo acesso ao backend passa por aqui.
// O frontend nunca fala diretamente com o banco de dados.
// ─────────────────────────────────────────────────────────────

import { supabase } from './supabaseClient';

// ── Helpers ──────────────────────────────────────────────────

/**
 * Chama uma Edge Function do Supabase com autenticação automática.
 * @param {string} fn   Nome da função (ex: 'fechamentos')
 * @param {object} body Payload JSON
 */
async function callFunction(fn, body = {}) {
  const { data, error } = await supabase.functions.invoke(fn, {
    body,
    headers: { 'Content-Type': 'application/json' },
  });
  if (error) {
    // Tenta extrair mensagem de erro do contexto da Edge Function
    const msg = error.context?.json?.error || error.message || 'Erro na requisição';
    throw new Error(msg);
  }
  return data;
}

// ── Auth ─────────────────────────────────────────────────────

/** Login com email + senha */
export async function login(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error) throw error;
  return data;
}

/** Criar conta nova (auto-registro — usado pelo gerente na assinatura) */
export async function registrar(email, password, nome) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome, perfil: 'gerente' },
      emailRedirectTo: 'https://brenao28.github.io/Big-Burguer/#/login',
    },
  });
  if (error) throw error;
  return data;
}

/** Logout */
export async function logout() {
  sessionStorage.removeItem('bb_perfil');
  await supabase.auth.signOut();
}

/** Recuperação de senha por email */
export async function recuperarSenha(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://brenao28.github.io/Big-Burguer/auth-redirect.html',
  });
  if (error) throw error;
}

// ── Fechamentos ───────────────────────────────────────────────

/**
 * Registra um novo fechamento de caixa.
 * Passa pelo backend (Edge Function) que valida e salva.
 */
export async function criarFechamento(payload) {
  return callFunction('fechamentos', { action: 'criar', ...payload });
}

/**
 * Lista os fechamentos do usuário logado.
 * O backend aplica RLS — gerente vê todos, funcionário só os próprios.
 */
export async function listarFechamentos({ pagina = 0, limite = 20 } = {}) {
  return callFunction('fechamentos', { action: 'listar', pagina, limite });
}

/**
 * Deleta um fechamento pelo ID.
 * Gerente deleta qualquer um. Funcionário só deleta o próprio do dia.
 */
export async function deletarFechamento(id) {
  return callFunction('fechamentos', { action: 'deletar', id });
}

// ── Equipe (gerente) ──────────────────────────────────────────

/**
 * Convida um funcionário por email.
 * O Supabase envia email com link para o funcionário definir sua senha.
 */
export async function convidarFuncionario(email, nome) {
  return callFunction('convidar-funcionario', { email, nome });
}

/**
 * Lista todos os funcionários cadastrados.
 * Apenas o gerente tem acesso.
 */
export async function listarFuncionarios() {
  return callFunction('gerenciar-equipe', { action: 'listar' });
}

/**
 * Remove um funcionário do sistema.
 * Apenas o gerente tem acesso.
 */
export async function removerFuncionario(funcionarioId) {
  return callFunction('gerenciar-equipe', { action: 'remover', funcionarioId });
}

// ── Mercado Pago ──────────────────────────────────────────────

/**
 * Cria uma preferência de pagamento no Mercado Pago
 * e retorna o link de checkout (init_point).
 */
export async function criarPreferenciaMp({ titulo, preco, userId, userEmail }) {
  return callFunction('criar-preferencia-mp', { titulo, preco, userId, userEmail });
}

// ── Mercado Pago — Assinatura ─────────────────────────────────

/**
 * Cria uma assinatura recorrente mensal no Mercado Pago
 * com trial gratuito de 30 dias.
 * Retorna { init_point, assinatura_id, status }
 */
export async function criarAssinaturaMp({ userId, userEmail }) {
  return callFunction('criar-assinatura-mp', { userId, userEmail });
}

/**
 * Cancela a assinatura recorrente no Mercado Pago.
 * O acesso continua até plano_expira_em — apenas não renova mais.
 * Retorna { ok: true, plano_expira_em }
 */
export async function cancelarAssinatura() {
  return callFunction('cancelar-assinatura', {});
}

// ── Entregadores ──────────────────────────────────────────────

/** Lista todos os nomes de entregadores salvos do gerente */
export async function listarEntregadores() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('nomes_entregadores')
    .select('id, nome')
    .eq('gerente_id', user.id)
    .order('nome', { ascending: true });
  if (error) throw error;
  return data;
}

/** Salva um novo nome de entregador (ignora se já existir) */
export async function salvarEntregador(nome) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('nomes_entregadores')
    .upsert({ gerente_id: user.id, nome: nome.trim() }, { onConflict: 'gerente_id,nome' });
  if (error) throw error;
}

/** Remove um nome de entregador pelo ID */
export async function removerEntregador(id) {
  const { error } = await supabase
    .from('nomes_entregadores')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
