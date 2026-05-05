const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinaryConfig");
const Site = require("../models/contentsite");
const { verifyAdmin } = require("../middleware/auth");

// Cloudinary storage config (mirrors routes/contentsite.js)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ahmed-khmiri",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 800, crop: "limit" }],
  },
});

const upload = multer({ storage });

const VALID_KEYS = ["hero", "skills", "services", "footer", "about", "projects"];

// ─── Task 2.1 — POST /:siteId/sections ───────────────────────────────────────
router.post("/:siteId/sections", verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    const { key, title, subtitle, content, order } = req.body;
    const image = req.file?.path;

    if (!VALID_KEYS.includes(key)) {
      return res.status(400).json({ message: `Validation error: key must be one of ${VALID_KEYS.join(", ")}` });
    }

    const site = await Site.findById(req.params.siteId);
    if (!site) return res.status(404).json({ message: "Site not found" });

    const sectionOrder = order !== undefined ? Number(order) : site.sections.length;

    site.sections.push({
      key,
      title,
      subtitle,
      content,
      image,
      order: sectionOrder,
      visible: true,
    });

    await site.save();
    res.status(201).json(site);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Task 2.3 — PUT /:siteId/sections/reorder ────────────────────────────────
// MUST be registered before /:siteId/sections/:sectionId to prevent "reorder"
// being matched as a :sectionId param.
router.put("/:siteId/sections/reorder", verifyAdmin, async (req, res) => {
  try {
    const { sectionIds } = req.body;

    const site = await Site.findById(req.params.siteId);
    if (!site) return res.status(404).json({ message: "Site not found" });

    if (sectionIds.length !== site.sections.length) {
      return res.status(400).json({ message: "Section ID count mismatch" });
    }

    for (let i = 0; i < sectionIds.length; i++) {
      const id = sectionIds[i];
      const section = site.sections.id(id);
      if (!section) {
        return res.status(400).json({ message: `Unknown section ID: ${id}` });
      }
      section.order = i;
    }

    await site.save();
    res.status(200).json(site);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Task 2.7 — PUT /:siteId/sections/:sectionId/toggle ──────────────────────
// MUST be registered before the plain /:sectionId update route.
router.put("/:siteId/sections/:sectionId/toggle", verifyAdmin, async (req, res) => {
  try {
    const site = await Site.findById(req.params.siteId);
    if (!site) return res.status(404).json({ message: "Site not found" });

    const section = site.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    section.visible = !section.visible;

    await site.save();
    res.status(200).json(site);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Task 2.5 — PUT /:siteId/sections/:sectionId ─────────────────────────────
router.put("/:siteId/sections/:sectionId", verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    const site = await Site.findById(req.params.siteId);
    if (!site) return res.status(404).json({ message: "Site not found" });

    const section = site.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    const { key, title, subtitle, content, order } = req.body;

    if (key !== undefined) {
      if (!VALID_KEYS.includes(key)) {
        return res.status(400).json({ message: `Validation error: key must be one of ${VALID_KEYS.join(", ")}` });
      }
      section.key = key;
    }
    if (title !== undefined) section.title = title;
    if (subtitle !== undefined) section.subtitle = subtitle;
    if (content !== undefined) section.content = content;
    if (order !== undefined) section.order = Number(order);
    if (req.file) section.image = req.file.path;

    await site.save();
    res.status(200).json(site);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Task 2.9 — DELETE /:siteId/sections/:sectionId ──────────────────────────
router.delete("/:siteId/sections/:sectionId", verifyAdmin, async (req, res) => {
  try {
    const site = await Site.findById(req.params.siteId);
    if (!site) return res.status(404).json({ message: "Site not found" });

    const section = site.sections.id(req.params.sectionId);
    if (!section) return res.status(404).json({ message: "Section not found" });

    site.sections.pull({ _id: req.params.sectionId });

    await site.save();
    res.status(200).json(site);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
