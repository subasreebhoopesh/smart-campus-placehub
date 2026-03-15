// Test if notification routes can be loaded
require('dotenv').config();
require('./config/database-mongodb');

// Import models first
require('./models/User');
require('./models/Student');
require('./models/Notification');

console.log('✅ Models loaded successfully');

// Try to load notification routes
try {
  const notificationRoutes = require('./routes/notifications-mongodb');
  console.log('✅ Notification routes loaded successfully');
  console.log('Type:', typeof notificationRoutes);
  console.log('Is function:', typeof notificationRoutes === 'function');
  console.log('Has stack:', notificationRoutes.stack ? 'Yes' : 'No');
} catch (error) {
  console.error('❌ Failed to load notification routes:', error.message);
  console.error(error.stack);
}
