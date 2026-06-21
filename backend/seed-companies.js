// Seed companies into MongoDB (run this on Render shell: node seed-companies.js)
const mongoose = require('./config/database-mongodb');
const Company = require('./models/Company');

const companiesData = [
  {
    name: 'Google',
    industry: 'Technology & Cloud',
    website: 'https://careers.google.com',
    contactPerson: 'HR Manager',
    contactEmail: 'hr@google.com',
    contactPhone: '9000000001',
    jobRoles: ['Software Engineer', 'Cloud Architect', 'Data Scientist'],
    packageOffered: { min: 20, max: 45 },
    requiredSkills: ['JavaScript', 'Python', 'Cloud', 'DSA'],
    visitHistory: []
  },
  {
    name: 'Microsoft',
    industry: 'Software & Cloud',
    website: 'https://careers.microsoft.com',
    contactPerson: 'HR Manager',
    contactEmail: 'hr@microsoft.com',
    contactPhone: '9000000002',
    jobRoles: ['Software Developer', 'Azure Engineer', 'Product Manager'],
    packageOffered: { min: 18, max: 40 },
    requiredSkills: ['C#', '.NET', 'Azure', 'JavaScript'],
    visitHistory: []
  },
  {
    name: 'Amazon',
    industry: 'E-commerce & AWS',
    website: 'https://www.amazon.jobs',
    contactPerson: 'HR Manager',
    contactEmail: 'hr@amazon.com',
    contactPhone: '9000000003',
    jobRoles: ['SDE', 'AWS Engineer', 'Operations Manager'],
    packageOffered: { min: 22, max: 50 },
    requiredSkills: ['Java', 'AWS', 'DSA', 'System Design'],
    visitHistory: []
  },
  {
    name: 'TCS',
    industry: 'IT Services',
    website: 'https://www.tcs.com/careers',
    contactPerson: 'HR Manager',
    contactEmail: 'hr@tcs.com',
    contactPhone: '9000000004',
    jobRoles: ['Software Engineer', 'Business Analyst', 'QA Engineer'],
    packageOffered: { min: 3.5, max: 7 },
    requiredSkills: ['Java', 'SQL', 'Communication'],
    visitHistory: []
  },
  {
    name: 'Infosys',
    industry: 'IT Consulting',
    website: 'https://www.infosys.com/careers',
    contactPerson: 'HR Manager',
    contactEmail: 'hr@infosys.com',
    contactPhone: '9000000005',
    jobRoles: ['Systems Engineer', 'Technology Analyst'],
    packageOffered: { min: 4, max: 9 },
    requiredSkills: ['Python', 'Java', 'SQL', 'Problem Solving'],
    visitHistory: []
  },
  {
    name: 'Wipro',
    industry: 'IT Services',
    website: 'https://careers.wipro.com',
    contactPerson: 'HR Manager',
    contactEmail: 'hr@wipro.com',
    contactPhone: '9000000006',
    jobRoles: ['Project Engineer', 'Software Developer'],
    packageOffered: { min: 3.5, max: 8 },
    requiredSkills: ['Java', 'C++', 'SQL', 'Communication'],
    visitHistory: []
  },
  {
    name: 'IBM',
    industry: 'Technology',
    website: 'https://www.ibm.com/careers',
    contactPerson: 'HR Manager',
    contactEmail: 'hr@ibm.com',
    contactPhone: '9000000007',
    jobRoles: ['Software Developer', 'Data Engineer', 'AI Engineer'],
    packageOffered: { min: 5, max: 12 },
    requiredSkills: ['Python', 'AI/ML', 'Cloud', 'Java'],
    visitHistory: []
  },
  {
    name: 'Cognizant',
    industry: 'IT Services',
    website: 'https://careers.cognizant.com',
    contactPerson: 'HR Manager',
    contactEmail: 'hr@cognizant.com',
    contactPhone: '9000000008',
    jobRoles: ['Programmer Analyst', 'Associate'],
    packageOffered: { min: 4, max: 8 },
    requiredSkills: ['Java', 'SQL', 'JavaScript'],
    visitHistory: []
  }
];

const seedCompanies = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));

    let created = 0;
    let skipped = 0;

    for (const companyData of companiesData) {
      const existing = await Company.findOne({ name: companyData.name });
      if (!existing) {
        await Company.create(companyData);
        console.log(`✅ Created: ${companyData.name}`);
        created++;
      } else {
        console.log(`⏭️  Skipped (exists): ${companyData.name}`);
        skipped++;
      }
    }

    console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}`);
    console.log('\n📋 Now you can create HR users for these companies from Admin panel.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedCompanies();
