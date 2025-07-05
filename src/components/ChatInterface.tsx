import React, { useState, useRef, useEffect } from 'react';
import { Send, Settings, Mic, MicOff } from 'lucide-react';
import { ChatMessage, AIProvider } from '../types/ai';
import { AIService } from '../services/aiService';

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiService = useRef(new AIService());

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
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.current.sendMessage(
        inputMessage,
        selectedProvider,
        videoContext
      );

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        provider: response.provider
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
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Chat with Your Virtual Wife</h2>
          <span className="text-sm text-gray-500">({selectedProvider})</span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Provider
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.icon} {provider.name}
                  </option>
                ))}
              </select>
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
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
                {message.provider && ` • ${message.provider}`}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
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
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleListening}
            className={`p-2 rounded-lg transition-colors ${
              isListening 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
            disabled={!recognition}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or use voice..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}