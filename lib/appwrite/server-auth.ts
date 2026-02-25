import { NextRequest } from 'next/server';
import { getServerClient } from './config';
import { Users as ServerUsers } from 'node-appwrite';
import { users, Query } from './database';
import type { User } from './auth';

/**
 * Get the current user from server-side API route
 * This uses the userId from request headers or body
 */
export async function getServerUser(request: NextRequest): Promise<User | null> {
  try {
    // Try to get userId from request headers first (set by client)
    let userId = request.headers.get('x-user-id');
    
    // If not in headers, try to get from request body (for POST/PUT requests)
    // But only if the content-type is JSON, not FormData
    if (!userId) {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        try {
          const body = await request.clone().json().catch(() => ({}));
          userId = body.userId;
        } catch {
          // Body might not be JSON or might be empty
        }
      } else if (contentType.includes('multipart/form-data')) {
        // For FormData requests, try to get userId from formData
        try {
          const formData = await request.clone().formData().catch(() => null);
          if (formData) {
            const userIdFromForm = formData.get('userId') as string | null;
            if (userIdFromForm) {
              userId = userIdFromForm;
            }
          }
        } catch {
          // FormData parsing failed, continue
        }
      }
    }

    // If still no userId, check cookies as fallback
    if (!userId) {
      // Check if we have session cookies
      const cookies = request.cookies;
      const hasSession = Array.from(cookies.getAll()).some(cookie => 
        cookie.name.startsWith('a_session_')
      );
      
      if (!hasSession) {
        return null;
      }
      
      // We can't easily validate the session server-side without the userId
      // So we return null and let the client handle it
      return null;
    }

    // Get user from database using userId
    return await getServerUserFromId(userId);
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

/**
 * Alternative method: Get user from userId passed in request body/headers
 * This is useful when the client sends the userId explicitly
 */
export async function getServerUserFromId(userId: string): Promise<User | null> {
  try {
    // Query user by userId field (not document ID)
    interface UserDocument {
      $id: string;
      userId: string;
      role?: string;
    }
    
    const userDocs = await users.list<UserDocument>([Query.equal('userId', userId)]);
    
    if (userDocs.documents.length === 0) {
      return null;
    }
    
    const user = userDocs.documents[0];
    
    // Check Appwrite Auth labels to sync role and access
    try {
      const serverClient = getServerClient();
      const serverUsers = new ServerUsers(serverClient);
      const appwriteUser = await serverUsers.get(userId);

      const hasAdminLabel = appwriteUser.labels?.includes('admin') ?? false;
      const hasPaidLabel = appwriteUser.labels?.includes('paid') ?? false;

      if (hasAdminLabel && user.role !== 'admin') {
        await users.update(user.$id, {
          role: 'admin',
          updatedAt: new Date().toISOString(),
        });
        user.role = 'admin';
      }

      // Derive access strictly from Appwrite Auth labels (source of truth)
      // DB hasAccess field alone is NOT sufficient — must have paid/admin label or admin role
      (user as any).hasAccess = hasPaidLabel || hasAdminLabel || user.role === 'admin';
    } catch (labelError: any) {
      console.warn('Could not check Appwrite labels:', labelError.message);
    }

    return user as User;
  } catch (error: any) {
    console.error('Error getting server user from ID:', error);
    return null;
  }
}
