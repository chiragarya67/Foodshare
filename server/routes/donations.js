const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Helper: broadcast notification via Socket.IO
async function notifyCharity(io, charityId, donation) {
  const note = await Notification.create({
    recipient: charityId,
    type: 'new_donation',
    title: 'New Food Available!',
    message: `${donation.quantity}${donation.unit} of ${donation.title} is available for pickup.`,
    data: { donationId: donation._id },
  });
  io.to(charityId.toString()).emit('notification', note);
}

// GET /api/donations - list donations (role-filtered)
router.get('/', protect, async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === 'business') filter.business = req.user._id;
    if (req.user.role === 'charity') {
      filter.status = 'available';
    }
    if (status) filter.status = status;
    if (category) filter.category = category;

    const total = await Donation.countDocuments(filter);
    const donations = await Donation.find(filter)
      .populate('business', 'name address businessType')
      .populate('matchedCharity', 'name address')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ donations, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/donations/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('business', 'name email phone address operatingHours')
      .populate('matchedCharity', 'name email phone address');
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    res.json({ donation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/donations - business creates donation
router.post('/', protect, authorize('business', 'admin'), async (req, res) => {
  try {
    const donation = await Donation.create({ ...req.body, business: req.user._id });

    // Auto-match: find active charities and notify them
    const charities = await User.find({ role: 'charity', isActive: true, notifications: true });
    const io = req.app.get('io');
    for (const charity of charities) {
      await notifyCharity(io, charity._id, donation);
    }

    res.status(201).json({ donation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/donations/:id - update donation
router.put('/:id', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    // Only owner or admin can edit
    if (req.user.role !== 'admin' && donation.business.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await Donation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ donation: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/donations/:id/claim - charity claims a donation
router.post('/:id/claim', protect, authorize('charity'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });
    if (donation.status !== 'available') return res.status(400).json({ message: 'Donation no longer available' });

    donation.status = 'matched';
    donation.matchedCharity = req.user._id;
    donation.matchedAt = new Date();
    await donation.save();

    // Notify business
    const io = req.app.get('io');
    const note = await Notification.create({
      recipient: donation.business,
      type: 'match_made',
      title: 'Donation Claimed!',
      message: `${req.user.name} will pick up your ${donation.title} donation.`,
      data: { donationId: donation._id, charityId: req.user._id },
    });
    io.to(donation.business.toString()).emit('notification', note);

    await donation.populate('business matchedCharity', 'name email phone address');
    res.json({ donation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/donations/:id/complete
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Not found' });

    donation.status = 'completed';
    donation.completedAt = new Date();
    if (req.body.actualWeight) donation.actualWeight = req.body.actualWeight;
    await donation.save();

    res.json({ donation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/donations/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && donation.business.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await donation.deleteOne();
    res.json({ message: 'Donation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;