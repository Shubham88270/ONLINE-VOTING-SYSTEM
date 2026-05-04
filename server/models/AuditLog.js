const mongoose = require('mongoose');

// Stores WHO did WHAT — never stores what they voted for
const auditSchema = new mongoose.Schema({
  action:    { type: String, required: true }, // 'VOTE_CAST', 'USER_APPROVED', 'ELECTION_CREATED', etc.
  actor:     { type: String, required: true }, // voterId or 'admin'
  actorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  target:    { type: String, default: '' },    // election title, user name, etc.
  targetId:  { type: mongoose.Schema.Types.ObjectId, default: null },
  ip:        { type: String, default: '' },
  meta:      { type: Object, default: {} },    // extra info (no vote choice stored)
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditSchema);
