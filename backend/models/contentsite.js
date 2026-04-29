// This file defines a Mongoose schema for a site configuration model.
const mongoose = require('mongoose');

const siteSchema = new mongoose.Schema({
  siteName: { type: String},
  logoheader: { type: String, required: true },
  siteDescription: { type: String, required: true },
  hero:{ type: String, required: true },
  heroTitle: { type: String },
  heroName: { type: String },
  skillsTitle: { type: String },
  serviceDescription: { type: String },
  footer:{ type: String, required: true },
  contactEmail: { type: String, required: true },
  logohero: { type: String, required: true },
  selected :{type:String, enum:['selected', 'not selected'],default:"not selected" },
});

module.exports = mongoose.model('Site', siteSchema);