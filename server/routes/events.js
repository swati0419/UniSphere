 const express = require('express');
const Event = require('../models/Event');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name email')
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('attendees', 'name email');
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create event
router.post('/', async (req, res) => {
  try {
    const { title, description, category, date, time, location, maxAttendees } = req.body;
    if (!title || !description || !date || !time || !location) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const event = await Event.create({
      title, description, category, date, time, location,
      maxAttendees: maxAttendees || null,
      organizer: req.userId,
    });

    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RSVP to event
router.post('/:id/rsvp', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    if (event.attendees.includes(req.userId)) {
      event.attendees = event.attendees.filter((id) => id.toString() !== req.userId.toString());
    } else {
      if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
        return res.status(400).json({ error: 'Event is full.' });
      }
      event.attendees.push(req.userId);
    }

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete event (only organizer or admin)
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    if (event.organizer.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this event.' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
