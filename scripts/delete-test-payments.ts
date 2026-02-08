/**
 * Script to delete test payments from Appwrite
 * 
 * Usage:
 *   npx tsx scripts/delete-test-payments.ts
 * 
 * This will delete all payments with productId 'early-access' and status 'completed'
 * You can modify the query filters below to target specific payments.
 */

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
  console.error('Make sure .env.local or .env file exists with the required variables.');
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

interface PaymentDocument {
  $id: string;
  paymentId: string;
  userId: string;
  productId: string;
  amount: number;
  status: string;
  createdAt: string;
}

async function deleteTestPayments() {
  try {
    console.log('🔍 Searching for test payments...\n');

    // Find all early access payments
    const result = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('productId', 'early-access'),
        Query.equal('status', 'completed'),
        Query.orderDesc('createdAt'),
      ]
    ) as { documents: PaymentDocument[]; total: number };

    console.log(`Found ${result.total} early access payment(s):\n`);

    if (result.total === 0) {
      console.log('✅ No test payments found to delete.');
      return;
    }

    // Display payments before deletion
    result.documents.forEach((payment, index) => {
      console.log(`${index + 1}. Payment ID: ${payment.paymentId}`);
      console.log(`   Amount: €${(payment.amount / 100).toFixed(2)}`);
      console.log(`   User ID: ${payment.userId}`);
      console.log(`   Created: ${new Date(payment.createdAt).toLocaleString()}`);
      console.log(`   Document ID: ${payment.$id}\n`);
    });

    // Confirm deletion
    console.log('⚠️  This will delete the above payment(s).');
    console.log('To proceed, modify this script and set CONFIRM_DELETE = true\n');

    const CONFIRM_DELETE = true; // Set to true to actually delete

    if (!CONFIRM_DELETE) {
      console.log('❌ Deletion cancelled. Set CONFIRM_DELETE = true to proceed.');
      return;
    }

    // Delete each payment
    let deletedCount = 0;
    for (const payment of result.documents) {
      try {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, payment.$id);
        console.log(`✅ Deleted payment: ${payment.paymentId}`);
        deletedCount++;
      } catch (error: any) {
        console.error(`❌ Failed to delete payment ${payment.paymentId}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully deleted ${deletedCount} of ${result.total} payment(s).`);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

// Run the script
deleteTestPayments()
  .then(() => {
    console.log('\n✨ Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
