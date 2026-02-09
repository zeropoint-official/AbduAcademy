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

  // Remove "TEST MODE" from product name if present
  const displayProductName = data.productName.replace(' (TEST MODE)', '').replace('TEST MODE', '').trim();
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Confirmation - Abdu Academy</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">Abdu Academy</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 30px 20px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">Payment Confirmed!</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi${data.customerName ? ` ${data.customerName}` : ''},
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for your purchase! Your payment has been successfully processed.
              </p>
              
              <!-- Purchase Details -->
              <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Purchase Details</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Product:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right; font-size: 14px;">${displayProductName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Amount:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right; font-size: 14px;">€${amountInEuros}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Date:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right; font-size: 14px;">${purchaseDateFormatted}</td>
                  </tr>
                </table>
              </div>
              
              ${data.isEarlyAccess ? `
              <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 0 0 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                  <strong>🎉 Early Access Member!</strong> You're one of the first to join. Thank you for your support!
                </p>
              </div>
              ` : ''}
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                You can now access your course by logging into your account.
              </p>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
                If you have any questions or need assistance, please don't hesitate to reach out to our support team.
              </p>
              
              <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
                Best regards,<br>
                <strong>The Abdu Academy Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="color: #999; font-size: 12px; margin: 0; line-height: 1.5;">
                This is an automated email. Please do not reply directly to this message.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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

  // Remove "TEST MODE" from product name if present
  const displayProductName = data.productName.replace(' (TEST MODE)', '').replace('TEST MODE', '').trim();

  return `
Payment Confirmed - Abdu Academy

Hi${data.customerName ? ` ${data.customerName}` : ''},

Thank you for your purchase! Your payment has been successfully processed.

Purchase Details:
- Product: ${displayProductName}
- Amount: €${amountInEuros}
- Date: ${purchaseDateFormatted}
${data.isEarlyAccess ? '\n🎉 Early Access Member! You\'re one of the first to join. Thank you for your support!' : ''}

You can now access your course by logging into your account.

If you have any questions or need assistance, please don't hesitate to reach out to our support team.

Best regards,
The Abdu Academy Team

---
This is an automated email. Please do not reply directly to this message.
  `.trim();
}
