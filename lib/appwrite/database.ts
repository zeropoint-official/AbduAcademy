import { ID, Query } from 'appwrite';
import { Databases as ServerDatabases } from 'node-appwrite';
import { getServerClient } from './config';
import { DATABASE_ID, COLLECTIONS } from './config';

// Cached at module scope so the same instance is reused within a serverless invocation
let _databases: ServerDatabases | null = null;

function getDatabases(): ServerDatabases {
  if (_databases) return _databases;
  const client = getServerClient();
  _databases = new ServerDatabases(client);
  return _databases;
}

// Generic CRUD helpers
export async function createDocument<T extends Record<string, any>>(
  collectionId: string,
  data: T,
  documentId?: string
) {
  const databases = getDatabases();
  return await databases.createDocument(
    DATABASE_ID,
    collectionId,
    documentId || ID.unique(),
    data
  );
}

export async function getDocument<T>(
  collectionId: string,
  documentId: string
): Promise<T> {
  const databases = getDatabases();
  return await databases.getDocument(
    DATABASE_ID,
    collectionId,
    documentId
  ) as T;
}

export async function listDocuments<T>(
  collectionId: string,
  queries: string[] = []
): Promise<{ documents: T[]; total: number }> {
  const databases = getDatabases();
  const response = await databases.listDocuments(
    DATABASE_ID,
    collectionId,
    queries
  );
  return {
    documents: response.documents as T[],
    total: response.total,
  };
}

export async function updateDocument<T extends Record<string, any>>(
  collectionId: string,
  documentId: string,
  data: Partial<T>
) {
  const databases = getDatabases();
  return await databases.updateDocument(
    DATABASE_ID,
    collectionId,
    documentId,
    data
  );
}

export async function deleteDocument(
  collectionId: string,
  documentId: string
) {
  const databases = getDatabases();
  return await databases.deleteDocument(
    DATABASE_ID,
    collectionId,
    documentId
  );
}

// Query helpers - export Query for use in other files
export { Query };

// Type-safe collection helpers
export const users = {
  create: <T extends Record<string, any>>(data: T, documentId?: string) =>
    createDocument(COLLECTIONS.USERS, data, documentId),
  get: <T>(documentId: string) => getDocument<T>(COLLECTIONS.USERS, documentId),
  list: <T>(queries: string[] = []) => listDocuments<T>(COLLECTIONS.USERS, queries),
  update: <T extends Record<string, any>>(documentId: string, data: Partial<T>) =>
    updateDocument(COLLECTIONS.USERS, documentId, data),
  delete: (documentId: string) => deleteDocument(COLLECTIONS.USERS, documentId),
};

export const products = {
  create: <T extends Record<string, any>>(data: T, documentId?: string) =>
    createDocument(COLLECTIONS.PRODUCTS, data, documentId),
  get: <T>(documentId: string) => getDocument<T>(COLLECTIONS.PRODUCTS, documentId),
  list: <T>(queries: string[] = []) => listDocuments<T>(COLLECTIONS.PRODUCTS, queries),
  update: <T extends Record<string, any>>(documentId: string, data: Partial<T>) =>
    updateDocument(COLLECTIONS.PRODUCTS, documentId, data),
  delete: (documentId: string) => deleteDocument(COLLECTIONS.PRODUCTS, documentId),
};

export const payments = {
  create: <T extends Record<string, any>>(data: T, documentId?: string) =>
    createDocument(COLLECTIONS.PAYMENTS, data, documentId),
  get: <T>(documentId: string) => getDocument<T>(COLLECTIONS.PAYMENTS, documentId),
  list: <T>(queries: string[] = []) => listDocuments<T>(COLLECTIONS.PAYMENTS, queries),
  update: <T extends Record<string, any>>(documentId: string, data: Partial<T>) =>
    updateDocument(COLLECTIONS.PAYMENTS, documentId, data),
  delete: (documentId: string) => deleteDocument(COLLECTIONS.PAYMENTS, documentId),
};

