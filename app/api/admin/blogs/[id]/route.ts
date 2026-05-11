import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { requireAdmin } from '@/lib/requireAdmin';
import Blog from '@/models/Blog';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/blogs/[id] — get single blog by id
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { id } = await params;
  await connectToDatabase();
  const blog = await Blog.findOne({ id }).lean();

  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(blog);
}

/**
 * PUT /api/admin/blogs/[id] — update a blog
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { id } = await params;
  await connectToDatabase();
  const body = await req.json();

  const blog = await Blog.findOneAndUpdate({ id }, body, {
    returnDocument: 'after',
    runValidators: true,
  }).lean();

  if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(blog);
}

/**
 * DELETE /api/admin/blogs/[id] — delete a blog
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { id } = await params;
  await connectToDatabase();
  const result = await Blog.findOneAndDelete({ id });

  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
