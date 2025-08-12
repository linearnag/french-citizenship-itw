import React from 'react';
import { ArrowLeft, Home } from 'lucide-react';

const NavigationHeader = ({ 
  title, 
  onBack, 
  onHome, 
  showBackButton = true, 
  showHomeButton = true,
  subtitle 
}) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Retour</span>
            </button>
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>
        
        {showHomeButton && onHome && (
          <button
            onClick={onHome}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Accueil</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default NavigationHeader;
