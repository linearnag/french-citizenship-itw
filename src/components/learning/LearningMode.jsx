import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';
import ProgressHeader from '../common/ProgressHeader.jsx';
import VoiceControls from '../common/VoiceControls.jsx';
import { DOMAINS } from '../../data/domains.js';

const LearningMode = ({ 
  session, 
  currentIndex, 
  voiceEnabled,
  isSpeaking,
  onNext,
  onPrevious,
  onSpeak,
  onComplete
}) => {
  const [showAnswer, setShowAnswer] = useState(false);
  
  if (!session || !session.items[currentIndex]) {
    return null;
  }
  
  const currentItem = session.items[currentIndex];
  const isLastCard = currentIndex >= session.items.length - 1;

  const handleNext = () => {
    setShowAnswer(false); // Reset answer visibility
    if (isLastCard) {
      onComplete();
    } else {
      onNext();
    }
  };

  const handlePrevious = () => {
    setShowAnswer(false); // Reset answer visibility when going back
    onPrevious();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <ProgressHeader 
        currentIndex={currentIndex}
        total={session.items.length}
        mode="learning"
      />

      {/* Learning Card */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        {/* Domain Tag */}
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm ${DOMAINS[currentItem.domain].color}`}>
            {DOMAINS[currentItem.domain].name} • CARTE D'APPRENTISSAGE
          </span>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">❓ Question</h3>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
            <p className="text-lg text-blue-900">{currentItem.question}</p>
          </div>
          
          <VoiceControls
            voiceEnabled={voiceEnabled}
            isSpeaking={isSpeaking}
            onSpeak={onSpeak}
            text={currentItem.question}
            showListenButton={false}
            showSpeakButton={true}
            speakButtonText="Écouter la question"
          />
        </div>

        {/* Answer - Reveal on Click */}
        {!showAnswer ? (
          <div className="mb-6">
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full bg-green-100 hover:bg-green-200 border-2 border-green-300 border-dashed p-6 rounded-lg transition-colors group"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">👁️</div>
                <div className="text-lg font-semibold text-green-700">Cliquez pour révéler la réponse</div>
                <div className="text-sm text-green-600 mt-1">Prenez le temps de réfléchir d'abord</div>
              </div>
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">✅ Réponse</h3>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
              {currentItem.type === 'mcq' && (
                <p className="text-lg text-green-900 font-medium">
                  {currentItem.options[currentItem.correctAnswer]}
                </p>
              )}
              {(currentItem.type === 'short' || currentItem.type === 'oral') && (
                <div>
                  <p className="text-lg text-green-900 font-medium mb-2">
                    {currentItem.correctAnswer}
                  </p>
                  {currentItem.suggestedFormulation && (
                    <div className="text-sm text-green-700 mt-2 p-2 bg-green-100 rounded">
                      <strong>Formulation suggérée:</strong> {currentItem.suggestedFormulation}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <VoiceControls
              voiceEnabled={voiceEnabled}
              isSpeaking={isSpeaking}
              onSpeak={onSpeak}
              text={currentItem.type === 'mcq' ? currentItem.options[currentItem.correctAnswer] : currentItem.correctAnswer}
              showListenButton={false}
              showSpeakButton={true}
              speakButtonText="Écouter la réponse"
            />
          </div>
        )}

        {/* Explanation - Only show after answer is revealed */}
        {showAnswer && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">💡 Explication</h3>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
              <p className="text-gray-700">{currentItem.rationale}</p>
            </div>
            
            <VoiceControls
              voiceEnabled={voiceEnabled}
              isSpeaking={isSpeaking}
              onSpeak={onSpeak}
              text={currentItem.rationale}
              showListenButton={false}
              showSpeakButton={true}
              speakButtonText="Écouter l'explication"
            />
          </div>
        )}

        {/* Navigation - Only show after answer is revealed */}
        {showAnswer && (
          <div className="flex gap-3">
            <button
              onClick={handleNext}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors"
            >
              {isLastCard ? 'Terminer l\'apprentissage' : 'Carte suivante'}
            </button>
            
            {currentIndex > 0 && (
              <button
                onClick={handlePrevious}
                className="px-6 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg transition-colors"
              >
                Précédent
              </button>
            )}
          </div>
        )}
      </div>

      {/* Study Tips */}
      <div className="bg-white rounded-xl p-4 shadow-lg">
        <h4 className="font-semibold mb-2">💡 Conseil d'étude</h4>
        <p className="text-sm text-gray-600">
          Prenez le temps de mémoriser cette information. Elle pourrait apparaître dans votre entretien de naturalisation !
        </p>
      </div>
    </div>
  );
};

export default LearningMode;
