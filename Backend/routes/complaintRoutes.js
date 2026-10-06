const express = require('express');
const router = express.Router();
const complaintController = require('../Controllers/complaintController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, complaintController.createComplaint);
router.get('/', authenticate, complaintController.getComplaints);
router.put('/:id/respond', authenticate, authorize('admin'), complaintController.respondToComplaint);

module.exports = router;
