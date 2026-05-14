"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";

/* ── Types ── */
export type AdminUser = {
  id: string;
  email: string;
  fullName: string | null;
  imageUrl: string;
  createdAt: number;
};

/** Serialize a Clerk user to a plain object safe for Client Components */
function toAdminUser(u: {
  id: string;
  primaryEmailAddress?: { emailAddress: string } | null;
  emailAddresses?: { emailAddress: string }[];
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  createdAt: number;
}): AdminUser {
  const email =
    u.primaryEmailAddress?.emailAddress ||
    u.emailAddresses?.[0]?.emailAddress ||
    "";
  return {
    id: u.id,
    email,
    fullName: u.fullName || [u.firstName, u.lastName].filter(Boolean).join(" ") || null,
    imageUrl: u.imageUrl,
    createdAt: u.createdAt,
  };
}

/**
 * Verify the caller is an admin. Returns userId or null.
 * Server actions cannot use `requireAdmin` from lib because it was designed
 * for API routes — we replicate the check inline for clarity.
 */
async function verifyCallerAdmin(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  if (user.privateMetadata?.role !== "admin") return null;

  return userId;
}

/* ── Queries ── */

/** Get all users who currently have admin role */
export async function getAdminUsers(): Promise<AdminUser[]> {
  const callerId = await verifyCallerAdmin();
  if (!callerId) return [];

  const client = await clerkClient();
  const admins: AdminUser[] = [];
  let offset = 0;
  const limit = 100;

  // Paginate through all users and filter by role
  while (true) {
    const { data } = await client.users.getUserList({ limit, offset });
    if (!data.length) break;

    for (const u of data) {
      if (u.privateMetadata?.role === "admin") {
        admins.push(toAdminUser(u));
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return admins;
}

/** Get all users who do NOT have admin role (pending / regular users) */
export async function getPendingUsers(): Promise<AdminUser[]> {
  const callerId = await verifyCallerAdmin();
  if (!callerId) return [];

  const client = await clerkClient();
  const pending: AdminUser[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data } = await client.users.getUserList({ limit, offset });
    if (!data.length) break;

    for (const u of data) {
      if (u.privateMetadata?.role !== "admin") {
        pending.push(toAdminUser(u));
      }
    }

    if (data.length < limit) break;
    offset += limit;
  }

  return pending;
}

/* ── Mutations ── */

/** Grant admin role to a user */
export async function grantAdmin(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const callerId = await verifyCallerAdmin();
    if (!callerId) return { success: false, error: "Unauthorized" };

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      privateMetadata: { role: "admin" },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to grant admin:", error);
    return {
      success: false,
      error: error.message || "Failed to grant admin role",
    };
  }
}

/** Revoke admin role from a user. Cannot revoke own role. */
export async function revokeAdmin(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const callerId = await verifyCallerAdmin();
    if (!callerId) return { success: false, error: "Unauthorized" };

    // Self-protection: prevent admin from revoking their own role
    if (userId === callerId) {
      return {
        success: false,
        error: "Không thể xóa quyền admin của chính mình",
      };
    }

    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      privateMetadata: { role: null },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to revoke admin:", error);
    return {
      success: false,
      error: error.message || "Failed to revoke admin role",
    };
  }
}
