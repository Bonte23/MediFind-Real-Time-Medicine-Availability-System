const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/inventory', authenticate, authorize('pharmacist', 'admin'), reportController.getInventoryReport);
router.get('/reservations', authenticate, authorize('pharmacist', 'admin'), reportController.getReservationReport);

module.exports = router;
