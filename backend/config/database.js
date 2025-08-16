const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI; 
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined!');
      process.exit(1);
    }
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
  } catch (error) {
    process.exit(1);
  }
};

module.exports = connectDB;
