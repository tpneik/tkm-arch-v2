import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { requireAdmin } from '@/lib/requireAdmin';
import Project from '@/models/Project';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/projects/[id] — get single project by document id
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { id } = await params;
  await connectToDatabase();
  const project = await Project.findOne({ id }).lean();

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(project);
}

/**
 * PUT /api/admin/projects/[id] — update a project
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { id } = await params;
  await connectToDatabase();
  const body = await req.json();

  const project = await Project.findOneAndUpdate({ id }, body, {
    returnDocument: 'after',
    runValidators: true,
  }).lean();

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(project);
}

/**
 * DELETE /api/admin/projects/[id] — delete a project
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { id } = await params;
  await connectToDatabase();
  const result = await Project.findOneAndDelete({ id });

  if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
