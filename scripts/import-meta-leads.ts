import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://knstfqojgyerymnrphgf.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtuc3RmcW9qZ3llcnltbnJwaGdmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI5MjUyOCwiZXhwIjoyMDg5ODY4NTI4fQ.cF4GcFjKaTlbQMwLOSTWmAcOCo5OQFkdS4EmXRAGRI4'
const META_ACCESS_TOKEN = 'EAAYVNg3u0OcBRakZCqVaM2ZANyKe4IxgtjwVs8pgmlq3v9TUCYiCJVEHVDj7YnMUIHnWv71N7hLOKcNFHWdxAB6WYtlQsNZBCUEaqjWgxa45xtPw2YwObr0IYSIJjpZC8dUWRaOPZBCOvTfHJahK3RFEr7tZCswjvqtiWOP4Ptdhvk8KL7xd93DveO79CB'
const FORM_IDS = ['26717674881219669']

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function importLeadsFromForm(formId: string) {
  console.log(`\n📋 Importando leads del formulario: ${formId}`)
  try {
    const response = await fetch(`https://graph.facebook.com/v25.0/${formId}/leads?access_token=${META_ACCESS_TOKEN}`)
    if (!response.ok) {
      console.error(`❌ Error:`, await response.text())
      return
    }
    const result = await response.json()
    const leads = result.data || []
    console.log(`   Encontrados ${leads.length} leads`)
    for (const lead of leads) {
      const leadId = lead.id
      const { data: existing } = await supabase.from('leads').select('id').eq('custom_fields->>lead_id', leadId).single()
      if (existing) {
        console.log(`   ⏭️  Lead ${leadId} ya existe`)
        continue
      }
      const leadDetailResponse = await fetch(`https://graph.facebook.com/v25.0/${leadId}?access_token=${META_ACCESS_TOKEN}`)
      if (!leadDetailResponse.ok) continue
      const leadData = await leadDetailResponse.json()
      const fieldData = leadData.field_data || []
      let name = null, phone = null, email = null
      const customFields: Record<string, any> = {}
      for (const field of fieldData) {
        const fieldName = field.name
        const fieldValue = field.values?.[0] || null
        if (fieldName === 'full_name' || fieldName === 'first_name') name = fieldValue
        else if (fieldName === 'phone_number' || fieldName === 'phone') phone = fieldValue
        else if (fieldName === 'email') email = fieldValue
        else customFields[fieldName] = fieldValue
      }
      customFields.lead_id = leadId
      customFields.form_id = formId
      customFields.ad_id = leadData.ad_id
      customFields.created_time = leadData.created_time
      const { error } = await supabase.from('leads').insert({
        name: name || 'Lead desde Meta',
        phone, email,
        status: 'Lead Entrante',
        canal: 'Meta Ads',
        source: 'Facebook Lead Ad',
        formulario: formId,
        custom_fields: customFields,
        created_at: leadData.created_time || new Date().toISOString()
      })
      if (error) console.error(`   ❌ Error:`, error)
      else console.log(`   ✅ Importado: ${name || leadId}`)
    }
  } catch (error) {
    console.error(`❌ Error:`, error)
  }
}

async function main() {
  console.log('🚀 Iniciando...\n')
  for (const formId of FORM_IDS) await importLeadsFromForm(formId)
  console.log('\n✨ Completado')
}

main()
