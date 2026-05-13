import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const VERIFY_TOKEN = Deno.env.get('META_VERIFY_TOKEN') || 'habitat_crm_verify_2024'
const META_ACCESS_TOKEN = Deno.env.get('META_ACCESS_TOKEN')

serve(async (req) => {
  const url = new URL(req.url)

  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return new Response(challenge, { status: 200 })
    }
    return new Response('Forbidden', { status: 403 })
  }

  if (req.method === 'POST') {
    const body = await req.json()
    console.log('Received webhook:', JSON.stringify(body))

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'leadgen') {
          const leadgenId = change.value.leadgen_id
          const formId = change.value.form_id
          const adId = change.value.ad_id
          const pageId = change.value.page_id

          console.log(`Processing lead: ${leadgenId}`)

          try {
            // Obtener datos del lead CON field_data
            const graphResponse = await fetch(
              `https://graph.facebook.com/v25.0/${leadgenId}?fields=id,created_time,field_data&access_token=${META_ACCESS_TOKEN}`
            )

            if (!graphResponse.ok) {
              console.error('Error fetching lead:', await graphResponse.text())
              continue
            }

            const leadData = await graphResponse.json()
            console.log('Lead data from Graph API:', JSON.stringify(leadData))

            // Obtener nombre del formulario
            let nombreFormulario = null
            try {
              const formResponse = await fetch(
                `https://graph.facebook.com/v25.0/${formId}?fields=name&access_token=${META_ACCESS_TOKEN}`
              )
              if (formResponse.ok) {
                const formData = await formResponse.json()
                nombreFormulario = formData.name || null
                console.log('Nombre formulario:', nombreFormulario)
              }
            } catch (e) {
              console.error('Error fetching form name:', e)
            }

            // Extraer campos
            const fieldData = leadData.field_data || []
            let name = null
            let phone = null
            let email = null
            const customFields: Record<string, any> = {}

            for (const field of fieldData) {
              const fieldName = field.name
              const fieldValue = field.values?.[0] || null

              if (fieldName === 'full_name' || fieldName === 'first_name') {
                name = fieldValue
              } else if (fieldName === 'phone_number' || fieldName === 'phone') {
                phone = fieldValue
              } else if (fieldName === 'email') {
                email = fieldValue
              } else {
                // ✅ CORRECCIÓN: Guardar TODAS las demás respuestas
                customFields[fieldName] = fieldValue
              }
            }

            // Agregar metadata
            customFields.lead_id = leadgenId
            customFields.form_id = formId
            customFields.ad_id = adId
            customFields.created_time = leadData.created_time

            console.log('Custom fields to save:', JSON.stringify(customFields))

            // Determinar canal
            let canal = 'Meta Ads'

            const { data, error } = await supabase.from('leads').insert({
              name: name || 'Lead desde Meta',
              phone: phone,
              email: email,
              status: 'Lead Entrante',
              canal: canal,
              source: 'Facebook Lead Ads',
              formulario: nombreFormulario || formId,
              nombre_formulario: nombreFormulario,
              custom_fields: customFields,
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
