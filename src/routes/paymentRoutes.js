const express = require('express');
const { createPaymentIntent, savePayment } = require('../controllers/paymentController');

const router = express.Router();

router.post('/create-payment-intent', createPaymentIntent);
router.post('/payments', savePayment);

module.exports = router;
