import { NextRequest, NextResponse } from 'next/server';
import { users } from '@/lib/appwrite/database';
import { ID } from 'appwrite';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, name } = body;

    if (!userId || !email || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user record already exists (userId is the document ID)
    try {
      const existing = await users.get(userId);
      return NextResponse.json({
        user: existing,
        message: 'User record already exists',
      });
    } catch {
      // User doesn't exist, continue to create
    }

    // Create user record
    const userData = {
      userId,
      email,
      name,
      role: 'student' as const,
      hasAccess: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const createdUser = await users.create(userData, userId);

    return NextResponse.json({
      user: createdUser,
      message: 'User record created successfully',
    });
  } catch (error: any) {
    console.error('Error creating user record:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create user record' },
      { status: 500 }
    );
  }
}
