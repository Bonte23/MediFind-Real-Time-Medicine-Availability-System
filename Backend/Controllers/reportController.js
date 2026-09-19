const db = require('../config/db');

/**
 * Helper to convert array of objects to CSV string
 */
function convertToCSV(headers, rows) {
  const headerRow = headers.map(h => `"${h.label}"`).join(',');
  const dataRows = rows.map(row => {
    return headers.map(h => {
      const val = row[h.key] !== undefined && row[h.key] !== null ? String(row[h.key]).replace(/"/g, '""') : '';
      return `"${val}"`;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\r\n');
}

/**
 * Export Pharmacy Inventory Report (CSV or JSON)
 */
exports.getInventoryReport = async (req, res, next) => {
  try {
    const { format = 'json' } = req.query;
    const pharmacyId = req.user.role === 'pharmacist' ? req.user.pharmacy_id : (req.query.pharmacy_id || null);

    let sql = `
      SELECT 
        i.inventory_id,
        p.pharmacy_name,
        m.medicine_name,
        m.category,
        m.dosage_form,
        m.strength,
        i.quantity,
        i.reserved_quantity,
        (i.quantity - i.reserved_quantity) as available_units,
        i.price,
        (i.quantity * i.price) as total_valuation,
        i.batch_number,
        i.expiry_date,
        i.availability_status,
        i.last_updated
      FROM inventory i
      JOIN medicines m ON i.medicine_id = m.medicine_id
      JOIN pharmacies p ON i.pharmacy_id = p.pharmacy_id
      WHERE 1=1
    `;

    const params = [];
    if (pharmacyId) {
      sql += ` AND i.pharmacy_id = ?`;
      params.push(pharmacyId);
    }

    sql += ` ORDER BY p.pharmacy_name ASC, m.medicine_name ASC`;

    const rows = await db.query(sql, params);

    if (format === 'csv') {
      const headers = [
        { label: 'Inventory ID', key: 'inventory_id' },
        { label: 'Pharmacy Name', key: 'pharmacy_name' },
        { label: 'Medicine Name', key: 'medicine_name' },
        { label: 'Category', key: 'category' },
        { label: 'Dosage Form', key: 'dosage_form' },
        { label: 'Strength', key: 'strength' },
        { label: 'Total Quantity', key: 'quantity' },
        { label: 'Reserved Units', key: 'reserved_quantity' },
        { label: 'Available Stock', key: 'available_units' },
        { label: 'Unit Price ($)', key: 'price' },
        { label: 'Valuation ($)', key: 'total_valuation' },
        { label: 'Batch No', key: 'batch_number' },
        { label: 'Expiry Date', key: 'expiry_date' },
        { label: 'Status', key: 'availability_status' },
        { label: 'Last Updated', key: 'last_updated' }
      ];

      const csv = convertToCSV(headers, rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="inventory_report.csv"');
      return res.send(csv);
    }

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Export Reservations Report (CSV or JSON)
 */
exports.getReservationReport = async (req, res, next) => {
  try {
    const { format = 'json' } = req.query;
    const pharmacyId = req.user.role === 'pharmacist' ? req.user.pharmacy_id : (req.query.pharmacy_id || null);

    let sql = `
      SELECT 
        r.reservation_code,
        u.full_name as patient_name,
        u.email as patient_email,
        u.phone as patient_phone,
        p.pharmacy_name,
        m.medicine_name,
        m.category,
        r.quantity,
        r.unit_price,
        r.total_price,
        r.status,
        r.reservation_date,
        r.expiry_time,
        r.rejection_reason
      FROM reservations r
      JOIN inventory i ON r.inventory_id = i.inventory_id
      JOIN medicines m ON i.medicine_id = m.medicine_id
      JOIN pharmacies p ON i.pharmacy_id = p.pharmacy_id
      JOIN users u ON r.user_id = u.user_id
      WHERE 1=1
    `;

    const params = [];
    if (pharmacyId) {
      sql += ` AND i.pharmacy_id = ?`;
      params.push(pharmacyId);
    }

    sql += ` ORDER BY r.created_at DESC`;

    const rows = await db.query(sql, params);

    if (format === 'csv') {
      const headers = [
        { label: 'Reservation Code', key: 'reservation_code' },
        { label: 'Patient Name', key: 'patient_name' },
        { label: 'Patient Email', key: 'patient_email' },
        { label: 'Patient Phone', key: 'patient_phone' },
        { label: 'Pharmacy Name', key: 'pharmacy_name' },
        { label: 'Medicine', key: 'medicine_name' },
        { label: 'Category', key: 'category' },
        { label: 'Quantity', key: 'quantity' },
        { label: 'Unit Price ($)', key: 'unit_price' },
        { label: 'Total Price ($)', key: 'total_price' },
        { label: 'Status', key: 'status' },
        { label: 'Date', key: 'reservation_date' },
        { label: 'Expiry Time', key: 'expiry_time' }
      ];

      const csv = convertToCSV(headers, rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="reservations_report.csv"');
      return res.send(csv);
    }

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    next(error);
  }
};
