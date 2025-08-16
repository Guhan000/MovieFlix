const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    // Debug environment variables
    console.log('🔍 Environment Debug:');
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`MONGODB_URI exists: ${!!process.env.MONGODB_URI}`);
    console.log(`JWT_SECRET exists: ${!!process.env.JWT_SECRET}`);
    
    // Use environment variable or fallback - with proper database name
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://guhan:Guhan007@cluster0.jbhud.mongodb.net/movie_ap?retryWrites=true&w=majority&appName=Cluster0';
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined!');
      console.log('\n📝 Atlas Connection Steps:');
      console.log('1. Create .env file in backend folder');
      console.log('2. Add your Atlas connection string:');
      console.log('   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/movieflix');
      console.log('3. Make sure to replace username, password, and cluster details');
      console.log('4. Whitelist your IP address in Atlas Network Access');
      process.exit(1);
    }
    
    console.log('🔗 Attempting to connect to MongoDB Atlas...');
    console.log(`📍 MongoDB URI: ${mongoURI.substring(0, 20)}...`); // Show first 20 chars only
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);
    console.log(`🌐 Connection state: ${conn.connection.readyState}`);
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🌐 Network/DNS Error - Check:');
      console.log('1. Internet connection');
      console.log('2. Atlas cluster URL is correct');
      console.log('3. Firewall settings');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n🔐 Authentication Error - Check:');
      console.log('1. Username and password are correct');
      console.log('2. User has proper permissions');
      console.log('3. Password special characters are URL-encoded');
    } else if (error.message.includes('IP')) {
      console.log('\n🛡️  IP Access Error - Check:');
      console.log('1. Your IP is whitelisted in Atlas Network Access');
      console.log('2. Try adding 0.0.0.0/0 for testing (allows all IPs)');
    }
    
    console.log('\n📝 Quick Atlas Setup:');
    console.log('1. Go to https://cloud.mongodb.com/');
    console.log('2. Network Access → Add IP Address → Add Current IP');
    console.log('3. Database Access → Add User → Create user');
    console.log('4. Clusters → Connect → Connect your application');
    
    process.exit(1);
  }
};

module.exports = connectDB;
