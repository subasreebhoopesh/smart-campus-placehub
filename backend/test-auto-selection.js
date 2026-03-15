const { calculateSkillMatch, getStatusBySkillMatch, shouldAutoSelect } = require('./utils/skillMatcher');

console.log('='.repeat(80));
console.log('AUTO-SELECTION FEATURE TEST');
console.log('='.repeat(80));

// Test scenarios
const scenarios = [
  {
    name: 'Perfect Match (100%)',
    studentSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
  },
  {
    name: 'Excellent Match (80%)',
    studentSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python'],
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
  },
  {
    name: 'Good Match (75% - Auto-Select Threshold)',
    studentSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'Java'],
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
  },
  {
    name: 'Above Shortlist (70% - Auto-Shortlist)',
    studentSkills: ['JavaScript', 'React', 'Python', 'Java', 'C++'],
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
  },
  {
    name: 'Moderate Match (60%)',
    studentSkills: ['JavaScript', 'React', 'Python', 'Java', 'C++'],
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'TypeScript'],
  },
  {
    name: 'Low Match (40%)',
    studentSkills: ['Python', 'Django', 'Flask', 'Java', 'C++'],
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
  },
  {
    name: 'No Match (0%)',
    studentSkills: ['Python', 'Django', 'Flask', 'Java', 'C++'],
    requiredSkills: ['Rust', 'Go', 'Kotlin', 'Swift', 'Dart'],
  }
];

console.log('\n📊 Testing Skill Matching Algorithm:\n');

scenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario.name}`);
  console.log('   ' + '-'.repeat(76));
  
  const result = calculateSkillMatch(scenario.studentSkills, scenario.requiredSkills);
  const status = getStatusBySkillMatch(result.matchPercentage);
  const autoSelect = shouldAutoSelect(result.matchPercentage);
  
  console.log(`   Student Skills: ${scenario.studentSkills.join(', ')}`);
  console.log(`   Required Skills: ${scenario.requiredSkills.join(', ')}`);
  console.log(`   Match Percentage: ${result.matchPercentage}%`);
  console.log(`   Matched Skills: ${result.matchedSkills.join(', ') || 'None'}`);
  console.log(`   Missing Skills: ${result.missingSkills.join(', ') || 'None'}`);
  console.log(`   Status: ${status.toUpperCase()}`);
  console.log(`   Auto-Selected: ${autoSelect ? 'YES ✅' : 'NO'}`);
  
  if (autoSelect) {
    console.log(`   🎊 AUTOMATICALLY SELECTED! Student will be placed directly.`);
  } else if (result.matchPercentage >= 70) {
    console.log(`   🎉 Auto-shortlisted for HR review.`);
  } else if (result.matchPercentage >= 50) {
    console.log(`   📝 Application submitted for HR review.`);
  } else {
    console.log(`   ⚠️  Low match - HR will review manually.`);
  }
  
  console.log('');
});

console.log('='.repeat(80));
console.log('SUMMARY OF AUTO-SELECTION RULES:');
console.log('='.repeat(80));
console.log('✅ >= 75% Match → AUTO-SELECTED (Directly placed)');
console.log('🎉 >= 70% Match → AUTO-SHORTLISTED (For HR review)');
console.log('📝 >= 50% Match → APPLIED (For HR review)');
console.log('⚠️  < 50% Match → APPLIED (For HR review)');
console.log('='.repeat(80));

console.log('\n💡 HOW IT WORKS:');
console.log('1. HR adds required skills for their company');
console.log('2. Student adds skills in their profile');
console.log('3. When student applies, system calculates skill match percentage');
console.log('4. If match >= 75%, student is AUTOMATICALLY SELECTED');
console.log('5. If match >= 70%, student is automatically shortlisted');
console.log('6. Notifications sent to student, HR, and admin');
console.log('7. Selected students count is updated automatically');
console.log('\n✅ Test Complete!\n');
