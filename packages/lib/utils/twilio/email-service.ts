import nodemailer from 'nodemailer';

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
        domainName: 'visiondeck.business', // TODO : update this to your domain name
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
      console.error('Error:', err);
      return err;
    }
  }
}

export default EmailService;
