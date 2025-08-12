import React from 'react';
import { CheckCircle, XCircle, Award } from 'lucide-react';
import { QUESTIONS_DATABASE } from '../../data/questions.js';

const SessionResults = ({ 
  mode, 
  stats, 
  sessionLength = 10,
  onStartSession,
  onReturnHome 
}) => {
  // Learning mode completion
  if (mode === 'learning') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">📚 Session d'apprentissage terminée !</h1>
          <p className="text-blue-700">Vous avez étudié {sessionLength} cartes</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg mb-6 text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-2xl font-semibold mb-4">Excellent travail !</h2>
          <p className="text-gray-600 mb-6">
            Vous avez parcouru toutes les cartes d'apprentissage. Ces connaissances vous seront utiles pour votre entretien de naturalisation.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Conseil</h3>
            <p className="text-sm text-blue-800">
              Maintenant, testez vos connaissances avec le mode Quiz pour voir ce que vous avez retenu !
            </p>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onReturnHome}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Retour au menu
          </button>
          <button
            onClick={() => onStartSession('quiz')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Passer au Quiz
          </button>
        </div>
      </div>
    );
  }

  // Quiz mode results
  if (!stats) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-2">🎉 Session terminée !</h1>
        <p className="text-indigo-700">Voici vos résultats détaillés</p>
      </div>

      {/* Overall Score */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <div className="text-center">
          <div className="text-6xl font-bold text-indigo-600 mb-2">{stats.percentage}%</div>
          <div className="text-xl text-gray-700 mb-4">
            {stats.correct} / {stats.total} réponses correctes
          </div>
          
          {stats.perfectFormulations > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-center gap-2 text-yellow-800">
                <Award className="w-5 h-5" />
                <span className="font-semibold">
                  Bonus ! {stats.perfectFormulations} formulation{stats.perfectFormulations > 1 ? 's' : ''} parfaite{stats.perfectFormulations > 1 ? 's' : ''} (+{stats.perfectFormulations * 5} XP)
                </span>
              </div>
            </div>
          )}

          <div className={`text-lg font-semibold ${stats.percentage >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
            {stats.percentage >= 70 ? '✅ Félicitations ! Niveau excellent' : '📚 Continuez vos efforts'}
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <h3 className="text-xl font-semibold mb-4">Analyse détaillée</h3>
        <div className="space-y-3">
          {stats.answers.map((answer, index) => {
            const question = QUESTIONS_DATABASE.find(q => q.id === answer.questionId);
            return (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${answer.isCorrect ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'}`}>
                <div className="flex items-start gap-3">
                  {answer.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Q{index + 1}: {question?.question}</div>
                    {answer.matchDetails && (
                      <div className="text-sm text-gray-600 mt-1">
                        {answer.matchDetails.reasoning || `Correspondance: ${answer.matchDetails.matchedKeywords}/${answer.matchDetails.totalKeywords} mots-clés trouvés`}
                        {answer.matchDetails.isQuantityQuestion && (
                          <div className="text-xs text-blue-600 mt-1">
                            🎯 Question de quantité détectée • Éléments trouvés: {answer.matchDetails.matchedItems?.join(', ')}
                          </div>
                        )}
                        {answer.matchDetails.accentIssues && (
                          <div className="text-xs text-yellow-600 mt-1">
                            ⚠️ Accents manquants détectés
                          </div>
                        )}
                      </div>
                    )}
                    {answer.perfectFormulation && (
                      <div className="text-sm text-yellow-700 font-medium mt-1">
                        🌟 Formulation parfaite !
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={onReturnHome}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Nouvelle session
        </button>
        <button
          onClick={() => onStartSession(mode)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Recommencer
        </button>
      </div>
    </div>
  );
};

export default SessionResults;
