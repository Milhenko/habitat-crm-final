import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")
const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_TOKEN")
const WHATSAPP_PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const body = await req.json()
    const { lead_id, phone, name, action } = body

    // Si no viene lead_id, buscar por teléfono
    let lead
    if (lead_id) {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", lead_id)
        .single()
      
      if (error) {
        console.error("Error fetching lead:", error)
      }
      lead = data
    }

    // Usar datos del body si no hay lead en DB
    const leadData = lead || { name, phone }

    let systemPrompt = ""
    let userMessage = ""
    let use_case = action || "first_contact"

    if (use_case === "first_contact") {
      systemPrompt = `Eres un asesor inmobiliario premium de Habitat Realty Group en Ecuador. 
Tu nombre es Valentina y representas a la empresa.
Eres cálida, profesional y natural en tu comunicación por WhatsApp.
NUNCA menciones que eres una IA.
Tu objetivo es iniciar una conversación natural con el prospecto.
Sé breve, máximo 3 líneas por mensaje.
Usa emojis con moderación (máximo 2 por mensaje).`

      userMessage = `El prospecto ${leadData.name} acaba de solicitar información sobre una propiedad.
Su teléfono es ${leadData.phone}.
Redacta el primer mensaje de WhatsApp para iniciar la conversación.
Preséntate como Valentina de Habitat Realty Group y pregunta qué tipo de propiedad está buscando.`
    }

    if (use_case === "follow_up") {
      systemPrompt = `Eres un asesor inmobiliario premium de Habitat Realty Group en Ecuador.
Tu nombre es Valentina.
El prospecto no ha respondido y debes reactivar la conversación.
Sé natural, no insistente. Máximo 3 líneas.`

      userMessage = `El prospecto ${leadData.name} solicitó información pero no ha respondido.
Redacta un mensaje de seguimiento amigable mencionando que tienes nuevas opciones disponibles.`
    }

    if (use_case === "visit_confirmation") {
      systemPrompt = `Eres un asesor inmobiliario premium de Habitat Realty Group.
Tu nombre es Valentina.
Debes confirmar una visita programada de manera cordial y profesional.`

      userMessage = `El prospecto ${leadData.name} tiene una visita agendada.
Redacta un mensaje de confirmación de visita para enviar 24 horas antes.
Incluye que estás disponible para cualquier pregunta previa.`
    }

    console.log("Calling Claude API...")
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    })

    const claudeData = await claudeResponse.json()
    console.log("Claude response:", JSON.stringify(claudeData))

    if (!claudeData.content || claudeData.content.length === 0) {
      return new Response(
        JSON.stringify({ error: "Claude no generó respuesta", details: claudeData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      )
    }

    const mensaje = claudeData.content[0].text

    // ENVIAR WHATSAPP
    console.log("Sending WhatsApp to:", leadData.phone)
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: leadData.phone,
          type: "text",
          text: { body: mensaje },
        }),
      }
    )

    const whatsappData = await whatsappResponse.json()
    console.log("WhatsApp response:", JSON.stringify(whatsappData))

    if (!whatsappResponse.ok) {
      console.error("WhatsApp API error:", whatsappData)
      return new Response(
        JSON.stringify({ 
          error: "Error enviando WhatsApp", 
          details: whatsappData,
          mensaje_generado: mensaje
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      )
    }

    // Actualizar DB solo si existe el lead
    if (lead_id) {
      await supabase
        .from("leads")
        .update({
          ai_status: "mensaje_enviado",
          last_ai_interaction: new Date().toISOString(),
          ai_messages_sent: (lead.ai_messages_sent || 0) + 1,
        })
        .eq("id", lead_id)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        mensaje, 
        whatsapp_message_id: whatsappData.messages?.[0]?.id,
        lead_id, 
        use_case 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    console.error("Error in ai-agent:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})