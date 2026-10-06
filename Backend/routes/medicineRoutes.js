const express = require('express');
const router = express.Router();
const medicineController = require('../Controllers/medicineController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', medicineController.getMedicines);
router.get('/categories', medicineController.getCategories);
router.get('/:id', medicineController.getMedicineById);

// Admin / Pharmacist Create
router.post('/', authenticate, authorize('admin', 'pharmacist'), medicineController.createMedicine);

// Admin Update & Delete
router.put('/:id', authenticate, authorize('admin'), medicineController.updateMedicine);
router.delete('/:id', authenticate, authorize('admin'), medicineController.deleteMedicine);

module.exports = router;
