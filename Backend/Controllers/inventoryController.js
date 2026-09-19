const db = require('../config/db');
const { logAudit } = require('../utils/logger');

/**
 * Determine automatic availability status based on quantity, reserved quantity, and expiry date
 */
function computeAvailabilityStatus(quantity, reservedQuantity, expiryDate) {
  const available = Math.max(0, quantity - reservedQuantity);

  // Check Expiry
  if (expiryDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDate);
    if (exp < today) {
      return 'Expired';
    }
  }

  if (available <= 0) {
    return 'Out of Stock';
  } else if (available <= 5) {
    return 'Low Stock';
  } else {
    return 'In Stock';
  }
}

/**
 * Get inventory for the logged-in pharmacist's pharmacy
 */
exports.getMyInventory = async (req, res, next) => {
  try {
    if (!req.user.pharmacy_id) {
      return res.status(400).json({
        success: false,
        message: 'No pharmacy associated with this pharmacist account.'
      });
    }

    const {
      search = '',
      status = '',
      category = '',
      sort = 'medicine_name'
    } = req.query;

    let sql = `
      SELECT 
        i.inventory_id,
        i.pharmacy_id,
        i.medicine_id,
        i.quantity,
        i.reserved_quantity,
        (i.quantity - i.reserved_quantity) as available_stock,
        i.price,
        i.batch_number,
        i.expiry_date,
        i.availability_status,
        i.last_updated,
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

    const params = [req.user.pharmacy_id];

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      sql += ` AND (m.medicine_name LIKE ? OR m.generic_name LIKE ? OR i.batch_number LIKE ?)`;
      params.push(term, term, term);
    }

    if (category && category !== 'All') {
      sql += ` AND m.category = ?`;
      params.push(category);
    }

    if (status && status !== 'All') {
      sql += ` AND i.availability_status = ?`;
      params.push(status);
    }

    if (sort === 'price_asc') {
      sql += ` ORDER BY i.price ASC`;
    } else if (sort === 'price_desc') {
      sql += ` ORDER BY i.price DESC`;
    } else if (sort === 'stock_low') {
      sql += ` ORDER BY i.quantity ASC`;
    } else if (sort === 'expiry') {
      sql += ` ORDER BY i.expiry_date ASC`;
    } else {
      sql += ` ORDER BY m.medicine_name ASC`;
    }

    const items = await db.query(sql, params);

    // Compute live summary stats
    let totalItems = items.length;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let expiredCount = 0;
    let totalInventoryValue = 0;

    const formattedItems = items.map(item => {
      const status = computeAvailabilityStatus(item.quantity, item.reserved_quantity, item.expiry_date);
      if (status === 'In Stock') inStockCount++;
      else if (status === 'Low Stock') lowStockCount++;
      else if (status === 'Out of Stock') outOfStockCount++;
      else if (status === 'Expired') expiredCount++;

      totalInventoryValue += item.quantity * item.price;

      return {
        ...item,
        availability_status: status,
        available_stock: Math.max(0, item.quantity - item.reserved_quantity)
      };
    });

    res.json({
      success: true,
      summary: {
        total_items: totalItems,
        in_stock: inStockCount,
        low_stock: lowStockCount,
        out_of_stock: outOfStockCount,
        expired: expiredCount,
        total_valuation: Number(totalInventoryValue.toFixed(2))
      },
      data: formattedItems
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add medicine to pharmacy inventory
 */
exports.addInventoryItem = async (req, res, next) => {
  try {
    const pharmacyId = req.user.pharmacy_id;
    if (!pharmacyId) {
      return res.status(400).json({
        success: false,
        message: 'No pharmacy associated with your account.'
      });
    }

    const {
      medicine_id,
      quantity,
      price,
      batch_number,
      expiry_date
    } = req.body;

    if (!medicine_id || quantity === undefined || !price || !expiry_date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide medicine, quantity, unit price, and expiry date.'
      });
    }

    const qty = parseInt(quantity, 10);
    const prc = parseFloat(price);

    if (isNaN(qty) || qty < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer.'
      });
    }

    if (isNaN(prc) || prc <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than zero.'
      });
    }

    // Check if item already exists in this pharmacy inventory
    const existing = await db.queryOne(
      'SELECT inventory_id FROM inventory WHERE pharmacy_id = ? AND medicine_id = ?',
      [pharmacyId, medicine_id]
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This medicine is already in your pharmacy inventory. Please update the existing stock instead.'
      });
    }

    const status = computeAvailabilityStatus(qty, 0, expiry_date);

    const result = await db.execute(
      `INSERT INTO inventory (pharmacy_id, medicine_id, quantity, reserved_quantity, price, batch_number, expiry_date, availability_status)
       VALUES (?, ?, ?, 0, ?, ?, ?, ?)`,
      [pharmacyId, medicine_id, qty, prc, batch_number || null, expiry_date, status]
    );

    await logAudit(req.user.user_id, 'INVENTORY_ADD', `Added medicine ID ${medicine_id} with qty ${qty} to inventory`);

    const newItem = await db.queryOne(
      `SELECT i.*, m.medicine_name, m.dosage_form, m.category 
       FROM inventory i JOIN medicines m ON i.medicine_id = m.medicine_id 
       WHERE i.inventory_id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Medicine added to inventory successfully.',
      data: newItem
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update stock, price, batch or expiry date
 */
exports.updateInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, price, batch_number, expiry_date } = req.body;

    const item = await db.queryOne('SELECT * FROM inventory WHERE inventory_id = ?', [id]);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory record not found.'
      });
    }

    // Check ownership unless admin
    if (req.user.role !== 'admin' && item.pharmacy_id !== req.user.pharmacy_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to modify this pharmacy inventory.'
      });
    }

    const newQty = quantity !== undefined ? parseInt(quantity, 10) : item.quantity;
    const newPrice = price !== undefined ? parseFloat(price) : item.price;
    const newBatch = batch_number !== undefined ? batch_number : item.batch_number;
    const newExpiry = expiry_date !== undefined ? expiry_date : item.expiry_date;

    if (newQty < item.reserved_quantity) {
      return res.status(400).json({
        success: false,
        message: `Quantity cannot be less than currently reserved units (${item.reserved_quantity}).`
      });
    }

    const newStatus = computeAvailabilityStatus(newQty, item.reserved_quantity, newExpiry);

    await db.execute(
      `UPDATE inventory 
       SET quantity = ?,
           price = ?,
           batch_number = ?,
           expiry_date = ?,
           availability_status = ?,
           last_updated = NOW()
       WHERE inventory_id = ?`,
      [newQty, newPrice, newBatch, newExpiry, newStatus, id]
    );

    // Low stock warning notification
    if (newStatus === 'Low Stock') {
      await db.execute(
        `INSERT INTO notifications (user_id, title, message, type, link)
         VALUES (?, 'Low Stock Alert', 'An item in your inventory is running low (<= 5 units). Please restock.', 'inventory', '/pharmacy/inventory')`,
        [req.user.user_id]
      );
    }

    await logAudit(req.user.user_id, 'INVENTORY_UPDATE', `Updated inventory ID ${id}: Qty=${newQty}, Price=${newPrice}`);

    const updated = await db.queryOne(
      `SELECT i.*, m.medicine_name, m.dosage_form, m.category 
       FROM inventory i JOIN medicines m ON i.medicine_id = m.medicine_id 
       WHERE i.inventory_id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Inventory updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete medicine from inventory
 */
exports.deleteInventoryItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await db.queryOne('SELECT * FROM inventory WHERE inventory_id = ?', [id]);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory record not found.'
      });
    }

    if (req.user.role !== 'admin' && item.pharmacy_id !== req.user.pharmacy_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this inventory item.'
      });
    }

    if (item.reserved_quantity > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete item with active pending reservations.'
      });
    }

    await db.execute('DELETE FROM inventory WHERE inventory_id = ?', [id]);
    await logAudit(req.user.user_id, 'INVENTORY_DELETE', `Deleted inventory item ID ${id}`);

    res.json({
      success: true,
      message: 'Item removed from inventory.'
    });
  } catch (error) {
    next(error);
  }
};
