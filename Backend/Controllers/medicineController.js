const db = require('../config/db');
const { calculateDistance } = require('../utils/distance');
const { logAudit } = require('../utils/logger');

/**
 * Search & List Medicines with available stock summary
 */
exports.getMedicines = async (req, res, next) => {
  try {
    const {
      search = '',
      category = '',
      dosage_form = '',
      manufacturer = '',
      requires_prescription = '',
      in_stock_only = 'false',
      user_lat,
      user_lng
    } = req.query;

    let sql = `
      SELECT 
        m.medicine_id,
        m.medicine_name,
        m.generic_name,
        m.category,
        m.manufacturer,
        m.description,
        m.dosage_form,
        m.strength,
        m.requires_prescription,
        m.side_effects,
        m.image_url,
        COALESCE(COUNT(DISTINCT CASE WHEN i.quantity > i.reserved_quantity AND p.approval_status = 'approved' THEN i.pharmacy_id END), 0) as pharmacies_with_stock,
        COALESCE(MIN(CASE WHEN i.quantity > i.reserved_quantity AND p.approval_status = 'approved' THEN i.price END), 0) as min_price,
        COALESCE(MAX(CASE WHEN i.quantity > i.reserved_quantity AND p.approval_status = 'approved' THEN i.price END), 0) as max_price,
        COALESCE(SUM(CASE WHEN p.approval_status = 'approved' THEN (i.quantity - i.reserved_quantity) ELSE 0 END), 0) as total_available_units
      FROM medicines m
      LEFT JOIN inventory i ON m.medicine_id = i.medicine_id
      LEFT JOIN pharmacies p ON i.pharmacy_id = p.pharmacy_id
      WHERE 1=1
    `;

    const params = [];

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      sql += ` AND (m.medicine_name LIKE ? OR m.generic_name LIKE ? OR m.description LIKE ? OR m.category LIKE ? OR m.manufacturer LIKE ?)`;
      params.push(term, term, term, term, term);
    }

    if (category && category !== 'All') {
      sql += ` AND m.category = ?`;
      params.push(category);
    }

    if (dosage_form && dosage_form !== 'All') {
      sql += ` AND m.dosage_form = ?`;
      params.push(dosage_form);
    }

    if (manufacturer) {
      sql += ` AND m.manufacturer LIKE ?`;
      params.push(`%${manufacturer}%`);
    }

    if (requires_prescription !== '') {
      sql += ` AND m.requires_prescription = ?`;
      params.push(requires_prescription === 'true' || requires_prescription === '1' ? 1 : 0);
    }

    sql += ` GROUP BY m.medicine_id ORDER BY m.medicine_name ASC`;

    let medicines = await db.query(sql, params);

    // Filter in-stock if requested
    if (in_stock_only === 'true') {
      medicines = medicines.filter(m => Number(m.pharmacies_with_stock) > 0);
    }

    res.json({
      success: true,
      count: medicines.length,
      data: medicines
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get distinct categories and dosage forms for search filters
 */
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await db.query('SELECT DISTINCT category FROM medicines ORDER BY category ASC');
    const dosageForms = await db.query('SELECT DISTINCT dosage_form FROM medicines ORDER BY dosage_form ASC');
    const manufacturers = await db.query('SELECT DISTINCT manufacturer FROM medicines ORDER BY manufacturer ASC');

    res.json({
      success: true,
      categories: categories.map(c => c.category),
      dosage_forms: dosageForms.map(d => d.dosage_form),
      manufacturers: manufacturers.map(m => m.manufacturer)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single medicine details along with all pharmacies stocking it
 */
exports.getMedicineById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_lat, user_lng } = req.query;

    const medicine = await db.queryOne('SELECT * FROM medicines WHERE medicine_id = ?', [id]);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found.'
      });
    }

    // Retrieve all pharmacies carrying this medicine with live stock
    const pharmaciesWithStock = await db.query(
      `SELECT 
        i.inventory_id,
        i.quantity,
        i.reserved_quantity,
        (i.quantity - i.reserved_quantity) as available_stock,
        i.price,
        i.batch_number,
        i.expiry_date,
        i.availability_status,
        i.last_updated,
        p.pharmacy_id,
        p.pharmacy_name,
        p.address,
        p.city,
        p.latitude,
        p.longitude,
        p.phone,
        p.email,
        p.opening_hours,
        p.is_24_hours
       FROM inventory i
       JOIN pharmacies p ON i.pharmacy_id = p.pharmacy_id
       WHERE i.medicine_id = ? AND p.approval_status = 'approved'
       ORDER BY i.price ASC`,
      [id]
    );

    // Calculate distances if coordinates are provided
    let formattedPharmacies = pharmaciesWithStock.map(p => {
      const available = Math.max(0, p.quantity - p.reserved_quantity);
      let status = p.availability_status;
      if (available === 0) status = 'Out of Stock';
      else if (available <= 5) status = 'Low Stock';
      else status = 'In Stock';

      const dist = calculateDistance(user_lat, user_lng, p.latitude, p.longitude, 'km');

      return {
        ...p,
        available_stock: available,
        computed_status: status,
        distance_km: dist !== null ? dist : null
      };
    });

    if (user_lat && user_lng) {
      formattedPharmacies.sort((a, b) => {
        if (a.distance_km === null) return 1;
        if (b.distance_km === null) return -1;
        return a.distance_km - b.distance_km;
      });
    }

    res.json({
      success: true,
      medicine,
      pharmacies: formattedPharmacies
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new Medicine (Admin or Pharmacist)
 */
exports.createMedicine = async (req, res, next) => {
  try {
    const {
      medicine_name,
      generic_name,
      category,
      manufacturer,
      description,
      dosage_form = 'Tablet',
      strength,
      requires_prescription = false,
      side_effects,
      image_url
    } = req.body;

    if (!medicine_name || !category || !manufacturer) {
      return res.status(400).json({
        success: false,
        message: 'Medicine name, category, and manufacturer are required.'
      });
    }

    const result = await db.execute(
      `INSERT INTO medicines 
       (medicine_name, generic_name, category, manufacturer, description, dosage_form, strength, requires_prescription, side_effects, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        medicine_name.trim(),
        generic_name ? generic_name.trim() : null,
        category.trim(),
        manufacturer.trim(),
        description || null,
        dosage_form.trim(),
        strength || null,
        requires_prescription ? 1 : 0,
        side_effects || null,
        image_url || null
      ]
    );

    await logAudit(req.user.user_id, 'MEDICINE_CREATE', `Created medicine "${medicine_name}" (ID: ${result.insertId})`);

    const newMedicine = await db.queryOne('SELECT * FROM medicines WHERE medicine_id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Medicine added to catalog successfully.',
      medicine: newMedicine
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Medicine (Admin only)
 */
exports.updateMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      medicine_name,
      generic_name,
      category,
      manufacturer,
      description,
      dosage_form,
      strength,
      requires_prescription,
      side_effects,
      image_url
    } = req.body;

    const existing = await db.queryOne('SELECT medicine_id FROM medicines WHERE medicine_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found.'
      });
    }

    await db.execute(
      `UPDATE medicines 
       SET medicine_name = COALESCE(?, medicine_name),
           generic_name = COALESCE(?, generic_name),
           category = COALESCE(?, category),
           manufacturer = COALESCE(?, manufacturer),
           description = COALESCE(?, description),
           dosage_form = COALESCE(?, dosage_form),
           strength = COALESCE(?, strength),
           requires_prescription = COALESCE(?, requires_prescription),
           side_effects = COALESCE(?, side_effects),
           image_url = COALESCE(?, image_url)
       WHERE medicine_id = ?`,
      [
        medicine_name,
        generic_name,
        category,
        manufacturer,
        description,
        dosage_form,
        strength,
        requires_prescription !== undefined ? (requires_prescription ? 1 : 0) : null,
        side_effects,
        image_url,
        id
      ]
    );

    await logAudit(req.user.user_id, 'MEDICINE_UPDATE', `Updated medicine ID ${id}`);

    const updated = await db.queryOne('SELECT * FROM medicines WHERE medicine_id = ?', [id]);

    res.json({
      success: true,
      message: 'Medicine updated successfully.',
      medicine: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Medicine (Admin only)
 */
exports.deleteMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await db.queryOne('SELECT medicine_name FROM medicines WHERE medicine_id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found.'
      });
    }

    await db.execute('DELETE FROM medicines WHERE medicine_id = ?', [id]);
    await logAudit(req.user.user_id, 'MEDICINE_DELETE', `Deleted medicine "${existing.medicine_name}" (ID: ${id})`);

    res.json({
      success: true,
      message: 'Medicine removed from catalog.'
    });
  } catch (error) {
    next(error);
  }
};
