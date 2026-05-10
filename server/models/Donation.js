const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['produce', 'bakery', 'dairy', 'meat', 'prepared', 'packaged', 'beverages', 'other'],
    },
    description: { type: String, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, enum: ['kg', 'lbs', 'items', 'boxes', 'bags'], default: 'kg' },
    expiryDate: { type: Date, required: true },
    pickupBy: { type: Date, required: true },
    pickupAddress: {
      street: String,
      city: String,
      state: String,
      zip: String,
      coordinates: { lat: Number, lng: Number },
    },
    dietary: {
      vegan: { type: Boolean, default: false },
      vegetarian: { type: Boolean, default: false },
      glutenFree: { type: Boolean, default: false },
      halal: { type: Boolean, default: false },
      kosher: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ['available', 'matched', 'in_transit', 'completed', 'expired', 'cancelled'],
      default: 'available',
    },
    matchedCharity: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    matchedAt: Date,
    completedAt: Date,
    images: [String],
    notes: String,
    estimatedValue: Number, // in USD
    actualWeight: Number,   // confirmed after pickup
    impactScore: Number,    // calculated field
  },
  { timestamps: true }
);

// Auto-set impactScore before save
donationSchema.pre('save', function () {
  if (this.quantity) {
    this.impactScore = Math.round(this.quantity * 2.5); // meals equivalent
  }
});

donationSchema.index({ status: 1, expiryDate: 1 });
donationSchema.index({ business: 1 });
donationSchema.index({ matchedCharity: 1 });

module.exports = mongoose.model('Donation', donationSchema);