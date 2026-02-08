/**
 * Script to manually add early access payments
 * 
 * Usage:
 *   npx tsx scripts/add-early-access-payments.ts
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
// CONFIGURE THE USER IDS HERE
// ============================================
// Add the userId values of users who paid for early access
const EARLY_ACCESS_USER_IDS = [
  '6988cd96003049f1149b', // Iasonas violaris
  '6988cb4a0033b5fcef06', // Sajad
  '6988cab0000bd607bb78', // Antonina Jarocka
  '6988ca550000a6586a52', // Charich Paet
  '6988c9f0001bb593d607', // Paulos Plakias
];

const EARLY_ACCESS_PRICE = 1999; // €19.99 in cents

async function listAllUsers() {
  console.log('📋 Listing all users in the database:\n');
  
  try {
    const result = await databases.listDocuments(
      DATABASE_ID,
      'users',
      [Query.orderDesc('createdAt'), Query.limit(50)]
    );

    console.log(`Total users: ${result.total}\n`);
    
    result.documents.forEach((user: any, index: number) => {
      console.log(`${index + 1}. User ID: ${user.userId}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Has Access: ${user.hasAccess ? '✅' : '❌'}`);
      console.log(`   Early Access: ${user.isEarlyAccess ? '✅' : '❌'}`);
      console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
      console.log(`   Doc ID: ${user.$id}\n`);
    });

    return result.documents;
  } catch (error: any) {
    console.error('Error listing users:', error.message);
    return [];
  }
}

async function addEarlyAccessPayment(userId: string, userEmail: string) {
  const paymentId = ID.unique();
  const now = new Date().toISOString();

  try {
    // Create payment record
    await databases.createDocument(
      DATABASE_ID,
      'payments',
      ID.unique(),
      {
        paymentId,
        userId,
        productId: 'early-access',
        stripeSessionId: `manual_${paymentId}`,
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

    console.log(`✅ Created payment for user: ${userId}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to create payment for ${userId}:`, error.message);
    return false;
  }
}

async function updateUserAccess(userId: string) {
  try {
    // Find user document
    const result = await databases.listDocuments(
      DATABASE_ID,
      'users',
      [Query.equal('userId', userId)]
    );

    if (result.documents.length === 0) {
      console.error(`❌ User not found: ${userId}`);
      return false;
    }

    const userDoc = result.documents[0];

    // Update user access
    await databases.updateDocument(
      DATABASE_ID,
      'users',
      userDoc.$id,
      {
        hasAccess: true,
        isEarlyAccess: true,
        purchaseDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    console.log(`✅ Updated access for user: ${userId} (${userDoc.email})`);
    return true;
  } catch (error: any) {
    console.error(`❌ Failed to update user ${userId}:`, error.message);
    return false;
  }
}

async function main() {
  // First, list all users so you can identify the 4 who paid
  const users = await listAllUsers();

  if (EARLY_ACCESS_USER_IDS.length === 0) {
    console.log('\n⚠️  No user IDs configured!');
    console.log('\nTo add early access payments:');
    console.log('1. Look at the user list above');
    console.log('2. Identify the 4 users who paid for early access');
    console.log('3. Edit this script and add their userIds to EARLY_ACCESS_USER_IDS array');
    console.log('4. Run the script again\n');
    return;
  }

  console.log('\n🚀 Adding early access payments...\n');

  for (const userId of EARLY_ACCESS_USER_IDS) {
    // Find user email
    const user = users.find((u: any) => u.userId === userId);
    if (!user) {
      console.error(`❌ User not found in list: ${userId}`);
      continue;
    }

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
      console.log(`⏭️  Payment already exists for ${userId}, skipping...`);
      continue;
    }

    // Add payment
    await addEarlyAccessPayment(userId, user.email);
    
    // Update user access
    await updateUserAccess(userId);
  }

  // Show final count
  console.log('\n📊 Checking final count...\n');
  
  const earlyAccessPayments = await databases.listDocuments(
    DATABASE_ID,
    'payments',
    [
      Query.equal('productId', 'early-access'),
      Query.equal('status', 'completed'),
    ]
  );

  console.log(`Early access payments: ${earlyAccessPayments.total}`);
  console.log(`Remaining spots: ${30 - earlyAccessPayments.total}`);
}

main()
  .then(() => {
    console.log('\n✨ Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
