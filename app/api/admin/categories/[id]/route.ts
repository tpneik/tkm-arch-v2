import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { requireAdmin } from '@/lib/requireAdmin';
import Category from '@/models/Category';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/categories/[id] — get single category
 * Note: id here is the MongoDB _id since category.id is not unique across types
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { id } = await params;
  await connectToDatabase();
  const category = await Category.findById(id).lean();

  if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(category);
}

/**
 * PUT /api/admin/categories/[id] — update a category
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { id } = await params;
  await connectToDatabase();
  const body = await req.json();

  const category = await Category.findByIdAndUpdate(id, body, {
    returnDocument: 'after',
    runValidators: true,
  }).lean();

  if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(category);
}

/**
 * DELETE /api/admin/categories/[id] — delete a category
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { id } = await params;
  await connectToDatabase();
  const result = await Category.findByIdAndDelete(id);

  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
