import { removeAccents, detectMissingAccents } from './textProcessing.js';

/**
 * Calculate semantic match between user answer and expected answer
 * @param {string} userText - User's answer
 * @param {string[]} keyPoints - Key points to match
 * @param {string} correctAnswer - Correct answer
 * @param {string} question - Original question (optional)
 * @returns {Object} Match details with score and reasoning
 */
export const calculateSemanticMatch = (userText, keyPoints, correctAnswer, question = '') => {
  const userLower = userText.toLowerCase().trim();
  const answerLower = correctAnswer.toLowerCase();
  const questionLower = question.toLowerCase();
  
  if (userLower.includes(answerLower) || answerLower.includes(userLower)) {
    return { score: 100, exactMatch: true };
  }
  
  const userNoAccents = removeAccents(userText);
  const answerNoAccents = removeAccents(correctAnswer);
  const hasAccentIssues = detectMissingAccents(userText, correctAnswer);
  
  if (userNoAccents.includes(answerNoAccents) || answerNoAccents.includes(userNoAccents)) {
    const score = hasAccentIssues ? 85 : 100;
    return { 
      score, 
      exactMatch: false, 
      accentIssues: hasAccentIssues,
      reasoning: hasAccentIssues ? 'Réponse correcte mais accents manquants (-15%)' : 'Correspondance exacte'
    };
  }
  
  const quantityMatch = questionLower.match(/nommez?\s+(deux|trois|quatre|cinq|\d+)|citez?\s+(deux|trois|quatre|cinq|\d+)/);
  const isQuantityQuestion = quantityMatch !== null;
  
  const matchedKeywords = keyPoints.filter(keyword => {
    const keywordLower = keyword.toLowerCase();
    const keywordNoAccents = removeAccents(keyword);
    return userLower.includes(keywordLower) || userNoAccents.includes(keywordNoAccents);
  });
  
  const keywordsWithAccentIssues = keyPoints.filter(keyword => {
    const keywordLower = keyword.toLowerCase();
    const keywordNoAccents = removeAccents(keyword);
    return !userLower.includes(keywordLower) && userNoAccents.includes(keywordNoAccents);
  });
  
  let score = 0;
  let reasoning = '';
  let accentPenalty = keywordsWithAccentIssues.length > 0;
  
  if (isQuantityQuestion) {
    const requestedQuantity = quantityMatch[1] || quantityMatch[2];
    let targetCount = 2;
    
    switch(requestedQuantity) {
      case 'deux': case '2': targetCount = 2; break;
      case 'trois': case '3': targetCount = 3; break;
      case 'quatre': case '4': targetCount = 4; break;
      case 'cinq': case '5': targetCount = 5; break;
      default: targetCount = parseInt(requestedQuantity) || 2;
    }
    
    if (matchedKeywords.length >= targetCount) {
      score = accentPenalty ? 85 : 100;
      reasoning = `Question de quantité: ${matchedKeywords.length}/${targetCount} éléments valides trouvés`;
      if (accentPenalty) reasoning += ` (accents manquants: -15%)`;
    } else if (matchedKeywords.length >= Math.ceil(targetCount * 0.5)) {
      score = accentPenalty ? 60 : 75;
      reasoning = `Partiellement correct: ${matchedKeywords.length}/${targetCount} éléments valides`;
      if (accentPenalty) reasoning += ` (accents manquants: -15%)`;
    } else {
      score = Math.max(0, ((matchedKeywords.length / targetCount) * 50) - (accentPenalty ? 15 : 0));
      reasoning = `Insuffisant: ${matchedKeywords.length}/${targetCount} éléments valides`;
      if (accentPenalty) reasoning += ` (accents manquants: -15%)`;
    }
  } else {
    const keywordScore = (matchedKeywords.length / keyPoints.length) * 100;
    let contextBonus = 0;
    
    const numberMatches = userLower.match(/\d+/g) || [];
    const answerNumbers = answerLower.match(/\d+/g) || [];
    if (numberMatches.length > 0 && answerNumbers.length > 0) {
      const numberMatch = numberMatches.some(num => answerNumbers.includes(num));
      if (numberMatch) contextBonus += 20;
    }
    
    if (questionLower.includes('année') || questionLower.includes('quelle année')) {
      if (numberMatches.length > 0 && answerNumbers.length > 0) {
        const exactYearMatch = numberMatches.some(num => answerNumbers.includes(num));
        score = exactYearMatch ? 100 : 0;
        reasoning = exactYearMatch ? 'Année correcte trouvée' : 'Année incorrecte';
      }
    } else {
      const baseScore = Math.min(100, keywordScore + contextBonus);
      score = accentPenalty ? Math.max(0, baseScore - 15) : baseScore;
      reasoning = `Score par mots-clés: ${keywordScore.toFixed(0)}%`;
      if (contextBonus > 0) reasoning += ` + contexte: ${contextBonus}%`;
      if (accentPenalty) reasoning += ` (accents manquants: -15%)`;
    }
  }
  
  return { 
    score: Math.round(score), 
    exactMatch: score === 100 && !accentPenalty,
    matchedKeywords: matchedKeywords.length,
    totalKeywords: keyPoints.length,
    reasoning: reasoning,
    isQuantityQuestion: isQuantityQuestion,
    matchedItems: matchedKeywords,
    accentIssues: accentPenalty,
    keywordsWithAccentIssues: keywordsWithAccentIssues
  };
};

/**
 * Check if user's formulation matches the suggested perfect formulation
 * @param {string} userAnswer - User's answer
 * @param {string} suggestedFormulation - Suggested perfect formulation
 * @returns {boolean} True if formulation is perfect
 */
export const checkFormulationQuality = (userAnswer, suggestedFormulation) => {
  const userNormalized = removeAccents(userAnswer.toLowerCase().trim());
  const suggestedNormalized = removeAccents(suggestedFormulation.toLowerCase().trim());
  
  // Check for exact match (ignoring accents)
  return userNormalized === suggestedNormalized ||
         userNormalized.includes(suggestedNormalized) ||
         suggestedNormalized.includes(userNormalized);
};
