// This file defines a Mongoose schema for a site configuration model.
const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  key: { type: String, required: true, enum: ["hero", "skills", "services", "footer", "about", "projects"] },
  title: { type: String },
  subtitle: { type: String },
  content: { type: String },
  image: { type: String },
  order: { type: Number, required: true },
  visible: { type: Boolean, default: true },
});

const siteSchema = new mongoose.Schema({
  siteName: { type: String },
  logoheader: { type: String, required: true },
  contactEmail: { type: String, required: true },
  selected: { type: Boolean, default: false },
  roles: { type: [String], default: [] },
  linkedIn: { type: String, default: '' },
  facebook: { type: String, default: '' },
  instagram: { type: String, default: '' },
  sections: [sectionSchema],
});

module.exports = mongoose.model('Site', siteSchema);
