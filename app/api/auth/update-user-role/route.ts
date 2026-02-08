import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/appwrite/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Missing userId or role' },
        { status: 400 }
      );
    }

    if (role !== 'admin' && role !== 'student') {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "student"' },
        { status: 400 }
      );
    }

    // Update user role in database
    await users.update(userId, {
      role,
      updatedAt: new Date().toISOString(),
    });

    // Get updated user
    const updatedUser = await users.get(userId);

    return NextResponse.json({
      user: updatedUser,
      message: 'User role updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user role' },
      { status: 500 }
    );
  }
}
