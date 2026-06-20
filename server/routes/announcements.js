 const express = require('express');
const Announcement = require('../models/Announcement');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// Get all announcements (everyone can view)
router.get('/', async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('postedBy', 'name email role')
      .sort({ pinned: -1, createdAt: -1 });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create announcement (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { title, content, category, pinned } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required.' });

    const announcement = await Announcement.create({
      title, content, category, pinned: !!pinned,
      postedBy: req.userId,
    });

    res.json(announcement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete announcement (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
