const db = require('../config/db');
const { logAudit } = require('../utils/logger');

/**
 * Submit a new Complaint/Feedback (Patient or Pharmacist)
 */
exports.createComplaint = async (req, res, next) => {
  try {
    const { pharmacy_id, subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both subject and description for your inquiry.'
      });
    }

    const result = await db.execute(
      `INSERT INTO complaints (user_id, pharmacy_id, subject, description, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [
        req.user.user_id,
        pharmacy_id ? parseInt(pharmacy_id, 10) : null,
        subject.trim(),
        description.trim()
      ]
    );

    // Notify admins
    const admins = await db.query("SELECT user_id FROM users WHERE role = 'admin'");
    for (const admin of admins) {
      await db.execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, 'New Support Inquiry / Complaint', ?, 'system', '/admin/complaints')`,
        [admin.user_id, `New complaint submitted: "${subject.trim()}".`]
      );
    }

    await logAudit(req.user.user_id, 'COMPLAINT_CREATE', `Submitted complaint ID ${result.insertId}`);

    const newComplaint = await db.queryOne('SELECT * FROM complaints WHERE complaint_id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Your inquiry/complaint has been submitted. Support team will review it shortly.',
      data: newComplaint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Complaints (Patient views their own; Admin views all)
 */
exports.getComplaints = async (req, res, next) => {
  try {
    let sql = '';
    const params = [];

    if (req.user.role === 'admin') {
      sql = `
        SELECT c.*, u.full_name as user_name, u.email as user_email, u.role as user_role, p.pharmacy_name
        FROM complaints c
        JOIN users u ON c.user_id = u.user_id
        LEFT JOIN pharmacies p ON c.pharmacy_id = p.pharmacy_id
        ORDER BY c.created_at DESC
      `;
    } else {
      sql = `
        SELECT c.*, p.pharmacy_name
        FROM complaints c
        LEFT JOIN pharmacies p ON c.pharmacy_id = p.pharmacy_id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
      `;
      params.push(req.user.user_id);
    }

    const complaints = await db.query(sql, params);

    res.json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin Respond / Resolve Complaint
 */
exports.respondToComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { admin_response, status = 'resolved' } = req.body;

    if (!admin_response) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a response message.'
      });
    }

    const complaint = await db.queryOne('SELECT * FROM complaints WHERE complaint_id = ?', [id]);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint record not found.'
      });
    }

    await db.execute(
      `UPDATE complaints 
       SET admin_response = ?, status = ?, updated_at = NOW() 
       WHERE complaint_id = ?`,
      [admin_response.trim(), status, id]
    );

    // Notify original submitter
    await db.execute(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Support Update', ?, 'system', '/patient/complaints')`,
      [
        complaint.user_id,
        `Admin responded to your inquiry "${complaint.subject}": ${admin_response.trim().substring(0, 100)}...`
      ]
    );

    await logAudit(req.user.user_id, 'COMPLAINT_RESPOND', `Admin responded to complaint ID ${id}`);

    const updated = await db.queryOne('SELECT * FROM complaints WHERE complaint_id = ?', [id]);

    res.json({
      success: true,
      message: 'Response sent and complaint updated.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
