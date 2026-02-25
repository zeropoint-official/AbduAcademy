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
        
        // Check Appwrite Auth labels
        const hasAdminLabel = appwriteUser.labels?.includes('admin') ?? false;
        const hasPaidLabel = appwriteUser.labels?.includes('paid') ?? false;
        const currentRole = user.role || 'student';

        // Sync admin role from label
        if (hasAdminLabel && currentRole !== 'admin') {
          await users.update(userId, {
            role: 'admin',
            updatedAt: new Date().toISOString()
          });
          user.role = 'admin';
        }

        // Derive access strictly from Appwrite Auth labels (source of truth)
        // DB hasAccess field alone is NOT sufficient — must have paid/admin label or admin role
        (user as any).hasAccess = hasPaidLabel || hasAdminLabel || (user.role === 'admin');
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
