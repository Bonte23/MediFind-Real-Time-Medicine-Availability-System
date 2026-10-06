const express = require('express');
const router = express.Router();
const pharmacyController = require('../Controllers/pharmacyController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', pharmacyController.getPharmacies);
router.get('/:id', pharmacyController.getPharmacyById);
router.put('/:id', authenticate, authorize('pharmacist', 'admin'), pharmacyController.updatePharmacyProfile);

module.exports = router;
