/**
 * Script to add missed early access payments by email
 * 
 * Usage:
 *   npx tsx scripts/add-missed-payments.ts
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const projectRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

const { Client, Databases, Query, ID } = require('node-appwrite');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = 'abdu-academy-db';

// ============================================
// CONFIGURE THE EMAIL ADDRESSES HERE
// ============================================
const MISSED_PAYMENT_EMAILS = [
  'kostantinoskofteros@gmail.com',
  'nikolas.papp1@icloud.com',
];

const EARLY_ACCESS_PRICE = 1999; // €19.99 in cents

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

async function addEarlyAccessPayment(userId: string, userEmail: string) {
  const paymentId = ID.unique();
  const now = new Date().toISOString();

  try {
    // Check if payment already exists
    const existingPayments = await databases.listDocuments(
      DATABASE_ID,
      'payments',
      [
        Query.equal('userId', userId),
        Query.equal('productId', 'early-access'),
        Query.equal('status', 'completed'),
      ]
    );

    if (existingPayments.total > 0) {
      console.log(`⏭️  Payment already exists for ${userEmail}, skipping...`);
      return { success: false, reason: 'already_exists' };
    }

    // Create payment record
    await databases.createDocument(
      DATABASE_ID,
      'payments',
      ID.unique(),
      {
        paymentId,
        userId,
        productId: 'early-access',
        stripeSessionId: `manual_missed_${paymentId}`,
        stripePaymentIntentId: null,
        amount: EARLY_ACCESS_PRICE,
        discountAmount: 0,
        affiliateCode: null,
        affiliateUserId: null,
        status: 'completed',
        createdAt: now,
        completedAt: now,
      }
    );

    console.log(`✅ Created payment for user: ${userEmail} (${userId})`);
    return { success: true };
  } catch (error: any) {
    console.error(`❌ Failed to create payment for ${userEmail}:`, error.message);
    return { success: false, reason: error.message };
  }
}

async function updateUserAccess(userDoc: any) {
  try {
    const now = new Date().toISOString();
    
    // Update user access
    await databases.updateDocument(
      DATABASE_ID,
      'users',
      userDoc.$id,
      {
        hasAccess: true,
        isEarlyAccess: true,
        purchaseDate: userDoc.purchaseDate || now,
        updatedAt: now,
      }
    );

    console.log(`✅ Updated access for user: ${userDoc.email} (${userDoc.userId})`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to update user ${userDoc.email}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Adding missed early access payments...\n');

  if (MISSED_PAYMENT_EMAILS.length === 0) {
    console.log('⚠️  No email addresses configured!');
    return;
  }

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const email of MISSED_PAYMENT_EMAILS) {
    console.log(`\n📧 Processing: ${email}`);
    
    // Find user by email
    const userDoc = await findUserByEmail(email);
    
    if (!userDoc) {
      console.error(`❌ User not found with email: ${email}`);
      errorCount++;
      continue;
    }

    console.log(`   Found user: ${userDoc.name || 'N/A'} (${userDoc.userId})`);

    // Add payment
    const paymentResult = await addEarlyAccessPayment(userDoc.userId, email);
    
    if (paymentResult.reason === 'already_exists') {
      skippedCount++;
    } else if (paymentResult.success) {
      // Update user access
      await updateUserAccess(userDoc);
      successCount++;
    } else {
      errorCount++;
    }
  }

  // Show final count
  console.log('\n\n📊 Final Results:');
  console.log(`✅ Successfully added: ${successCount}`);
  console.log(`⏭️  Skipped (already exists): ${skippedCount}`);
  console.log(`❌ Errors: ${errorCount}`);

  console.log('\n📊 Checking final count...\n');
  
  const earlyAccessPayments = await databases.listDocuments(
    DATABASE_ID,
    'payments',
    [
      Query.equal('productId', 'early-access'),
      Query.equal('status', 'completed'),
    ]
  );

  const totalSold = earlyAccessPayments.total;
  const remaining = Math.max(0, 30 - totalSold);

  console.log(`\n💰 Early Access Payments: ${totalSold}`);
  console.log(`🎫 Remaining Spots: ${remaining}`);
  console.log(`📈 Counter will now show: ${remaining} spots left\n`);
}

main()
  .then(() => {
    console.log('✨ Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
