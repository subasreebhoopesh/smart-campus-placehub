const mongoose = require('mongoose');

// MongoDB connection string - using local MongoDB or MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

// MongoDB connection options with increased timeouts for free tier
const mongooseOptions = {
  serverSelectionTimeoutMS: 30000, // 30 seconds for server selection
  socketTimeoutMS: 45000, // 45 seconds for socket timeout
  connectTimeoutMS: 30000, // 30 seconds for initial connection
  maxPoolSize: 10, // Connection pool size
  minPoolSize: 2,
  maxIdleTimeMS: 60000, // Close idle connections after 60 seconds
  retryWrites: true,
  retryReads: true,
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🌐 Host:', mongoose.connection.host);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n⚠️  Using fallback: In-memory storage');
    console.log('💡 To use MongoDB:');
    console.log('   1. Install MongoDB locally, OR');
    console.log('   2. Use MongoDB Atlas (free): https://www.mongodb.com/cloud/atlas');
    console.log('   3. Set MONGODB_URI in .env file');
  }
};

connectDB();

module.exports = mongoose;
