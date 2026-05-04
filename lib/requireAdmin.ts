/**
 * Shared auth helper for all admin API routes.
 * Checks Clerk authentication + privateMetadata.role === 'admin'.
 *
 * Usage in API routes:
 *   const admin = await requireAdmin();
 *   if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
 */
import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * @returns {{ userId: string } | null} Returns userId if authorized admin, null otherwise
 */
export async function requireAdmin(): Promise<{ userId: string } | null> {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.privateMetadata?.role;

    if (role !== 'admin') return null;

    return { userId };
  } catch {
    return null;
  }
}
