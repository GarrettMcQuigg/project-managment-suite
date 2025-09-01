import { getInvoicePaymentEmail } from './templates/client-invoice.template';

interface SendInvoicePaymentEmailParams {
  to: string;
  invoiceNumber: string;
  projectName?: string;
  amount: string;
  dueDate: string;
  paymentLink: string;
  companyName: string;
  clientName: string;
  notes?: string;
}

class EmailService {
  private apiKey: string;
  private domain: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.MAILGUN_API_KEY!;
    this.domain = process.env.MAILGUN_DOMAIN || process.env.MAILGUN_SANDBOX_DOMAIN!;
    this.baseUrl = process.env.MAILGUN_BASE_URL!;
  }

  async send(from: string, to: string, subject: string, text: string, html: string): Promise<Error | null> {
    try {
      console.log('Mailgun config:', {
        baseUrl: this.baseUrl,
        domain: this.domain,
        hasApiKey: !!this.apiKey
      });

      const url = `${this.baseUrl}/v3/${this.domain}/messages`;
      console.log('Sending to URL:', url);

      const formData = new FormData();
      formData.append('from', from);
      formData.append('to', to);
      formData.append('subject', subject);
      formData.append('text', text);
      formData.append('html', html);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${this.apiKey}`).toString('base64')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Mailgun response:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`Mailgun API error: ${response.status} ${errorText}`);
      }

      return null;
    } catch (err: any) {
      console.error('Error sending email:', err);
      return err;
    }
  }

  // TODO : Test this once Mailgun is set up
  async sendInvoicePaymentEmail(params: SendInvoicePaymentEmailParams): Promise<Error | null> {
    try {
      const { subject, text, html } = getInvoicePaymentEmail(params);

      // Use a no-reply email from your Mailgun domain
      const from = `"${params.companyName}" <noreply@${this.domain}>`;

      console.log(`Sending invoice payment email to: ${params.to}`);
      console.log(`Invoice #: ${params.invoiceNumber}`);
      console.log(`Payment Link: ${params.paymentLink}`);

      return await this.send(from, params.to, subject, text, html);
    } catch (err: any) {
      console.error('Error in sendInvoicePaymentEmail:', err);
      return err;
    }
  }
}

export default EmailService;
