const { ObjectId } = require('mongodb');
const stripe = require('../config/stripe');
const { bookingsCollection } = require('../models/bookingModel');
const { paymentsCollection } = require('../models/paymentModel');

const createPaymentIntent = async (req, res) => {
  try {
    const price = Number(req.body.price);

    if (!price || price <= 0) {
      return res.status(400).send({
        success: false,
        message: 'Valid price is required',
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'usd',
      amount: Math.round(price * 100),
      payment_method_types: ['card'],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

const savePayment = async (req, res) => {
  try {
    const payment = req.body;
    const result = await paymentsCollection.insertOne(payment);
    const filter = { _id: new ObjectId(payment.bookingId) };
    const updateDoc = {
      $set: {
        paid: true,
        transactionId: payment.transactionId,
      },
    };

    await bookingsCollection.updateOne(filter, updateDoc);

    res.send({
      success: true,
      payment: result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  createPaymentIntent,
  savePayment,
};
