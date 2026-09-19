const db = require('../config/db');

/**
 * Log an audit trail entry
 * @param {number|null} userId 
 * @param {string} action 
 * @param {string} description 
 * @param {string} ipAddress 
 */
async function logAudit(userId, action, description, ipAddress = '127.0.0.1') {
  try {
    await db.execute(
      'INSERT INTO audit_logs (user_id, action, description, ip_address) VALUES (?, ?, ?, ?)',
      [userId || null, action, description, ipAddress]
    );
  } catch (err) {
    console.error('[AUDIT LOG ERROR]:', err.message);
  }
}

module.exports = {
  logAudit
};
