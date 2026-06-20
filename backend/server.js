const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
const allowedOrigins = ['http://localhost:8080','http://localhost:5173',process.env.FRONTEND_URL].filter(Boolean);
app.use(cors({ origin: function(o,cb){ if(!o||allowedOrigins.includes(o)) return cb(null,true); cb(new Error('CORS')); }, credentials:true, methods:['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders:['Content-Type','Authorization'] }));
app.use(express.json({ limit:'10mb' }));
app.use(express.urlencoded({ extended:true }));
app.get('/api/health',(req,res)=>res.status(200).json({status:'ok',database:mongoose.connection.readyState===1?'connected':'disconnected'}));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize MongoDB connection
require('./config/database-mongodb');

// Import models to ensure they're registered
require('./models/User');
require('./models/Student');
require('./models/Company');
require('./models/PlacementDrive');
require('./models/Application');
require('./models/HR');
require('./models/Notification');
require('./models/Interview');
require('./models/Message');
require('./models/Document');
require('./models/Assessment');
require('./models/AssessmentResult');

// Routes
const authRoutes = require('./routes/auth-mongodb');
const companyRoutes = require('./routes/companies-mongodb');
const driveRoutes = require('./routes/drives-mongodb');
const applicationRoutes = require('./routes/applications-mongodb');
const studentRoutes = require('./routes/students-mongodb');
const notificationRoutes = require('./routes/notifications-simple');
const adminRoutes = require('./routes/admin-mongodb');
const hrRoutes = require('./routes/hr-mongodb');
const interviewRoutes = require('./routes/interviews-mongodb');
const messageRoutes = require('./routes/messages-mongodb');
const documentRoutes = require('./routes/documents-mongodb');
const offerLetterRoutes = require('./routes/offerletter-mongodb');
const assessmentRoutes = require('./routes/assessment-mongodb');

app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/offer-letters', offerLetterRoutes);
app.use('/api/assessments', assessmentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running with MongoDB' });
});

// Public stats endpoint (no auth required) for homepage
app.get('/api/public/stats', async (req, res) => {
  try {
    const Student = require('./models/Student');
    const Company = require('./models/Company');
    const Application = require('./models/Application');
    const PlacementDrive = require('./models/PlacementDrive');

    const [totalStudents, totalCompanies, activeDrives] = await Promise.all([
      Student.countDocuments(),
      Company.countDocuments(),
      PlacementDrive.countDocuments({ status: { $in: ['upcoming', 'ongoing'] } })
    ]);

    // Get placed students count
    const placedStudentIds = await Application.distinct('studentId', { status: 'selected' });
    const placedStudents = placedStudentIds.length;

    // Get highest package from selected applications
    const selectedApps = await Application.find({ status: 'selected' }).select('packageOffered');
    const packages = selectedApps.map(a => a.packageOffered || 0).filter(p => p > 0);
    const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;

    res.json({ totalStudents, totalCompanies, placedStudents, highestPackage, activeDrives });
  } catch (error) {
    console.error('Public stats error:', error);
    res.json({ totalStudents: 0, totalCompanies: 0, placedStudents: 0, highestPackage: 0, activeDrives: 0 });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Auto-sync local passwords on startup (needed when switching from Atlas to local MongoDB)
const syncLocalPasswords = async () => {
  try {
    const mongoose = require('mongoose');
    // Wait until MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    const bcrypt = require('bcrypt');
    const User = require('./models/User');

    // Known password map - email => password
    const passwordMap = {
      'admin@college.edu':             'admin123',
      'subasree@gmail.com':            'suba123',
      'sreesuba219.2005@gmail.com':    'suba123',
      'maithra@gmail.com':             'maithra123',
      'sneha@gmail.com':               'sneha123',
      'rajee@gmail.com':               'rajee123',
      'slonesathis@gmail.com':         'sathish123',
      'priy@gmail.com':                'priya123',
      'preethi@gmail.com':             'preethi123',
      'sreeja@gmail.com':              'sreeja@2005',
      'hr@google.com':                 'google123',
      'hr@wipro.com':                  'wipro123',
      'hr@google1.com':                'google123',
      'hr@ibm.com':                    'ibm123',
      'hr@abc.com':                    'abc123',
    };

    // Check if a test login works; if not, re-sync all passwords
    const adminUser = await User.findOne({ email: 'admin@college.edu' });
    if (adminUser) {
      const valid = await bcrypt.compare('admin123', adminUser.password);
      if (!valid) {
        console.log('🔄 Re-syncing passwords for local MongoDB...');
        for (const [email, password] of Object.entries(passwordMap)) {
          const hash = await bcrypt.hash(password, 10);
          await User.updateOne({ email }, { password: hash });
        }
        console.log('✅ Passwords synced successfully');
      }
    }
  } catch (e) {
    // Non-fatal — don't crash server
  }
};

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`💾 Using MongoDB database`);
  console.log(`👤 Default admin: admin@college.edu / admin123`);
  console.log(`\n📝 To create admin user, run: node seed-admin.js`);
  // Auto-sync passwords
  await syncLocalPasswords();
});




