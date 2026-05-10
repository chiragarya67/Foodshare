const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['business', 'charity', 'admin'], required: true },
    phone: { type: String, trim: true },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      coordinates: { lat: Number, lng: Number },
    },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    avatar: String,
    // Business-specific
    businessType: String,
    operatingHours: String,
    // Charity-specific
    charityType: String,
    capacity: Number, // max kg per week
    notifications: { type: Boolean, default: true },
    lastLogin: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});


userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);