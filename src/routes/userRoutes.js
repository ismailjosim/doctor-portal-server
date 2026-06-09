const express = require('express');
const {
  checkAdmin,
  createJwt,
  getUsers,
  makeAdmin,
  saveUser,
} = require('../controllers/userController');
const { verifyAdmin, verifyJWT } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/users', saveUser);
router.get('/jwt', createJwt);
router.get('/users', getUsers);
router.put('/users/admin/:id', verifyJWT, verifyAdmin, makeAdmin);
router.get('/users/admin/:email', checkAdmin);

module.exports = router;
