import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const VERIFY_TOKEN = Deno.env.get('META_VERIFY_TOKEN') || 'habitat_crm_verify_2024'
const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN')

serve(async (req) => {
  const url = new URL(req.url)
  
  // Verificación del webhook (GET request)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified')
      return new Response(challenge, { status: 200 })
    }
    
    return new Response('Forbidden', { status: 403 })
  }
  
  // Recepción de leads (POST request)
  if (req.method === 'POST') {
    const body = await req.json()
    console.log('Received webhook:', JSON.stringify(body))
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Procesar cada entrada
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'leadgen') {
          const leadgenId = change.value.leadgen_id
          const formId = change.value.form_id
          
          console.log(`Processing lead: ${leadgenId}`)
          
          try {
            // OBTENER DATOS REALES DEL LEAD DESDE META GRAPH API
            const graphResponse = await fetch(
              `https://graph.facebook.com/v25.0/${leadgenId}?access_token=${META_ACCESS_TOKEN}`
            )
            
            if (!graphResponse.ok) {
              console.error('Error fetching lead from Graph API:', await graphResponse.text())
              continue
            }
            
            const leadData = await graphResponse.json()
            console.log('Lead data from Meta:', JSON.stringify(leadData))
            
            // Extraer campos del lead
            const fieldData = leadData.field_data || []
            let name = null
            let phone = null
            let email = null
            
            for (const field of fieldData) {
              if (field.name === 'full_name' || field.name === 'first_name') {
                name = field.values[0]
              }
              if (field.name === 'phone_number' || field.name === 'phone') {
                phone = field.values[0]
              }
              if (field.name === 'email') {
                email = field.values[0]
              }
            }
            
            // Insertar lead en Supabase
            const { data, error } = await supabase.from('leads').insert({
              name: name || 'Lead desde Meta',
              phone: phone,
              email: email,
              status: 'Lead Entrante',
              canal: 'Meta Ads',
              source: 'Facebook Lead Ad',
              formulario: formId,
              created_at: new Date().toISOString()
            }).select()
            
            if (error) {
              console.error('Error inserting lead:', error)
            } else {
              console.log('Lead inserted successfully:', data)
            }
            
          } catch (error) {
            console.error('Error processing lead:', error)
          }
        }
      }
    }
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return new Response('Method not allowed', { status: 405 })
})
