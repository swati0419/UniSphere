 const express = require('express');
const ForumPost = require('../models/ForumPost');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate('postedBy', 'name email')
      .populate('replies.postedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('postedBy', 'name email')
      .populate('replies.postedBy', 'name email');
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create post
router.post('/', async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required.' });

    const post = await ForumPost.create({
      title, content,
      tags: tags || [],
      postedBy: req.userId,
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add reply
router.post('/:id/reply', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Reply content is required.' });

    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    post.replies.push({ content, postedBy: req.userId });
    await post.save();

    const updated = await ForumPost.findById(req.params.id)
      .populate('postedBy', 'name email')
      .populate('replies.postedBy', 'name email');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle upvote
router.post('/:id/upvote', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    if (post.upvotes.includes(req.userId)) {
      post.upvotes = post.upvotes.filter((id) => id.toString() !== req.userId.toString());
    } else {
      post.upvotes.push(req.userId);
    }

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete post
router.delete('/:id', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });

    if (post.postedBy.toString() !== req.userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    await ForumPost.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

