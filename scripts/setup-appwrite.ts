/**
 * Appwrite Setup Script
 * 
 * This script sets up all required Appwrite collections, attributes, and indexes
 * for the payment and affiliate system.
 * 
 * Usage:
 *   pnpm tsx scripts/setup-appwrite.ts
 * 
 * Make sure to set these environment variables:
 *   NEXT_PUBLIC_APPWRITE_ENDPOINT
 *   NEXT_PUBLIC_APPWRITE_PROJECT_ID
 *   APPWRITE_API_KEY
 */

import { Client, Databases, ID, Permission, Role, Query, IndexType } from 'node-appwrite';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
// Support both ESM and CommonJS
let __dirname: string;
try {
  __dirname = dirname(fileURLToPath(import.meta.url));
} catch {
  __dirname = process.cwd();
}
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_APPWRITE_ENDPOINT:', ENDPOINT ? '✓' : '✗');
  console.error('   NEXT_PUBLIC_APPWRITE_PROJECT_ID:', PROJECT_ID ? '✓' : '✗');
  console.error('   APPWRITE_API_KEY:', API_KEY ? '✓' : '✗');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

// Database ID - create or get existing database
const DATABASE_NAME = 'abdu-academy-db';
const DATABASE_ID = 'abdu-academy-db'; // Fixed database ID

// Collection IDs
const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  PAYMENTS: 'payments',
  AFFILIATES: 'affiliates',
  AFFILIATE_REFERRALS: 'affiliate_referrals',
  PAYOUTS: 'payouts',
  CHAPTERS: 'chapters',
  EPISODES: 'episodes',
  LIVE_SESSIONS: 'live_sessions',
} as const;

// Helper to create or get collection
async function createOrGetCollection(name: string, collectionId: string) {
  try {
    const collection = await databases.getCollection(DATABASE_ID, collectionId);
    console.log(`✓ Collection "${name}" already exists`);
    return collection;
  } catch (error: any) {
    if (error.code === 404) {
      const collection = await databases.createCollection(
        DATABASE_ID,
        collectionId,
        name
      );
      console.log(`✓ Created collection "${name}"`);
      return collection;
    }
    throw error;
  }
}

// Helper to create attribute if it doesn't exist
async function createAttributeIfNotExists(
  collectionId: string,
  attributeId: string,
  type: string,
  size: number | null,
  required: boolean,
  array: boolean = false,
  defaultValue?: any
) {
  try {
    await databases.getAttribute(DATABASE_ID, collectionId, attributeId);
    console.log(`  ✓ Attribute "${attributeId}" already exists`);
  } catch (error: any) {
    if (error.code === 404) {
      let attribute;
      // In Appwrite 1.6.2, required attributes cannot have default values
      const useDefault = !required && defaultValue !== undefined;
      
      switch (type) {
        case 'string':
          attribute = await databases.createStringAttribute(
            DATABASE_ID,
            collectionId,
            attributeId,
            size!,
            required,
            useDefault ? defaultValue : undefined,
            array
          );
          break;
        case 'integer':
          attribute = await databases.createIntegerAttribute(
            DATABASE_ID,
            collectionId,
            attributeId,
            required,
            undefined, // min
            undefined, // max
            useDefault ? defaultValue : undefined,
            array
          );
          break;
        case 'boolean':
          attribute = await databases.createBooleanAttribute(
            DATABASE_ID,
            collectionId,
            attributeId,
            required,
            useDefault ? defaultValue : undefined,
            array
          );
          break;
        case 'datetime':
          attribute = await databases.createDatetimeAttribute(
            DATABASE_ID,
            collectionId,
            attributeId,
            required,
            useDefault ? defaultValue : undefined,
            array
          );
          break;
        default:
          throw new Error(`Unknown attribute type: ${type}`);
      }
      console.log(`  ✓ Created attribute "${attributeId}" (${type})`);
      return attribute;
    }
    throw error;
  }
}

