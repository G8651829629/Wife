import React, { useState, useRef, useEffect } from 'react';
import VirtualWife from './components/VirtualWife';
import ChatInterface from './components/ChatInterface';
import CameraCapture from './components/CameraCapture';
import ClapDetection from './components/ClapDetection';
import KnowledgeManager from './components/KnowledgeManager';
import TrainingPanel from './components/TrainingPanel';
import LanguageSelector from './components/LanguageSelector';
import YouTubePlayer from './components/music/YouTubePlayer';
import AppAutomation from './components/automation/AppAutomation';
import { Heart, Video, MessageCircle, Music, Brain, Globe, Settings, Terminal, Menu, X } from 'lucide-react';
import { AIService } from './services/aiService';
import { UserKnowledge } from './types/ai';

function App() {
  const [emotion, setEmotion] = useState('happy');
  const [animation, setAnimation] = useState('Happy');
  const [isListening, setIsListening] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [clapDetectionActive, setClapDetectionActive] = useState(false);
  const [videoContext, setVideoContext] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chat' | 'camera' | 'music' | 'training' | 'knowledge' | 'language' | 'automation'>('chat');
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const aiService = useRef(new AIService());

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleAIResponse = (response: { emotion: string; animation: string }) => {
    setEmotion(response.emotion);
    setAnimation(response.animation);
  };

  const handleVideoFrame = (imageData: string) => {
    setVideoContext(`User is visible on camera at ${new Date().toLocaleTimeString()}`);
  };

  const handleAudioData = (audioData: Blob) => {
    console.log('Audio data received:', audioData.size, 'bytes');
  };

  const handleClapDetected = () => {
    setIsListening(true);
    // Auto-trigger voice input
    setTimeout(() => {
      setIsListening(false);
    }, 5000);
  };

  const handleKnowledgeUpdate = (knowledge: UserKnowledge) => {
    aiService.current.setUserKnowledge(knowledge);
  };

  const handleMusicStateChange = (isPlaying: boolean) => {
    setIsMusicPlaying(isPlaying);
    if (isPlaying) {
      setAnimation('Hip Hop Dancing');
      setEmotion('happy');
    }
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: MessageCircle, color: 'pink' },
    { id: 'camera', label: 'Camera', icon: Video, color: 'blue' },
    { id: 'music', label: 'Music', icon: Music, color: 'purple' },
    { id: 'training', label: 'Training', icon: Brain, color: 'green' },
    { id: 'knowledge', label: 'Knowledge', icon: Settings, color: 'orange' },
    { id: 'language', label: 'Language', icon: Globe, color: 'indigo' },
    { id: 'automation', label: 'Apps', icon: Terminal, color: 'red' }
  ];

  const getTabColorClasses = (tabId: string, isActive: boolean) => {
    const colors = {
      pink: isActive ? 'bg-pink-500 text-white' : 'bg-white/50 text-gray-700 hover:bg-white/70',
      blue: isActive ? 'bg-blue-500 text-white' : 'bg-white/50 text-gray-700 hover:bg-white/70',
      purple: isActive ? 'bg-purple-500 text-white' : 'bg-white/50 text-gray-700 hover:bg-white/70',
      green: isActive ? 'bg-green-500 text-white' : 'bg-white/50 text-gray-700 hover:bg-white/70',
      orange: isActive ? 'bg-orange-500 text-white' : 'bg-white/50 text-gray-700 hover:bg-white/70',
      indigo: isActive ? 'bg-indigo-500 text-white' : 'bg-white/50 text-gray-700 hover:bg-white/70',
      red: isActive ? 'bg-red-500 text-white' : 'bg-white/50 text-gray-700 hover:bg-white/70'
    };
    
    const tab = tabs.find(t => t.id === tabId);
    return colors[tab?.color as keyof typeof colors] || colors.pink;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="text-pink-500" size={28} />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Virtual Wife</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Your AI Companion</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2 flex-wrap">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                      getTabColorClasses(tab.id, activeTab === tab.id)
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden xl:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                        getTabColorClasses(tab.id, activeTab === tab.id)
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-h-[calc(100vh-140px)]">
          {/* 3D Model */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden order-2 lg:order-1">
            <div className="h-64 sm:h-80 lg:h-full relative">
              <VirtualWife 
                emotion={emotion} 
                animation={animation} 
                isListening={isListening}
                isMusicPlaying={isMusicPlaying}
              />
            </div>
          </div>

          {/* Interface Panel */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden order-1 lg:order-2">
            <div className="h-full flex flex-col">
              {activeTab === 'chat' && (
                <ChatInterface
                  onResponse={handleAIResponse}
                  onListening={setIsListening}
                  videoContext={videoContext}
                />
              )}
              
              {activeTab === 'camera' && (
                <div className="p-4 sm:p-6 h-full overflow-y-auto">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Camera & Voice</h3>
                  
                  <div className="space-y-6">
                    <CameraCapture
                      onVideoFrame={handleVideoFrame}
                      onAudioData={handleAudioData}
                      isActive={cameraActive}
                      onToggle={() => setCameraActive(!cameraActive)}
                    />
                    
                    <ClapDetection
                      onClapDetected={handleClapDetected}
                      isActive={clapDetectionActive}
                      onToggle={() => setClapDetectionActive(!clapDetectionActive)}
                    />
                  </div>
                  
                  {videoContext && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Visual Context:</strong> {videoContext}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'music' && (
                <div className="p-4 sm:p-6 h-full overflow-y-auto">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Music & Dancing</h3>
                  <YouTubePlayer onMusicStateChange={handleMusicStateChange} />
                </div>
              )}

              {activeTab === 'training' && (
                <div className="p-4 sm:p-6 h-full overflow-y-auto">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">AI Training</h3>
                  <TrainingPanel trainingService={aiService.current.getTrainingService()} />
                </div>
              )}

              {activeTab === 'knowledge' && (
                <div className="p-4 sm:p-6 h-full overflow-y-auto">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Personal Knowledge</h3>
                  <KnowledgeManager onKnowledgeUpdate={handleKnowledgeUpdate} />
                </div>
              )}

              {activeTab === 'language' && (
                <div className="p-4 sm:p-6 h-full overflow-y-auto">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Language Settings</h3>
                  <LanguageSelector
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                    autoDetect={autoDetectLanguage}
                    onAutoDetectChange={setAutoDetectLanguage}
                  />
                </div>
              )}

              {activeTab === 'automation' && (
                <div className="p-4 sm:p-6 h-full overflow-y-auto">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">App Automation</h3>
                  <AppAutomation automationService={aiService.current.getAutomationService()} />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-600 text-xs sm:text-sm">
        <p>Built with React, Three.js, and VRM. Your multilingual virtual companion with AI learning.</p>
      </footer>
    </div>
  );
}

export default App;