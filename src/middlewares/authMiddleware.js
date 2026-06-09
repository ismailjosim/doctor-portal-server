const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/env');
const { usersCollection } = require('../models/userModel');

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ') && !authHeader?.startsWith('bearer ')) {
    return res.status(401).send({ message: 'Unauthorized access' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, getJwtSecret(), (error, decoded) => {
    if (error) {
      return res.status(403).send({ message: 'Forbidden access' });
    }

    req.decoded = decoded;
    next();
  });
};

const verifyAdmin = async (req, res, next) => {
  try {
    const decodedEmail = req.decoded?.email;
    const user = await usersCollection.findOne({ email: decodedEmail });

    if (user?.role !== 'admin') {
      return res.status(403).send({ message: 'Forbidden access' });
    }

    next();
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  verifyJWT,
  verifyAdmin,
};
