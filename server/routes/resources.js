 const express = require('express');
const Resource = require('../models/Resource');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// Get all resources (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { type, category, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;

    const resources = await Resource.find(filter)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single resource
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('postedBy', 'name email');
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create resource post
router.post('/', async (req, res) => {
  try {
    const { title, description, type, category, contactInfo } = req.body;
    if (!title || !description || !type || !contactInfo) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const resource = await Resource.create({
      title, description, type, category, contactInfo,
      postedBy: req.userId,
    });

    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark as resolved
router.patch('/:id/resolve', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });

    if (resource.postedBy.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    resource.status = 'resolved';
    await resource.save();
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete resource
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ error: 'Resource not found.' });

    if (resource.postedBy.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
