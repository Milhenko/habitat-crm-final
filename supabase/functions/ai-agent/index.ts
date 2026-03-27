import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!)
    const body = await req.json()
    const { lead_id, use_case } = body

    // Obtener datos del lead
    const { data: lead, error } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single()

    if (error || !lead) {
      return new Response(JSON.stringify({ error: "Lead no encontrado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      })
    }

    let systemPrompt = ""
    let userMessage = ""

    if (use_case === "first_contact") {
      systemPrompt = `Eres un asesor inmobiliario premium de Habitat Realty Group en Ecuador. 
Tu nombre es Valentina y representas a la empresa.
Eres cálida, profesional y natural en tu comunicación por WhatsApp.
NUNCA menciones que eres una IA.
Tu objetivo es iniciar una conversación natural con el prospecto usando el guión de apertura.
Sé breve, máximo 3 líneas por mensaje.
Usa emojis con moderación.`

      userMessage = `El prospecto ${lead.name} acaba de solicitar información sobre ${lead.formulario || "una propiedad"}.
Su teléfono es ${lead.phone}.
Redacta el primer mensaje de WhatsApp para iniciar la conversación.
Pregunta si es su primera propiedad y qué le llamó la atención del proyecto.`
    }

    if (use_case === "follow_up") {
      systemPrompt = `Eres un asesor inmobiliario premium de Habitat Realty Group en Ecuador.
Tu nombre es Valentina.
El prospecto no ha respondido y debes reactivar la conversación.
Sé natural, no insistente. Máximo 3 líneas.`

      userMessage = `El prospecto ${lead.name} solicitó información sobre ${lead.formulario || "una propiedad"} pero no ha respondido.
Redacta un mensaje de seguimiento amigable que incluya la mención de que tienes opciones similares disponibles.`
    }

    if (use_case === "visit_confirmation") {
      systemPrompt = `Eres un asesor inmobiliario premium de Habitat Realty Group.
Tu nombre es Valentina.
Debes confirmar una visita programada de manera cordial y profesional.`

      userMessage = `El prospecto ${lead.name} tiene una visita agendada.
Redacta un mensaje de confirmación de visita para enviar 24 horas antes.
Incluye que estás disponible para cualquier pregunta previa.`
    }

    // Llamar a Claude API
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    })

    const claudeData = await claudeResponse.json()
    const mensaje = claudeData.content[0].text

    // Actualizar lead en Supabase
    await supabase
      .from("leads")
      .update({
        ai_status: "mensaje_generado",
        last_ai_interaction: new Date().toISOString(),
        ai_messages_sent: (lead.ai_messages_sent || 0) + 1,
      })
      .eq("id", lead_id)

    return new Response(
      JSON.stringify({ mensaje, lead_id, use_case }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    )
  }
})