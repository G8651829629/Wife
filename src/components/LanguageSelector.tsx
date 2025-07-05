import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../types/ai';
import { LanguageService } from '../services/languageService';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  autoDetect: boolean;
  onAutoDetectChange: (autoDetect: boolean) => void;
}

export default function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  autoDetect,
  onAutoDetectChange
}: LanguageSelectorProps) {
  const languageService = new LanguageService();
  const languages = languageService.getLanguages();

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Globe className="text-pink-500" size={20} />
        <h3 className="text-lg font-semibold text-gray-800">Language Settings</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="autoDetect"
            checked={autoDetect}
            onChange={(e) => onAutoDetectChange(e.target.checked)}
            className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
          />
          <label htmlFor="autoDetect" className="text-sm font-medium text-gray-700">
            Auto-detect language
          </label>
        </div>

        {!autoDetect && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Auto-detect analyzes your message to determine language</p>
          <p>• Your wife will respond in the detected/selected language</p>
          <p>• Supports 12 major languages with proper scripts</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {languages.slice(0, 6).map(lang => (
          <button
            key={lang.code}
            onClick={() => {
              onAutoDetectChange(false);
              onLanguageChange(lang.code);
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              selectedLanguage === lang.code && !autoDetect
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <span>{lang.flag}</span>
            <span className="truncate">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}