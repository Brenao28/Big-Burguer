// supabase/functions/criar-assinatura-mp/index.ts
// Cria uma assinatura recorrente no Mercado Pago com 1 mês grátis

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN_ASSINATURA') // token da app de Assinaturas
  const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')

  if (!MP_ACCESS_TOKEN) {
    return new Response(
      JSON.stringify({ error: 'MP_ACCESS_TOKEN_ASSINATURA não configurado.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  let userId: string | undefined
  let userEmail: string | undefined

  try {
    const body = await req.json()
    userId    = body.userId
    userEmail = body.userEmail
  } catch {
    return new Response(
      JSON.stringify({ error: 'Body inválido.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!userId || !userEmail) {
    return new Response(
      JSON.stringify({ error: 'userId e userEmail são obrigatórios.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    // Data de início = daqui 30 dias (após o trial gratuito)
    const inicioCobranca = new Date()
    inicioCobranca.setDate(inicioCobranca.getDate() + 30)

    const assinatura = {
      reason: 'Big Burguer Pro — Mensal',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 149.90,
        currency_id: 'BRL',
        free_trial: {
          frequency: 1,
          frequency_type: 'months',
        },
      },
      payer_email: userEmail,
      external_reference: userId,
      back_url: `${Deno.env.get('APP_BASE_URL')}/#/plano`,
      notification_url: `${SUPABASE_URL}/functions/v1/mp-webhook`,
      // ✅ Adicione isso:
      start_date: new Date().toISOString(),
    }

    console.log('[criar-assinatura-mp] criando assinatura para:', userEmail)

    const resposta = await fetch('https://api.mercadopago.com/preapproval', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(assinatura),
    })

    const dados = await resposta.json()
    console.log('MP status:', resposta.status, '| init_point:', dados.init_point)

    if (!resposta.ok) {
      throw new Error(`Mercado Pago ${resposta.status}: ${JSON.stringify(dados)}`)
    }

    return new Response(
      JSON.stringify({
        init_point:      dados.init_point,
        assinatura_id:   dados.id,
        status:          dados.status,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('ERRO ao criar assinatura:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
