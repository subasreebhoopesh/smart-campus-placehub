const mongoose = require('mongoose');
const User = require('./models/User');
const HR = require('./models/HR');
const Company = require('./models/Company');

mongoose.connect('mongodb://localhost:27017/placement_portal')
  .then(async () => {
    console.log('MongoDB connected');
    
    // Find HR user
    const user = await User.findOne({ email: 'hr@wipro.com' });
    console.log('\n=== USER ===');
    console.log(user);
    
    if (user) {
      // Find HR profile
      const hr = await HR.findOne({ userId: user._id });
      console.log('\n=== HR PROFILE ===');
      console.log(hr);
      
      if (hr) {
        // Find Company
        const company = await Company.findById(hr.companyId);
        console.log('\n=== COMPANY ===');
        console.log(company);
      } else {
        console.log('\n❌ No HR profile found for this user!');
        console.log('Creating HR profile...');
        
        // Find Wipro company
        const wipro = await Company.findOne({ name: 'Wipro' });
        if (wipro) {
          const newHR = new HR({
            userId: user._id,
            companyId: wipro._id
          });
          await newHR.save();
          console.log('✅ HR profile created:', newHR);
        } else {
          console.log('❌ Wipro company not found!');
        }
      }
    } else {
      console.log('\n❌ HR user not found!');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
