/**
 * Script to send release date change announcement to all paid customers
 * 
 * Usage:
 *   npx tsx scripts/send-release-date-announcement.ts
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

// Release date information
const NEW_RELEASE_DATE = 'Sunday, February 22, 2026';
const NEW_RELEASE_DATE_SHORT = 'February 22';

// Import Resend (we'll use dynamic import since it's ESM)
async function sendReleaseDateEmail(email: string, name: string | undefined) {
  try {
    // Dynamic import for Resend (ESM module)
    const { Resend } = await import('resend');
    
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set');
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const DEFAULT_FROM_EMAIL = 'Abdu Academy <noreply@zeropoint.company>';

    // Generate HTML email
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Important Update - Release Date Change - Abdu Academy</title>
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
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px; font-weight: 600;">Important Update: Release Date Change</h2>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Hi${name ? ` ${name}` : ''},
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We wanted to reach out to inform you of an important update regarding the release schedule.
              </p>
              
              <!-- Release Date Update Box -->
              <div style="background: #e7f3ff; border-left: 4px solid #2196F3; padding: 20px; margin: 0 0 30px 0; border-radius: 4px;">
                <h3 style="color: #1976D2; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">📅 Release Date Update</h3>
                <p style="margin: 0; color: #333; font-size: 16px; line-height: 1.6;">
                  The release has been moved to <strong style="color: #1976D2;">${NEW_RELEASE_DATE}</strong>.
                </p>
              </div>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We appreciate your patience and understanding as we work to ensure the best possible experience for you.
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                If you have any questions or concerns, please don't hesitate to reach out to our support team. We're here to help!
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
Important Update: Release Date Change - Abdu Academy

Hi${name ? ` ${name}` : ''},

We wanted to reach out to inform you of an important update regarding the release schedule.

📅 Release Date Update
The release has been moved to ${NEW_RELEASE_DATE}.

We appreciate your patience and understanding as we work to ensure the best possible experience for you.

If you have any questions or concerns, please don't hesitate to reach out to our support team. We're here to help!

Best regards,
The Abdu Academy Team

---
This is an automated email. Please do not reply directly to this message.
    `.trim();

    const result = await resend.emails.send({
      from: DEFAULT_FROM_EMAIL,
      to: email,
      subject: `Important Update: Release Date Changed to ${NEW_RELEASE_DATE_SHORT} - Abdu Academy`,
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

/**
 * Get all users who have completed payments
 */
async function getAllPaidCustomers() {
  try {
    // Get all completed payments
    const paymentsResult = await databases.listDocuments(
      DATABASE_ID,
      'payments',
      [
        Query.equal('status', 'completed'),
        Query.orderDesc('createdAt'),
      ]
    );

    if (paymentsResult.documents.length === 0) {
      console.log('⚠️  No completed payments found');
      return [];
    }

    console.log(`📊 Found ${paymentsResult.documents.length} completed payment(s)`);

    // Get unique user IDs
    const userIds = [...new Set(paymentsResult.documents.map((p: any) => p.userId))];
    console.log(`👥 Found ${userIds.length} unique customer(s)`);

    // Get user details for each user ID
    const customers: Array<{ email: string; name?: string; userId: string }> = [];
    const seenEmails = new Set<string>();

    for (const userId of userIds) {
      try {
        const usersResult = await databases.listDocuments(
          DATABASE_ID,
          'users',
          [Query.equal('userId', userId)]
        );

        if (usersResult.documents.length > 0) {
          const user = usersResult.documents[0];
          const email = user.email;

          // Skip if we've already processed this email (avoid duplicates)
          if (email && !seenEmails.has(email)) {
            seenEmails.add(email);
            customers.push({
              email,
              name: user.name || undefined,
              userId: user.userId,
            });
          }
        }
      } catch (error: any) {
        console.error(`⚠️  Error fetching user ${userId}:`, error.message);
      }
    }

    return customers;
  } catch (error: any) {
    console.error('❌ Error fetching paid customers:', error.message);
    throw error;
  }
}

async function main() {
  console.log('📧 Sending release date announcement to all paid customers...\n');
  console.log(`📅 New release date: ${NEW_RELEASE_DATE}\n`);

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in environment variables');
    process.exit(1);
  }

  try {
    // Get all paid customers
    const customers = await getAllPaidCustomers();

    if (customers.length === 0) {
      console.log('⚠️  No paid customers found to email');
      return;
    }

    console.log(`\n📧 Preparing to send emails to ${customers.length} customer(s)...\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ email: string; error: string }> = [];

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      console.log(`📧 Processing (${i + 1}/${customers.length}): ${customer.email}`);
      
      try {
        const emailResult = await sendReleaseDateEmail(
          customer.email,
          customer.name
        );

        if (emailResult.success) {
          console.log(`   ✅ Email sent successfully! (ID: ${emailResult.emailId})`);
          successCount++;
        }

        // Add delay to respect rate limit (2 requests per second = 500ms delay)
        // Add extra buffer to be safe
        if (i < customers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      } catch (error: any) {
        console.error(`   ❌ Failed to send email:`, error.message);
        errorCount++;
        errors.push({ email: customer.email, error: error.message });
        
        // If rate limited, wait longer before next attempt
        if (error.message.includes('rate limit') || error.message.includes('Too many requests')) {
          console.log(`   ⏳ Rate limit hit, waiting 2 seconds before continuing...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          // Still add small delay even on other errors
          await new Promise(resolve => setTimeout(resolve, 600));
        }
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
  } catch (error: any) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
