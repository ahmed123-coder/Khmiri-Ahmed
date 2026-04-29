const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinaryConfig");
const Site = require("../models/contentsite");
const User = require("../models/user");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Cloudinary storage config
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ahmed-khmiri",
    upload_preset:process.env.CLOUDINARY_UPLOAD_PRESET,
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 800, crop: "limit" }],
  },
});

const upload = multer({ storage });

// Middleware to verify admin permissions
const verifyAdmin = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.role !== "admin") return res.status(403).json({ message: "Only admins are allowed" });
  
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token", error: err.message });
    }
};

// Add site data
router.post(
  "/",
  verifyAdmin,
  upload.fields([
    { name: "logoheader", maxCount: 1 },
    { name: "logohero", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        siteName,
        siteDescription,
        hero,
        heroTitle,
        heroName,
        skillsTitle,
        serviceDescription,
        footer,
        contactEmail,
        selected,
      } = req.body;

      const logoheader = req.files?.logoheader?.[0]?.path;
      const logohero = req.files?.logohero?.[0]?.path;

      if (!logoheader || !logohero) {
        return res
          .status(400)
          .json({ message: "Both logoheader and logohero are required" });
      }

      if (selected === "selected") {
        const alreadySelected = await Site.findOne({ selected: "selected" });
        if (alreadySelected) {
          return res
            .status(400)
            .json({ message: "Another site is already selected. Please deselect it first." });
        }
      }

      const site = new Site({
        siteName,
        siteDescription,
        hero,
        heroTitle,
        heroName,
        skillsTitle,
        serviceDescription,
        footer,
        contactEmail,
        logoheader,
        logohero,
        selected: selected || "not selected",
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
    let site = await Site.findOne({ selected: "selected" });
    
    // If no site is explicitly selected, fallback to the first available site
    if (!site) {
      site = await Site.findOne();
    }

    // If still no site (db is empty), return 200 with an empty object to avoid 404 errors on the frontend
    if (!site) {
      return res.status(200).json({});
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
  upload.fields([
    { name: "logoheader", maxCount: 1 },
    { name: "logohero", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        siteName,
        siteDescription,
        hero,
        heroTitle,
        heroName,
        skillsTitle,
        serviceDescription,
        footer,
        contactEmail,
        selected,
      } = req.body;

      const logoheader = req.files?.logoheader?.[0]?.path;
      const logohero = req.files?.logohero?.[0]?.path;

      // Build update object with only provided fields
      const updateFields = {};
      if (siteName !== undefined) updateFields.siteName = siteName;
      if (siteDescription !== undefined) updateFields.siteDescription = siteDescription;
      if (hero !== undefined) updateFields.hero = hero;
      if (heroTitle !== undefined) updateFields.heroTitle = heroTitle;
      if (heroName !== undefined) updateFields.heroName = heroName;
      if (skillsTitle !== undefined) updateFields.skillsTitle = skillsTitle;
      if (serviceDescription !== undefined) updateFields.serviceDescription = serviceDescription;
      if (footer !== undefined) updateFields.footer = footer;
      if (contactEmail !== undefined) updateFields.contactEmail = contactEmail;
      if (logoheader) updateFields.logoheader = logoheader;
      if (logohero) updateFields.logohero = logohero;
      if (selected !== undefined) updateFields.selected = selected;

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
    await Site.updateMany({}, { selected: "not selected" });
    const site = await Site.findByIdAndUpdate(
      req.params.id,
      { selected: "selected" },
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
      { selected: "not selected" },
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
