/**
 * Script to send confirmation emails to existing subscribers
 * 
 * Usage:
 *   npx tsx scripts/send-confirmation-emails.ts
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const projectRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = 'abdu-academy-db';

// Import Resend (we'll use dynamic import since it's ESM)
async function sendEmail(email: string, name: string | undefined, amount: number, purchaseDate: string) {
  try {
    // Dynamic import for Resend (ESM module)
    const { Resend } = await import('resend');
    
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const DEFAULT_FROM_EMAIL = 'Abdu Academy <noreply@zeropoint.company>';

    const amountInEuros = (amount / 100).toFixed(2);
    const purchaseDateFormatted = new Date(purchaseDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Generate HTML email
    const html = `
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
                Hi${name ? ` ${name}` : ''},
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
                    <td style="padding: 8px 0; color: #333; font-weight: 600; text-align: right; font-size: 14px;">Early Access - Abdu Academy</td>
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
              
              <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 0 0 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                  <strong>🎉 Early Access Member!</strong> You're one of the first to join. Thank you for your support!
                </p>
              </div>
              
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

    const text = `
Payment Confirmed - Abdu Academy

Hi${name ? ` ${name}` : ''},

Thank you for your purchase! Your payment has been successfully processed.

Purchase Details:
- Product: Early Access - Abdu Academy
- Amount: €${amountInEuros}
- Date: ${purchaseDateFormatted}

🎉 Early Access Member! You're one of the first to join. Thank you for your support!

You can now access your course by logging into your account.

If you have any questions or need assistance, please don't hesitate to reach out to our support team.

Best regards,
The Abdu Academy Team

---
This is an automated email. Please do not reply directly to this message.
    `.trim();

    const result = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: email,
      subject: 'Payment Confirmed - Early Access - Abdu Academy',
      html,
      text,
    });

    if (result.error) {
      throw new Error(result.error.message || 'Failed to send email');
    }

    return { success: true, emailId: result.data?.id };
  } catch (error: any) {
    throw error;
  }
}

// ============================================
// CONFIGURE THE EMAIL ADDRESSES HERE
// ============================================
const SUBSCRIBER_EMAILS = [
  'kostantinoskofteros@gmail.com',
  'nikolas.papp1@icloud.com',
  'mustafadawod2018@gmail.com',
  'iasonasviolaris@gmail.com',
  'sajad2001@hotmail.no',
  'ant85@inbox.lv',
  'charichnguyen@hotmail.com',
  'paulosplakias@icloud.com',
];

async function findUserByEmail(email: string) {
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      'users',
      [Query.equal('email', email)]
    );

    if (result.documents.length === 0) {
      return null;
    }

    return result.documents[0];
  } catch (error: any) {
    console.error(`Error finding user by email ${email}:`, error.message);
    return null;
  }
}

async function findPaymentByEmail(email: string) {
  try {
    // First find user
    const userDoc = await findUserByEmail(email);
    if (!userDoc) {
      return null;
    }

    // Then find their payment
    const result = await databases.listDocuments(
      DATABASE_ID,
      'payments',
      [
        Query.equal('userId', userDoc.userId),
        Query.equal('productId', 'early-access'),
        Query.equal('status', 'completed'),
      ],
      [Query.orderDesc('createdAt'), Query.limit(1)]
    );

    if (result.documents.length === 0) {
      return null;
    }

    return {
      payment: result.documents[0],
      user: userDoc,
    };
  } catch (error: any) {
    console.error(`Error finding payment for ${email}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('📧 Sending confirmation emails to subscribers...\n');

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in environment variables');
    process.exit(1);
  }

  if (SUBSCRIBER_EMAILS.length === 0) {
    console.log('⚠️  No email addresses configured!');
    return;
  }

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ email: string; error: string }> = [];

  for (const email of SUBSCRIBER_EMAILS) {
    console.log(`\n📧 Processing: ${email}`);
    
    try {
      // Find user and payment
      const result = await findPaymentByEmail(email);
      
      if (!result) {
        console.error(`❌ User or payment not found for: ${email}`);
        errorCount++;
        errors.push({ email, error: 'User or payment not found' });
        continue;
      }

      const { user, payment } = result;
      console.log(`   Found user: ${user.name || 'N/A'} (${user.userId})`);
      console.log(`   Payment amount: €${(payment.amount / 100).toFixed(2)}`);
      console.log(`   Payment date: ${new Date(payment.createdAt).toLocaleDateString()}`);

      // Send email
      const emailResult = await sendEmail(
        email,
        user.name,
        payment.amount,
        payment.createdAt || payment.completedAt
      );

      if (emailResult.success) {
        console.log(`✅ Email sent successfully! (ID: ${emailResult.emailId})`);
        successCount++;
      }
    } catch (error: any) {
      console.error(`❌ Failed to send email to ${email}:`, error.message);
      errorCount++;
      errors.push({ email, error: error.message });
    }
  }

  // Show final results
  console.log('\n\n📊 Final Results:');
  console.log(`✅ Successfully sent: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ email, error }) => {
      console.log(`   - ${email}: ${error}`);
    });
  }

  console.log('\n✨ Script completed.');
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
