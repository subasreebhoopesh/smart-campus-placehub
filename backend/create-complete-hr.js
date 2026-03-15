const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/placement_portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(async () => {
  console.log('✅ MongoDB connected');
  
  const User = require('./models/User');
  const HR = require('./models/HR');
  const Company = require('./models/Company');
  const bcrypt = require('bcryptjs');
  
  try {
    // 1. Find or create Wipro company
    let wipro = await Company.findOne({ name: 'Wipro' });
    
    if (!wipro) {
      console.log('Creating Wipro company...');
      wipro = new Company({
        name: 'Wipro',
        industry: 'IT Services',
        website: 'https://careers.wipro.com',
        contactEmail: 'recruitment@wipro.com',
        contactPhone: '+91-80-2844-0011',
        description: 'Wipro Limited is a leading global information technology, consulting and business process services company.',
        jobRoles: ['Software Engineer', 'Senior Developer', 'Tech Lead'],
        requiredSkills: ['Java', 'Python', 'JavaScript', 'React', 'Node.js'],
        packageOffered: {
          min: 3.5,
          max: 8
        }
      });
      await wipro.save();
      console.log('✅ Wipro company created');
    } else {
      console.log('✅ Wipro company exists');
    }
    
    // 2. Find or create HR user
    let hrUser = await User.findOne({ email: 'hr@wipro.com' });
    
    if (!hrUser) {
      console.log('Creating HR user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      hrUser = new User({
        name: 'Wipro HR',
        email: 'hr@wipro.com',
        password: hashedPassword,
        role: 'hr'
      });
      await hrUser.save();
      console.log('✅ HR user created');
    } else {
      console.log('✅ HR user exists');
    }
    
    // 3. Find or create HR profile
    let hrProfile = await HR.findOne({ userId: hrUser._id });
    
    if (!hrProfile) {
      console.log('Creating HR profile...');
      hrProfile = new HR({
        userId: hrUser._id,
        companyId: wipro._id
      });
      await hrProfile.save();
      console.log('✅ HR profile created');
    } else {
      console.log('✅ HR profile exists');
    }
    
    // 4. Verify the complete setup
    console.log('\n=== VERIFICATION ===');
    console.log('User ID:', hrUser._id);
    console.log('User Email:', hrUser.email);
    console.log('User Role:', hrUser.role);
    console.log('Company ID:', wipro._id);
    console.log('Company Name:', wipro.name);
    console.log('HR Profile ID:', hrProfile._id);
    console.log('HR Profile User ID:', hrProfile.userId);
    console.log('HR Profile Company ID:', hrProfile.companyId);
    
    console.log('\n✅ Complete HR profile setup successful!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});
