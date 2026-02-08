import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/appwrite/server-auth';
import { users } from '@/lib/appwrite/database';
import { Query } from 'appwrite';

interface UserDocument {
  $id: string;
  userId: string;
  email: string;
  name?: string;
  role: string;
  hasAccess?: boolean;
  purchaseDate?: string;
  affiliateCode?: string;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const user = await getServerUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    // Get all users
    const allUsers = await users.list<UserDocument>([
      Query.orderDesc('createdAt'),
    ]);

    return NextResponse.json({
      users: allUsers.documents.map((userDoc) => ({
        userId: userDoc.userId,
        email: userDoc.email,
        name: userDoc.name,
        role: userDoc.role,
        hasAccess: userDoc.hasAccess,
        purchaseDate: userDoc.purchaseDate || null,
        affiliateCode: userDoc.affiliateCode || null,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
