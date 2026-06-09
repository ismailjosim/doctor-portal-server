const { ObjectId } = require('mongodb');
const { doctorsCollection } = require('../models/doctorModel');

const createDoctor = async (req, res) => {
  try {
    const doctors = await doctorsCollection.insertOne(req.body);

    res.send({
      success: true,
      doctors,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

const getDoctors = async (req, res) => {
  try {
    const doctors = await doctorsCollection.find({}).toArray();

    res.send({
      success: true,
      doctors,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const doctor = await doctorsCollection.deleteOne({ _id: new ObjectId(req.params.id) });

    res.send({
      success: true,
      doctor,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createDoctor,
  getDoctors,
  deleteDoctor,
};
