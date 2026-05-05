const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinaryConfig");
const Service = require("../models/service");
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

/**
 * Extract the Cloudinary public_id from a stored URL.
 */
const extractPublicId = (url) => {
  if (!url) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const withoutVersion = parts[1].replace(/^v\d+\//, "");
    return withoutVersion.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

const destroyAsset = (url) => {
  const publicId = extractPublicId(url);
  if (publicId) {
    cloudinary.uploader.destroy(publicId).catch((e) =>
      console.error("Cloudinary destroy error:", e.message)
    );
  }
};

// POST /api/service — Create a service
router.post("/", verifyAdmin, upload.fields([{ name: "image" }, { name: "icon" }]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.files?.image?.[0]?.path;
    const icon = req.files?.icon?.[0]?.path;

    if (!title || !description || !image || !icon) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const service = new Service({ title, description, icon, image });
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/service — List all services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/service/:id — Update a service
router.put("/:id", verifyAdmin, upload.fields([{ name: "image" }, { name: "icon" }]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const newImage = req.files?.image?.[0]?.path;
    const newIcon = req.files?.icon?.[0]?.path;

    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    if (title) service.title = title;
    if (description) service.description = description;

    if (newImage) {
      destroyAsset(service.image);
      service.image = newImage;
    }
    if (newIcon) {
      destroyAsset(service.icon);
      service.icon = newIcon;
    }

    await service.save();
    res.status(200).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/service/:id — Delete a service
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: "Service not found" });

    // Delete both Cloudinary assets
    destroyAsset(service.image);
    destroyAsset(service.icon);

    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
