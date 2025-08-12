/**
 * Load user data from localStorage
 * @param {string} username - Username to load data for
 * @returns {Object} User data object
 */
export const loadUserData = (username) => {
  try {
    const userData = localStorage.getItem(`frenchCoach_${username}`);
    if (userData) {
      return JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }
  
  // Create new user profile
  const newUser = {
    username,
    createdAt: new Date().toISOString(),
    streak: 1,
    lastSessionDate: null,
    xp: 0,
    level: 1,
    totalSessions: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    badges: ['Débutant'],
    sessionHistory: [],
    weeklyProgress: Array(7).fill(0), // Last 7 days
    strongDomains: [],
    weakDomains: []
  };
  
  saveUserData(username, newUser);
  return newUser;
};

/**
 * Save user data to localStorage
 * @param {string} username - Username
 * @param {Object} userData - User data to save
 */
export const saveUserData = (username, userData) => {
  try {
    localStorage.setItem(`frenchCoach_${username}`, JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

/**
 * Calculate user's current streak
 * @param {Object} userData - User data object
 * @returns {number} Current streak count
 */
export const calculateStreak = (userData) => {
  const today = new Date().toDateString();
  const lastSession = userData.lastSessionDate;
  
  if (!lastSession) return 1; // First session
  
  const lastSessionDate = new Date(lastSession).toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (lastSessionDate === today) {
    return userData.streak; // Already completed today
  } else if (lastSessionDate === yesterday) {
    return userData.streak + 1; // Continue streak
  } else {
    return 1; // Reset streak
  }
};

/**
 * Update user progress after a session
 * @param {Object} currentUser - Current user data
 * @param {Object} sessionData - Session results data
 * @param {string} mode - Session mode ('quiz' or 'learning')
 * @returns {string[]} Array of newly earned badges
 */
export const updateUserProgress = (currentUser, sessionData, mode) => {
  if (!currentUser) return [];
  
  const today = new Date().toDateString();
  const userData = { ...currentUser };
  
  // Update streak
  if (userData.lastSessionDate !== today) {
    userData.streak = calculateStreak(userData);
  }
  userData.lastSessionDate = today;
  
  // Update XP and level (only for quiz mode)
  if (mode === 'quiz') {
    const sessionXP = sessionData.correct * 10 + (sessionData.perfectFormulations * 5);
    userData.xp += sessionXP;
    userData.level = Math.floor(userData.xp / 500) + 1;
    
    userData.totalSessions += 1;
    userData.totalQuestions += sessionData.total;
    userData.totalCorrect += sessionData.correct;
  }
  
  // Add session to history
  userData.sessionHistory.unshift({
    date: new Date().toISOString(),
    mode: mode,
    score: sessionData ? sessionData.percentage : null,
    questions: sessionData ? sessionData.total : 10, // Default to 10 for learning mode
    correct: sessionData ? sessionData.correct : null,
    perfectFormulations: sessionData ? sessionData.perfectFormulations : null
  });
  
  // Keep only last 50 sessions
  userData.sessionHistory = userData.sessionHistory.slice(0, 50);
  
  // Award badges
  const newBadges = [];
  if (userData.streak >= 7 && !userData.badges.includes('Assidu')) newBadges.push('Assidu');
  if (userData.streak >= 30 && !userData.badges.includes('Dévoué')) newBadges.push('Dévoué');
  if (userData.totalSessions >= 10 && !userData.badges.includes('Expérimenté')) newBadges.push('Expérimenté');
  if (userData.level >= 5 && !userData.badges.includes('Constitution Pro')) newBadges.push('Constitution Pro');
  if (userData.totalCorrect >= 100 && !userData.badges.includes('Centurion')) newBadges.push('Centurion');
  
  userData.badges = [...userData.badges, ...newBadges];
  
  saveUserData(userData.username, userData);
  
  return { userData, newBadges };
};
