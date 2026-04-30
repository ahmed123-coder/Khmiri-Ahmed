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
    upload_preset:process.env.CLOUDINARY_UPLOAD_PRESET,
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 800, crop: "limit" }],
  },
});

const upload = multer({ storage });

// 🔹 إنشاء خدمة جديدة
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

// 🔹 جلب كل الخدمات
router.get("/", async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 تعديل خدمة
router.put("/:id", verifyAdmin, upload.fields([{ name: "image" }, { name: "icon" }]), async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.files?.image?.[0]?.path;
    const icon = req.files?.icon?.[0]?.path;

    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (title) service.title = title;
    if (description) service.description = description;
    if (image) service.image = image;
    if (icon) service.icon = icon;

    await service.save();
    res.status(200).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 حذف خدمة
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
