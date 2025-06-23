
import { Contract } from '../../types/api';

export class WebhookService {
  private readonly financeFlowWebhookUrl = process.env.FINANCEFLOW_WEBHOOK_URL;
  private readonly webhookSecret = process.env.WEBHOOK_SECRET;

  async notifyContractSent(contract: Contract): Promise<void> {
    try {
      await this.sendWebhook('contract.sent', {
        contract_id: contract.id,
        user_id: contract.user_id,
        client_id: contract.client_id,
        title: contract.title,
        value: contract.value,
        sent_at: contract.sent_at,
        expires_at: contract.expires_at,
      });
    } catch (error) {
      console.error('Error sending contract.sent webhook:', error);
    }
  }

  async notifyContractSigned(contract: Contract): Promise<void> {
    try {
      await this.sendWebhook('contract.signed', {
        contract_id: contract.id,
        user_id: contract.user_id,
        client_id: contract.client_id,
        title: contract.title,
        value: contract.value,
        signed_at: contract.signed_at,
        signer_name: contract.signature_data?.signer_name,
        signer_email: contract.signature_data?.signer_email,
      });
    } catch (error) {
      console.error('Error sending contract.signed webhook:', error);
    }
  }

  async notifyContractExpired(contract: Contract): Promise<void> {
    try {
      await this.sendWebhook('contract.expired', {
        contract_id: contract.id,
        user_id: contract.user_id,
        client_id: contract.client_id,
        title: contract.title,
        expires_at: contract.expires_at,
      });
    } catch (error) {
      console.error('Error sending contract.expired webhook:', error);
    }
  }

  private async sendWebhook(eventType: string, data: any): Promise<void> {
    if (!this.financeFlowWebhookUrl) {
      console.warn('FinanceFlow webhook URL not configured');
      return;
    }

    const payload = {
      event: eventType,
      timestamp: new Date().toISOString(),
      data,
    };

    const signature = this.generateWebhookSignature(JSON.stringify(payload));

    const response = await fetch(this.financeFlowWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ContratPro-Signature': signature,
        'User-Agent': 'ContratPro-Webhook/1.0',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }
  }

  private generateWebhookSignature(payload: string): string {
    if (!this.webhookSecret) return '';

    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
  }

  async validateIncomingWebhook(payload: string, signature: string): Promise<boolean> {
    if (!this.webhookSecret || !signature) return false;

    const expectedSignature = this.generateWebhookSignature(payload);
    const crypto = require('crypto');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }
}

export const webhookService = new WebhookService();
