import mongoose from 'mongoose';

/**
 * Project model — mirrors data/projects.json shape.
 * The `id` field is the human-readable identifier, not MongoDB _id.
 */

const ProjectLocaleSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  slug: { type: String, default: '' },
  categoryLabel: { type: String, default: '' },
  categorySlug: { type: String, default: '' },
  description: { type: String, default: '' },
  details: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
}, { _id: false });

const ProjectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    category: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    gallery: { type: [String], default: [] },
    en: { type: ProjectLocaleSchema, default: () => ({}) },
    vi: { type: ProjectLocaleSchema, default: () => ({}) },
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
