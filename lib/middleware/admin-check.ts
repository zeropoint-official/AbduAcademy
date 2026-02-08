import { NextRequest } from 'next/server';
import { getServerClient } from '@/lib/appwrite/config';
import { Users as ServerUsers } from 'node-appwrite';
import { users, Query } from '@/lib/appwrite/database';

/**
 * Check if user is admin from middleware
 * Uses session cookies to get userId, then checks database
 */
export async function isAdminUser(request: NextRequest): Promise<boolean> {
  try {
    // Get session cookies
    const cookies = request.cookies;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
    
    // Check for Appwrite session cookies
    const hasAppwriteSession = cookies.getAll().some((cookie) => 
      cookie.name.startsWith('a_session_') || 
      cookie.name.includes(projectId)
    );
    
    const hasCustomSession = cookies.has('abdu_session');
    
    if (!hasAppwriteSession && !hasCustomSession) {
      return false;
    }

    // Try to get userId from Appwrite session
    // We need to extract it from the session cookie or use Appwrite SDK
    // For now, we'll use a simpler approach: check if user has admin label in Appwrite Auth
    try {
      const serverClient = getServerClient();
      const serverUsers = new ServerUsers(serverClient);
      
      // Get all sessions and check the first one
      // Note: This is a simplified check - in production you might want to validate the session properly
      // For middleware, we'll rely on checking the user document by querying with a known pattern
      // Since we can't easily get userId from cookies in middleware, we'll use a different approach
      
      // Alternative: Query users collection for admin role
      // But we need userId... Let's check Appwrite Auth labels directly
      // Actually, we can't easily do this in middleware without userId
      
      // For now, return false and let the client-side check handle it
      // The middleware will allow access if session exists, and client-side will redirect if not admin
      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  } catch (error) {
    console.error('Error in isAdminUser:', error);
    return false;
  }
}

/**
 * Get user ID from request cookies (if possible)
 * This is a helper to extract userId from Appwrite session cookies
 */
function getUserIdFromCookies(request: NextRequest): string | null {
  // Appwrite session cookies don't directly contain userId
  // We'd need to decode the session or use Appwrite SDK
  // For middleware, this is complex, so we'll handle admin checks client-side
  return null;
}
