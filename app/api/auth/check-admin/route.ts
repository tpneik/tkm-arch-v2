import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * In-memory cache for admin role checks.
 * Avoids hitting Clerk's API on every request during a single server lifecycle.
 */
const adminCache = new Map<string, { isAdmin: boolean; ts: number }>();
const SERVER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { isAdmin: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check server-side cache first
    const cached = adminCache.get(userId);
    if (cached && Date.now() - cached.ts < SERVER_CACHE_TTL) {
      if (!cached.isAdmin) {
        return NextResponse.json(
          { isAdmin: false, error: 'Not authorized' },
          { status: 403 }
        );
      }
      return NextResponse.json({ isAdmin: true, role: 'admin' });
    }

    // Cache miss — query Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.privateMetadata?.role;
    const isAdmin = role === 'admin';

    // Store in cache
    adminCache.set(userId, { isAdmin, ts: Date.now() });

    if (!isAdmin) {
      return NextResponse.json(
        { isAdmin: false, error: 'Not authorized' },
        { status: 403 }
      );
    }

    return NextResponse.json({ isAdmin: true, role });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
