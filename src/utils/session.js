import { QUESTIONS_DATABASE } from '../data/questions.js';

/**
 * Generate a randomized learning/quiz session
 * @param {string} mode - 'learning', 'quiz-mcq', or 'quiz-oral'
 * @param {number} count - Number of questions (default: 10)
 * @param {string[]} questionTypes - Filter by question types (optional)
 * @returns {Object} Session object with questions
 */
export const generateSession = (mode, count = 10, questionTypes = null) => {
  let availableQuestions = [...QUESTIONS_DATABASE];
  
  // Filter by question types if specified
  if (questionTypes && questionTypes.length > 0) {
    availableQuestions = availableQuestions.filter(q => questionTypes.includes(q.type));
  }
  
  const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
  const items = shuffled.slice(0, Math.min(count, shuffled.length));
  
  return {
    id: Date.now(),
    items,
    mode,
    questionTypes: questionTypes || ['mcq', 'short', 'oral'],
    practiceCount: items.filter(q => ['mcq', 'short'].includes(q.type)).length,
    testCount: items.filter(q => q.type === 'oral').length,
    createdAt: new Date().toISOString()
  };
};

/**
 * Calculate final session statistics
 * @param {Array} answersHistory - Array of answer objects
 * @returns {Object} Session statistics
 */
export const calculateSessionStats = (answersHistory) => {
  const correctAnswers = answersHistory.filter(a => a.isCorrect).length;
  const totalQuestions = answersHistory.length;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const perfectFormulations = answersHistory.filter(a => a.perfectFormulation).length;
  
  return {
    correct: correctAnswers,
    total: totalQuestions,
    percentage,
    perfectFormulations,
    answers: answersHistory
  };
};
