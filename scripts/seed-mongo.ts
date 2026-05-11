/**
 * Seed script — pushes data from data/*.json into MongoDB.
 *
 * Usage:
 *   npx tsx scripts/seed-mongo.ts
 *
 * Requires MONGODB_URI in .env.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

/* ──────────────── Load models ──────────────── */
// Import model files directly to register schemas
import '../models/Project';
import '../models/Blog';
import '../models/Category';

const Project = mongoose.model('Project');
const Blog = mongoose.model('Blog');
const Category = mongoose.model('Category');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not set in .env');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB…');
  await mongoose.connect(uri);
  console.log('✅ Connected');

  const dataDir = path.resolve(__dirname, '..', 'data');

  /* ─── Categories ─── */
  const catFile = path.join(dataDir, 'categories.json');
  const catData = JSON.parse(fs.readFileSync(catFile, 'utf-8'));

  // Map projectCategories → type: 'project'
  const projectCats = (catData.projectCategories || []).map((c: any) => ({
    id: c.id,
    slug: c.slug,
    type: 'project',
    en: c.en,
    vi: c.vi,
  }));

  // Map blogCategories → type: 'blog'
  const blogCats = (catData.blogCategories || []).map((c: any) => ({
    id: c.id,
    slug: c.slug,
    type: 'blog',
    en: c.en,
    vi: c.vi,
  }));

  const allCats = [...projectCats, ...blogCats];
  console.log(`📂 Categories: ${allCats.length} total`);

  await Category.deleteMany({});
  await Category.insertMany(allCats);
  console.log('✅ Categories seeded');

  /* ─── Projects ─── */
  const projFile = path.join(dataDir, 'projects.json');
  const projData = JSON.parse(fs.readFileSync(projFile, 'utf-8'));
  console.log(`📂 Projects: ${projData.length} total`);

  await Project.deleteMany({});
  await Project.insertMany(
    projData.map((p: any) => ({
      id: p.id,
      category: p.category,
      thumbnail: p.thumbnail,
      gallery: p.gallery || [],
      en: p.en || {},
      vi: p.vi || {},
      status: 'published',
    }))
  );
  console.log('✅ Projects seeded');

  /* ─── Blogs ─── */
  const blogFile = path.join(dataDir, 'blogs.json');
  const blogData = JSON.parse(fs.readFileSync(blogFile, 'utf-8'));
  console.log(`📂 Blogs: ${blogData.length} total`);

  await Blog.deleteMany({});
  await Blog.insertMany(
    blogData.map((b: any) => ({
      id: b.id,
      category: b.category,
      thumbnail: b.thumbnail,
      date: b.date || '',
      en: b.en || {},
      vi: b.vi || {},
      status: 'published',
    }))
  );
  console.log('✅ Blogs seeded');

  /* ─── Done ─── */
  await mongoose.disconnect();
  console.log('🏁 Seed complete — disconnected.');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
