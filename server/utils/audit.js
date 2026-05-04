const AuditLog = require('../models/AuditLog');

/**
 * Log an audit event.
 * @param {string} action   - e.g. 'VOTE_CAST', 'USER_APPROVED', 'ELECTION_CREATED'
 * @param {object} opts     - { actorId, actor, target, targetId, ip, meta }
 */
async function logAudit(action, opts = {}) {
  try {
    await AuditLog.create({
      action,
      actor:    opts.actor    || 'system',
      actorId:  opts.actorId  || null,
      target:   opts.target   || '',
      targetId: opts.targetId || null,
      ip:       opts.ip       || '',
      meta:     opts.meta     || {},
    });
  } catch (err) {
    // Never crash the main flow because of audit logging
    console.error('Audit log error:', err.message);
  }
}

module.exports = { logAudit };
