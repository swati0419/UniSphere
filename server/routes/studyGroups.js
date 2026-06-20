 const express = require('express');
const StudyGroup = require('../models/StudyGroup');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// Get all study groups
router.get('/', async (req, res) => {
  try {
    const groups = await StudyGroup.find()
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single group
router.get('/:id', async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email');
    if (!group) return res.status(404).json({ error: 'Study group not found.' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create study group
router.post('/', async (req, res) => {
  try {
    const { name, subject, description, maxMembers, meetingSchedule, meetingMode } = req.body;
    if (!name || !subject || !description) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const group = await StudyGroup.create({
      name, subject, description,
      maxMembers: maxMembers || 10,
      meetingSchedule: meetingSchedule || '',
      meetingMode: meetingMode || 'offline',
      createdBy: req.userId,
      members: [req.userId],
    });

    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Join/leave group
router.post('/:id/join', async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Study group not found.' });

    if (group.members.includes(req.userId)) {
      group.members = group.members.filter((id) => id.toString() !== req.userId.toString());
    } else {
      if (group.members.length >= group.maxMembers) {
        return res.status(400).json({ error: 'Study group is full.' });
      }
      group.members.push(req.userId);
    }

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete group
router.delete('/:id', async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ error: 'Study group not found.' });

    if (group.createdBy.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await StudyGroup.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
