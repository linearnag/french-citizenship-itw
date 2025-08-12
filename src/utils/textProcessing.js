/**
 * Remove accents from French text for comparison purposes
 * @param {string} text - Text to process
 * @returns {string} Text without accents
 */
export const removeAccents = (text) => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

/**
 * Detect if user text is missing required accents compared to reference
 * @param {string} userText - User's input text
 * @param {string} referenceText - Correct reference text
 * @returns {boolean} True if accents are missing
 */
export const detectMissingAccents = (userText, referenceText) => {
  const userNormalized = removeAccents(userText);
  const referenceNormalized = removeAccents(referenceText);
  const userOriginal = userText.toLowerCase();
  const referenceOriginal = referenceText.toLowerCase();
  
  const hasAccentIssues = userNormalized === referenceNormalized && userOriginal !== referenceOriginal;
  const hasPartialAccentIssues = userNormalized.includes(referenceNormalized) && !userOriginal.includes(referenceOriginal);
  
  return hasAccentIssues || hasPartialAccentIssues;
};
