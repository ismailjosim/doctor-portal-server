const { appointmentOptionsCollection } = require('../models/appointmentModel');
const { bookingsCollection } = require('../models/bookingModel');

const getAppointmentOptions = async (req, res) => {
  try {
    const date = req.query.date;
    const options = await appointmentOptionsCollection.find({}).toArray();
    const prevBooked = await bookingsCollection.find({ appointmentDate: date }).toArray();

    options.forEach((option) => {
      const optionBooked = prevBooked.filter((book) => book.treatmentName === option.name);
      const bookedSlots = optionBooked.map((book) => book.slot);
      option.slots = option.slots.filter((slot) => !bookedSlots.includes(slot));
    });

    res.send({
      success: true,
      options,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

const getAppointmentSpecialty = async (req, res) => {
  try {
    const specialty = await appointmentOptionsCollection.find({}).project({ name: 1 }).toArray();

    res.send({
      success: true,
      specialty,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getAppointmentOptions,
  getAppointmentSpecialty,
};
