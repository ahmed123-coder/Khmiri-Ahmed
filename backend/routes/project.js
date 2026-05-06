const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinaryConfig');
const Project    = require('../models/project');
const { verifyAdmin } = require('../middleware/auth');

/* ─── Cloudinary storages ────────────────────────────────────────────────── */

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio/projects/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1400, crop: 'limit', quality: 'auto' }],
  },
});

const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'portfolio/projects/videos',
    resource_type: 'video',
    allowed_formats: ['mp4', 'webm', 'mov'],
  }),
});

// image uploader: 1 cover + up to 20 gallery images
const uploadImages = multer({ storage: imageStorage }).fields([
  { name: 'image',  maxCount: 1  },
  { name: 'images', maxCount: 20 },
]);

// video uploader (separate endpoint)
const uploadVideo = multer({ storage: videoStorage }).single('video');

/* ─── Helpers ────────────────────────────────────────────────────────────── */

const extractPublicId = (url, resourceType = 'image') => {
  if (!url) return null;
  try {
    const marker = resourceType === 'video' ? '/video/upload/' : '/image/upload/';
    const parts  = url.split(marker);
    if (parts.length < 2) return null;
    return parts[1].replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '');
  } catch { return null; }
};

const destroyAsset = (url, resourceType = 'image') => {
  const id = extractPublicId(url, resourceType);
  if (id) cloudinary.uploader.destroy(id, { resource_type: resourceType })
    .catch(e => console.error('Cloudinary destroy error:', e.message));
};

/* ─── GET /api/project  — list (no heavy fields) ─────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find()
      .select('title description image slug categories date order tags link')
      .populate('categories')
      .sort({ order: 1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ─── GET /api/project/categories ───────────────────────────────────────── */
router.get('/categories', async (req, res) => {
  try {
    const cats = await Project.distinct('category');
    res.json(cats.filter(Boolean));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ─── GET /api/project/:slugOrId  — full detail ──────────────────────────── */
router.get('/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    let project = await Project.findOne({ slug: slugOrId }).populate('categories');
    if (!project && /^[a-f\d]{24}$/i.test(slugOrId)) {
      project = await Project.findById(slugOrId).populate('categories');
    }
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ─── POST /api/project  — create ───────────────────────────────────────── */
router.post('/', verifyAdmin, uploadImages, async (req, res) => {
  try {
    const { title, description, slug, categories, date, tags, link, video } = req.body;

    const coverFile = req.files?.image?.[0];
    if (!coverFile) return res.status(400).json({ message: 'Cover image is required' });

    const galleryUrls = (req.files?.images || []).map(f => f.path);

    const last  = await Project.findOne().sort({ order: -1 });
    const order = last ? last.order + 1 : 0;

    const project = new Project({
      title,
      description,
      slug,
      categories: categories ? JSON.parse(categories) : [],
      date:     date     || Date.now(),
      order,
      image:  coverFile.path,
      images: galleryUrls,
      video:  video || '',
      tags:   tags  ? JSON.parse(tags) : [],
      link:   link  || '',
    });

    await project.save();
    res.status(201).json(project);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Slug already exists' });
    res.status(500).json({ error: err.message });
  }
});

/* ─── PUT /api/project/reorder  — bulk reorder ───────────────────────────── */
router.put('/reorder', verifyAdmin, async (req, res) => {
  try {
    const updates = req.body;
    if (!Array.isArray(updates)) return res.status(400).json({ message: 'Expected array' });
    await Promise.all(updates.map(({ id, order }) =>
      Project.findByIdAndUpdate(id, { order })
    ));
    res.json({ message: 'Order updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ─── PUT /api/project/:id  — update ────────────────────────────────────── */
router.put('/:id', verifyAdmin, uploadImages, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { title, description, slug, categories, date, tags, link, video, keepImages } = req.body;

    if (title)       project.title       = title;
    if (description) project.description = description;
    if (slug)        project.slug        = slug;
    if (categories)   project.categories  = JSON.parse(categories);
    if (date)        project.date        = date;
    if (link !== undefined) project.link = link;
    if (video !== undefined) project.video = video;
    if (tags)        project.tags        = JSON.parse(tags);

    // Replace cover image
    if (req.files?.image?.[0]) {
      destroyAsset(project.image);
      project.image = req.files.image[0].path;
    }

    // Gallery: keep existing URLs sent from client + add new uploads
    const kept    = keepImages ? JSON.parse(keepImages) : project.images;
    const newImgs = (req.files?.images || []).map(f => f.path);
    project.images = [...kept, ...newImgs];

    await project.save();
    res.json(project);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Slug already exists' });
    res.status(500).json({ error: err.message });
  }
});

/* ─── POST /api/project/:id/video  — upload video to Cloudinary ─────────── */
router.post('/:id/video', verifyAdmin, uploadVideo, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Delete old Cloudinary video if it was uploaded (not a YouTube link)
    if (project.video && project.video.includes('cloudinary')) {
      destroyAsset(project.video, 'video');
    }

    project.video = req.file.path;
    await project.save();
    res.json({ video: project.video });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

/* ─── DELETE /api/project/:id ────────────────────────────────────────────── */
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    destroyAsset(project.image);
    project.images.forEach(img => destroyAsset(img));
    if (project.video && project.video.includes('cloudinary')) {
      destroyAsset(project.video, 'video');
    }

    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
