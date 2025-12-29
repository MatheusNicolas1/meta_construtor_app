import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface N8NTestRequest {
  action: 'test' | 'trigger';
  n8nUrl?: string;
  apiKey?: string;
  webhookUrl?: string;
  payload?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client to verify user
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('User verification failed:', userError);
      return new Response(
        JSON.stringify({ success: false, error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`N8N integration request from user: ${user.id}`);

    const body: N8NTestRequest = await req.json();
    const { action } = body;

    if (action === 'test') {
      // Test N8N connection
      const { n8nUrl, apiKey } = body;
      
      if (!n8nUrl || !apiKey) {
        return new Response(
          JSON.stringify({ success: false, error: 'URL e API Key são obrigatórios' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Testing N8N connection to: ${n8nUrl}`);

      try {
        const response = await fetch(`${n8nUrl}/api/v1/workflows`, {
          method: 'GET',
          headers: {
            'X-N8N-API-KEY': apiKey,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          console.log('N8N connection test successful');
          return new Response(
            JSON.stringify({ success: true, message: 'Conexão com N8N estabelecida com sucesso' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          const errorText = await response.text();
          console.error('N8N connection failed:', response.status, errorText);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Falha na conexão: ${response.status} - Verifique a URL e API Key` 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (fetchError) {
        console.error('N8N fetch error:', fetchError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Não foi possível conectar ao N8N. Verifique se a URL está correta e acessível.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (action === 'trigger') {
      // Trigger N8N webhook
      const { webhookUrl, payload } = body;
      
      if (!webhookUrl) {
        return new Response(
          JSON.stringify({ success: false, error: 'URL do webhook é obrigatória' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Triggering N8N webhook: ${webhookUrl}`);

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...payload,
            timestamp: new Date().toISOString(),
            userId: user.id
          })
        });

        if (response.ok) {
          const responseData = await response.json().catch(() => ({}));
          console.log('N8N webhook triggered successfully');
          return new Response(
            JSON.stringify({ success: true, data: responseData }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          console.error('N8N webhook trigger failed:', response.status);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Webhook retornou erro: ${response.status}` 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (fetchError) {
        console.error('N8N webhook error:', fetchError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Não foi possível acionar o webhook N8N.' 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Ação inválida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('N8N integration error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
