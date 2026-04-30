const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    isAdmin:  { type: Boolean, default: false },

    // Voter specific
    voterId:  { type: String, unique: true, sparse: true }, // auto-generated
    photo:    { type: String, default: '' },                // profile photo URL

    // Status
    isVerified:  { type: Boolean, default: false },  // email verified
    isApproved:  { type: Boolean, default: false },  // admin approved

    votedElections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Election' }],

    // Email verification
    verificationToken:  { type: String, default: null },
    verificationExpiry: { type: Date,   default: null },
  },
  { timestamps: true }
);

// Hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Auto-generate voter ID before save
userSchema.pre('save', async function (next) {
  if (!this.voterId) {
    const count = await mongoose.model('User').countDocuments();
    this.voterId = `VOTER-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

userSchema.methods.matchPassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
