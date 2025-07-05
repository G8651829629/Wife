import React, { useState } from 'react';
import VirtualWife from './components/VirtualWife';
import ChatInterface from './components/ChatInterface';
import CameraCapture from './components/CameraCapture';
import { Heart, Video, MessageCircle } from 'lucide-react';

function App() {
  const [emotion, setEmotion] = useState('happy');
  const [animation, setAnimation] = useState('Happy');
  const [isListening, setIsListening] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [videoContext, setVideoContext] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chat' | 'camera'>('chat');

  const handleAIResponse = (response: { emotion: string; animation: string }) => {
    setEmotion(response.emotion);
    setAnimation(response.animation);
  };

  const handleVideoFrame = (imageData: string) => {
    // Simple context extraction - in a real app, you'd use computer vision
    setVideoContext(`User is visible on camera at ${new Date().toLocaleTimeString()}`);
  };

  const handleAudioData = (audioData: Blob) => {
    // Handle audio data for speech recognition or analysis
    console.log('Audio data received:', audioData.size, 'bytes');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="text-pink-500" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Virtual Wife</h1>
                <p className="text-sm text-gray-600">Your AI Companion</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'chat' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white/50 text-gray-700 hover:bg-white/70'
                }`}
              >
                <MessageCircle size={20} />
                Chat
              </button>
              <button
                onClick={() => setActiveTab('camera')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === 'camera' 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white/50 text-gray-700 hover:bg-white/70'
                }`}
              >
                <Video size={20} />
                Camera
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
          {/* 3D Model */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="h-full relative">
              <VirtualWife 
                emotion={emotion} 
                animation={animation} 
                isListening={isListening}
              />
              
              {/* Status Indicators */}
              <div className="absolute top-4 left-4 space-y-2">
                <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  Emotion: {emotion}
                </div>
                <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  Animation: {animation}
                </div>
                {isListening && (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm animate-pulse">
                    Listening...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Interface Panel */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            {activeTab === 'chat' ? (
              <ChatInterface
                onResponse={handleAIResponse}
                onListening={setIsListening}
                videoContext={videoContext}
              />
            ) : (
              <div className="p-6 h-full">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Camera Interaction</h3>
                <CameraCapture
                  onVideoFrame={handleVideoFrame}
                  onAudioData={handleAudioData}
                  isActive={cameraActive}
                  onToggle={() => setCameraActive(!cameraActive)}
                />
                
                {videoContext && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Visual Context:</strong> {videoContext}
                    </p>
                  </div>
                )}
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Camera Features:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Real-time video capture for AI context</li>
                    <li>• Voice recording for speech interaction</li>
                    <li>• Visual feedback integration</li>
                    <li>• Privacy-focused local processing</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-600 text-sm">
        <p>Built with React, Three.js, and VRM. Your virtual companion with multiple AI providers.</p>
      </footer>
    </div>
  );
}

export default App;