import React from 'react';
import { BookOpen, Brain, Mic, Flame, Award, Target, Volume2 } from 'lucide-react';
import { DOMAINS } from '../../data/domains.js';

const ModeSelection = ({ 
  streak = 3, 
  xp = 1250, 
  voiceEnabled = false,
  onStartSession 
}) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-indigo-900 mb-2">🇫🇷 Coach Citoyenneté</h1>
        <p className="text-indigo-700 text-lg">Votre préparation à l'entretien de naturalisation française</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{streak}</div>
              <div className="text-gray-600">Série de jours</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-purple-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{xp}</div>
              <div className="text-gray-600">Points XP</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-gray-900">Niveau 3</div>
              <div className="text-gray-600">Constitution Pro</div>
            </div>
          </div>
        </div>
      </div>

      {/* Voice Status */}
      {voiceEnabled && (
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg">
            <Volume2 className="w-4 h-4" />
            Mode vocal activé
          </div>
        </div>
      )}

      {/* Mode Selection */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div 
          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" 
          onClick={() => onStartSession('learning')}
        >
          <div className="text-center">
            <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">📚 Apprentissage</h3>
            <p className="text-gray-600 mb-3 text-sm">
              Découvrez les concepts clés avec des explications détaillées.
            </p>
            <div className="text-xs text-blue-600">
              • Explications détaillées<br/>
              • Tous types de questions<br/>
              • Pas de score
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" 
          onClick={() => onStartSession('quiz-mcq')}
        >
          <div className="text-center">
            <Brain className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">🎯 Quiz QCM</h3>
            <p className="text-gray-600 mb-3 text-sm">
              Questions à choix multiples avec scoring final.
            </p>
            <div className="text-xs text-purple-600">
              • Questions à choix multiples<br/>
              • Évaluation rapide<br/>
              • Score détaillé
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" 
          onClick={() => onStartSession('quiz-oral')}
        >
          <div className="text-center">
            <Mic className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">🎙️ Quiz Oral</h3>
            <p className="text-gray-600 mb-3 text-sm">
              Réponses orales et écrites comme à l'entretien.
            </p>
            <div className="text-xs text-green-600">
              • Questions ouvertes<br/>
              • Réponse vocale/écrite<br/>
              • Simulation réaliste
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Domaines couverts</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(DOMAINS).map(([key, domain]) => (
            <span key={key} className={`px-3 py-1 rounded-full text-sm ${domain.color}`}>
              {domain.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModeSelection;
