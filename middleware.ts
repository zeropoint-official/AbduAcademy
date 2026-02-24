import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/payment', '/payment/success', '/payment/cancel'];

// Auth routes that should redirect to dashboard if already logged in
const authRoutes = ['/login', '/register'];

// Admin routes that require admin access
const adminRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API routes
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if user is authenticated by checking for Appwrite session cookies
  const cookies = request.cookies;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
  
  // Check for any Appwrite-related session cookie
  const hasAppwriteSession = cookies.getAll().some((cookie) => 
    cookie.name.startsWith('a_session_') || 
    cookie.name.includes(projectId)
  );
  
  // Also check for our custom auth cookie (set after login)
  const hasCustomSession = cookies.has('abdu_session');
  
  const hasSession = hasAppwriteSession || hasCustomSession;

  if (hasSession) {
    // User appears to be authenticated
    // Redirect from auth pages — honor ?redirect param if present
    if (authRoutes.includes(pathname)) {
      const redirectTo = request.nextUrl.searchParams.get('redirect');
      const destination = redirectTo && redirectTo.startsWith('/') ? redirectTo : '/course/dashboard';
      return NextResponse.redirect(new URL(destination, request.url));
    }
    
    // For admin routes, allow access (client-side will check admin status)
    if (pathname.startsWith('/admin')) {
      return NextResponse.next();
    }
    
    // Allow access to protected routes (course, account, etc.)
    return NextResponse.next();
  } else {
    // No session cookie found
    // For admin routes, redirect to login
    if (pathname.startsWith('/admin')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // For other protected routes, redirect to login with redirect param
    if (!publicRoutes.includes(pathname)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
