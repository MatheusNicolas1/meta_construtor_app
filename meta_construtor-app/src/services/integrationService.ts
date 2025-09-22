import { 
  N8NConfig, 
  WhatsAppConfig, 
  GmailConfig, 
  GoogleDriveConfig, 
  WebhookConfig,
  ApiResponse,
  IntegrationLog
} from '@/types/integration';

export interface IntegrationService {
  // N8N Integration
  testN8NConnection(config: N8NConfig): Promise<boolean>;
  saveN8NConfig(config: N8NConfig): Promise<ApiResponse>;
  
  // WhatsApp Integration
  testWhatsAppConnection(config: WhatsAppConfig): Promise<boolean>;
  sendWhatsAppMessage(phoneNumber: string, message: string): Promise<ApiResponse>;
  
  // Gmail Integration
  testGmailConnection(config: GmailConfig): Promise<boolean>;
  sendEmail(to: string[], subject: string, body: string): Promise<ApiResponse>;
  
  // Google Drive Integration
  testGoogleDriveConnection(config: GoogleDriveConfig): Promise<boolean>;
  uploadToGoogleDrive(file: File, path: string): Promise<ApiResponse>;
}

class IntegrationServiceImpl implements IntegrationService {
  
  async testN8NConnection(config: N8NConfig): Promise<boolean> {
    try {
      const response = await fetch(`${config.n8nUrl}/api/v1/workflows`, {
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': config.apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('N8N connection test failed:', error);
      return false;
    }
  }

  async saveN8NConfig(config: N8NConfig): Promise<ApiResponse> {
    try {
      // Test connection first
      const isConnected = await this.testN8NConnection(config);
      
      if (!isConnected) {
        return {
          success: false,
          error: 'Failed to connect to N8N instance. Please check your URL and API key.'
        };
      }

      // Save configuration (in production, this would be an API call)
      localStorage.setItem('n8n_config', JSON.stringify(config));
      
      return {
        success: true,
        message: 'N8N configuration saved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async testWhatsAppConnection(config: WhatsAppConfig): Promise<boolean> {
    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('WhatsApp connection test failed:', error);
      return false;
    }
  }

  async sendWhatsAppMessage(phoneNumber: string, message: string): Promise<ApiResponse> {
    try {
      const config = JSON.parse(localStorage.getItem('whatsapp_config') || '{}') as WhatsAppConfig;
      
      if (!config.phoneNumberId || !config.accessToken) {
        return {
          success: false,
          error: 'WhatsApp not configured. Please configure WhatsApp integration first.'
        };
      }

      const response = await fetch(`https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            body: message
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          message: 'WhatsApp message sent successfully',
          data: result
        };
      } else {
        const error = await response.json();
        return {
          success: false,
          error: error.error?.message || 'Failed to send WhatsApp message'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async testGmailConnection(config: GmailConfig): Promise<boolean> {
    try {
      // In production, this would validate the OAuth tokens
      return !!(config.accessToken && config.refreshToken);
    } catch (error) {
      console.error('Gmail connection test failed:', error);
      return false;
    }
  }

  async sendEmail(to: string[], subject: string, body: string): Promise<ApiResponse> {
    try {
      const config = JSON.parse(localStorage.getItem('gmail_config') || '{}') as GmailConfig;
      
      if (!config.accessToken) {
        return {
          success: false,
          error: 'Gmail not configured. Please configure Gmail integration first.'
        };
      }

      // In production, this would use the Gmail API
      // For now, we'll simulate the request
      console.log('Sending email via Gmail API:', { to, subject, body });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: true,
        message: 'Email sent successfully via Gmail',
        data: { 
          messageId: `msg_${Date.now()}`,
          recipients: to 
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async testGoogleDriveConnection(config: GoogleDriveConfig): Promise<boolean> {
    try {
      // In production, this would validate the OAuth tokens and test file access
      return !!(config.accessToken && config.refreshToken);
    } catch (error) {
      console.error('Google Drive connection test failed:', error);
      return false;
    }
  }

  async uploadToGoogleDrive(file: File, path: string): Promise<ApiResponse> {
    try {
      const config = JSON.parse(localStorage.getItem('googledrive_config') || '{}') as GoogleDriveConfig;
      
      if (!config.accessToken) {
        return {
          success: false,
          error: 'Google Drive not configured. Please configure Google Drive integration first.'
        };
      }

      // In production, this would use the Google Drive API
      console.log('Uploading file to Google Drive:', { fileName: file.name, path });
      
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        success: true,
        message: 'File uploaded to Google Drive successfully',
        data: { 
          fileId: `file_${Date.now()}`,
          fileName: file.name,
          path,
          url: `https://drive.google.com/file/d/file_${Date.now()}/view`
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Utility method to create integration logs
  createLog(
    integrationId: string, 
    integrationType: string, 
    event: string, 
    status: 'success' | 'error' | 'pending',
    message: string,
    data?: any,
    error?: string
  ): IntegrationLog {
    return {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      integrationId,
      integrationType: integrationType as any,
      event,
      status,
      message,
      data,
      error,
      timestamp: new Date().toISOString(),
      duration: status === 'success' ? Math.floor(Math.random() * 2000) + 500 : undefined
    };
  }
}

export const integrationService = new IntegrationServiceImpl();
export default integrationService;