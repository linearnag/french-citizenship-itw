import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Award, Clock } from 'lucide-react';
import ProgressHeader from '../common/ProgressHeader.jsx';
import NavigationHeader from '../common/NavigationHeader.jsx';
import VoiceControls from '../common/VoiceControls.jsx';
import { DOMAINS } from '../../data/domains.js';
import { calculateSemanticMatch, checkFormulationQuality } from '../../utils/scoring.js';

const QuizMode = ({ 
  session, 
  currentIndex,
  voiceEnabled,
  isListening,
  isSpeaking,
  transcript,
  onStartListening,
  onStopListening,
  onSpeak,
  onAnswer,
  onNext,
  onPrevious,
  onHome
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [perfectFormulation, setPerfectFormulation] = useState(false);
  const [matchDetails, setMatchDetails] = useState(null);
  
  // Timer states for oral questions
  const [answerStartTime, setAnswerStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  if (!session || !session.items[currentIndex]) {
    return null;
  }
  
  const currentItem = session.items[currentIndex];
  const isLastQuestion = currentIndex >= session.items.length - 1;

  // Update userAnswer when transcript changes
  useEffect(() => {
    if (transcript) {
      setUserAnswer(transcript);
    }
  }, [transcript]);

  // Start timer when user begins answering oral questions
  useEffect(() => {
    if (currentItem.type === 'oral' && userAnswer.length > 0 && !answerStartTime && !showFeedback) {
      setAnswerStartTime(Date.now());
      setTimerActive(true);
      setTimeElapsed(0);
    }
  }, [userAnswer, currentItem.type, answerStartTime, showFeedback]);

  // Timer update effect
  useEffect(() => {
    let interval = null;
    if (timerActive && answerStartTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - answerStartTime) / 1000);
        setTimeElapsed(elapsed);
      }, 1000);
    } else if (!timerActive) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive, answerStartTime]);

  // Reset timer when question changes or feedback is shown
  useEffect(() => {
    setAnswerStartTime(null);
    setTimeElapsed(0);
    setTimerActive(false);
  }, [currentIndex, showFeedback]);

  const handleMCQSelect = (index) => {
    setUserAnswer(index.toString());
  };

  const handleSubmitAnswer = () => {
    if (!currentItem) return;
    
    let isCorrect = false;
    let details = null;
    let perfectForm = false;
    
    switch (currentItem.type) {
      case 'mcq':
        const selectedIndex = parseInt(userAnswer);
        isCorrect = selectedIndex === currentItem.correctAnswer;
        break;
        
      case 'short':
      case 'oral':
        details = calculateSemanticMatch(
          userAnswer, 
          currentItem.keyPoints, 
          currentItem.correctAnswer, 
          currentItem.question
        );
        isCorrect = details.score >= 60;
        
        if (currentItem.suggestedFormulation) {
          perfectForm = checkFormulationQuality(userAnswer, currentItem.suggestedFormulation);
        }
        break;
        
      default:
        isCorrect = false;
    }
    
    const answerData = {
      questionId: currentItem.id,
      userAnswer,
      isCorrect,
      matchDetails: details,
      perfectFormulation: perfectForm
    };
    
    setLastAnswerCorrect(isCorrect);
    setPerfectFormulation(perfectForm);
    setMatchDetails(details);
    setShowFeedback(true);
    
    // Notify parent component
    onAnswer(answerData);
  };

  const handleNext = () => {
    setUserAnswer('');
    setShowFeedback(false);
    setPerfectFormulation(false);
    setMatchDetails(null);
    // Reset timer
    setAnswerStartTime(null);
    setTimeElapsed(0);
    setTimerActive(false);
    onNext();
  };

  const handlePrevious = () => {
    setUserAnswer('');
    setShowFeedback(false);
    setPerfectFormulation(false);
    setMatchDetails(null);
    // Reset timer
    setAnswerStartTime(null);
    setTimeElapsed(0);
    setTimerActive(false);
    onPrevious();
  };

  const getQuizTitle = () => {
    if (session.mode === 'quiz-mcq') return 'Quiz QCM';
    if (session.mode === 'quiz-oral') return 'Quiz Oral';
    return 'Quiz';
  };

  // Helper functions for timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isRecordingComplete = () => {
    return currentItem.type !== 'oral' || timeElapsed >= 30;
  };

  const getRemainingRecordingTime = () => {
    return Math.max(0, 30 - timeElapsed);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <NavigationHeader
        title={getQuizTitle()}
        subtitle="Testez vos connaissances et obtenez votre score"
        onBack={currentIndex > 0 ? handlePrevious : null}
        onHome={onHome}
        showBackButton={currentIndex > 0}
      />
      
      <ProgressHeader 
        currentIndex={currentIndex}
        total={session.items.length}
        mode="quiz"
      />

      {/* Question Card */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        {/* Domain Tag */}
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm ${DOMAINS[currentItem.domain].color}`}>
            {DOMAINS[currentItem.domain].name} • {currentItem.type.toUpperCase()}
          </span>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">{currentItem.question}</h3>
          
          {voiceEnabled && currentItem.type === 'oral' && (
            <VoiceControls
              voiceEnabled={voiceEnabled}
              isSpeaking={isSpeaking}
              onSpeak={onSpeak}
              text={currentItem.question}
              showListenButton={false}
              showSpeakButton={true}
              speakButtonText="Réécouter la question"
            />
          )}
        </div>

        {/* Answer Interface */}
        {!showFeedback && (
          <div className="space-y-4">
            {currentItem.type === 'mcq' && (
              <div className="space-y-2">
                {currentItem.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleMCQSelect(index)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      userAnswer === index.toString()
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {index + 1}. {option}
                  </button>
                ))}
              </div>
            )}

            {(currentItem.type === 'short' || currentItem.type === 'oral') && (
              <div className="space-y-4">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Tapez votre réponse ici..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                />
                
                {voiceEnabled && currentItem.type === 'oral' && (
                  <VoiceControls
                    voiceEnabled={voiceEnabled}
                    isListening={isListening}
                    transcript={transcript}
                    onStartListening={onStartListening}
                    onStopListening={onStopListening}
                    showListenButton={true}
                    showSpeakButton={false}
                    listenButtonText="Répondre à l'oral"
                  />
                )}

                {/* Timer display for oral questions */}
                {currentItem.type === 'oral' && answerStartTime && (
                  <div className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                    isRecordingComplete() 
                      ? 'border-green-200 bg-green-50 text-green-800' 
                      : 'border-blue-200 bg-blue-50 text-blue-800'
                  }`}>
                    <Clock className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium">
                        Temps de réponse: {formatTime(timeElapsed)}
                      </div>
                      {!isRecordingComplete() && (
                        <div className="text-sm">
                          🎙️ Durée suggérée pour réponse orale: 30s ({getRemainingRecordingTime()}s restantes)
                        </div>
                      )}
                      {isRecordingComplete() && (
                        <div className="text-sm">
                          ✅ Durée suggérée atteinte - Réponse complète
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim()}
              className={`w-full py-3 rounded-lg transition-colors ${
                !userAnswer.trim()
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              Valider ma réponse
            </button>
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${
              lastAnswerCorrect 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {lastAnswerCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className="font-semibold">
                  {lastAnswerCorrect ? 'Correct !' : 'Incorrect'}
                </span>
                {perfectFormulation && (
                  <span className="ml-2 text-yellow-600 font-medium">🌟 Formulation parfaite ! (+5 XP)</span>
                )}
              </div>
              
              {currentItem.type === 'mcq' && (
                <div className="mb-2">
                  <strong>Bonne réponse:</strong> {currentItem.options[currentItem.correctAnswer]}
                </div>
              )}
              
              {(currentItem.type === 'short' || currentItem.type === 'oral') && currentItem.suggestedFormulation && !perfectFormulation && (
                <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded">
                  <strong>Suggestion de formulation:</strong>
                  <div className="text-blue-800 mt-1">{currentItem.suggestedFormulation}</div>
                </div>
              )}
              
              {/* Accent reminder */}
              {matchDetails?.accentIssues && (
                <div className="mb-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <span className="text-lg">⚠️</span>
                    <div>
                      <strong>Rappel sur les accents:</strong>
                      <div className="text-sm mt-1">
                        Votre réponse est correcte, mais attention aux accents français ! 
                        {matchDetails?.keywordsWithAccentIssues?.length > 0 && (
                          <span> Mots concernés: {matchDetails.keywordsWithAccentIssues.join(', ')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <p className="text-gray-700">{currentItem.rationale}</p>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors"
            >
              {isLastQuestion ? 'Voir les résultats' : 'Question suivante'}
            </button>
          </div>
        )}
      </div>

      {/* Voice Controls */}
      {voiceEnabled && (
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <h4 className="font-semibold mb-2">Contrôles vocaux</h4>
          <div className="flex flex-wrap gap-2 text-sm text-gray-600">
            <span>• Dites "répète" pour réécouter</span>
            <span>• Utilisez le micro pour les réponses orales</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizMode;
