const db = require('../config/db');
const { calculateDistance } = require('../utils/distance');
const { logAudit } = require('../utils/logger');

/**
 * Get all approved pharmacies with distance from user and optional medicine filter
 */
exports.getPharmacies = async (req, res, next) => {
  try {
    const {
      search = '',
      city = '',
      is_24_hours = '',
      medicine_id = '',
      user_lat,
      user_lng,
      radius_km = ''
    } = req.query;

    let sql = `
      SELECT 
        p.pharmacy_id,
        p.user_id,
        p.pharmacy_name,
        p.license_number,
        p.address,
        p.city,
        p.latitude,
        p.longitude,
        p.phone,
        p.email,
        p.opening_hours,
        p.is_24_hours,
        p.approval_status,
        COUNT(DISTINCT i.inventory_id) as total_medicines_stocked,
        COALESCE(SUM(CASE WHEN i.quantity > i.reserved_quantity THEN 1 ELSE 0 END), 0) as in_stock_count
      FROM pharmacies p
      LEFT JOIN inventory i ON p.pharmacy_id = i.pharmacy_id
      WHERE p.approval_status = 'approved'
    `;

    const params = [];

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      sql += ` AND (p.pharmacy_name LIKE ? OR p.address LIKE ? OR p.city LIKE ?)`;
      params.push(term, term, term);
    }

    if (city) {
      sql += ` AND p.city = ?`;
      params.push(city);
    }

    if (is_24_hours === 'true' || is_24_hours === '1') {
      sql += ` AND p.is_24_hours = 1`;
    }

    if (medicine_id) {
      sql += ` AND p.pharmacy_id IN (
        SELECT pharmacy_id FROM inventory WHERE medicine_id = ? AND quantity > reserved_quantity
      )`;
      params.push(medicine_id);
    }

    sql += ` GROUP BY p.pharmacy_id ORDER BY p.pharmacy_name ASC`;

    const pharmacies = await db.query(sql, params);

    let formatted = pharmacies.map(p => {
      const dist = calculateDistance(user_lat, user_lng, p.latitude, p.longitude, 'km');
      return {
        ...p,
        is_24_hours: Boolean(p.is_24_hours),
        distance_km: dist !== null ? dist : null
      };
    });

    // Apply radius filter if provided
    if (radius_km && user_lat && user_lng) {
      const maxRadius = parseFloat(radius_km);
      formatted = formatted.filter(p => p.distance_km !== null && p.distance_km <= maxRadius);
    }

    // Sort by distance if user coords provided
    if (user_lat && user_lng) {
      formatted.sort((a, b) => {
        if (a.distance_km === null) return 1;
        if (b.distance_km === null) return -1;
        return a.distance_km - b.distance_km;
      });
    }

    res.json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed pharmacy profile including full inventory
 */
exports.getPharmacyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { user_lat, user_lng, search = '', category = '' } = req.query;

    const pharmacy = await db.queryOne(
      'SELECT * FROM pharmacies WHERE pharmacy_id = ?',
      [id]
    );

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found.'
      });
    }

    // Fetch inventory for this pharmacy
    let invSql = `
      SELECT 
        i.inventory_id,
        i.quantity,
        i.reserved_quantity,
        (i.quantity - i.reserved_quantity) as available_stock,
        i.price,
        i.batch_number,
        i.expiry_date,
        i.availability_status,
        i.last_updated,
        m.medicine_id,
        m.medicine_name,
        m.generic_name,
        m.category,
        m.manufacturer,
        m.dosage_form,
        m.strength,
        m.requires_prescription,
        m.image_url
      FROM inventory i
      JOIN medicines m ON i.medicine_id = m.medicine_id
      WHERE i.pharmacy_id = ?
    `;

    const invParams = [id];

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      invSql += ` AND (m.medicine_name LIKE ? OR m.generic_name LIKE ? OR m.manufacturer LIKE ?)`;
      invParams.push(term, term, term);
    }

    if (category && category !== 'All') {
      invSql += ` AND m.category = ?`;
      invParams.push(category);
    }

    invSql += ` ORDER BY m.medicine_name ASC`;

    const inventory = await db.query(invSql, invParams);

    const dist = calculateDistance(user_lat, user_lng, pharmacy.latitude, pharmacy.longitude, 'km');

    res.json({
      success: true,
      pharmacy: {
        ...pharmacy,
        is_24_hours: Boolean(pharmacy.is_24_hours),
        distance_km: dist
      },
      inventory: inventory.map(item => {
        const available = Math.max(0, item.quantity - item.reserved_quantity);
        let status = item.availability_status;
        if (available === 0) status = 'Out of Stock';
        else if (available <= 5) status = 'Low Stock';
        else status = 'In Stock';

        return {
          ...item,
          available_stock: available,
          computed_status: status
        };
      })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Pharmacy Profile (Pharmacist or Admin)
 */
exports.updatePharmacyProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      pharmacy_name,
      address,
      city,
      latitude,
      longitude,
      phone,
      email,
      opening_hours,
      is_24_hours
    } = req.body;

    const pharmacy = await db.queryOne('SELECT * FROM pharmacies WHERE pharmacy_id = ?', [id]);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy not found.'
      });
    }

    // Check authorization: must be owner or admin
    if (req.user.role !== 'admin' && pharmacy.user_id !== req.user.user_id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this pharmacy profile.'
      });
    }

    await db.execute(
      `UPDATE pharmacies
       SET pharmacy_name = COALESCE(?, pharmacy_name),
           address = COALESCE(?, address),
           city = COALESCE(?, city),
           latitude = COALESCE(?, latitude),
           longitude = COALESCE(?, longitude),
           phone = COALESCE(?, phone),
           email = COALESCE(?, email),
           opening_hours = COALESCE(?, opening_hours),
           is_24_hours = COALESCE(?, is_24_hours)
       WHERE pharmacy_id = ?`,
      [
        pharmacy_name,
        address,
        city,
        latitude ? parseFloat(latitude) : null,
        longitude ? parseFloat(longitude) : null,
        phone,
        email,
        opening_hours,
        is_24_hours !== undefined ? (is_24_hours ? 1 : 0) : null,
        id
      ]
    );

    await logAudit(req.user.user_id, 'PHARMACY_UPDATE', `Updated pharmacy profile ID ${id}`);

    const updated = await db.queryOne('SELECT * FROM pharmacies WHERE pharmacy_id = ?', [id]);

    res.json({
      success: true,
      message: 'Pharmacy profile updated successfully.',
      pharmacy: updated
    });
  } catch (error) {
    next(error);
  }
};
