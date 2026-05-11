import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { requireAdmin } from '@/lib/requireAdmin';
import Category from '@/models/Category';

/**
 * GET /api/admin/categories — list all categories
 * Optional query param: ?type=project|blog
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  await connectToDatabase();
  const type = req.nextUrl.searchParams.get('type');
  const filter = type ? { type } : {};

  const categories = await Category.find(filter).sort({ type: 1, id: 1 }).lean();
  return NextResponse.json(categories);
}

/**
 * POST /api/admin/categories — create a new category
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  await connectToDatabase();
  const body = await req.json();

  if (!body.id) {
    const count = await Category.countDocuments({ type: body.type || 'project' });
    body.id = String(count + 1);
  }

  const category = await Category.create(body);
  return NextResponse.json(category, { status: 201 });
}
