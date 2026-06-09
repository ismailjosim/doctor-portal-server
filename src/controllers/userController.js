const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { getJwtSecret } = require('../config/env');
const { usersCollection } = require('../models/userModel');

const saveUser = async (req, res) => {
  try {
    const user = req.body;
    const filter = { email: user.email };
    const updateDoc = {
      $set: user,
      $setOnInsert: { role: 'user' },
    };
    const options = { upsert: true };

    const users = await usersCollection.updateOne(filter, updateDoc, options);

    res.send({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

const createJwt = async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: 'Email is required',
      });
    }

    await usersCollection.updateOne(
      { email },
      { $setOnInsert: { email, role: 'user' } },
      { upsert: true }
    );

    const token = jwt.sign({ email }, getJwtSecret(), { expiresIn: '7d' });

    res.send({
      success: true,
      token,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray();

    res.send({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

const makeAdmin = async (req, res) => {
  try {
    const filter = { _id: new ObjectId(req.params.id) };
    const updateDoc = {
      $set: {
        role: 'admin',
      },
    };
    const admin = await usersCollection.updateOne(filter, updateDoc, { upsert: true });

    res.send({
      success: true,
      admin,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

const checkAdmin = async (req, res) => {
  try {
    const user = await usersCollection.findOne({ email: req.params.email });

    res.send({ isAdmin: user?.role === 'admin' });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  saveUser,
  createJwt,
  getUsers,
  makeAdmin,
  checkAdmin,
};
