// supabase/functions/criar-preferencia-mp/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Lê secrets DENTRO do handler (obrigatório no Deno Edge)
  const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
  const BASE_URL        = Deno.env.get('APP_BASE_URL')
  const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')

  console.log('[criar-preferencia-mp] boot OK')
  console.log('MP_ACCESS_TOKEN presente:', !!MP_ACCESS_TOKEN)
  console.log('APP_BASE_URL:', BASE_URL)

  if (!MP_ACCESS_TOKEN) {
    console.error('ERRO: MP_ACCESS_TOKEN ausente')
    return new Response(
      JSON.stringify({ error: 'MP_ACCESS_TOKEN não configurado nos secrets do Supabase.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (!BASE_URL) {
    console.error('ERRO: APP_BASE_URL ausente')
    return new Response(
      JSON.stringify({ error: 'APP_BASE_URL não configurado nos secrets do Supabase.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json()
    console.log('Body recebido:', JSON.stringify(body))

    const { titulo, preco, userId, userEmail } = body

    if (!userId || !preco) {
      return new Response(
        JSON.stringify({ error: 'userId e preco são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // URLs de retorno — aponta para mp-redirect.html que redireciona para o hash correto
    const successUrl = `${BASE_URL}/mp-redirect.html?mp_status=approved&external_reference=${userId}`
    const failureUrl = `${BASE_URL}/mp-redirect.html?mp_status=failure&external_reference=${userId}`
    const pendingUrl = `${BASE_URL}/mp-redirect.html?mp_status=pending&external_reference=${userId}`

    console.log('successUrl:', successUrl)

    const preferencia = {
      items: [
        {
          id:          'bigburguer-pro-mensal',
          title:       titulo ?? 'Big Burguer Pro — Mensal',
          description: 'Acesso completo ao sistema de fechamento de caixa',
          quantity:    1,
          currency_id: 'BRL',
          unit_price:  Number(preco),
        },
      ],
      payer: {
        ...(userEmail ? { email: userEmail } : {}),
      },
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
      auto_return:        'approved',
      external_reference: String(userId),
      expires:            true,
      expiration_date_to: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      payment_methods: {
        installments: 1,
      },
      notification_url:     `${SUPABASE_URL}/functions/v1/mp-webhook`,
      statement_descriptor: 'BIGBURGUER PRO',
    }

    console.log('Chamando API do Mercado Pago...')

    const resposta = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferencia),
    })

    const dados = await resposta.json()
    console.log('MP status HTTP:', resposta.status)
    console.log('MP resposta:', JSON.stringify(dados))

    if (!resposta.ok) {
      throw new Error(`Mercado Pago erro ${resposta.status}: ${JSON.stringify(dados)}`)
    }

    return new Response(
      JSON.stringify({
        init_point:    dados.init_point,
        sandbox_point: dados.sandbox_init_point,
        preference_id: dados.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('ERRO GERAL:', err.message)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
