import React from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

const VoiceControls = ({ 
  voiceEnabled, 
  isListening, 
  isSpeaking,
  transcript,
  onStartListening,
  onStopListening,
  onSpeak,
  text,
  showListenButton = true,
  showSpeakButton = true,
  listenButtonText = "Répondre à l'oral",
  speakButtonText = "Écouter"
}) => {
  if (!voiceEnabled) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {showListenButton && (
        <button
          onClick={isListening ? onStopListening : onStartListening}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-indigo-500 hover:bg-indigo-600 text-white'
          }`}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          {isListening ? 'Arrêter' : listenButtonText}
        </button>
      )}
      
      {showSpeakButton && text && (
        <button
          onClick={() => onSpeak(text)}
          disabled={isSpeaking}
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 disabled:text-gray-400"
        >
          <Volume2 className="w-4 h-4" />
          {isSpeaking ? 'En cours...' : speakButtonText}
        </button>
      )}
      
      {transcript && (
        <div className="text-sm text-gray-600">
          Transcription: "{transcript}"
        </div>
      )}
    </div>
  );
};

export default VoiceControls;
