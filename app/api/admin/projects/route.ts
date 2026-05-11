import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongoose';
import { requireAdmin } from '@/lib/requireAdmin';
import Project from '@/models/Project';

/**
 * GET /api/admin/projects — list all projects
 */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  await connectToDatabase();
  const projects = await Project.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json(projects);
}

/**
 * POST /api/admin/projects — create a new project
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  await connectToDatabase();
  const body = await req.json();

  // Auto-generate id if not provided
  if (!body.id) {
    const count = await Project.countDocuments();
    body.id = String(count + 1);
  }

  const project = await Project.create(body);
  return NextResponse.json(project, { status: 201 });
}
