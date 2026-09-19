const db = require('../config/db');
const { logAudit } = require('../utils/logger');

/**
 * Upload Prescription Image (Patient)
 */
exports.uploadPrescription = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a prescription image or document (JPG, PNG, WEBP, or PDF).'
      });
    }

    const { notes, pharmacy_id } = req.body;
    const imagePath = `/uploads/prescriptions/${req.file.filename}`;

    const result = await db.execute(
      `INSERT INTO prescriptions (user_id, pharmacy_id, image_path, notes, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [
        req.user.user_id,
        pharmacy_id ? parseInt(pharmacy_id, 10) : null,
        imagePath,
        notes || null
      ]
    );

    // If pharmacy was designated, notify the pharmacy
    if (pharmacy_id) {
      const pharmacy = await db.queryOne('SELECT user_id, pharmacy_name FROM pharmacies WHERE pharmacy_id = ?', [pharmacy_id]);
      if (pharmacy) {
        await db.execute(
          `INSERT INTO notifications (user_id, title, message, type, link)
           VALUES (?, 'New Prescription Uploaded', ?, 'prescription', '/pharmacy/prescriptions')`,
          [
            pharmacy.user_id,
            `Patient ${req.user.full_name} submitted a prescription image for verification.`
          ]
        );
      }
    }

    await logAudit(req.user.user_id, 'PRESCRIPTION_UPLOAD', `Uploaded prescription ID ${result.insertId}`);

    const newPrescription = await db.queryOne('SELECT * FROM prescriptions WHERE prescription_id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Prescription uploaded successfully. A pharmacist will review your prescription.',
      prescription: newPrescription
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Prescriptions (Patient or Pharmacist or Admin)
 */
exports.getPrescriptions = async (req, res, next) => {
  try {
    let sql = '';
    const params = [];

    if (req.user.role === 'patient') {
      sql = `
        SELECT pr.*, p.pharmacy_name, p.address as pharmacy_address, p.phone as pharmacy_phone
        FROM prescriptions pr
        LEFT JOIN pharmacies p ON pr.pharmacy_id = p.pharmacy_id
        WHERE pr.user_id = ?
        ORDER BY pr.created_at DESC
      `;
      params.push(req.user.user_id);
    } else if (req.user.role === 'pharmacist') {
      if (!req.user.pharmacy_id) {
        return res.status(400).json({
          success: false,
          message: 'No pharmacy associated with your account.'
        });
      }
      sql = `
        SELECT pr.*, u.full_name as patient_name, u.email as patient_email, u.phone as patient_phone
        FROM prescriptions pr
        JOIN users u ON pr.user_id = u.user_id
        WHERE pr.pharmacy_id = ? OR pr.pharmacy_id IS NULL
        ORDER BY pr.created_at DESC
      `;
      params.push(req.user.pharmacy_id);
    } else if (req.user.role === 'admin') {
      sql = `
        SELECT pr.*, u.full_name as patient_name, u.email as patient_email, p.pharmacy_name
        FROM prescriptions pr
        JOIN users u ON pr.user_id = u.user_id
        LEFT JOIN pharmacies p ON pr.pharmacy_id = p.pharmacy_id
        ORDER BY pr.created_at DESC
      `;
    }

    const prescriptions = await db.query(sql, params);

    res.json({
      success: true,
      count: prescriptions.length,
      data: prescriptions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Prescription Review Status (Pharmacist)
 */
exports.reviewPrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, pharmacist_notes } = req.body;

    if (!['reviewed', 'fulfilled', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid prescription review status.'
      });
    }

    const prescription = await db.queryOne('SELECT * FROM prescriptions WHERE prescription_id = ?', [id]);
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found.'
      });
    }

    await db.execute(
      `UPDATE prescriptions 
       SET status = ?,
           pharmacist_notes = ?,
           pharmacy_id = COALESCE(pharmacy_id, ?)
       WHERE prescription_id = ?`,
      [status, pharmacist_notes || null, req.user.pharmacy_id || null, id]
    );

    // Notify patient
    await db.execute(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Prescription Reviewed', ?, 'prescription', '/patient/prescriptions')`,
      [
        prescription.user_id,
        `Your uploaded prescription status has been updated to ${status.toUpperCase()}. Notes: ${pharmacist_notes || 'None'}`
      ]
    );

    const updated = await db.queryOne('SELECT * FROM prescriptions WHERE prescription_id = ?', [id]);

    res.json({
      success: true,
      message: `Prescription marked as ${status}.`,
      prescription: updated
    });
  } catch (error) {
    next(error);
  }
};
