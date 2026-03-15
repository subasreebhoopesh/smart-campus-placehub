/**
 * Skill Matching Utility
 * Compares student skills with company required skills
 */

/**
 * Calculate skill match percentage between student and company
 * @param {Array<string>} studentSkills - Skills from student's resume/profile
 * @param {Array<string>} requiredSkills - Skills required by company
 * @returns {Object} - Match percentage, matched skills, and missing skills
 */
function calculateSkillMatch(studentSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      matchPercentage: 100,
      matchedSkills: [],
      missingSkills: [],
      totalRequired: 0,
      totalMatched: 0
    };
  }

  if (!studentSkills || studentSkills.length === 0) {
    return {
      matchPercentage: 0,
      matchedSkills: [],
      missingSkills: requiredSkills,
      totalRequired: requiredSkills.length,
      totalMatched: 0
    };
  }

  // Normalize skills to lowercase for case-insensitive comparison
  const normalizedStudentSkills = studentSkills.map(s => s.toLowerCase().trim());
  const normalizedRequiredSkills = requiredSkills.map(s => s.toLowerCase().trim());

  // Find matched skills
  const matchedSkills = [];
  const missingSkills = [];

  normalizedRequiredSkills.forEach((requiredSkill, index) => {
    const isMatched = normalizedStudentSkills.some(studentSkill => {
      // Exact match or partial match (e.g., "React" matches "React.js")
      return studentSkill.includes(requiredSkill) || requiredSkill.includes(studentSkill);
    });

    if (isMatched) {
      matchedSkills.push(requiredSkills[index]); // Use original case
    } else {
      missingSkills.push(requiredSkills[index]);
    }
  });

  // Calculate percentage
  const matchPercentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);

  return {
    matchPercentage,
    matchedSkills,
    missingSkills,
    totalRequired: requiredSkills.length,
    totalMatched: matchedSkills.length
  };
}

/**
 * Determine if student should be auto-shortlisted based on skill match
 * @param {number} matchPercentage - Skill match percentage
 * @param {number} threshold - Minimum percentage required (default 70%)
 * @returns {boolean} - True if should be auto-shortlisted
 */
function shouldAutoShortlist(matchPercentage, threshold = 70) {
  return matchPercentage >= threshold;
}

/**
 * Get status based on skill match percentage
 * @param {number} matchPercentage - Skill match percentage
 * @param {number} totalMatched - Total number of matched skills
 * @returns {string} - Application status
 */
function getStatusBySkillMatch(matchPercentage, totalMatched = 0) {
  // MINIMUM REQUIREMENT: Must match at least 4 skills
  if (totalMatched < 4) {
    return 'applied'; // Not enough skills matched - manual review required
  }
  
  if (matchPercentage >= 75) {
    return 'selected'; // Auto-select if >= 75% AND >= 4 skills
  } else if (matchPercentage >= 70) {
    return 'shortlisted'; // Auto-shortlist if >= 70% AND >= 4 skills
  } else if (matchPercentage >= 50) {
    return 'applied'; // Keep as applied for manual review
  } else {
    return 'applied'; // Low match, but keep as applied for HR to review
  }
}

/**
 * Check if student should be auto-selected based on skill match
 * @param {number} matchPercentage - Skill match percentage
 * @param {number} totalMatched - Total number of matched skills
 * @param {number} threshold - Minimum percentage required (default 75%)
 * @returns {boolean} - True if should be auto-selected
 */
function shouldAutoSelect(matchPercentage, totalMatched = 0, threshold = 75) {
  // Must match at least 4 skills AND meet percentage threshold
  return totalMatched >= 4 && matchPercentage >= threshold;
}

module.exports = {
  calculateSkillMatch,
  shouldAutoShortlist,
  shouldAutoSelect,
  getStatusBySkillMatch
};
