// ============================================================
// WhatsApp Business Cloud API — Service Layer
// Ready for Meta WhatsApp Cloud API integration
// ============================================================

interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  businessAccountId: string;
  webhookVerifyToken: string;
}

interface WhatsAppTemplate {
  name: string;
  language: string;
  components: {
    type: 'header' | 'body' | 'footer' | 'buttons';
    parameters: { type: string; text?: string }[];
  }[];
}

interface SendMessageParams {
  to: string;
  template: string;
  parameters?: Record<string, string>;
}

// WhatsApp API base URL
const WA_API_BASE = 'https://graph.facebook.com/v18.0';

class WhatsAppService {
  private config: WhatsAppConfig | null = null;
  private initialized = false;

  /**
   * Initialize the WhatsApp service with Meta API credentials
   * Call this during app startup from Settings
   */
  initialize(config: WhatsAppConfig): void {
    this.config = config;
    this.initialized = true;
    console.log('[WhatsApp] Service initialized with Phone ID:', config.phoneNumberId);
  }

  isInitialized(): boolean {
    return this.initialized && !!this.config;
  }

  /**
   * Send a template message to a lead
   */
  async sendTemplateMessage(params: SendMessageParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isInitialized() || !this.config) {
      return this._mockSend(params);
    }

    try {
      const response = await fetch(
        `${WA_API_BASE}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: params.to,
            type: 'template',
            template: {
              name: params.template,
              language: { code: 'en' },
              components: params.parameters
                ? [
                    {
                      type: 'body',
                      parameters: Object.entries(params.parameters).map(([_, value]) => ({
                        type: 'text',
                        text: value,
                      })),
                    },
                  ]
                : [],
            },
          }),
        }
      );

      const data = await response.json();
      if (data.messages?.[0]?.id) {
        return { success: true, messageId: data.messages[0].id };
      }
      return { success: false, error: data.error?.message || 'Unknown error' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a text message
   */
  async sendTextMessage(to: string, text: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isInitialized() || !this.config) {
      return this._mockSend({ to, template: 'text', parameters: { text } });
    }

    try {
      const response = await fetch(
        `${WA_API_BASE}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to,
            type: 'text',
            text: { body: text },
          }),
        }
      );

      const data = await response.json();
      if (data.messages?.[0]?.id) {
        return { success: true, messageId: data.messages[0].id };
      }
      return { success: false, error: data.error?.message || 'Unknown error' };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ============================================================
  // Pre-built template senders (for automation workflows)
  // ============================================================

  async sendWelcomeMessage(leadName: string, phone: string): Promise<void> {
    await this.sendTemplateMessage({
      to: phone,
      template: 'welcome_property_inquiry',
      parameters: { name: leadName },
    });
  }

  async sendBrochureLink(leadName: string, phone: string, projectName: string, brochureUrl: string): Promise<void> {
    await this.sendTemplateMessage({
      to: phone,
      template: 'property_brochure',
      parameters: { name: leadName, project: projectName, brochure_url: brochureUrl },
    });
  }

  async sendSiteVisitConfirmation(leadName: string, phone: string, date: string, time: string, address: string): Promise<void> {
    await this.sendTemplateMessage({
      to: phone,
      template: 'site_visit_confirmed',
      parameters: { name: leadName, date, time, address },
    });
  }

  async sendFollowUpReminder(leadName: string, phone: string): Promise<void> {
    await this.sendTemplateMessage({
      to: phone,
      template: 'follow_up_reminder',
      parameters: { name: leadName },
    });
  }

  // ============================================================
  // Mock sender for development
  // ============================================================

  private async _mockSend(params: SendMessageParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('[WhatsApp Mock] Sending to:', params.to);
    console.log('[WhatsApp Mock] Template:', params.template);
    console.log('[WhatsApp Mock] Parameters:', params.parameters);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      messageId: `mock_${Date.now()}`,
    };
  }
}

export const whatsappService = new WhatsAppService();

// ============================================================
// Automated Workflow Triggers (call these from hooks/services)
// ============================================================

export async function triggerWhatsAppWorkflow(lead: { name: string; phone: string; source?: string }): Promise<void> {
  if (!whatsappService.isInitialized()) {
    console.log('[WhatsApp Workflow] Service not initialized. Skipping automated message.');
    return;
  }

  // Send welcome message for new leads
  await whatsappService.sendWelcomeMessage(lead.name, lead.phone);

  // If WhatsApp source, send immediate brochure
  if (lead.source === 'whatsapp') {
    await whatsappService.sendBrochureLink(lead.name, lead.phone, 'Premium Properties', 'https://leadluxe.ai/brochure');
  }
}

export async function triggerVisitReminder(lead: { name: string; phone: string }, visit: { date: string; time: string; address?: string }): Promise<void> {
  if (!whatsappService.isInitialized()) return;

  await whatsappService.sendSiteVisitConfirmation(
    lead.name,
    lead.phone,
    visit.date,
    visit.time,
    visit.address || 'Our Showroom'
  );
}

export async function triggerFollowUp(lead: { name: string; phone: string }): Promise<void> {
  if (!whatsappService.isInitialized()) return;

  await whatsappService.sendFollowUpReminder(lead.name, lead.phone);
}
