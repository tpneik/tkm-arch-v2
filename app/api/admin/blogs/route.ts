import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { requireAdmin } from '@/lib/requireAdmin';
import Blog from '@/models/Blog';

/**
 * GET /api/admin/blogs — list all blogs
 */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  await connectToDatabase();
  const blogs = await Blog.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(blogs);
}

/**
 * POST /api/admin/blogs — create a new blog
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  await connectToDatabase();
  const body = await req.json();

  if (!body.id) {
    const count = await Blog.countDocuments();
    body.id = String(count + 1);
  }

  const blog = await Blog.create(body);
  return NextResponse.json(blog, { status: 201 });
}
