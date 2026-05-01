const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  // Basic
  name:       { type: String, required: true, trim: true },
  rollNumber: { type: String, default: '' },
  course:     { type: String, default: '' },
  year:       { type: String, default: '' },

  // Contact
  email:      { type: String, default: '' },
  mobile:     { type: String, default: '' },

  // Position
  appliedPost: { type: String, default: '' }, // CR, President, Secretary etc.
  description: { type: String, default: '' }, // party / extra info
  symbol:      { type: String, default: '🌸' },

  // Eligibility
  attendance:       { type: String, default: '' }, // e.g. "85%"
  disciplineRecord: { type: String, default: 'Good' },
  approvalStatus:   { type: String, default: 'Pending', enum: ['Pending','Approved','Rejected'] },

  // Manifesto
  plans:    { type: String, default: '' },
  goals:    { type: String, default: '' },
  slogan:   { type: String, default: '' },

  // Documents (base64 or URL)
  photo:     { type: String, default: '' },
  collegeId: { type: String, default: '' },
  signature: { type: String, default: '' },

  // Voting
  votes:    { type: Number, default: 0 },
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Candidate', candidateSchema);
