const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/analytics/overview - role-aware summary
router.get('/overview', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isBusiness = req.user.role === 'business';
    const isCharity = req.user.role === 'charity';

    const baseFilter = isBusiness
      ? { business: req.user._id }
      : isCharity
      ? { matchedCharity: req.user._id }
      : {};

    const [totalDonations, completed, active, expired, users] = await Promise.all([
      Donation.countDocuments(baseFilter),
      Donation.countDocuments({ ...baseFilter, status: 'completed' }),
      Donation.countDocuments({ ...baseFilter, status: { $in: ['available', 'matched'] } }),
      Donation.countDocuments({ ...baseFilter, status: 'expired' }),
      isAdmin ? User.countDocuments() : Promise.resolve(null),
    ]);

    // Total weight donated
    const weightAgg = await Donation.aggregate([
      { $match: { ...baseFilter, status: 'completed' } },
      { $group: { _id: null, totalWeight: { $sum: '$actualWeight' }, totalQty: { $sum: '$quantity' } } },
    ]);
    const weightData = weightAgg[0] || { totalWeight: 0, totalQty: 0 };

    // Meals equivalent (1kg ≈ 2.5 meals)
    const mealsProvided = Math.round((weightData.totalWeight || weightData.totalQty) * 2.5);

    // CO2 saved (1kg food waste = ~2.5kg CO2)
    const co2Saved = Math.round((weightData.totalWeight || weightData.totalQty) * 2.5);

    res.json({
      totalDonations,
      completedDonations: completed,
      activeDonations: active,
      expiredDonations: expired,
      totalWeight: weightData.totalWeight || weightData.totalQty,
      mealsProvided,
      co2Saved,
      ...(isAdmin && { totalUsers: users }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/trends - monthly donation trends
router.get('/trends', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'business' ? { business: req.user._id } : {};
    const trends = await Donation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          totalQty: { $sum: '$quantity' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formatted = trends.map((t) => ({
      month: `${months[t._id.month - 1]} ${t._id.year}`,
      donations: t.count,
      completed: t.completed,
      quantity: t.totalQty,
    }));

    res.json({ trends: formatted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/categories - breakdown by food category
router.get('/categories', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'business' ? { business: req.user._id } : {};
    const categories = await Donation.aggregate([
      { $match: filter },
      { $group: { _id: '$category', count: { $sum: 1 }, totalQty: { $sum: '$quantity' } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/analytics/leaderboard (admin)
router.get('/leaderboard', protect, authorize('admin'), async (req, res) => {
  try {
    const top = await Donation.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$business', totalDonations: { $sum: 1 }, totalQty: { $sum: '$quantity' } } },
      { $sort: { totalDonations: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'business' } },
      { $unwind: '$business' },
      { $project: { 'business.password': 0 } },
    ]);
    res.json({ leaderboard: top });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;