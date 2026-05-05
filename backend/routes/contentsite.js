const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinaryConfig");
const Site = require("../models/contentsite");
const { verifyAdmin } = require("../middleware/auth");

// Cloudinary storage config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ahmed-khmiri",
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 800, crop: "limit" }],
  },
});

const upload = multer({ storage });

// Add site data
router.post(
  "/",
  verifyAdmin,
  upload.fields([{ name: "logoheader", maxCount: 1 }]),
  async (req, res) => {
    try {
      const {
        siteName,
        contactEmail,
        selected,
        roles,
        linkedIn,
        facebook,
        instagram,
      } = req.body;

      const logoheader = req.files?.logoheader?.[0]?.path;

      if (!logoheader) {
        return res.status(400).json({ message: "logoheader is required" });
      }

      const site = new Site({
        siteName,
        contactEmail,
        logoheader,
        selected: selected === true || selected === "true" ? true : false,
        roles: roles
          ? Array.isArray(roles)
            ? roles
            : roles.split(",").map((r) => r.trim()).filter(Boolean)
          : [],
        linkedIn: linkedIn || "",
        facebook: facebook || "",
        instagram: instagram || "",
      });

      await site.save();
      res.status(201).json(site);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get all sites
router.get("/", async (req, res) => {
  try {
    const sites = await Site.find();
    res.status(200).json(sites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get selected site
router.get("/selected", async (req, res) => {
  try {
    // Attempt to find the selected site
    let site = await Site.findOne({ selected: true });

    // If no site is explicitly selected, fallback to the first available site
    if (!site) {
      site = await Site.findOne();
    }

    // If still no site (db is empty), return 200 with an empty object to avoid 404 errors on the frontend
    if (!site) {
      return res.status(200).json({});
    }

    // Sort sections ascending by order
    if (site && site.sections && site.sections.length > 0) {
      site.sections.sort((a, b) => a.order - b.order);
    }

    res.status(200).json(site);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update site
router.put(
  "/:id",
  verifyAdmin,
  upload.fields([{ name: "logoheader", maxCount: 1 }]),
  async (req, res) => {
    try {
      const {
        siteName,
        contactEmail,
        selected,
        roles,
        linkedIn,
        facebook,
        instagram,
      } = req.body;

      const logoheader = req.files?.logoheader?.[0]?.path;

      // Build update object with only provided fields
      const updateFields = {};
      if (siteName !== undefined) updateFields.siteName = siteName;
      if (contactEmail !== undefined) updateFields.contactEmail = contactEmail;
      if (logoheader) updateFields.logoheader = logoheader;
      if (selected !== undefined) updateFields.selected = selected;
      if (roles !== undefined)
        updateFields.roles = Array.isArray(roles)
          ? roles
          : roles.split(",").map((r) => r.trim()).filter(Boolean);
      if (linkedIn !== undefined) updateFields.linkedIn = linkedIn;
      if (facebook !== undefined) updateFields.facebook = facebook;
      if (instagram !== undefined) updateFields.instagram = instagram;

      const site = await Site.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true, runValidators: false }
      );

      if (!site) return res.status(404).json({ message: "Site not found" });

      res.status(200).json(site);
    } catch (err) {
      console.error("PUT /site/:id error:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

// Select site
router.put("/:id/select", verifyAdmin, async (req, res) => {
  try {
    await Site.updateMany({}, { selected: false });
    const site = await Site.findByIdAndUpdate(
      req.params.id,
      { selected: true },
      { new: true }
    );

    if (!site) return res.status(404).json({ message: "Site not found" });

    res.status(200).json({ message: "Site selected successfully", site });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deselect site
router.put("/:id/deselect", verifyAdmin, async (req, res) => {
  try {
    const site = await Site.findByIdAndUpdate(
      req.params.id,
      { selected: false },
      { new: true }
    );

    if (!site) return res.status(404).json({ message: "Site not found" });

    res.status(200).json({ message: "Site deselected successfully", site });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete site
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const site = await Site.findByIdAndDelete(req.params.id);
    if (!site) return res.status(404).json({ message: "Site not found" });

    res.status(200).json({ message: "Site deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
