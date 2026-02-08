import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/payment', '/payment/success', '/payment/cancel'];

// Auth routes that should redirect to dashboard if already logged in
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API routes
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if user is authenticated by checking for Appwrite session cookies
  // Appwrite SDK can set cookies with various naming patterns:
  // - a_session_<project_id> (legacy)
  // - a_session_<project_id>_legacy (legacy fallback)
  // - Custom session cookie we set after login
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
    // Redirect from auth pages to dashboard
    if (authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL('/course/dashboard', request.url));
    }
    // Allow access to protected routes
    return NextResponse.next();
  } else {
    // No session cookie found
    // For protected routes, redirect to login
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
