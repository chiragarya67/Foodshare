// routes/matches.js
const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const { protect } = require('../middleware/auth');

// GET /api/matches - donations matched to this charity
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'charity'
      ? { matchedCharity: req.user._id }
      : { business: req.user._id, status: { $in: ['matched', 'in_transit', 'completed'] } };

    const matches = await Donation.find(filter)
      .populate('business', 'name address phone')
      .populate('matchedCharity', 'name address phone')
      .sort({ matchedAt: -1 });

    res.json({ matches });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;