import { account } from './config';
import { ID } from 'appwrite';

// Session cookie helpers for middleware detection
const SESSION_COOKIE_NAME = 'abdu_session';

function setSessionCookie() {
  // Set a cookie that middleware can detect
  // Using a timestamp as value, expires in 30 days
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  document.cookie = `${SESSION_COOKIE_NAME}=${Date.now()}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export interface User {
  $id: string;
  userId: string;
  email: string;
  name: string;
  role: 'student' | 'admin';
  hasAccess: boolean;
  purchaseDate?: string;
  isEarlyAccess?: boolean; // Indicates if user purchased early access
  affiliateCode?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get current user session
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const session = await account.getSession('current');
    if (!session) {
      return null;
    }

    // Ensure session cookie is set (handles cases where user has valid session but no cookie)
    if (typeof document !== 'undefined' && !document.cookie.includes(SESSION_COOKIE_NAME)) {
      setSessionCookie();
    }

    // Get user from Appwrite Auth
    const appwriteUser = await account.get();
    
    // Check if user has 'admin' label in Appwrite
    const hasAdminLabel = appwriteUser.labels?.includes('admin') ?? false;
    
    // Get user data from our users collection via API
    try {
      const response = await fetch('/api/auth/get-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId: appwriteUser.$id }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        const user = data.user as User;
        
        // Sync role from Appwrite labels if they don't match
        if (hasAdminLabel && user.role !== 'admin') {
          // Update role in database via API
          try {
            await fetch('/api/auth/update-user-role', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ 
                userId: user.userId, 
                role: 'admin' 
              }),
            });
            user.role = 'admin';
          } catch (updateError) {
            console.error('Error updating user role:', updateError);
            // Still return user with admin role set locally
            user.role = 'admin';
          }
        }
        
        return user;
      }

      // If user record doesn't exist, create it
      if (data.error?.includes('not found') || response.status === 404) {
        return await createUserRecord(
          appwriteUser.$id,
          appwriteUser.email,
          appwriteUser.name || ''
        );
      }

      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Create user record in users collection (via API route)
 */
async function createUserRecord(
  userId: string,
  email: string,
  name: string
): Promise<User> {
  try {
    const response = await fetch('/api/auth/create-user-record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userId, email, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create user record');
    }

    return data.user as User;
  } catch (error: any) {
    console.error('Error creating user record:', error);
    throw error;
  }
}

/**
 * Register a new user
 */
export async function register(email: string, password: string, name: string) {
  try {
    // Create account in Appwrite Auth
    const appwriteAccount = await account.create(ID.unique(), email, password, name);
    
    // Create session
    await account.createEmailPasswordSession(email, password);
    
    // Set session cookie for middleware
    setSessionCookie();
    
    // Create user record
    const user = await createUserRecord(appwriteAccount.$id, email, name);
    
    return { user, session: await account.getSession('current') };
  } catch (error: any) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Registration failed');
  }
}

/**
 * Login user
 */
export async function login(email: string, password: string) {
  try {
    // Check if session already exists - if so, delete it first
    try {
      const existingSession = await account.getSession('current');
      if (existingSession) {
        // Delete existing session before creating new one
        await account.deleteSession('current');
      }
    } catch {
      // No existing session, continue
    }

    // Create new session
    const session = await account.createEmailPasswordSession(email, password);
    
    // Set session cookie for middleware
    setSessionCookie();
    
    const user = await getCurrentUser();
    return { user, session };
  } catch (error: any) {
    console.error('Login error:', error);
    // If error is about existing session, try to get current user and return it
    if (error.message?.includes('session is active') || error.message?.includes('prohibited')) {
      try {
        const user = await getCurrentUser();
        if (user) {
          // Set session cookie for middleware
          setSessionCookie();
          const session = await account.getSession('current');
          return { user, session };
        }
      } catch (e) {
        // Fall through to throw error
      }
      throw new Error('Please logout first, then login again');
    }
    throw new Error(error.message || 'Login failed');
  }
}

/**
 * Logout user
 */
export async function logout() {
  try {
    // Clear session cookie first
    clearSessionCookie();
    await account.deleteSession('current');
  } catch (error) {
    // Still clear cookie even if Appwrite logout fails
    clearSessionCookie();
    console.error('Logout error:', error);
    throw error;
  }
}

/**
 * Check if user has course access
 */
export async function hasCourseAccess(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.hasAccess ?? false;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}
