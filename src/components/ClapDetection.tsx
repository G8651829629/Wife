import React, { useRef, useEffect, useState } from 'react';
import { Mic, MicOff, Settings } from 'lucide-react';

interface ClapDetectionProps {
  onClapDetected: () => void;
  isActive: boolean;
  onToggle: () => void;
}

export default function ClapDetection({ onClapDetected, isActive, onToggle }: ClapDetectionProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [sensitivity, setSensitivity] = useState(7);
  const [showSettings, setShowSettings] = useState(false);
  const [clapCount, setClapCount] = useState(0);
  const [lastClapTime, setLastClapTime] = useState(0);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (isActive) {
      startClapDetection();
    } else {
      stopClapDetection();
    }

    return () => stopClapDetection();
  }, [isActive, sensitivity]);

  const startClapDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const microphone = audioContext.createMediaStreamSource(stream);
      microphoneRef.current = microphone;
      microphone.connect(analyser);

      detectClaps();
    } catch (error) {
      console.error('Error starting clap detection:', error);
    }
  };

  const stopClapDetection = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    microphoneRef.current = null;
    analyserRef.current = null;
    setIsListening(false);
  };

  const detectClaps = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkForClap = () => {
      if (!analyser) return;

      analyser.getByteFrequencyData(dataArray);
      
      // Calculate average amplitude
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      
      // Detect sudden spike in amplitude (clap)
      const threshold = 50 + (sensitivity * 10); // Adjustable threshold
      
      if (average > threshold) {
        const currentTime = Date.now();
        
        // Prevent multiple detections within 200ms
        if (currentTime - lastClapTime > 200) {
          setLastClapTime(currentTime);
          setClapCount(prev => {
            const newCount = prev + 1;
            
            // Reset count after 2 seconds
            setTimeout(() => {
              setClapCount(0);
            }, 2000);
            
            // Trigger action on double clap
            if (newCount === 2) {
              onClapDetected();
              setIsListening(true);
              
              // Stop listening after 5 seconds
              setTimeout(() => {
                setIsListening(false);
              }, 5000);
              
              return 0; // Reset count
            }
            
            return newCount;
          });
        }
      }

      if (isActive) {
        requestAnimationFrame(checkForClap);
      }
    };

    checkForClap();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Clap Detection</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-600 hover:text-pink-500 transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>

      <div className="flex items-center justify-center">
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
            isActive
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-pink-500 hover:bg-pink-600 text-white'
          }`}
        >
          {isActive ? <MicOff size={20} /> : <Mic size={20} />}
          {isActive ? 'Stop Detection' : 'Start Detection'}
        </button>
      </div>

      {showSettings && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sensitivity: {sensitivity}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
      )}

      {isActive && (
        <div className="text-center space-y-2">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isListening 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isListening ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
            }`} />
            {isListening ? 'Listening for voice...' : 'Listening for claps...'}
          </div>
          
          {clapCount > 0 && (
            <p className="text-sm text-gray-600">
              Claps detected: {clapCount}/2
            </p>
          )}
          
          <p className="text-xs text-gray-500">
            👏 Clap twice to activate voice input
          </p>
        </div>
      )}
    </div>
  );
}