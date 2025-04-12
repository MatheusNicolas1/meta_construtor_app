
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://jchnjeihrutgmfjwnfyo.supabase.co";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjaG5qZWlocnV0Z21manduZnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1OTk2ODIsImV4cCI6MjA1OTE3NTY4Mn0.Mkn0XWEwElTiFWNLjm58PfSoj6QT-zUMisaCQxqtqHs";
// These will be used when we have the WhatsApp API key
const whatsappApiKey = Deno.env.get("WHATSAPP_API_KEY");
const whatsappPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Will be used when we implement WhatsApp integration
async function processWhatsAppMessage(supabase: any, message: string, sender: string) {
  try {
    // Log the incoming message
    await supabase
      .from('whatsapp_message_log')
      .insert({
        sender,
        message,
        direction: 'incoming',
        timestamp: new Date().toISOString()
      });
    
    // For now, just log that we received a message
    console.log(`Received message from ${sender}: ${message}`);
    
    // This is just a placeholder - when we have the WhatsApp API key, 
    // we'll process the message and send a response using the WhatsApp API
    return { success: true, message: "Message logged successfully" };
  } catch (error) {
    console.error("Error processing WhatsApp message:", error);
    throw error;
  }
}

// Will be used when we implement WhatsApp integration
async function sendWhatsAppMessage(sender: string, message: string) {
  try {
    if (!whatsappApiKey || !whatsappPhoneNumberId) {
      console.log("WhatsApp API not configured yet, logging response instead");
      console.log(`Would send to ${sender}: ${message}`);
      return { success: true, simulated: true };
    }
    
    // This will be implemented when we have the WhatsApp API key
    // For now, just log the message we would send
    console.log(`Would send message to ${sender}: ${message}`);
    return { success: true, simulated: true };
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // For GET requests, this would be for webhook verification
    if (req.method === 'GET') {
      // WhatsApp webhook verification will be implemented here
      // when we have the WhatsApp API key
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      
      if (mode === 'subscribe' && token === 'your_verify_token') {
        return new Response(challenge, { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "text/plain" } 
        });
      }
      
      return new Response('Verification failed', { 
        status: 403, 
        headers: { ...corsHeaders, "Content-Type": "text/plain" } 
      });
    }
    
    // For POST requests, this would be incoming messages
    // When we have the WhatsApp API key, we'll parse the incoming message
    // and call processWhatsAppMessage
    
    // For now, let's just log the request body for testing
    const body = await req.json();
    console.log("Received webhook POST:", JSON.stringify(body));
    
    // Simulate processing a message
    const { message = "Test message", sender = "test_user" } = body;
    await processWhatsAppMessage(supabase, message, sender);
    
    return new Response(
      JSON.stringify({ 
        status: "received",
        message: "Webhook received successfully"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("Error in WhatsApp webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
