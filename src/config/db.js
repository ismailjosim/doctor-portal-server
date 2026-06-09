const { MongoClient, ServerApiVersion } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const db = client.db('doctorsPortal');

const collections = {
  appointmentOptions: db.collection('appointmentOptions'),
  bookings: db.collection('bookings'),
  users: db.collection('users'),
  doctors: db.collection('doctors'),
  payments: db.collection('payments'),
};

const connectDatabase = async () => {
  await client.db('admin').command({ ping: 1 });
  console.log('Database Connected!');
};

module.exports = {
  client,
  collections,
  connectDatabase,
};
