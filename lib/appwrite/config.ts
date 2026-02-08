import { Client, Account, Databases } from 'appwrite';
import { Client as ServerClient, Databases as ServerDatabases } from 'node-appwrite';

if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
  throw new Error('NEXT_PUBLIC_APPWRITE_ENDPOINT is not set');
}

if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID) {
  throw new Error('NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set');
}

// Client-side Appwrite client (for browser)
export const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

// Server-side Appwrite client (with API key) - using node-appwrite
export function getServerClient() {
  if (!process.env.APPWRITE_API_KEY) {
    throw new Error('APPWRITE_API_KEY is not set');
  }

  const serverClient = new ServerClient()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY);

  return serverClient;
}

// Client-side services
export const account = new Account(client);
export const databases = new Databases(client);

// Database ID - must match the database created in Appwrite
export const DATABASE_ID = 'abdu-academy-db';

// Collection IDs (will be created by setup script)
export const COLLECTIONS = {
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
