import mongoose from 'mongoose';

/**
 * Blog model — mirrors data/blogs.json shape.
 * The `id` field is the human-readable identifier, not MongoDB _id.
 */

const BlogLocaleSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  slug: { type: String, default: '' },
  categoryLabel: { type: String, default: '' },
  categorySlug: { type: String, default: '' },
  excerpt: { type: String, default: '' },
  content: { type: String, default: '' },
}, { _id: false });

const BlogSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    category: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    date: { type: String, default: '' },
    en: { type: BlogLocaleSchema, default: () => ({}) },
    vi: { type: BlogLocaleSchema, default: () => ({}) },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
