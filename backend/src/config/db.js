const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || 'mongodb://localhost:27017/ml-notebooks';

    if (process.env.USE_MEMORY_DB === 'true') {
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri('ml-notebooks');
      console.log(`Using in-memory MongoDB at ${uri}`);
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error('Continuing without database for local run...');
  }
};

module.exports = connectDB;