export const affiliates = {
  create: <T extends Record<string, any>>(data: T, documentId?: string) =>
    createDocument(COLLECTIONS.AFFILIATES, data, documentId),
  get: <T>(documentId: string) => getDocument<T>(COLLECTIONS.AFFILIATES, documentId),
  list: <T>(queries: string[] = []) => listDocuments<T>(COLLECTIONS.AFFILIATES, queries),
  update: <T extends Record<string, any>>(documentId: string, data: Partial<T>) =>
    updateDocument(COLLECTIONS.AFFILIATES, documentId, data),
  delete: (documentId: string) => deleteDocument(COLLECTIONS.AFFILIATES, documentId),
};

export const affiliateReferrals = {
  create: <T extends Record<string, any>>(data: T, documentId?: string) =>
    createDocument(COLLECTIONS.AFFILIATE_REFERRALS, data, documentId),
  get: <T>(documentId: string) => getDocument<T>(COLLECTIONS.AFFILIATE_REFERRALS, documentId),
  list: <T>(queries: string[] = []) => listDocuments<T>(COLLECTIONS.AFFILIATE_REFERRALS, queries),
  update: <T extends Record<string, any>>(documentId: string, data: Partial<T>) =>
    updateDocument(COLLECTIONS.AFFILIATE_REFERRALS, documentId, data),
  delete: (documentId: string) => deleteDocument(COLLECTIONS.AFFILIATE_REFERRALS, documentId),
};

export const payouts = {
  create: <T extends Record<string, any>>(data: T, documentId?: string) =>
    createDocument(COLLECTIONS.PAYOUTS, data, documentId),
  get: <T>(documentId: string) => getDocument<T>(COLLECTIONS.PAYOUTS, documentId),
  list: <T>(queries: string[] = []) => listDocuments<T>(COLLECTIONS.PAYOUTS, queries),
  update: <T extends Record<string, any>>(documentId: string, data: Partial<T>) =>
    updateDocument(COLLECTIONS.PAYOUTS, documentId, data),
  delete: (documentId: string) => deleteDocument(COLLECTIONS.PAYOUTS, documentId),
};

export const chapters = {
  create: <T extends Record<string, any>>(data: T, documentId?: string) =>
    createDocument(COLLECTIONS.CHAPTERS, data, documentId),
  get: <T>(documentId: string) => getDocument<T>(COLLECTIONS.CHAPTERS, documentId),
  list: <T>(queries: string[] = []) => listDocuments<T>(COLLECTIONS.CHAPTERS, queries),
  update: <T extends Record<string, any>>(documentId: string, data: Partial<T>) =>
    updateDocument(COLLECTIONS.CHAPTERS, documentId, data),
  delete: (documentId: string) => deleteDocument(COLLECTIONS.CHAPTERS, documentId),
};

export const episodes = {
  create: <T extends Record<string, any>>(data: T, documentId?: string) =>
    createDocument(COLLECTIONS.EPISODES, data, documentId),
  get: <T>(documentId: string) => getDocument<T>(COLLECTIONS.EPISODES, documentId),
  list: <T>(queries: string[] = []) => listDocuments<T>(COLLECTIONS.EPISODES, queries),
  update: <T extends Record<string, any>>(documentId: string, data: Partial<T>) =>
    updateDocument(COLLECTIONS.EPISODES, documentId, data),
  delete: (documentId: string) => deleteDocument(COLLECTIONS.EPISODES, documentId),
};

export const liveSessions = {
  create: <T extends Record<string, any>>(data: T, documentId?: string) =>
    createDocument(COLLECTIONS.LIVE_SESSIONS, data, documentId),
  get: <T>(documentId: string) => getDocument<T>(COLLECTIONS.LIVE_SESSIONS, documentId),
  list: <T>(queries: string[] = []) => listDocuments<T>(COLLECTIONS.LIVE_SESSIONS, queries),
  update: <T extends Record<string, any>>(documentId: string, data: Partial<T>) =>
    updateDocument(COLLECTIONS.LIVE_SESSIONS, documentId, data),
  delete: (documentId: string) => deleteDocument(COLLECTIONS.LIVE_SESSIONS, documentId),
};
