import mongoose from 'mongoose';

/**
 * Settings model — site-wide singleton documents keyed by `key`.
 * Currently holds the "homepage" document (hero cover + expertise slider images).
 */
const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    // Homepage hero/cover image (public URL).
    heroImage: { type: String, default: '' },
    // Expertise ("chuyên môn hoạt động") slider images, in display order.
    serviceImages: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
