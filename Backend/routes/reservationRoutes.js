const express = require('express');
const router = express.Router();
const reservationController = require('../Controllers/reservationController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, reservationController.createReservation);
router.get('/', authenticate, reservationController.getReservations);
router.put('/:id/status', authenticate, reservationController.updateReservationStatus);

module.exports = router;
