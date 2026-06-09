require('dotenv').config();
require('colors');

const app = require('./src/app');
const { connectDatabase } = require('./src/config/db');

const port = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(port, () => console.log(`Server Running on Port ${port}`.random.bold));
  } catch (error) {
    console.log(error.name, error.message);
    process.exit(1);
  }
};

startServer();
