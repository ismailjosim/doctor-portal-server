const express = require('express');
const {
  createBooking,
  getBookingById,
  getBookingsByEmail,
} = require('../controllers/bookingController');
const { verifyJWT } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/bookings', createBooking);
router.get('/bookings', verifyJWT, getBookingsByEmail);
router.get('/booking/:id', getBookingById);

module.exports = router;