// Helper to create index if it doesn't exist
async function createIndexIfNotExists(
  collectionId: string,
  key: string,
  type: IndexType,
  attributes: string[]
) {
  try {
    await databases.getIndex(DATABASE_ID, collectionId, key);
    console.log(`  ✓ Index "${key}" already exists`);
  } catch (error: any) {
    if (error.code === 404) {
      await databases.createIndex(
        DATABASE_ID,
        collectionId,
        key,
        type,
        attributes
      );
      console.log(`  ✓ Created index "${key}"`);
    } else {
      throw error;
    }
  }
}

async function setupCollections() {
  console.log('\n📦 Setting up collections...\n');

  // 1. Users collection
  console.log('1. Setting up "users" collection...');
  await createOrGetCollection('Users', COLLECTIONS.USERS);
  
  await createAttributeIfNotExists(COLLECTIONS.USERS, 'userId', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.USERS, 'email', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.USERS, 'name', 'string', 255, true);
  // Role: make it optional with default, or required without default
  await createAttributeIfNotExists(COLLECTIONS.USERS, 'role', 'string', 50, false);
  await createAttributeIfNotExists(COLLECTIONS.USERS, 'hasAccess', 'boolean', null, true, false, false);
  await createAttributeIfNotExists(COLLECTIONS.USERS, 'purchaseDate', 'datetime', null, false);
  await createAttributeIfNotExists(COLLECTIONS.USERS, 'affiliateCode', 'string', 50, false);
  await createAttributeIfNotExists(COLLECTIONS.USERS, 'createdAt', 'datetime', null, true);
  await createAttributeIfNotExists(COLLECTIONS.USERS, 'updatedAt', 'datetime', null, true);

  await createIndexIfNotExists(COLLECTIONS.USERS, 'idx_userId', 'unique' as IndexType, ['userId']);
  await createIndexIfNotExists(COLLECTIONS.USERS, 'idx_email', 'unique' as IndexType, ['email']);
  await createIndexIfNotExists(COLLECTIONS.USERS, 'idx_affiliateCode', 'unique' as IndexType, ['affiliateCode']);
  await createIndexIfNotExists(COLLECTIONS.USERS, 'idx_role', 'key' as IndexType, ['role']);

  // Set permissions: Users can read their own data, admins can read/write all
  // Note: In Appwrite 1.6.2, we use 'users' for user role, not 'user'
  await databases.updateCollection(
    DATABASE_ID,
    COLLECTIONS.USERS,
    'Users',
    [
      Permission.read(Role.users()),
      Permission.update(Role.users()),
      Permission.read(Role.any()), // Allow public read for now
    ],
    true, // documentSecurity
    true  // enabled
  );

  // 2. Products collection
  console.log('\n2. Setting up "products" collection...');
  await createOrGetCollection('Products', COLLECTIONS.PRODUCTS);
  
  await createAttributeIfNotExists(COLLECTIONS.PRODUCTS, 'productId', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.PRODUCTS, 'name', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.PRODUCTS, 'description', 'string', 2000, false);
  await createAttributeIfNotExists(COLLECTIONS.PRODUCTS, 'price', 'integer', null, true);
  await createAttributeIfNotExists(COLLECTIONS.PRODUCTS, 'stripePriceId', 'string', 255, false);
  await createAttributeIfNotExists(COLLECTIONS.PRODUCTS, 'stripeProductId', 'string', 255, false);
  await createAttributeIfNotExists(COLLECTIONS.PRODUCTS, 'isActive', 'boolean', null, true, false, true);
  await createAttributeIfNotExists(COLLECTIONS.PRODUCTS, 'createdAt', 'datetime', null, true);
  await createAttributeIfNotExists(COLLECTIONS.PRODUCTS, 'updatedAt', 'datetime', null, true);

  await createIndexIfNotExists(COLLECTIONS.PRODUCTS, 'idx_productId', 'unique' as IndexType, ['productId']);
  await createIndexIfNotExists(COLLECTIONS.PRODUCTS, 'idx_isActive', 'key' as IndexType, ['isActive']);

  // Permissions: Everyone can read, only admins can write
  await databases.updateCollection(
    DATABASE_ID,
    COLLECTIONS.PRODUCTS,
    'Products',
    [
      Permission.read(Role.any()),
      Permission.write(Role.users()), // Allow users to write for now (will be restricted via API)
    ],
    true, // documentSecurity
    true  // enabled
  );

  // 3. Payments collection
  console.log('\n3. Setting up "payments" collection...');
  await createOrGetCollection('Payments', COLLECTIONS.PAYMENTS);
  
  await createAttributeIfNotExists(COLLECTIONS.PAYMENTS, 'paymentId', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.PAYMENTS, 'userId', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.PAYMENTS, 'productId', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.PAYMENTS, 'stripeSessionId', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.PAYMENTS, 'stripePaymentIntentId', 'string', 255, false);
  await createAttributeIfNotExists(COLLECTIONS.PAYMENTS, 'amount', 'integer', null, true);
  await createAttributeIfNotExists(COLLECTIONS.PAYMENTS, 'discountAmount', 'integer', null, false, false, 0);
  await createAttributeIfNotExists(COLLECTIONS.PAYMENTS, 'affiliateCode', 'string', 50, false);
  await createAttributeIfNotExists(COLLECTIONS.PAYMENTS, 'affiliateUserId', 'string', 255, false);
  await createAttributeIfNotExists(COLLECTIONS.PAYMENTS, 'status', 'string', 50, true, false, 'pending');
  await createAttributeIfNotExists(COLLECTIONS.PAYMENTS, 'createdAt', 'datetime', null, true);
  await createAttributeIfNotExists(COLLECTIONS.PAYMENTS, 'completedAt', 'datetime', null, false);

  await createIndexIfNotExists(COLLECTIONS.PAYMENTS, 'idx_paymentId', 'unique' as IndexType, ['paymentId']);
  await createIndexIfNotExists(COLLECTIONS.PAYMENTS, 'idx_userId', 'key' as IndexType, ['userId']);
  await createIndexIfNotExists(COLLECTIONS.PAYMENTS, 'idx_stripeSessionId', 'unique' as IndexType, ['stripeSessionId']);
  await createIndexIfNotExists(COLLECTIONS.PAYMENTS, 'idx_status', 'key' as IndexType, ['status']);
  await createIndexIfNotExists(COLLECTIONS.PAYMENTS, 'idx_createdAt', 'key' as IndexType, ['createdAt']);

  // Permissions: Users can read their own, admins can read/write all
  await databases.updateCollection(
    DATABASE_ID,
    COLLECTIONS.PAYMENTS,
    'Payments',
    [
      Permission.read(Role.users()),
      Permission.write(Role.users()),
    ],
    true, // documentSecurity
    true  // enabled
  );

  // 4. Affiliates collection
  console.log('\n4. Setting up "affiliates" collection...');
  await createOrGetCollection('Affiliates', COLLECTIONS.AFFILIATES);
  
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATES, 'affiliateId', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATES, 'userId', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATES, 'code', 'string', 50, true);
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATES, 'totalEarnings', 'integer', null, true, false, 0);
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATES, 'totalReferrals', 'integer', null, true, false, 0);
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATES, 'pendingEarnings', 'integer', null, true, false, 0);
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATES, 'paidEarnings', 'integer', null, true, false, 0);
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATES, 'isActive', 'boolean', null, true, false, true);
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATES, 'createdAt', 'datetime', null, true);
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATES, 'updatedAt', 'datetime', null, true);

  await createIndexIfNotExists(COLLECTIONS.AFFILIATES, 'idx_affiliateId', 'unique' as IndexType, ['affiliateId']);
  await createIndexIfNotExists(COLLECTIONS.AFFILIATES, 'idx_userId', 'unique' as IndexType, ['userId']);
  await createIndexIfNotExists(COLLECTIONS.AFFILIATES, 'idx_code', 'unique' as IndexType, ['code']);

  // Permissions: Users can read their own, admins can read/write all
  await databases.updateCollection(
    DATABASE_ID,
    COLLECTIONS.AFFILIATES,
    'Affiliates',
    [
      Permission.read(Role.users()),
      Permission.update(Role.users()),
      Permission.write(Role.users()),
    ],
    true, // documentSecurity
    true  // enabled
  );

  // 5. Affiliate Referrals collection
  console.log('\n5. Setting up "affiliate_referrals" collection...');
  await createOrGetCollection('Affiliate Referrals', COLLECTIONS.AFFILIATE_REFERRALS);
  
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATE_REFERRALS, 'referralId', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATE_REFERRALS, 'affiliateId', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATE_REFERRALS, 'paymentId', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATE_REFERRALS, 'buyerUserId', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATE_REFERRALS, 'earnings', 'integer', null, true);
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATE_REFERRALS, 'status', 'string', 50, true, false, 'pending');
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATE_REFERRALS, 'paidAt', 'datetime', null, false);
  await createAttributeIfNotExists(COLLECTIONS.AFFILIATE_REFERRALS, 'createdAt', 'datetime', null, true);

  await createIndexIfNotExists(COLLECTIONS.AFFILIATE_REFERRALS, 'idx_referralId', 'unique' as IndexType, ['referralId']);
  await createIndexIfNotExists(COLLECTIONS.AFFILIATE_REFERRALS, 'idx_affiliateId', 'key' as IndexType, ['affiliateId']);
  await createIndexIfNotExists(COLLECTIONS.AFFILIATE_REFERRALS, 'idx_paymentId', 'unique' as IndexType, ['paymentId']);
  await createIndexIfNotExists(COLLECTIONS.AFFILIATE_REFERRALS, 'idx_status', 'key' as IndexType, ['status']);

  // Permissions: Affiliates can read their own referrals, admins can read/write all
  await databases.updateCollection(
    DATABASE_ID,
    COLLECTIONS.AFFILIATE_REFERRALS,
    'Affiliate Referrals',
    [
      Permission.read(Role.users()),
      Permission.write(Role.users()),
    ],
    true, // documentSecurity
    true  // enabled
  );

  // 6. Payouts collection
  console.log('\n6. Setting up "payouts" collection...');
  await createOrGetCollection('Payouts', COLLECTIONS.PAYOUTS);
  
  await createAttributeIfNotExists(COLLECTIONS.PAYOUTS, 'payoutId', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.PAYOUTS, 'affiliateId', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.PAYOUTS, 'referralId', 'string', 255, false); // Link to specific referral
  await createAttributeIfNotExists(COLLECTIONS.PAYOUTS, 'requestedBy', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.PAYOUTS, 'amount', 'integer', null, true);
  await createAttributeIfNotExists(COLLECTIONS.PAYOUTS, 'status', 'string', 50, true, false, 'requested');
  await createAttributeIfNotExists(COLLECTIONS.PAYOUTS, 'paymentMethod', 'string', 100, false);
  await createAttributeIfNotExists(COLLECTIONS.PAYOUTS, 'paymentDetails', 'string', 500, false);
  await createAttributeIfNotExists(COLLECTIONS.PAYOUTS, 'adminNotes', 'string', 1000, false);
  await createAttributeIfNotExists(COLLECTIONS.PAYOUTS, 'rejectionReason', 'string', 500, false);
  await createAttributeIfNotExists(COLLECTIONS.PAYOUTS, 'requestedAt', 'datetime', null, true);
  await createAttributeIfNotExists(COLLECTIONS.PAYOUTS, 'approvedAt', 'datetime', null, false);
  await createAttributeIfNotExists(COLLECTIONS.PAYOUTS, 'completedAt', 'datetime', null, false);

  await createIndexIfNotExists(COLLECTIONS.PAYOUTS, 'idx_payoutId', 'unique' as IndexType, ['payoutId']);
  await createIndexIfNotExists(COLLECTIONS.PAYOUTS, 'idx_affiliateId', 'key' as IndexType, ['affiliateId']);
  await createIndexIfNotExists(COLLECTIONS.PAYOUTS, 'idx_referralId', 'key' as IndexType, ['referralId']);
  await createIndexIfNotExists(COLLECTIONS.PAYOUTS, 'idx_status', 'key' as IndexType, ['status']);
  await createIndexIfNotExists(COLLECTIONS.PAYOUTS, 'idx_requestedAt', 'key' as IndexType, ['requestedAt']);

  // Permissions: Affiliates can read their own payouts, admins can read/write all
  await databases.updateCollection(
    DATABASE_ID,
    COLLECTIONS.PAYOUTS,
    'Payouts',
    [
      Permission.read(Role.users()),
      Permission.write(Role.users()),
    ],
    true, // documentSecurity
    true  // enabled
  );

  // 7. Chapters collection
  console.log('\n7. Setting up "chapters" collection...');
  await createOrGetCollection('Chapters', COLLECTIONS.CHAPTERS);
  
  await createAttributeIfNotExists(COLLECTIONS.CHAPTERS, 'title', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.CHAPTERS, 'description', 'string', 2000, true);
  await createAttributeIfNotExists(COLLECTIONS.CHAPTERS, 'order', 'integer', null, true);
  await createAttributeIfNotExists(COLLECTIONS.CHAPTERS, 'isLocked', 'boolean', null, true, false, false);
  await createAttributeIfNotExists(COLLECTIONS.CHAPTERS, 'createdAt', 'datetime', null, true);
  await createAttributeIfNotExists(COLLECTIONS.CHAPTERS, 'updatedAt', 'datetime', null, true);

  await createIndexIfNotExists(COLLECTIONS.CHAPTERS, 'idx_order', 'key' as IndexType, ['order']);

  // Permissions: Everyone can read, only admins can write (enforced via API)
  await databases.updateCollection(
    DATABASE_ID,
    COLLECTIONS.CHAPTERS,
    'Chapters',
    [
      Permission.read(Role.any()),
      Permission.write(Role.users()), // Restricted via API
    ],
    true, // documentSecurity
    true  // enabled
  );

  // 8. Episodes collection
  console.log('\n8. Setting up "episodes" collection...');
  await createOrGetCollection('Episodes', COLLECTIONS.EPISODES);
  
  await createAttributeIfNotExists(COLLECTIONS.EPISODES, 'chapterId', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.EPISODES, 'title', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.EPISODES, 'description', 'string', 2000, true);
  await createAttributeIfNotExists(COLLECTIONS.EPISODES, 'duration', 'string', 20, true);
  await createAttributeIfNotExists(COLLECTIONS.EPISODES, 'order', 'integer', null, true);
  await createAttributeIfNotExists(COLLECTIONS.EPISODES, 'isLocked', 'boolean', null, true, false, false);
  await createAttributeIfNotExists(COLLECTIONS.EPISODES, 'videoUrl', 'string', 500, false);
  await createAttributeIfNotExists(COLLECTIONS.EPISODES, 'thumbnailUrl', 'string', 500, false);
  await createAttributeIfNotExists(COLLECTIONS.EPISODES, 'attachmentUrls', 'string', 500, false, true);
  await createAttributeIfNotExists(COLLECTIONS.EPISODES, 'createdAt', 'datetime', null, true);
  await createAttributeIfNotExists(COLLECTIONS.EPISODES, 'updatedAt', 'datetime', null, true);

  await createIndexIfNotExists(COLLECTIONS.EPISODES, 'idx_chapterId', 'key' as IndexType, ['chapterId']);
  await createIndexIfNotExists(COLLECTIONS.EPISODES, 'idx_chapterId_order', 'key' as IndexType, ['chapterId', 'order']);
  await createIndexIfNotExists(COLLECTIONS.EPISODES, 'idx_order', 'key' as IndexType, ['order']);

  // Permissions: Everyone can read, only admins can write (enforced via API)
  await databases.updateCollection(
    DATABASE_ID,
    COLLECTIONS.EPISODES,
    'Episodes',
    [
      Permission.read(Role.any()),
      Permission.write(Role.users()), // Restricted via API
    ],
    true, // documentSecurity
    true  // enabled
  );

  // 9. Live Sessions collection
  console.log('\n9. Setting up "live_sessions" collection...');
  await createOrGetCollection('Live Sessions', COLLECTIONS.LIVE_SESSIONS);
  
  await createAttributeIfNotExists(COLLECTIONS.LIVE_SESSIONS, 'title', 'string', 255, true);
  await createAttributeIfNotExists(COLLECTIONS.LIVE_SESSIONS, 'description', 'string', 2000, false);
  await createAttributeIfNotExists(COLLECTIONS.LIVE_SESSIONS, 'scheduledAt', 'datetime', null, true);
  await createAttributeIfNotExists(COLLECTIONS.LIVE_SESSIONS, 'startedAt', 'datetime', null, false);
  await createAttributeIfNotExists(COLLECTIONS.LIVE_SESSIONS, 'endedAt', 'datetime', null, false);
  await createAttributeIfNotExists(COLLECTIONS.LIVE_SESSIONS, 'isLive', 'boolean', null, true, false, false);
  await createAttributeIfNotExists(COLLECTIONS.LIVE_SESSIONS, 'streamUrl', 'string', 500, false);
  await createAttributeIfNotExists(COLLECTIONS.LIVE_SESSIONS, 'joinUrl', 'string', 500, false);
  await createAttributeIfNotExists(COLLECTIONS.LIVE_SESSIONS, 'createdAt', 'datetime', null, true);
  await createAttributeIfNotExists(COLLECTIONS.LIVE_SESSIONS, 'updatedAt', 'datetime', null, true);

  await createIndexIfNotExists(COLLECTIONS.LIVE_SESSIONS, 'idx_scheduledAt', 'key' as IndexType, ['scheduledAt']);
  await createIndexIfNotExists(COLLECTIONS.LIVE_SESSIONS, 'idx_isLive', 'key' as IndexType, ['isLive']);

  // Permissions: Everyone can read, only admins can write (enforced via API)
  await databases.updateCollection(
    DATABASE_ID,
    COLLECTIONS.LIVE_SESSIONS,
    'Live Sessions',
    [
      Permission.read(Role.any()),
      Permission.write(Role.users()), // Restricted via API
    ],
    true, // documentSecurity
    true  // enabled
  );
}

