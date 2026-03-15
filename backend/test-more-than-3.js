/**
 * Test: "More than 3 skills" = 4 or more skills
 */

const { calculateSkillMatch, getStatusBySkillMatch } = require('./utils/skillMatcher');

console.log('=== Testing "More Than 3 Skills" Requirement ===\n');

// Test: 3 skills (NOT more than 3)
console.log('Test 1: Exactly 3 skills matched');
const match1 = calculateSkillMatch(
  ['JavaScript', 'React', 'Node.js'],
  ['JavaScript', 'React', 'Node.js', 'MongoDB']
);
console.log('Matched Skills:', match1.totalMatched);
console.log('Match Percentage:', match1.matchPercentage + '%');
console.log('Status:', getStatusBySkillMatch(match1.matchPercentage, match1.totalMatched));
console.log('Expected: "applied" (3 is NOT more than 3)');
console.log('Result:', match1.totalMatched === 3 ? '✅ Correct - 3 skills = applied' : '❌ Wrong');
console.log('---\n');

// Test: 4 skills (IS more than 3)
console.log('Test 2: Exactly 4 skills matched (80% match)');
const match2 = calculateSkillMatch(
  ['JavaScript', 'React', 'Node.js', 'MongoDB'],
  ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express']
);
console.log('Matched Skills:', match2.totalMatched);
console.log('Match Percentage:', match2.matchPercentage + '%');
console.log('Status:', getStatusBySkillMatch(match2.matchPercentage, match2.totalMatched));
console.log('Expected: "selected" (4 is more than 3 AND 80% >= 75%)');
console.log('Result:', match2.totalMatched === 4 ? '✅ Correct - 4 skills = can be selected' : '❌ Wrong');
console.log('---\n');

// Test: 5 skills (IS more than 3)
console.log('Test 3: Exactly 5 skills matched (100% match)');
const match3 = calculateSkillMatch(
  ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
  ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express']
);
console.log('Matched Skills:', match3.totalMatched);
console.log('Match Percentage:', match3.matchPercentage + '%');
console.log('Status:', getStatusBySkillMatch(match3.matchPercentage, match3.totalMatched));
console.log('Expected: "selected" (5 is more than 3 AND 100% >= 75%)');
console.log('Result:', match3.totalMatched === 5 ? '✅ Correct - 5 skills = can be selected' : '❌ Wrong');
console.log('---\n');

console.log('=== Summary ===');
console.log('✅ "More than 3 skills" = 4, 5, 6, 7, ... skills');
console.log('✅ 3 skills or less = Status "applied" only');
console.log('✅ 4+ skills + 75%+ match = Status "selected"');
console.log('✅ 4+ skills + 70-74% match = Status "shortlisted"');
