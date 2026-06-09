const { ObjectId } = require('mongodb');
const { bookingsCollection } = require('../models/bookingModel');

const createBooking = async (req, res) => {
  try {
    const booking = req.body;
    const query = {
      appointmentDate: booking.appointmentDate,
      email: booking.email,
      treatmentName: booking.treatmentName,
    };

    const alreadyBooked = await bookingsCollection.find(query).toArray();

    if (alreadyBooked.length) {
      return res.send({
        success: true,
        bookings: `You already have a booking on ${booking.appointmentDate}`,
      });
    }

    const bookings = await bookingsCollection.insertOne(booking);

    res.send({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

const getBookingsByEmail = async (req, res) => {
  try {
    const email = req.query.email;
    const decodedEmail = req.decoded.email;

    if (email !== decodedEmail) {
      return res.status(403).send({ message: 'Forbidden access' });
    }

    const bookings = await bookingsCollection.find({ email }).toArray();

    res.send({
      success: true,
      bookings,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await bookingsCollection.findOne({ _id: new ObjectId(req.params.id) });

    res.send({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getBookingsByEmail,
  getBookingById,
};
