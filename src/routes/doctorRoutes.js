const express = require('express');
const { createDoctor, deleteDoctor, getDoctors } = require('../controllers/doctorController');
const { verifyAdmin, verifyJWT } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/doctors', verifyJWT, verifyAdmin, createDoctor);
router.get('/doctors', verifyJWT, verifyAdmin, getDoctors);
router.delete('/doctors/:id', verifyJWT, verifyAdmin, deleteDoctor);

module.exports = router;
