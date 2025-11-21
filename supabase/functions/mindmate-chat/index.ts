import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    // Input validation
    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages must be an array" }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Too many messages. Maximum 50 allowed." }), 
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        return new Response(
          JSON.stringify({ error: "Invalid message format" }), 
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!['user', 'assistant', 'system'].includes(msg.role)) {
        return new Response(
          JSON.stringify({ error: "Invalid message role" }), 
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (typeof msg.content !== 'string' || msg.content.length > 2000) {
        return new Response(
          JSON.stringify({ error: "Message content must be a string under 2000 characters" }), 
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are MindMate AI, a compassionate and supportive mental wellness companion for young people. Your role is to:

- Provide emotional support and active listening
- Suggest evidence-based coping strategies and mindfulness techniques
- Encourage healthy habits and self-care
- Help users understand and manage their emotions
- Recognize crisis situations and provide appropriate resources

IMPORTANT GUIDELINES:
- Always be empathetic, non-judgmental, and supportive
- Use age-appropriate language for young adults
- Never provide medical diagnoses or replace professional help
- If someone expresses thoughts of self-harm or suicide, encourage them to seek immediate professional help from:
  * National Suicide Prevention Lifeline: 988 or 1-800-273-8255
  * Crisis Text Line: Text HOME to 741741
  * Emergency Services: 911
- Keep responses concise but meaningful (2-4 paragraphs max)
- Use a warm, friendly tone while maintaining professionalism
- Validate their feelings and experiences
- Offer practical, actionable advice

You are here to support, not to fix. Sometimes the best help is simply listening and validating feelings.` 
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }), 
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
