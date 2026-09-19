const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/dashboard', authenticate, authorize('admin'), adminController.getDashboardStats);
router.get('/users', authenticate, authorize('admin'), adminController.getUsers);
router.put('/users/:id/status', authenticate, authorize('admin'), adminController.updateUserStatus);
router.get('/pharmacies', authenticate, authorize('admin'), adminController.getPharmacies);
router.put('/pharmacies/:id/approval', authenticate, authorize('admin'), adminController.updatePharmacyApproval);
router.get('/audit-logs', authenticate, authorize('admin'), adminController.getAuditLogs);

module.exports = router;
