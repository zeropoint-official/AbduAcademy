import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/appwrite/database';
import { getServerClient } from '@/lib/appwrite/config';
import { Users as ServerUsers } from 'node-appwrite';

interface UserDocument {
  $id: string;
  userId: string;
  role?: string;
  updatedAt?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    // Get user record - use document ID directly since userId is stored as document ID
    try {
      const user = await users.get<UserDocument>(userId);
      
      // Check Appwrite Auth labels to sync role
      try {
        const serverClient = getServerClient();
        const serverUsers = new ServerUsers(serverClient);
        const appwriteUser = await serverUsers.get(userId);
        
        // Check if user has 'admin' label
        const hasAdminLabel = appwriteUser.labels?.includes('admin') ?? false;
        const shouldBeAdmin = hasAdminLabel;
        const currentRole = user.role || 'student';
        
        // Update role in database if it doesn't match Appwrite labels
        if (shouldBeAdmin && currentRole !== 'admin') {
          await users.update(userId, { 
            role: 'admin',
            updatedAt: new Date().toISOString()
          });
          user.role = 'admin';
        } else if (!shouldBeAdmin && currentRole === 'admin') {
          // Only remove admin role if explicitly not admin (don't auto-demote)
          // This is a safety measure - admin removal should be manual
        }
      } catch (labelError: any) {
        // If we can't check labels (e.g., API key doesn't have permissions), 
        // just return the user as-is
        console.warn('Could not check Appwrite labels:', labelError.message);
      }
      
      return NextResponse.json({ user });
    } catch (getError: any) {
      // If direct get fails, try query (but Query has issues in Next.js server)
      // For now, just return 404
      console.error('Error getting user:', getError);
      return NextResponse.json(
        { error: 'User record not found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}
