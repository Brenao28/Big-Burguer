// supabase/functions/mp-webhook/index.ts

import { serve }        from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
  const SUPABASE_URL    = Deno.env.get('SUPABASE_URL')
  const SERVICE_KEY     = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  console.log('[mp-webhook] recebido')

  if (!MP_ACCESS_TOKEN || !SUPABASE_URL || !SERVICE_KEY) {
    console.error('Secrets ausentes')
    return new Response('Secrets ausentes', { status: 500 })
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

  try {
    const body = await req.json().catch(() => ({}))
    const url  = new URL(req.url)

    const topic  = body.type  ?? url.searchParams.get('topic')
    const dataId = body.data?.id ?? url.searchParams.get('id')

    console.log('topic:', topic, '| dataId:', dataId)

    if (topic !== 'payment' || !dataId) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const respostaPagamento = await fetch(
      `https://api.mercadopago.com/v1/payments/${dataId}`,
      { headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` } }
    )

    const pagamento = await respostaPagamento.json()
    console.log('Pagamento status:', pagamento.status, '| userId:', pagamento.external_reference)

    const userId = pagamento.external_reference
    if (!userId) {
      console.error('external_reference ausente')
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    switch (pagamento.status) {
      case 'approved': {
        const { error } = await supabase
          .from('perfis')
          .update({ plano_ativo: true, atualizado_em: new Date().toISOString() })
          .eq('id', userId)
        if (error) throw error
        console.log('Plano ATIVADO:', userId)
        break
      }
      case 'rejected':
      case 'cancelled':
      case 'refunded': {
        const { error } = await supabase
          .from('perfis')
          .update({ plano_ativo: false, atualizado_em: new Date().toISOString() })
          .eq('id', userId)
        if (error) throw error
        console.log('Plano DESATIVADO:', userId)
        break
      }
      default:
        console.log('Status ignorado:', pagamento.status)
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('ERRO:', err.message)
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 200, // retorna 200 para MP não reenviar
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
