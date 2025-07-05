import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, Mic, MicOff, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ChatMessage, AIProvider } from '../types/ai';
import { AIService } from '../services/aiService';
import { LanguageService } from '../services/languageService';

interface ChatInterfaceProps {
  onResponse: (response: { emotion: string; animation: string }) => void;
  onListening: (listening: boolean) => void;
  videoContext?: string;
}

export default function ChatInterface({ 
  onResponse, 
  onListening, 
  videoContext 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [showSettings, setShowSettings] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiService = useRef(new AIService());
  const languageService = useRef(new LanguageService());

  const providers: AIProvider[] = [
    { name: 'Gemini', id: 'gemini', icon: '🤖', enabled: true },
    { name: 'OpenAI', id: 'openai', icon: '🧠', enabled: true },
    { name: 'Groq', id: 'groq', icon: '⚡', enabled: true },
    { name: 'Together AI', id: 'together', icon: '🤝', enabled: true }
  ];

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
        onListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        onListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        onListening(false);
      };

      setRecognition(recognition);
    }

    // Add welcome message
    setMessages([{
      role: 'assistant',
      content: "Hello my love! I'm your virtual wife. I'm here to chat, listen, and be with you. How was your day? 💕",
      timestamp: new Date()
    }]);
  }, [onListening]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.current.sendMessage(
        currentInput,
        selectedProvider,
        videoContext,
        autoDetectLanguage,
        selectedLanguage
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        provider: response.provider,
        language: response.language
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Trigger animation and emotion
      onResponse({
        emotion: response.emotion || 'happy',
        animation: response.animation || 'Happy'
      });

      // Text-to-speech
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.content);
        utterance.rate = 0.9;
        utterance.pitch = 1.2;
        utterance.volume = 0.8;
        
        // Set language for speech synthesis
        if (response.language) {
          utterance.lang = response.language === 'hi' ? 'hi-IN' : 
                          response.language === 'es' ? 'es-ES' :
                          response.language === 'fr' ? 'fr-FR' :
                          response.language === 'de' ? 'de-DE' :
                          response.language === 'ja' ? 'ja-JP' :
                          'en-US';
        }
        
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble right now. Please try again or check your API settings.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (messageIndex: number, feedback: 'positive' | 'negative') => {
    const message = messages[messageIndex];
    const previousMessage = messages[messageIndex - 1];
    
    if (message.role === 'assistant' && previousMessage?.role === 'user') {
      aiService.current.addTrainingFeedback(
        previousMessage.content,
        message.content,
        feedback,
        message.language || 'en',
        videoContext
      );

      // Update message with feedback
      setMessages(prev => prev.map((msg, idx) => 
        idx === messageIndex ? { ...msg, feedback } : msg
      ));
    }
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
      onListening(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const setApiKey = (provider: string, key: string) => {
    aiService.current.setApiKey(provider, key);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">Chat</h2>
          <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">({selectedProvider})</span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 max-h-64 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
              >
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.icon} {provider.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language Settings
              </label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoDetect"
                    checked={autoDetectLanguage}
                    onChange={(e) => setAutoDetectLanguage(e.target.checked)}
                    className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <label htmlFor="autoDetect" className="text-sm text-gray-700">
                    Auto-detect language
                  </label>
                </div>
                
                {!autoDetectLanguage && (
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                  >
                    {languageService.current.getLanguages().map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.nativeName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* API Key Inputs */}
            {providers.map(provider => (
              <div key={provider.id}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {provider.name} API Key
                </label>
                <input
                  type="password"
                  placeholder={`Enter ${provider.name} API key`}
                  defaultValue={aiService.current.getApiKey(provider.id) || ''}
                  onChange={(e) => setApiKey(provider.id, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className="max-w-[85%] sm:max-w-xs lg:max-w-md">
              <div
                className={`px-3 sm:px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                    {message.provider && ` • ${message.provider}`}
                    {message.language && ` • ${languageService.current.getLanguageName(message.language)}`}
                  </p>
                  
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => handleFeedback(index, 'positive')}
                        className={`p-1 rounded transition-colors ${
                          message.feedback === 'positive'
                            ? 'text-green-600 bg-green-100'
                            : 'text-gray-400 hover:text-green-600'
                        }`}
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button
                        onClick={() => handleFeedback(index, 'negative')}
                        className={`p-1 rounded transition-colors ${
                          message.feedback === 'negative'
                            ? 'text-red-600 bg-red-100'
                            : 'text-gray-400 hover:text-red-600'
                        }`}
                      >
                        <ThumbsDown size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-3 sm:px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-500"></div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleListening}
            className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
              isListening 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            disabled={!recognition}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or use voice..."
            className="flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-2 sm:p-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}