import React, { useState, useEffect, useRef } from 'react';

// Components
import ModeSelection from './components/common/ModeSelection.jsx';
import LearningMode from './components/learning/LearningMode.jsx';
import QuizMode from './components/quiz/QuizMode.jsx';
import SessionResults from './components/results/SessionResults.jsx';

// Utils
import { generateSession, calculateSessionStats } from './utils/session.js';
import { initializeSpeechRecognition, speak, checkSpeechSupport } from './utils/speech.js';

const FrenchCitizenshipCoach = () => {
  // Main app state
  const [mode, setMode] = useState(null); // 'learning' or 'quiz'
  const [currentSession, setCurrentSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [finalStats, setFinalStats] = useState(null);

  // Answer tracking (for quiz mode)
  const [answersHistory, setAnswersHistory] = useState([]);

  // Speech state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // User stats (simplified for now)
  const [streak, setStreak] = useState(3);
  const [xp, setXp] = useState(1250);

  // Speech recognition ref
  const recognitionRef = useRef(null);

  // Initialize voice capabilities
  useEffect(() => {
    const speechSupport = checkSpeechSupport();
    
    if (speechSupport.fullSupport) {
      setVoiceEnabled(true);
      
      const recognition = initializeSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        
        recognition.onresult = (event) => {
          const current = event.resultIndex;
          const transcriptResult = event.results[current][0].transcript;
          setTranscript(transcriptResult);
          
          if (event.results[current].isFinal) {
            setIsListening(false);
          }
        };
        
        recognition.onerror = () => {
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  // Speech functions
  const handleSpeak = (text) => {
    speak(text, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const startListening = () => {
    if (!recognitionRef.current || isListening) return;
    
    setTranscript('');
    setIsListening(true);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Session management
  const startSession = (selectedMode) => {
    setMode(selectedMode);
    
    let session;
    let questionTypes;
    
    switch(selectedMode) {
      case 'learning':
        session = generateSession(selectedMode, 10);
        break;
      case 'quiz-mcq':
        questionTypes = ['mcq'];
        session = generateSession(selectedMode, 10, questionTypes);
        break;
      case 'quiz-oral':
        questionTypes = ['oral', 'short'];
        session = generateSession(selectedMode, 10, questionTypes);
        break;
      default:
        session = generateSession(selectedMode, 10);
    }
    
    setCurrentSession(session);
    setCurrentIndex(0);
    setAnswersHistory([]);
    setSessionComplete(false);
    setFinalStats(null);
    setTranscript('');
    
    if (voiceEnabled) {
      const modeTexts = {
        'learning': 'apprentissage',
        'quiz-mcq': 'quiz de questions à choix multiples',
        'quiz-oral': 'quiz oral'
      };
      const modeText = modeTexts[selectedMode] || 'quiz';
      setTimeout(() => {
        handleSpeak(`Bonjour ! Commençons votre session de ${modeText}. Aujourd'hui nous allons pratiquer dix questions sur la France.`);
      }, 500);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < currentSession.items.length) {
      setCurrentIndex(currentIndex + 1);
      setTranscript('');
    } else {
      handleSessionComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setTranscript('');
    }
  };

  const handleSessionComplete = () => {
    if (mode === 'quiz' && answersHistory.length > 0) {
      const stats = calculateSessionStats(answersHistory);
      setFinalStats(stats);
      
      if (voiceEnabled) {
        const message = stats.percentage >= 70 
          ? `Félicitations ! Session terminée avec ${stats.percentage} pour cent de réussite.`
          : `Session terminée. Vous avez obtenu ${stats.percentage} pour cent. Continuez vos efforts !`;
        setTimeout(() => handleSpeak(message), 500);
      }
    } else if (mode === 'learning' && voiceEnabled) {
      setTimeout(() => handleSpeak("Félicitations ! Vous avez terminé votre session d'apprentissage."), 500);
    }
    
    setSessionComplete(true);
    setCurrentSession(null);
  };

  const handleAnswerSubmission = (answerData) => {
    setAnswersHistory(prev => [...prev, answerData]);
    
    if (voiceEnabled) {
      const message = answerData.isCorrect 
        ? (answerData.perfectFormulation ? "Excellent ! Réponse parfaite avec une formulation exemplaire !" : "Excellent ! Bonne réponse.")
        : "Pas tout à fait. Voici la bonne réponse.";
      setTimeout(() => handleSpeak(message), 500);
    }
  };

  const resetToHome = () => {
    setMode(null);
    setCurrentSession(null);
    setCurrentIndex(0);
    setSessionComplete(false);
    setFinalStats(null);
    setAnswersHistory([]);
    setTranscript('');
  };

  // Render logic
  if (sessionComplete) {
    return (
      <SessionResults
        mode={mode}
        stats={finalStats}
        sessionLength={10}
        onStartSession={startSession}
        onReturnHome={resetToHome}
      />
    );
  }

  if (mode === 'learning' && currentSession) {
    return (
      <LearningMode
        session={currentSession}
        currentIndex={currentIndex}
        voiceEnabled={voiceEnabled}
        isSpeaking={isSpeaking}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSpeak={handleSpeak}
        onComplete={handleSessionComplete}
        onHome={resetToHome}
      />
    );
  }

  if ((mode === 'quiz-mcq' || mode === 'quiz-oral') && currentSession) {
    return (
      <QuizMode
        session={currentSession}
        currentIndex={currentIndex}
        voiceEnabled={voiceEnabled}
        isListening={isListening}
        isSpeaking={isSpeaking}
        transcript={transcript}
        onStartListening={startListening}
        onStopListening={stopListening}
        onSpeak={handleSpeak}
        onAnswer={handleAnswerSubmission}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onHome={resetToHome}
      />
    );
  }

  // Default: Mode selection
  return (
    <ModeSelection
      streak={streak}
      xp={xp}
      voiceEnabled={voiceEnabled}
      onStartSession={startSession}
    />
  );
};

export default FrenchCitizenshipCoach;
