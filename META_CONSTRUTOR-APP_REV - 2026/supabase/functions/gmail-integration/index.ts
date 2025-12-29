import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GmailSendRequest {
  action: 'send' | 'test' | 'oauth-url' | 'oauth-callback';
  to?: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  body?: string;
  isHtml?: boolean;
  code?: string;
  redirectUri?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, to, cc, bcc, subject, body, isHtml, code, redirectUri }: GmailSendRequest = await req.json();

    // Get OAuth credentials from secrets
    const clientId = Deno.env.get('GMAIL_CLIENT_ID');
    const clientSecret = Deno.env.get('GMAIL_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      console.log('Gmail OAuth credentials not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Gmail integration not configured. Please add GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET secrets.',
          configured: false 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'oauth-url': {
        // Generate OAuth URL for user authorization
        const scopes = [
          'https://www.googleapis.com/auth/gmail.send',
          'https://www.googleapis.com/auth/gmail.readonly'
        ].join(' ');

        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${encodeURIComponent(clientId)}&` +
          `redirect_uri=${encodeURIComponent(redirectUri || '')}&` +
          `response_type=code&` +
          `scope=${encodeURIComponent(scopes)}&` +
          `access_type=offline&` +
          `prompt=consent`;

        return new Response(
          JSON.stringify({ success: true, oauthUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'oauth-callback': {
        // Exchange authorization code for tokens
        if (!code || !redirectUri) {
          return new Response(
            JSON.stringify({ error: 'Missing code or redirectUri' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          })
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
          console.error('OAuth token error:', tokenData);
          return new Response(
            JSON.stringify({ error: tokenData.error_description || 'Failed to exchange code' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Return tokens (in production, store these securely per user)
        return new Response(
          JSON.stringify({ 
            success: true, 
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresIn: tokenData.expires_in
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'test': {
        // Test connection by checking if credentials are configured
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Gmail integration is configured. OAuth flow required for full functionality.',
            configured: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'send': {
        // Note: Sending emails requires a valid access token obtained via OAuth
        // This is a placeholder - in production, retrieve user's stored tokens
        if (!to || !subject || !body) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields: to, subject, body' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('Gmail send request:', { to, subject, userId: user.id });
        
        // Placeholder response - actual implementation requires stored OAuth tokens
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Email sending requires OAuth authorization. Please complete the OAuth flow first.',
            requiresOAuth: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    console.error('Gmail integration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
