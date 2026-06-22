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

// Auto-seed companies on startup if collection is empty
const autoSeedCompanies = async () => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    const Company = require('./models/Company');
    const count = await Company.countDocuments();
    if (count > 0) return; // Already has companies

    console.log('🌱 Auto-seeding companies...');
    const companiesData = [
      { name: 'Google', industry: 'Technology & Cloud', website: 'https://careers.google.com', contactPerson: 'HR Manager', contactEmail: 'hr@google.com', contactPhone: '9000000001', jobRoles: ['Software Engineer', 'Cloud Architect'], packageOffered: { min: 20, max: 45 }, requiredSkills: ['JavaScript', 'Python', 'Cloud', 'DSA'], visitHistory: [] },
      { name: 'Microsoft', industry: 'Software & Cloud', website: 'https://careers.microsoft.com', contactPerson: 'HR Manager', contactEmail: 'hr@microsoft.com', contactPhone: '9000000002', jobRoles: ['Software Developer', 'Azure Engineer'], packageOffered: { min: 18, max: 40 }, requiredSkills: ['C#', '.NET', 'Azure', 'JavaScript'], visitHistory: [] },
      { name: 'Amazon', industry: 'E-commerce & AWS', website: 'https://www.amazon.jobs', contactPerson: 'HR Manager', contactEmail: 'hr@amazon.com', contactPhone: '9000000003', jobRoles: ['SDE', 'AWS Engineer'], packageOffered: { min: 22, max: 50 }, requiredSkills: ['Java', 'AWS', 'DSA'], visitHistory: [] },
      { name: 'TCS', industry: 'IT Services', website: 'https://www.tcs.com/careers', contactPerson: 'HR Manager', contactEmail: 'hr@tcs.com', contactPhone: '9000000004', jobRoles: ['Software Engineer', 'Business Analyst'], packageOffered: { min: 3.5, max: 7 }, requiredSkills: ['Java', 'SQL', 'Communication'], visitHistory: [] },
      { name: 'Infosys', industry: 'IT Consulting', website: 'https://www.infosys.com/careers', contactPerson: 'HR Manager', contactEmail: 'hr@infosys.com', contactPhone: '9000000005', jobRoles: ['Systems Engineer'], packageOffered: { min: 4, max: 9 }, requiredSkills: ['Python', 'Java', 'SQL'], visitHistory: [] },
      { name: 'Wipro', industry: 'IT Services', website: 'https://careers.wipro.com', contactPerson: 'HR Manager', contactEmail: 'hr@wipro.com', contactPhone: '9000000006', jobRoles: ['Project Engineer'], packageOffered: { min: 3.5, max: 8 }, requiredSkills: ['Java', 'C++', 'SQL'], visitHistory: [] },
      { name: 'IBM', industry: 'Technology', website: 'https://www.ibm.com/careers', contactPerson: 'HR Manager', contactEmail: 'hr@ibm.com', contactPhone: '9000000007', jobRoles: ['Software Developer', 'AI Engineer'], packageOffered: { min: 5, max: 12 }, requiredSkills: ['Python', 'AI/ML', 'Cloud'], visitHistory: [] },
      { name: 'Cognizant', industry: 'IT Services', website: 'https://careers.cognizant.com', contactPerson: 'HR Manager', contactEmail: 'hr@cognizant.com', contactPhone: '9000000008', jobRoles: ['Programmer Analyst'], packageOffered: { min: 4, max: 8 }, requiredSkills: ['Java', 'SQL', 'JavaScript'], visitHistory: [] },
      { name: 'Accenture', industry: 'Consulting', website: 'https://www.accenture.com/careers', contactPerson: 'HR Manager', contactEmail: 'hr@accenture.com', contactPhone: '9000000009', jobRoles: ['Associate Software Engineer'], packageOffered: { min: 4.5, max: 9 }, requiredSkills: ['Java', 'Python', 'SQL'], visitHistory: [] },
      { name: 'HCL Tech', industry: 'IT Services', website: 'https://www.hcltech.com/careers', contactPerson: 'HR Manager', contactEmail: 'hr@hcltech.com', contactPhone: '9000000010', jobRoles: ['Software Engineer'], packageOffered: { min: 3.5, max: 7 }, requiredSkills: ['Java', 'C++', 'SQL'], visitHistory: [] },
    ];
    await Company.insertMany(companiesData);
    console.log(`✅ Auto-seeded ${companiesData.length} companies`);
  } catch (e) {
    console.error('Auto-seed companies error:', e.message);
  }
};

// Auto-seed admin user on startup if not exists
const autoSeedAdmin = async () => {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    const bcrypt = require('bcrypt');
    const User = require('./models/User');
    const existing = await User.findOne({ email: 'admin@college.edu' });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({ email: 'admin@college.edu', password: hashedPassword, name: 'Admin User', role: 'admin' });
      console.log('✅ Auto-created admin user: admin@college.edu / admin123');
    }
  } catch (e) {
    // Non-fatal
  }
};


app.listen(process.env.PORT || 3001, async () => {
  const PORT = process.env.PORT || 3001;
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`💾 Using MongoDB database`);
  console.log(`👤 Default admin: admin@college.edu / admin123`);
  console.log(`\n📝 To create admin user, run: node seed-admin.js`);
  // Auto-sync passwords
  await syncLocalPasswords();
  // Auto-seed companies if empty
  await autoSeedCompanies();
  // Auto-seed admin if not exists
  await autoSeedAdmin();
});




