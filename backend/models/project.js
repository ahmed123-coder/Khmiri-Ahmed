const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true },
    description: { type: String, required: true },
    slug:        { type: String, unique: true, lowercase: true, trim: true },
    categories:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    date:        { type: Date, default: Date.now },
    order:       { type: Number, default: 0 },

    // Main cover image (Cloudinary URL)
    image: { type: String, required: true },

    // Extra gallery images (Cloudinary URLs)
    images: [{ type: String }],

    // Optional video — Cloudinary URL or YouTube/Vimeo link
    video: { type: String, default: '' },

    // Tech stack tags  e.g. ["React", "Node.js"]
    tags: [{ type: String }],

    // External link (live demo / GitHub)
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-generate slug from title before validation
projectSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
