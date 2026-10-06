const express = require('express');
const router = express.Router();
const prescriptionController = require('../Controllers/prescriptionController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadPrescription } = require('../middleware/upload');

router.post('/upload', authenticate, uploadPrescription.single('prescription'), prescriptionController.uploadPrescription);
router.get('/', authenticate, prescriptionController.getPrescriptions);
router.put('/:id/review', authenticate, authorize('pharmacist', 'admin'), prescriptionController.reviewPrescription);

module.exports = router;
