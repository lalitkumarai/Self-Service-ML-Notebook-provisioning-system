const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    users.forEach(u => console.log(`- ID: ${u._id}, Username: ${u.username}, Email: ${u.email}`));
    
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

checkUsers();