async function createDefaultProduct() {
  console.log('\n💰 Creating default product...\n');
  
  try {
    const existing = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PRODUCTS,
      [Query.equal('productId', 'forex-course-full-access')]
    );

    if (existing.documents.length > 0) {
      console.log('✓ Default product already exists');
      return;
    }

    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PRODUCTS,
      ID.unique(),
      {
        productId: 'forex-course-full-access',
        name: 'Abdu Academy Forex Mastery Course - Full Access',
        description: 'Complete forex trading course with lifetime access',
        price: 39900, // €399 in cents
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    console.log('✓ Created default product (€399)');
  } catch (error: any) {
    console.error('✗ Error creating default product:', error.message);
  }
}

async function createOrGetDatabase() {
  try {
    const db = await databases.get(DATABASE_ID);
    console.log(`✓ Database "${DATABASE_NAME}" already exists`);
    return db;
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`📦 Creating database "${DATABASE_NAME}"...`);
      const db = await databases.create(DATABASE_ID, DATABASE_NAME);
      console.log(`✓ Created database "${DATABASE_NAME}"`);
      return db;
    }
    throw error;
  }
}

async function main() {
  console.log('🚀 Starting Appwrite setup...\n');
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Project ID: ${PROJECT_ID}\n`);

  try {
    // Create or get database first
    await createOrGetDatabase();
    console.log('');
    
    await setupCollections();
    await createDefaultProduct();
    
    console.log('\n✅ Setup completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Set up your admin user role in Appwrite console');
    console.log('2. Configure Stripe webhook endpoint');
    console.log('3. Test the payment flow\n');
  } catch (error: any) {
    console.error('\n❌ Setup failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
