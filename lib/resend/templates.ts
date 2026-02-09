/**
 * Email templates for payment confirmations
 */

export interface PaymentConfirmationEmailData {
  customerEmail: string;
  customerName?: string;
  productName: string;
  amount: number; // in cents
  currency: string;
  purchaseDate: string;
  isEarlyAccess?: boolean;
}

/**
 * Generate HTML email template for payment confirmation
 */
export function getPaymentConfirmationEmailHtml(data: PaymentConfirmationEmailData): string {
  const amountInEuros = (data.amount / 100).toFixed(2);
  const purchaseDateFormatted = new Date(data.purchaseDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation - Abdu Academy</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Abdu Academy</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h2 style="color: #333; margin-top: 0; font-size: 24px;">Payment Confirmed!</h2>
    
    <p style="color: #666; font-size: 16px;">
      Hi${data.customerName ? ` ${data.customerName}` : ''},
    </p>
    
    <p style="color: #666; font-size: 16px;">
      Thank you for your purchase! Your payment has been successfully processed.
    </p>
    
    <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
      <h3 style="color: #333; margin-top: 0; font-size: 18px;">Purchase Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666;">Product:</td>
          <td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right;">${data.productName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Amount:</td>
          <td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right;">€${amountInEuros}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Date:</td>
          <td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right;">${purchaseDateFormatted}</td>
        </tr>
      </table>
    </div>
    
    ${data.isEarlyAccess ? `
    <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #856404; font-size: 14px;">
        <strong>🎉 Early Access Member!</strong> You're one of the first to join. Thank you for your support!
      </p>
    </div>
    ` : ''}
    
    <div style="margin: 40px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/course/dashboard" 
         style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 16px;">
        Access Your Course
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px; margin-top: 40px;">
      If you have any questions or need assistance, please don't hesitate to reach out to our support team.
    </p>
    
    <p style="color: #666; font-size: 14px;">
      Best regards,<br>
      <strong>The Abdu Academy Team</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
    <p>This is an automated email. Please do not reply directly to this message.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text email template for payment confirmation
 */
export function getPaymentConfirmationEmailText(data: PaymentConfirmationEmailData): string {
  const amountInEuros = (data.amount / 100).toFixed(2);
  const purchaseDateFormatted = new Date(data.purchaseDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
Payment Confirmed - Abdu Academy

Hi${data.customerName ? ` ${data.customerName}` : ''},

Thank you for your purchase! Your payment has been successfully processed.

Purchase Details:
- Product: ${data.productName}
- Amount: €${amountInEuros}
- Date: ${purchaseDateFormatted}
${data.isEarlyAccess ? '\n🎉 Early Access Member! You\'re one of the first to join. Thank you for your support!' : ''}

Access your course: ${process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'}/course/dashboard

If you have any questions or need assistance, please don't hesitate to reach out to our support team.

Best regards,
The Abdu Academy Team

---
This is an automated email. Please do not reply directly to this message.
  `.trim();
}
