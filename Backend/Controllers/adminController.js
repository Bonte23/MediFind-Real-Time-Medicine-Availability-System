const db = require('../config/db');
const { logAudit } = require('../utils/logger');

/**
 * Get Dynamic Administrator Dashboard KPIs and Statistics
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Real database counts (No hard-coding!)
    const totalUsers = await db.queryOne('SELECT COUNT(*) as count FROM users');
    const totalPatients = await db.queryOne("SELECT COUNT(*) as count FROM users WHERE role = 'patient'");
    const totalPharmacies = await db.queryOne("SELECT COUNT(*) as count FROM pharmacies WHERE approval_status = 'approved'");
    const pendingPharmacies = await db.queryOne("SELECT COUNT(*) as count FROM pharmacies WHERE approval_status = 'pending'");
    const totalMedicines = await db.queryOne('SELECT COUNT(*) as count FROM medicines');
    
    // Reservations stats
    const totalReservations = await db.queryOne('SELECT COUNT(*) as count FROM reservations');
    const confirmedReservations = await db.queryOne("SELECT COUNT(*) as count FROM reservations WHERE status = 'Confirmed'");
    const pendingReservations = await db.queryOne("SELECT COUNT(*) as count FROM reservations WHERE status = 'Pending'");
    const collectedReservations = await db.queryOne("SELECT COUNT(*) as count FROM reservations WHERE status = 'Collected'");
    const cancelledReservations = await db.queryOne("SELECT COUNT(*) as count FROM reservations WHERE status = 'Cancelled' OR status = 'Rejected'");

    // Stock metrics
    const outOfStockItems = await db.queryOne('SELECT COUNT(*) as count FROM inventory WHERE quantity <= reserved_quantity');
    const lowStockItems = await db.queryOne('SELECT COUNT(*) as count FROM inventory WHERE (quantity - reserved_quantity) > 0 AND (quantity - reserved_quantity) <= 5');
    const pendingComplaints = await db.queryOne("SELECT COUNT(*) as count FROM complaints WHERE status = 'pending'");

    // Top Reserved Medicines
    const topMedicines = await db.query(`
      SELECT m.medicine_name, m.category, COUNT(r.reservation_id) as reservation_count, SUM(r.quantity) as total_units_reserved
      FROM medicines m
      JOIN inventory i ON m.medicine_id = i.medicine_id
      JOIN reservations r ON i.inventory_id = r.inventory_id
      GROUP BY m.medicine_id
      ORDER BY reservation_count DESC
      LIMIT 6
    `);

    // Category Distribution
    const categoryDistribution = await db.query(`
      SELECT m.category, COUNT(DISTINCT m.medicine_id) as medicine_count, COUNT(DISTINCT i.inventory_id) as inventory_listings
      FROM medicines m
      LEFT JOIN inventory i ON m.medicine_id = i.medicine_id
      GROUP BY m.category
      ORDER BY medicine_count DESC
    `);

    // Recent System Activity Logs
    const recentLogs = await db.query(`
      SELECT l.*, u.full_name, u.email, u.role
      FROM audit_logs l
      LEFT JOIN users u ON l.user_id = u.user_id
      ORDER BY l.created_at DESC
      LIMIT 10
    `);

    // Dynamic Monthly reservation volume breakdown from real records
    let monthlyReservations = [];
    try {
      const monthRows = await db.query(`
        SELECT 
          substr(created_at, 1, 7) as month_key,
          COUNT(*) as reservations,
          SUM(CASE WHEN status = 'Collected' THEN 1 ELSE 0 END) as completed
        FROM reservations
        WHERE created_at IS NOT NULL
        GROUP BY substr(created_at, 1, 7)
        ORDER BY month_key ASC
        LIMIT 12
      `);
      if (monthRows && monthRows.length > 0) {
        monthlyReservations = monthRows.map(r => ({
          month: r.month_key,
          reservations: Number(r.reservations) || 0,
          completed: Number(r.completed) || 0
        }));
      }
    } catch (_) {
      monthlyReservations = [];
    }

    res.json({
      success: true,
      stats: {
        total_users: totalUsers.count,
        total_patients: totalPatients.count,
        total_pharmacies: totalPharmacies.count,
        pending_pharmacy_approvals: pendingPharmacies.count,
        total_medicines: totalMedicines.count,
        total_reservations: totalReservations.count,
        confirmed_reservations: confirmedReservations.count,
        pending_reservations: pendingReservations.count,
        collected_reservations: collectedReservations.count,
        cancelled_reservations: cancelledReservations.count,
        out_of_stock_items: outOfStockItems.count,
        low_stock_items: lowStockItems.count,
        pending_complaints: pendingComplaints.count
      },
      charts: {
        top_medicines: topMedicines,
        category_distribution: categoryDistribution,
        monthly_trends: monthlyReservations
      },
      recent_activity: recentLogs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Manage Users (List, filter, status toggle)
 */
