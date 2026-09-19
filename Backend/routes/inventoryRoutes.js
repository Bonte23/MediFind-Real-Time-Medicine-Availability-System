const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/my-inventory', authenticate, authorize('pharmacist'), inventoryController.getMyInventory);
router.post('/', authenticate, authorize('pharmacist'), inventoryController.addInventoryItem);
router.put('/:id', authenticate, authorize('pharmacist', 'admin'), inventoryController.updateInventoryItem);
router.delete('/:id', authenticate, authorize('pharmacist', 'admin'), inventoryController.deleteInventoryItem);

module.exports = router;
