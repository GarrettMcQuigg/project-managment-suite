import nodemailer from 'nodemailer';
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
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.protonmail.ch',
      port: 587, // usually 587 for TLS/STARTTLS
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_AUTH_USER,
        pass: process.env.SMTP_AUTH_PASS
      },
      dkim: {
        domainName: 'solira.io', // TODO : update this to your domain name
        keySelector: 'default',
        privateKey: process.env.DKIM_PRIVATE_KEY!
      }
    });
  }

  async send(from: string, to: string, subject: string, text: string, html: string): Promise<Error | null> {
    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        text,
        html
      });

      return null;
    } catch (err: any) {
      console.error('Error sending email:', err);
      return err;
    }
  }

  // TODO : Test this once ProtonMail is set up
  async sendInvoicePaymentEmail(params: SendInvoicePaymentEmailParams): Promise<Error | null> {
    try {
      const { subject, text, html } = getInvoicePaymentEmail(params);
      
      // Use the SMTP auth user as the sender email
      const from = `"${params.companyName}" <${process.env.SMTP_AUTH_USER}>`;
      
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