exports.getUsers = async (req, res, next) => {
  try {
    const { role = '', status = '', search = '' } = req.query;
    let sql = `
      SELECT u.user_id, u.full_name, u.email, u.phone, u.role, u.status, u.address, u.created_at,
             p.pharmacy_name, p.approval_status as pharmacy_status
      FROM users u
      LEFT JOIN pharmacies p ON u.user_id = p.user_id
      WHERE 1=1
    `;
    const params = [];

    if (role && role !== 'All') {
      sql += ` AND u.role = ?`;
      params.push(role);
    }

    if (status && status !== 'All') {
      sql += ` AND u.status = ?`;
      params.push(status);
    }

    if (search && search.trim() !== '') {
      const term = `%${search.trim()}%`;
      sql += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY u.created_at DESC`;

    const users = await db.query(sql, params);

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update User Status (Activate / Suspend)
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user status.'
      });
    }

    // Prevent suspending self
    if (parseInt(id, 10) === req.user.user_id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own admin account status.'
      });
    }

    await db.execute('UPDATE users SET status = ? WHERE user_id = ?', [status, id]);
    await logAudit(req.user.user_id, 'USER_STATUS_CHANGE', `Changed user ID ${id} status to ${status}`);

    res.json({
      success: true,
      message: `User status changed to ${status}.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Pharmacy Approval Management (List all with approval status)
 */
exports.getPharmacies = async (req, res, next) => {
  try {
    const { status = '' } = req.query;
    let sql = `
      SELECT p.*, u.full_name as owner_name, u.email as owner_email, u.phone as owner_phone,
             COUNT(DISTINCT i.inventory_id) as items_count
      FROM pharmacies p
      JOIN users u ON p.user_id = u.user_id
      LEFT JOIN inventory i ON p.pharmacy_id = i.pharmacy_id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'All') {
      sql += ` AND p.approval_status = ?`;
      params.push(status);
    }

    sql += ` GROUP BY p.pharmacy_id ORDER BY p.created_at DESC`;

    const pharmacies = await db.query(sql, params);

    res.json({
      success: true,
      count: pharmacies.length,
      data: pharmacies.map(p => ({
        ...p,
        is_24_hours: Boolean(p.is_24_hours)
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve or Reject Pharmacy Registration
 */
exports.updatePharmacyApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pharmacy approval status.'
      });
    }

    const pharmacy = await db.queryOne('SELECT * FROM pharmacies WHERE pharmacy_id = ?', [id]);
    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: 'Pharmacy record not found.'
      });
    }

    await db.execute(
      `UPDATE pharmacies 
       SET approval_status = ?, rejection_reason = ?, updated_at = NOW() 
       WHERE pharmacy_id = ?`,
      [status, rejection_reason || null, id]
    );

    // Also update associated user account status
    const userStatus = status === 'approved' ? 'active' : (status === 'rejected' ? 'suspended' : 'pending');
    await db.execute('UPDATE users SET status = ? WHERE user_id = ?', [userStatus, pharmacy.user_id]);

    // Send notification to pharmacist
    await db.execute(
      `INSERT INTO notifications (user_id, title, message, type, link)
       VALUES (?, 'Pharmacy Registration Update', ?, 'approval', '/pharmacy/dashboard')`,
      [
        pharmacy.user_id,
        status === 'approved' 
          ? `Congratulations! ${pharmacy.pharmacy_name} has been APPROVED by the administrator. You can now manage your inventory.`
          : `Your pharmacy registration for ${pharmacy.pharmacy_name} was not approved. Reason: ${rejection_reason || 'License verification unfulfilled.'}`
      ]
    );

    await logAudit(req.user.user_id, 'PHARMACY_APPROVAL', `Updated pharmacy "${pharmacy.pharmacy_name}" approval to ${status}`);

    res.json({
      success: true,
      message: `Pharmacy has been marked as ${status}.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * View System Audit Logs
 */
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { limit = 100 } = req.query;
    const logs = await db.query(
      `SELECT l.*, u.full_name, u.email, u.role
       FROM audit_logs l
       LEFT JOIN users u ON l.user_id = u.user_id
       ORDER BY l.created_at DESC
       LIMIT ?`,
      [parseInt(limit, 10) || 100]
    );

    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
