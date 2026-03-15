/**
 * Test script to verify 4-skill minimum requirement
 * Tests the updated skill matching logic
 */

const { calculateSkillMatch, getStatusBySkillMatch, shouldAutoSelect } = require('./utils/skillMatcher');

console.log('=== Testing 4-Skill Minimum Requirement ===\n');

// Test Case 1: Student with 3 matching skills (should NOT be auto-selected)
console.log('Test 1: Student with 3 matching skills');
const studentSkills1 = ['JavaScript', 'React', 'Node.js'];
const requiredSkills1 = ['JavaScript', 'React', 'Node.js', 'MongoDB'];
const match1 = calculateSkillMatch(studentSkills1, requiredSkills1);
const status1 = getStatusBySkillMatch(match1.matchPercentage, match1.totalMatched);
const autoSelect1 = shouldAutoSelect(match1.matchPercentage, match1.totalMatched);

console.log('Student Skills:', studentSkills1);
console.log('Required Skills:', requiredSkills1);
console.log('Match Percentage:', match1.matchPercentage + '%');
console.log('Total Matched:', match1.totalMatched);
console.log('Status:', status1);
console.log('Auto-Selected:', autoSelect1);
console.log('Expected: Status = "applied", Auto-Selected = false');
console.log('Result:', status1 === 'applied' && !autoSelect1 ? '✅ PASS' : '❌ FAIL');
console.log('---\n');

// Test Case 2: Student with 4 matching skills and 80% match (should be auto-selected)
console.log('Test 2: Student with 4 matching skills (80% match)');
const studentSkills2 = ['JavaScript', 'React', 'Node.js', 'MongoDB'];
const requiredSkills2 = ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'];
const match2 = calculateSkillMatch(studentSkills2, requiredSkills2);
const status2 = getStatusBySkillMatch(match2.matchPercentage, match2.totalMatched);
const autoSelect2 = shouldAutoSelect(match2.matchPercentage, match2.totalMatched);

console.log('Student Skills:', studentSkills2);
console.log('Required Skills:', requiredSkills2);
console.log('Match Percentage:', match2.matchPercentage + '%');
console.log('Total Matched:', match2.totalMatched);
console.log('Status:', status2);
console.log('Auto-Selected:', autoSelect2);
console.log('Expected: Status = "selected", Auto-Selected = true');
console.log('Result:', status2 === 'selected' && autoSelect2 ? '✅ PASS' : '❌ FAIL');
console.log('---\n');

// Test Case 3: Student with 4 matching skills and 72% match (should be auto-shortlisted)
console.log('Test 3: Student with 4 matching skills (72% match)');
const studentSkills3 = ['JavaScript', 'React', 'Node.js', 'MongoDB'];
const requiredSkills3 = ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'Docker'];
const match3 = calculateSkillMatch(studentSkills3, requiredSkills3);
const status3 = getStatusBySkillMatch(match3.matchPercentage, match3.totalMatched);
const autoSelect3 = shouldAutoSelect(match3.matchPercentage, match3.totalMatched);

console.log('Student Skills:', studentSkills3);
console.log('Required Skills:', requiredSkills3);
console.log('Match Percentage:', match3.matchPercentage + '%');
console.log('Total Matched:', match3.totalMatched);
console.log('Status:', status3);
console.log('Auto-Selected:', autoSelect3);
console.log('Expected: Status = "shortlisted", Auto-Selected = false');
console.log('Result:', status3 === 'shortlisted' && !autoSelect3 ? '✅ PASS' : '❌ FAIL');
console.log('---\n');

// Test Case 4: Student with 5 matching skills and 100% match (should be auto-selected)
console.log('Test 4: Student with 5 matching skills (100% match)');
const studentSkills4 = ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'];
const requiredSkills4 = ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'];
const match4 = calculateSkillMatch(studentSkills4, requiredSkills4);
const status4 = getStatusBySkillMatch(match4.matchPercentage, match4.totalMatched);
const autoSelect4 = shouldAutoSelect(match4.matchPercentage, match4.totalMatched);

console.log('Student Skills:', studentSkills4);
console.log('Required Skills:', requiredSkills4);
console.log('Match Percentage:', match4.matchPercentage + '%');
console.log('Total Matched:', match4.totalMatched);
console.log('Status:', status4);
console.log('Auto-Selected:', autoSelect4);
console.log('Expected: Status = "selected", Auto-Selected = true');
console.log('Result:', status4 === 'selected' && autoSelect4 ? '✅ PASS' : '❌ FAIL');
console.log('---\n');

// Test Case 5: Student with 2 matching skills (should NOT be auto-selected)
console.log('Test 5: Student with 2 matching skills');
const studentSkills5 = ['JavaScript', 'React'];
const requiredSkills5 = ['JavaScript', 'React', 'Node.js', 'MongoDB'];
const match5 = calculateSkillMatch(studentSkills5, requiredSkills5);
const status5 = getStatusBySkillMatch(match5.matchPercentage, match5.totalMatched);
const autoSelect5 = shouldAutoSelect(match5.matchPercentage, match5.totalMatched);

console.log('Student Skills:', studentSkills5);
console.log('Required Skills:', requiredSkills5);
console.log('Match Percentage:', match5.matchPercentage + '%');
console.log('Total Matched:', match5.totalMatched);
console.log('Status:', status5);
console.log('Auto-Selected:', autoSelect5);
console.log('Expected: Status = "applied", Auto-Selected = false');
console.log('Result:', status5 === 'applied' && !autoSelect5 ? '✅ PASS' : '❌ FAIL');
console.log('---\n');

console.log('=== Summary ===');
console.log('✅ All tests verify that students need AT LEAST 4 matching skills');
console.log('✅ Students with < 4 skills get status "applied" (manual review)');
console.log('✅ Students with >= 4 skills AND >= 75% match get "selected"');
console.log('✅ Students with >= 4 skills AND >= 70% match get "shortlisted"');
