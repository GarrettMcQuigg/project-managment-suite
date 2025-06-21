interface InvoiceEmailTemplateProps {
  invoiceNumber: string;
  projectName?: string;
  amount: string;
  dueDate: string;
  paymentLink: string;
  companyName: string;
  clientName: string;
  notes?: string;
}

export const getInvoicePaymentEmail = ({
  invoiceNumber,
  projectName,
  amount,
  dueDate,
  paymentLink,
  companyName,
  clientName,
  notes
}: InvoiceEmailTemplateProps) => {
  const subject = `Invoice #${invoiceNumber} - Payment Request`;
  
  const text = `
Hi ${clientName},

${projectName ? `Regarding your project "${projectName}", ` : ''}we've issued invoice #${invoiceNumber} in the amount of ${amount}.

Invoice Details:
- Invoice #: ${invoiceNumber}
${projectName ? `- Project: ${projectName}\n` : ''}- Amount Due: ${amount}
- Due Date: ${dueDate}
${notes ? `\nNotes: ${notes}\n` : ''}
You can view and pay your invoice by clicking the link below:
${paymentLink}

Thank you for your business!

Best regards,
${companyName}
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <div style="margin-bottom: 20px;">
        <h1 style="color: #333;">Invoice #${invoiceNumber}</h1>
      </div>
      
      <p>Hi ${clientName},</p>
      
      <p>${projectName ? `Regarding your project <strong>${projectName}</strong>, ` : ''}we've issued invoice #${invoiceNumber} in the amount of <strong>${amount}</strong>.</p>
      
      <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #4a90e2; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Invoice Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; width: 140px;">Invoice #:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${invoiceNumber}</td>
          </tr>
          ${projectName ? `
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Project:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${projectName}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">Amount Due:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">${amount}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">Due Date:</td>
            <td style="padding: 8px 0;">${dueDate}</td>
          </tr>
        </table>
        
        ${notes ? `
        <div style="margin-top: 15px; padding: 10px; background: #fff; border-radius: 4px;">
          <p style="margin: 0; font-style: italic;">${notes}</p>
        </div>
        ` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${paymentLink}" style="display: inline-block; background-color: #4a90e2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">Pay Invoice</a>
      </div>
      
      <p>Or copy and paste this link into your browser:<br>
      <a href="${paymentLink}" style="color: #4a90e2; word-break: break-all;">${paymentLink}</a></p>
      
      <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
      
      <p>Thank you for your business!</p>
      
      <p>Best regards,<br>
      ${companyName}</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
        <p>This is an automated message, please do not reply directly to this email.</p>
      </div>
    </div>
  `;

  return { subject, text, html };
};
