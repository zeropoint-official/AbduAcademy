/**
 * Fix attachmentUrls attribute to be an array
 * 
 * This script deletes the existing attachmentUrls attribute and recreates it as a string array
 * 
 * Usage:
 *   pnpm tsx scripts/fix-attachment-urls.ts
 */

import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables
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
  console.error('Missing required environment variables:');
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
const DATABASE_ID = 'abdu-academy-db';
const EPISODES_COLLECTION = 'episodes';

async function fixAttachmentUrls() {
  try {
    console.log('🔧 Fixing attachmentUrls attribute...\n');

    // Delete existing attribute
    try {
      await databases.deleteAttribute(DATABASE_ID, EPISODES_COLLECTION, 'attachmentUrls');
      console.log('✓ Deleted existing attachmentUrls attribute');
    } catch (error: any) {
      if (error.code === 404) {
        console.log('ℹ attachmentUrls attribute does not exist, will create new one');
      } else {
        throw error;
      }
    }

    // Wait a bit for deletion to propagate
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create new attribute as string array
    await databases.createStringAttribute(
      DATABASE_ID,
      EPISODES_COLLECTION,
      'attachmentUrls',
      500,
      false, // not required
      undefined, // no default
      true // array = true
    );

    console.log('✓ Created attachmentUrls as string array');
    console.log('\n✅ Fix completed successfully!');
  } catch (error: any) {
    console.error('❌ Error fixing attribute:', error.message);
    process.exit(1);
  }
}

fixAttachmentUrls();
