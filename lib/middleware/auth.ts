import { NextRequest, NextResponse } from 'next/server';
import { getServerUser } from '@/lib/appwrite/server-auth';
import type { User } from '@/lib/appwrite/auth';

/**
 * Middleware to check if user is authenticated
 * Uses server-side authentication (expects userId in headers or body)
 */
export async function requireAuth(request: NextRequest) {
  const user = await getServerUser(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return { user };
}

/**
 * Middleware to check if user has course access
 */
export async function requireCourseAccess(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  if (!user.hasAccess) {
    return NextResponse.json(
      { error: 'Course access required' },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Middleware to check if user is admin
 */
export async function requireAdmin(request: NextRequest) {
  const authResult = await requireAuth(request);
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  if (user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  return { user };
}
