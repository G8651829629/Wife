import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Mic, MicOff } from 'lucide-react';

interface CameraCaptureProps {
  onVideoFrame: (imageData: string) => void;
  onAudioData: (audioData: Blob) => void;
  isActive: boolean;
  onToggle: () => void;
}

export default function CameraCapture({ 
  onVideoFrame, 
  onAudioData, 
  isActive, 
  onToggle 
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isActive]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      });

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Set up media recorder for audio
      const mediaRecorder = new MediaRecorder(mediaStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          onAudioData(event.data);
        }
      };

      // Capture video frames periodically
      const captureInterval = setInterval(() => {
        captureFrame();
      }, 2000); // Capture every 2 seconds

      return () => clearInterval(captureInterval);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isActive) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onVideoFrame(imageData);
  };

  const toggleRecording = () => {
    if (!mediaRecorderRef.current) return;

    if (isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      mediaRecorderRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isActive 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {isActive ? <CameraOff size={20} /> : <Camera size={20} />}
          {isActive ? 'Stop Camera' : 'Start Camera'}
        </button>

        {isActive && (
          <button
            onClick={toggleRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
        )}
      </div>

      {isActive && (
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full max-w-sm rounded-lg border-2 border-gray-300"
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          {isRecording && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
              Recording
            </div>
          )}
        </div>
      )}
    </div>
  );
}