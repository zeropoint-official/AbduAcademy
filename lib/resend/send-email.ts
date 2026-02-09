import { resend, DEFAULT_FROM_EMAIL } from './client';
import { getPaymentConfirmationEmailHtml, getPaymentConfirmationEmailText, type PaymentConfirmationEmailData } from './templates';

/**
 * Send payment confirmation email to customer
 * 
 * @param data - Payment confirmation email data
 * @returns Promise that resolves when email is sent
 */
export async function sendPaymentConfirmationEmail(
  data: PaymentConfirmationEmailData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate required fields
    if (!data.customerEmail) {
      throw new Error('Customer email is required');
    }

    if (!data.productName || !data.amount || !data.purchaseDate) {
      throw new Error('Missing required payment data');
    }

    // Generate email content
    const html = getPaymentConfirmationEmailHtml(data);
    const text = getPaymentConfirmationEmailText(data);

    // Send email via Resend
    const result = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: data.customerEmail,
      subject: `Payment Confirmed - ${data.productName}`,
      html,
      text,
    });

    if (result.error) {
      console.error('[Resend] Error sending payment confirmation email:', result.error);
      return {
        success: false,
        error: result.error.message || 'Failed to send email',
      };
    }

    console.log(`[Resend] Payment confirmation email sent successfully to ${data.customerEmail} (ID: ${result.data?.id})`);
    return { success: true };
  } catch (error: any) {
    console.error('[Resend] Exception sending payment confirmation email:', error);
    return {
      success: false,
      error: error.message || 'Unknown error sending email',
    };
  }
}
