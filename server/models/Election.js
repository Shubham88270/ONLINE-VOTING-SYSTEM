const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    candidates:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }],
    isActive:    { type: Boolean, default: true },
    startDate:   { type: Date, default: Date.now },
    endDate:     { type: Date, default: null },   // null = no expiry
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Auto-expire: if endDate passed, isActive = false
electionSchema.pre('save', function (next) {
  if (this.endDate && new Date() > this.endDate) {
    this.isActive = false;
  }
  next();
});

module.exports = mongoose.model('Election', electionSchema);
