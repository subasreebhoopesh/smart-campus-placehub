const mongoose = require('mongoose');

// MongoDB connection string - using local MongoDB or MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database:', mongoose.connection.name);
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
