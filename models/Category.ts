import mongoose from 'mongoose';

/**
 * Category model — mirrors data/categories.json shape.
 * Combines both projectCategories and blogCategories with a `type` discriminator.
 */

const CategoryLocaleSchema = new mongoose.Schema({
  label: { type: String, default: '' },
}, { _id: false });

const CategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, index: true },
    slug: { type: String, required: true },
    type: { type: String, enum: ['project', 'blog'], required: true, index: true },
    en: { type: CategoryLocaleSchema, default: () => ({}) },
    vi: { type: CategoryLocaleSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Compound unique index: same slug can exist in different types
CategorySchema.index({ slug: 1, type: 1 }, { unique: true });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
