import React, { useState } from 'react';
import { Terminal, Plus, Play, Settings } from 'lucide-react';
import { AutomationService } from '../../services/automationService';
import { AppCommand } from '../../types/ai';

interface AppAutomationProps {
  automationService: AutomationService;
}

export default function AppAutomation({ automationService }: AppAutomationProps) {
  const [commands] = useState<AppCommand[]>(automationService.getCommands());
  const [showAddCommand, setShowAddCommand] = useState(false);
  const [newCommand, setNewCommand] = useState<Partial<AppCommand>>({
    name: '',
    command: '',
    description: '',
    category: 'system',
    keywords: []
  });
  const [keywordInput, setKeywordInput] = useState('');

  const executeCommand = async (command: AppCommand) => {
    const success = await automationService.executeCommand(command);
    if (success) {
      // Show success notification
      const event = new CustomEvent('showNotification', {
        detail: { message: `${command.name} executed successfully!`, type: 'success' }
      });
      window.dispatchEvent(event);
    } else {
      // Show error notification
      const event = new CustomEvent('showNotification', {
        detail: { message: `Failed to execute ${command.name}`, type: 'error' }
      });
      window.dispatchEvent(event);
    }
  };

  const addKeyword = () => {
    if (!keywordInput.trim()) return;
    
    setNewCommand(prev => ({
      ...prev,
      keywords: [...(prev.keywords || []), keywordInput.trim()]
    }));
    setKeywordInput('');
  };

  const removeKeyword = (index: number) => {
    setNewCommand(prev => ({
      ...prev,
      keywords: prev.keywords?.filter((_, i) => i !== index) || []
    }));
  };

  const saveNewCommand = () => {
    if (!newCommand.name || !newCommand.command || !newCommand.keywords?.length) return;
    
    automationService.addCustomCommand(newCommand as AppCommand);
    setNewCommand({
      name: '',
      command: '',
      description: '',
      category: 'system',
      keywords: []
    });
    setShowAddCommand(false);
  };

  const categoryIcons = {
    browser: '🌐',
    system: '⚙️',
    media: '🎵',
    productivity: '📝'
  };

  const groupedCommands = commands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = [];
    }
    acc[command.category].push(command);
    return acc;
  }, {} as { [key: string]: AppCommand[] });

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="text-pink-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-800">App Automation</h3>
        </div>
        <button
          onClick={() => setShowAddCommand(!showAddCommand)}
          className="flex items-center gap-1 px-3 py-1 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
        >
          <Plus size={16} />
          Add Command
        </button>
      </div>

      {showAddCommand && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <h4 className="font-medium text-gray-800">Add Custom Command</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Command name"
              value={newCommand.name}
              onChange={(e) => setNewCommand(prev => ({ ...prev, name: e.target.value }))}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Command/URL"
              value={newCommand.command}
              onChange={(e) => setNewCommand(prev => ({ ...prev, command: e.target.value }))}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>

          <input
            type="text"
            placeholder="Description"
            value={newCommand.description}
            onChange={(e) => setNewCommand(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />

          <select
            value={newCommand.category}
            onChange={(e) => setNewCommand(prev => ({ ...prev, category: e.target.value as any }))}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="browser">Browser</option>
            <option value="system">System</option>
            <option value="media">Media</option>
            <option value="productivity">Productivity</option>
          </select>

          <div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add keyword"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button
                onClick={addKeyword}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {newCommand.keywords?.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-800 rounded text-sm"
                >
                  {keyword}
                  <button
                    onClick={() => removeKeyword(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={saveNewCommand}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Save Command
            </button>
            <button
              onClick={() => setShowAddCommand(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
          <div key={category}>
            <h4 className="flex items-center gap-2 font-medium text-gray-800 mb-2 capitalize">
              <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
              {category}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {categoryCommands.map((command, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-gray-800 truncate">{command.name}</h5>
                    <p className="text-sm text-gray-600 truncate">{command.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {command.keywords.slice(0, 3).map((keyword, i) => (
                        <span key={i} className="text-xs bg-gray-200 text-gray-600 px-1 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => executeCommand(command)}
                    className="ml-2 p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    <Play size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 p-3 bg-blue-50 rounded-lg">
        <p className="font-medium mb-1">💡 Voice Commands:</p>
        <p>Say "open chrome", "launch calculator", or any keyword to execute commands automatically!</p>
      </div>
    </div>
  );
}