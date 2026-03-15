/**
 * Student Ranking System
 * Calculates student rank based on multiple factors
 */

/**
 * Calculate student rank score
 * @param {Object} student - Student object with all details
 * @param {Array} requiredSkills - Company required skills (optional)
 * @returns {number} - Rank score (0-100)
 */
function calculateRankScore(student, requiredSkills = []) {
  let score = 0;
  
  // 1. CGPA Score (30 points max)
  const cgpaScore = (student.cgpa / 10) * 30;
  score += cgpaScore;
  
  // 2. Skills Score (25 points max)
  const studentSkills = student.skills || [];
  let skillScore = 0;
  
  if (requiredSkills.length > 0) {
    // If company skills provided, calculate match percentage
    const matchedSkills = studentSkills.filter(skill => 
      requiredSkills.some(req => 
        skill.toLowerCase().includes(req.toLowerCase()) || 
        req.toLowerCase().includes(skill.toLowerCase())
      )
    );
    skillScore = (matchedSkills.length / requiredSkills.length) * 25;
  } else {
    // General skill score based on number of skills
    skillScore = Math.min(studentSkills.length * 2.5, 25);
  }
  score += skillScore;
  
  // 3. Projects Score (20 points max)
  const projects = student.projects || [];
  const projectScore = Math.min(projects.length * 5, 20);
  score += projectScore;
  
  // 4. Academic Performance (15 points max)
  const tenthScore = ((student.tenthPercentage || 0) / 100) * 7.5;
  const twelfthScore = ((student.twelfthPercentage || 0) / 100) * 7.5;
  score += tenthScore + twelfthScore;
  
  // 5. Profile Completeness (10 points max)
  let completenessScore = 0;
  if (student.resumeUrl) completenessScore += 2;
  if (student.profilePhotoUrl) completenessScore += 1;
  if (student.phone) completenessScore += 1;
  if (student.linkedin) completenessScore += 2;
  if (student.github) completenessScore += 2;
  if (student.about) completenessScore += 2;
  score += completenessScore;
  
  return Math.round(score * 100) / 100; // Round to 2 decimal places
}

/**
 * Rank students for a specific company/drive
 * @param {Array} students - Array of student objects
 * @param {Array} requiredSkills - Company required skills
 * @returns {Array} - Ranked students with scores
 */
function rankStudents(students, requiredSkills = []) {
  const rankedStudents = students.map(student => {
    const score = calculateRankScore(student, requiredSkills);
    return {
      ...student,
      rankScore: score
    };
  });
  
  // Sort by rank score (highest first)
  rankedStudents.sort((a, b) => b.rankScore - a.rankScore);
  
  // Add rank position
  rankedStudents.forEach((student, index) => {
    student.rank = index + 1;
  });
  
  return rankedStudents;
}

/**
 * Get top N students
 * @param {Array} students - Array of student objects
 * @param {Array} requiredSkills - Company required skills
 * @param {number} topN - Number of top students to return
 * @returns {Array} - Top N ranked students
 */
function getTopStudents(students, requiredSkills = [], topN = 10) {
  const ranked = rankStudents(students, requiredSkills);
  return ranked.slice(0, topN);
}

/**
 * Get rank breakdown for a student
 * @param {Object} student - Student object
 * @param {Array} requiredSkills - Company required skills (optional)
 * @returns {Object} - Detailed rank breakdown
 */
function getRankBreakdown(student, requiredSkills = []) {
  const cgpaScore = (student.cgpa / 10) * 30;
  
  const studentSkills = student.skills || [];
  let skillScore = 0;
  if (requiredSkills.length > 0) {
    const matchedSkills = studentSkills.filter(skill => 
      requiredSkills.some(req => 
        skill.toLowerCase().includes(req.toLowerCase()) || 
        req.toLowerCase().includes(skill.toLowerCase())
      )
    );
    skillScore = (matchedSkills.length / requiredSkills.length) * 25;
  } else {
    skillScore = Math.min(studentSkills.length * 2.5, 25);
  }
  
  const projects = student.projects || [];
  const projectScore = Math.min(projects.length * 5, 20);
  
  const tenthScore = ((student.tenthPercentage || 0) / 100) * 7.5;
  const twelfthScore = ((student.twelfthPercentage || 0) / 100) * 7.5;
  const academicScore = tenthScore + twelfthScore;
  
  let completenessScore = 0;
  if (student.resumeUrl) completenessScore += 2;
  if (student.profilePhotoUrl) completenessScore += 1;
  if (student.phone) completenessScore += 1;
  if (student.linkedin) completenessScore += 2;
  if (student.github) completenessScore += 2;
  if (student.about) completenessScore += 2;
  
  const totalScore = cgpaScore + skillScore + projectScore + academicScore + completenessScore;
  
  return {
    totalScore: Math.round(totalScore * 100) / 100,
    breakdown: {
      cgpa: { score: Math.round(cgpaScore * 100) / 100, max: 30 },
      skills: { score: Math.round(skillScore * 100) / 100, max: 25 },
      projects: { score: Math.round(projectScore * 100) / 100, max: 20 },
      academic: { score: Math.round(academicScore * 100) / 100, max: 15 },
      profileCompleteness: { score: Math.round(completenessScore * 100) / 100, max: 10 }
    }
  };
}

module.exports = {
  calculateRankScore,
  rankStudents,
  getTopStudents,
  getRankBreakdown
};
