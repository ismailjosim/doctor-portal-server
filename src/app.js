require('colors');
const cors = require('cors');
const express = require('express');
const appointmentRoutes = require('./routes/appointmentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use(appointmentRoutes);
app.use(bookingRoutes);
app.use(userRoutes);
app.use(doctorRoutes);
app.use(paymentRoutes);

app.get('/', (req, res) => {
  res.send('<div>Doctor Portal Server Connected</div>');
});

module.exports = app;
