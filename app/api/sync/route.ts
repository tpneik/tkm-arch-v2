import { NextResponse } from "next/server";
import { syncAll } from "@/data/sync";

/**
 * POST /api/sync
 *
 * Triggers a full data sync from MongoDB → static JSON files.
 * Call this on server startup or after admin data changes.
 *
 * Protected by a simple secret token check in production.
 */
export async function POST(request: Request) {
  try {
    // Optional: simple token protection for production
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const expectedToken = process.env.SYNC_SECRET;

    if (expectedToken && token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await syncAll();

    return NextResponse.json({
      success: true,
      message: "All data synced from MongoDB → JSON",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[api/sync] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Sync failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync — health check / status
 */
export async function GET() {
  return NextResponse.json({
    status: "ready",
    description: "POST to trigger MongoDB → JSON sync",
  });
}
