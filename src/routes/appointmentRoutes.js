const express = require('express');
const {
  getAppointmentOptions,
  getAppointmentSpecialty,
} = require('../controllers/appointmentController');

const router = express.Router();

router.get('/appOptions', getAppointmentOptions);
router.get('/appointmentSpecialty', getAppointmentSpecialty);

module.exports = router;
