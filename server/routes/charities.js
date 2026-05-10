// routes/charities.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const charities = await User.find({ role: 'charity', isActive: true }).select('-password');
    res.json({ charities });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const charity = await User.findOne({ _id: req.params.id, role: 'charity' }).select('-password');
    if (!charity) return res.status(404).json({ message: 'Charity not found' });
    res.json({ charity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
