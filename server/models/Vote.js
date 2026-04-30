const mongoose = require('mongoose');

// Separate Vote collection — full audit trail
const voteSchema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User',      required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    electionId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Election',  required: true },
  },
  { timestamps: true }
);

// Compound unique index — one vote per user per election
voteSchema.index({ userId: 1, electionId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
