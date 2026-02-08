// Load environment variables using require() to ensure synchronous loading
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local first, then .env (so .env.local overrides .env)
const projectRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

// Verify required env vars
if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
  console.error('❌ Error: NEXT_PUBLIC_APPWRITE_ENDPOINT is not set');
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  console.error('❌ Error: NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set');
  process.exit(1);
}

if (!process.env.APPWRITE_API_KEY) {
  console.error('❌ Error: APPWRITE_API_KEY is not set');
  process.exit(1);
}

// Use node-appwrite directly to avoid config.ts import issues
const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const DATABASE_ID = 'abdu-academy-db';
const COLLECTION_ID = 'payments';

async function checkPayments() {
  try {
    console.log('🔍 Checking all payments...\n');

    // Get all payments (any status)
    const allPayments = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.orderDesc('createdAt')]
    );

    console.log(`Total payments in database: ${allPayments.total}\n`);

    if (allPayments.total === 0) {
      console.log('✅ No payments found in database.');
      return;
    }

    // Filter early access payments
    const earlyAccessPayments = allPayments.documents.filter(
      (p: any) => p.productId === 'early-access'
    );

    console.log(`Early access payments: ${earlyAccessPayments.length}\n`);

    // Display all payments
    allPayments.documents.forEach((payment: any, index: number) => {
      console.log(`${index + 1}. Payment ID: ${payment.paymentId}`);
      console.log(`   Product ID: ${payment.productId}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Amount: €${(payment.amount / 100).toFixed(2)}`);
      console.log(`   User ID: ${payment.userId}`);
      console.log(`   Created: ${new Date(payment.createdAt).toLocaleString()}`);
      console.log(`   Document ID: ${payment.$id}\n`);
    });

    // Check completed early access payments
    const completedEarlyAccess = earlyAccessPayments.filter(
      (p: any) => p.status === 'completed'
    );

    console.log(`\n📊 Summary:`);
    console.log(`   Total payments: ${allPayments.total}`);
    console.log(`   Early access payments: ${earlyAccessPayments.length}`);
    console.log(`   Completed early access: ${completedEarlyAccess.length}`);
    console.log(`   Remaining spots: ${30 - completedEarlyAccess.length}`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

checkPayments()
  .then(() => {
    console.log('\n✨ Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
