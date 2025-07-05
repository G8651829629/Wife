import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Download, BarChart3, Brain } from 'lucide-react';
import { TrainingService } from '../services/trainingService';

interface TrainingPanelProps {
  trainingService: TrainingService;
}

export default function TrainingPanel({ trainingService }: TrainingPanelProps) {
  const [stats, setStats] = useState(trainingService.getTrainingStats());
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      setStats(trainingService.getTrainingStats());
    };

    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [trainingService]);

  const exportTrainingData = () => {
    const data = trainingService.exportTrainingData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `virtual_wife_training_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="text-pink-500" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">AI Training</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            <BarChart3 size={16} />
            Stats
          </button>
          <button
            onClick={exportTrainingData}
            className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="text-center p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="text-pink-500" size={20} />
          <span className="font-medium text-gray-800">Learning Progress</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Your virtual wife learns from your feedback to provide better responses
        </p>
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <ThumbsUp className="text-green-500" size={16} />
            <span className="text-green-600 font-medium">{stats.positive}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbsDown className="text-red-500" size={16} />
            <span className="text-red-600 font-medium">{stats.negative}</span>
          </div>
          <div className="text-gray-600">
            Total: <span className="font-medium">{stats.total}</span>
          </div>
        </div>
      </div>

      {showStats && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-800">Training Statistics</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-500">{stats.positive}</div>
              <div className="text-sm text-gray-600">Positive Feedback</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-red-500">{stats.negative}</div>
              <div className="text-sm text-gray-600">Negative Feedback</div>
            </div>
          </div>

          <div>
            <h5 className="font-medium text-gray-700 mb-2">Training by Language</h5>
            <div className="space-y-2">
              {Object.entries(stats.byLanguage).map(([lang, count]) => (
                <div key={lang} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 capitalize">{lang}</span>
                  <span className="font-medium text-gray-800">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            <p>• Training data is automatically saved locally</p>
            <p>• Positive feedback helps improve response quality</p>
            <p>• Export data to backup your training progress</p>
          </div>
        </div>
      )}

      <div className="text-center text-sm text-gray-500">
        <p>Rate responses with 👍/👎 to help your wife learn your preferences</p>
      </div>
    </div>
  );
}