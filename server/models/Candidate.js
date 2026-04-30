const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  party:       { type: String, default: '' },
  description: { type: String, default: '' },
  symbol:      { type: String, default: '🌸' }, // election symbol
  photo:       { type: String, default: '' },   // candidate photo URL
  votes:       { type: Number, default: 0 },
  election:    { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
});

module.exports = mongoose.model('Candidate', candidateSchema);
