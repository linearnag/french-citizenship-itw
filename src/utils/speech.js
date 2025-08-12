/**
 * Initialize speech recognition for French language
 * @returns {Object|null} Speech recognition instance or null if not supported
 */
export const initializeSpeechRecognition = () => {
  if (!('webkitSpeechRecognition' in window)) {
    return null;
  }
  
  const recognition = new window.webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'fr-FR';
  
  return recognition;
};

/**
 * Speak text using French text-to-speech
 * @param {string} text - Text to speak
 * @param {Object} options - Speech options (rate, pitch, etc.)
 */
export const speak = (text, options = {}) => {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-speech not supported');
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  utterance.rate = options.rate || 0.9;
  utterance.pitch = options.pitch || 1;
  
  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;
  
  window.speechSynthesis.speak(utterance);
};

/**
 * Stop current speech synthesis
 */
export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Check if speech synthesis and recognition are supported
 * @returns {Object} Support status for speech features
 */
export const checkSpeechSupport = () => {
  return {
    speechSynthesis: 'speechSynthesis' in window,
    speechRecognition: 'webkitSpeechRecognition' in window,
    fullSupport: 'speechSynthesis' in window && 'webkitSpeechRecognition' in window
  };
};
