const db = require('../config/db');
const { logAudit } = require('../utils/logger');

/**
 * Generate unique alphanumeric reservation code
 */
function generateReservationCode() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `RES-${year}-${randomNum}`;
}

/**
 * Create a new medicine reservation (Patient)
 */
exports.createReservation = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const {
      inventory_id,
      quantity = 1,
      patient_notes,
      prescription_id
    } = req.body;

    if (!inventory_id) {
      return res.status(400).json({
        success: false,
        message: 'Please specify the inventory item to reserve.'
      });
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Reservation quantity must be at least 1 unit.'
      });
    }

    // Retrieve inventory with pharmacy & medicine info
    const item = await db.queryOne(
      `SELECT i.*, p.pharmacy_name, p.user_id as pharmacist_user_id, p.approval_status,
              m.medicine_name, m.requires_prescription
       FROM inventory i
       JOIN pharmacies p ON i.pharmacy_id = p.pharmacy_id
       JOIN medicines m ON i.medicine_id = m.medicine_id
       WHERE i.inventory_id = ?`,
      [inventory_id]
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Medicine inventory item not found.'
      });
    }

    if (item.approval_status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This pharmacy is currently not eligible for reservations.'
      });
    }

    // Check expiry
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (item.expiry_date && new Date(item.expiry_date) < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reserve medicine that has passed its expiration date.'
      });
    }

    // Check available stock
    const available = item.quantity - item.reserved_quantity;
    if (available < qty) {
      return res.status(400).json({
        success: false,
        message: `Reservation quantity (${qty}) exceeds currently available stock (${available} units).`
      });
    }

    // Generate unique code & expiry time (24 hours from now)
    const reservationCode = generateReservationCode();
    const unitPrice = parseFloat(item.price);
    const totalPrice = Number((unitPrice * qty).toFixed(2));

    // Create reservation record
    const result = await db.execute(
      `INSERT INTO reservations 
       (reservation_code, user_id, inventory_id, prescription_id, quantity, unit_price, total_price, status, patient_notes, expiry_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
      [
        reservationCode,
        userId,
        inventory_id,
        prescription_id || null,
        qty,
        unitPrice,
        totalPrice,
        patient_notes || null
      ]
    );

    // Lock reserved stock in inventory
    const newReservedQty = item.reserved_quantity + qty;
    const newStatus = (item.quantity - newReservedQty) <= 0 ? 'Out of Stock' : (item.quantity - newReservedQty <= 5 ? 'Low Stock' : 'In Stock');
    await db.execute(
      'UPDATE inventory SET reserved_quantity = ?, availability_status = ? WHERE inventory_id = ?',
      [newReservedQty, newStatus, inventory_id]
    );

    // Send Notification to Pharmacist
    await db.execute(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'New Reservation Received', ?, 'reservation', '/pharmacy/reservations')`,
      [
        item.pharmacist_user_id,
        `Patient requested reservation for ${qty}x ${item.medicine_name} (Code: ${reservationCode}).`
      ]
    );

    // Send Notification to Patient
    await db.execute(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Reservation Submitted', ?, 'reservation', '/patient/reservations')`,
      [
        userId,
        `Your reservation for ${item.medicine_name} at ${item.pharmacy_name} was placed successfully (Code: ${reservationCode}). Awaiting pharmacy confirmation.`
      ]
    );

    await logAudit(userId, 'RESERVATION_CREATE', `Created reservation ${reservationCode} for ${qty}x ${item.medicine_name}`);

    const newReservation = await db.queryOne(
      `SELECT r.*, m.medicine_name, m.dosage_form, m.category, p.pharmacy_name, p.address as pharmacy_address, p.phone as pharmacy_phone
       FROM reservations r
       JOIN inventory i ON r.inventory_id = i.inventory_id
       JOIN medicines m ON i.medicine_id = m.medicine_id
       JOIN pharmacies p ON i.pharmacy_id = p.pharmacy_id
       WHERE r.reservation_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Medicine reserved successfully! Please present your reservation code at the pharmacy.',
      reservation: newReservation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reservations for Patient or Pharmacist
 */
exports.getReservations = async (req, res, next) => {
  try {
    const { status = '', search = '' } = req.query;
    let sql = '';
    const params = [];

    if (req.user.role === 'patient') {
      sql = `
        SELECT 
          r.*,
          m.medicine_id,
          m.medicine_name,
          m.generic_name,
          m.dosage_form,
          m.strength,
          m.requires_prescription,
          p.pharmacy_id,
          p.pharmacy_name,
          p.address as pharmacy_address,
          p.city as pharmacy_city,
          p.phone as pharmacy_phone,
          p.latitude as pharmacy_latitude,
          p.longitude as pharmacy_longitude,
          pr.image_path as prescription_image
        FROM reservations r
        JOIN inventory i ON r.inventory_id = i.inventory_id
        JOIN medicines m ON i.medicine_id = m.medicine_id
        JOIN pharmacies p ON i.pharmacy_id = p.pharmacy_id
        LEFT JOIN prescriptions pr ON r.prescription_id = pr.prescription_id
        WHERE r.user_id = ?
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
        SELECT 
          r.*,
          u.full_name as patient_name,
          u.email as patient_email,
          u.phone as patient_phone,
          m.medicine_id,
          m.medicine_name,
          m.generic_name,
          m.dosage_form,
          m.strength,
          m.requires_prescription,
          pr.image_path as prescription_image
        FROM reservations r
        JOIN inventory i ON r.inventory_id = i.inventory_id
        JOIN medicines m ON i.medicine_id = m.medicine_id
        JOIN users u ON r.user_id = u.user_id
        LEFT JOIN prescriptions pr ON r.prescription_id = pr.prescription_id
        WHERE i.pharmacy_id = ?
      `;
      params.push(req.user.pharmacy_id);
    } else if (req.user.role === 'admin') {
      sql = `
        SELECT 
          r.*,
          u.full_name as patient_name,
          u.email as patient_email,
          u.phone as patient_phone,
          m.medicine_name,
          m.dosage_form,
          p.pharmacy_name,
          p.phone as pharmacy_phone
        FROM reservations r
        JOIN inventory i ON r.inventory_id = i.inventory_id
        JOIN medicines m ON i.medicine_id = m.medicine_id
        JOIN pharmacies p ON i.pharmacy_id = p.pharmacy_id
        JOIN users u ON r.user_id = u.user_id
        WHERE 1=1
      `;
    }

    if (status && status !== 'All') {
      sql += ` AND r.status = ?`;
      params.push(status);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      sql += ` AND (r.reservation_code LIKE ? OR m.medicine_name LIKE ?)`;
      params.push(term, term);
    }

    sql += ` ORDER BY r.created_at DESC`;

    const reservations = await db.query(sql, params);

    res.json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update reservation status (Confirm, Reject, Collect, Cancel)
 */
exports.updateReservationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['Confirmed', 'Collected', 'Rejected', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status transition requested.'
      });
    }

    const reservation = await db.queryOne(
      `SELECT r.*, i.inventory_id, i.pharmacy_id, i.quantity, i.reserved_quantity,
              m.medicine_name, p.pharmacy_name, p.user_id as pharmacist_user_id, u.full_name as patient_name
       FROM reservations r
       JOIN inventory i ON r.inventory_id = i.inventory_id
       JOIN medicines m ON i.medicine_id = m.medicine_id
       JOIN pharmacies p ON i.pharmacy_id = p.pharmacy_id
       JOIN users u ON r.user_id = u.user_id
       WHERE r.reservation_id = ?`,
      [id]
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found.'
      });
    }

    const isPatientOwner = req.user.role === 'patient' && reservation.user_id === req.user.user_id;
    const isPharmacistOwner = req.user.role === 'pharmacist' && reservation.pharmacy_id === req.user.pharmacy_id;
    const isAdmin = req.user.role === 'admin';

    if (!isPatientOwner && !isPharmacistOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have authorization to update this reservation.'
      });
    }

    // Patient can only Cancel active reservations
    if (isPatientOwner && status !== 'Cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Patients may only cancel their pending or confirmed reservations.'
      });
    }

    // Cannot modify already finalized reservations
    if (['Collected', 'Cancelled', 'Rejected', 'Expired'].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: `Reservation is already marked as ${reservation.status} and cannot be modified.`
      });
    }

    const inventoryId = reservation.inventory_id;
    const reservedQty = reservation.quantity;

    if (status === 'Confirmed') {
      // Confirming reservation
      await db.execute('UPDATE reservations SET status = ? WHERE reservation_id = ?', ['Confirmed', id]);

      // Notify Patient
      await db.execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, 'Reservation Confirmed!', ?, 'reservation', '/patient/reservations')`,
        [
          reservation.user_id,
          `Your reservation (${reservation.reservation_code}) for ${reservation.medicine_name} has been CONFIRMED by ${reservation.pharmacy_name}. Ready for pick-up!`
        ]
      );
    } else if (status === 'Rejected') {
      // Rejection: Free up reserved quantity
      const newReserved = Math.max(0, reservation.reserved_quantity - reservedQty);
      const newStatus = (reservation.quantity - newReserved) <= 0 ? 'Out of Stock' : ((reservation.quantity - newReserved) <= 5 ? 'Low Stock' : 'In Stock');

      await db.execute(
        'UPDATE inventory SET reserved_quantity = ?, availability_status = ? WHERE inventory_id = ?',
        [newReserved, newStatus, inventoryId]
      );

      await db.execute(
        'UPDATE reservations SET status = ?, rejection_reason = ? WHERE reservation_id = ?',
        ['Rejected', rejection_reason || 'Stock unavailable / compliance requirement not met.', id]
      );

      // Notify Patient
      await db.execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, 'Reservation Declined', ?, 'reservation', '/patient/reservations')`,
        [
          reservation.user_id,
          `Reservation ${reservation.reservation_code} for ${reservation.medicine_name} could not be fulfilled. Reason: ${rejection_reason || 'Out of stock'}.`
        ]
      );
    } else if (status === 'Cancelled') {
      // Cancellation by Patient or Staff: Free up reserved quantity
      const newReserved = Math.max(0, reservation.reserved_quantity - reservedQty);
      const newStatus = (reservation.quantity - newReserved) <= 0 ? 'Out of Stock' : ((reservation.quantity - newReserved) <= 5 ? 'Low Stock' : 'In Stock');

      await db.execute(
        'UPDATE inventory SET reserved_quantity = ?, availability_status = ? WHERE inventory_id = ?',
        [newReserved, newStatus, inventoryId]
      );

      await db.execute(
        'UPDATE reservations SET status = ?, rejection_reason = ? WHERE reservation_id = ?',
        ['Cancelled', rejection_reason || 'Cancelled by user.', id]
      );

      // Notify Pharmacist
      await db.execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, 'Reservation Cancelled', ?, 'reservation', '/pharmacy/reservations')`,
        [
          reservation.pharmacist_user_id,
          `Reservation ${reservation.reservation_code} for ${reservation.medicine_name} was cancelled. Reserved stock released.`
        ]
      );
    } else if (status === 'Collected') {
      // Collected: Deduct from physical stock and release reserved lock
      const newPhysicalQty = Math.max(0, reservation.quantity - reservedQty);
      const newReserved = Math.max(0, reservation.reserved_quantity - reservedQty);
      const newStatus = (newPhysicalQty - newReserved) <= 0 ? 'Out of Stock' : ((newPhysicalQty - newReserved) <= 5 ? 'Low Stock' : 'In Stock');

      await db.execute(
        'UPDATE inventory SET quantity = ?, reserved_quantity = ?, availability_status = ? WHERE inventory_id = ?',
        [newPhysicalQty, newReserved, newStatus, inventoryId]
      );

      await db.execute('UPDATE reservations SET status = ? WHERE reservation_id = ?', ['Collected', id]);

      // Notify Patient
      await db.execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, 'Medicine Collected', ?, 'reservation', '/patient/reservations')`,
        [
          reservation.user_id,
          `Thank you! Your medicine (${reservation.medicine_name}) for order ${reservation.reservation_code} was marked as collected.`
        ]
      );
    }

    await logAudit(req.user.user_id, 'RESERVATION_STATUS_UPDATE', `Updated reservation ${reservation.reservation_code} to ${status}`);

    const updated = await db.queryOne('SELECT * FROM reservations WHERE reservation_id = ?', [id]);

    res.json({
      success: true,
      message: `Reservation marked as ${status}.`,
      reservation: updated
    });
  } catch (error) {
    next(error);
  }
};
