import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, User, Heart, Settings } from 'lucide-react';
import { UserKnowledge } from '../types/ai';

interface KnowledgeManagerProps {
  onKnowledgeUpdate: (knowledge: UserKnowledge) => void;
}

export default function KnowledgeManager({ onKnowledgeUpdate }: KnowledgeManagerProps) {
  const [knowledge, setKnowledge] = useState<UserKnowledge>({
    personal: {
      name: '',
      age: '',
      occupation: '',
      location: '',
      relationship_status: ''
    },
    preferences: {
      hobbies: [],
      favorite_music: [],
      favorite_movies: [],
      favorite_food: [],
      interests: []
    },
    personality: {
      traits: [],
      goals: [],
      dreams: [],
      memories: []
    },
    custom_notes: ''
  });

  const [activeTab, setActiveTab] = useState<'personal' | 'preferences' | 'personality'>('personal');
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = () => {
    try {
      const saved = localStorage.getItem('virtual_wife_knowledge');
      if (saved) {
        const loadedKnowledge = JSON.parse(saved);
        setKnowledge(loadedKnowledge);
        onKnowledgeUpdate(loadedKnowledge);
      }
    } catch (error) {
      console.error('Error loading knowledge:', error);
    }
  };

  const saveKnowledge = () => {
    try {
      localStorage.setItem('virtual_wife_knowledge', JSON.stringify(knowledge));
      onKnowledgeUpdate(knowledge);
      
      // Show success message
      const event = new CustomEvent('showNotification', {
        detail: { message: 'Knowledge saved successfully!', type: 'success' }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error saving knowledge:', error);
    }
  };

  const exportKnowledge = () => {
    const dataStr = JSON.stringify(knowledge, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'virtual_wife_knowledge.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importKnowledge = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setKnowledge(imported);
        saveKnowledge();
      } catch (error) {
        console.error('Error importing knowledge:', error);
      }
    };
    reader.readAsText(file);
  };

  const updatePersonal = (field: keyof UserKnowledge['personal'], value: string) => {
    setKnowledge(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  const addToArray = (category: keyof UserKnowledge['preferences'] | keyof UserKnowledge['personality']) => {
    if (!newItem.trim()) return;

    setKnowledge(prev => {
      if (category in prev.preferences) {
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            [category]: [...prev.preferences[category as keyof UserKnowledge['preferences']], newItem.trim()]
          }
        };
      } else {
        return {
          ...prev,
          personality: {
            ...prev.personality,
            [category]: [...prev.personality[category as keyof UserKnowledge['personality']], newItem.trim()]
          }
        };
      }
    });
    setNewItem('');
  };

  const removeFromArray = (category: keyof UserKnowledge['preferences'] | keyof UserKnowledge['personality'], index: number) => {
    setKnowledge(prev => {
      if (category in prev.preferences) {
        return {
          ...prev,
          preferences: {
            ...prev.preferences,
            [category]: prev.preferences[category as keyof UserKnowledge['preferences']].filter((_, i) => i !== index)
          }
        };
      } else {
        return {
          ...prev,
          personality: {
            ...prev.personality,
            [category]: prev.personality[category as keyof UserKnowledge['personality']].filter((_, i) => i !== index)
          }
        };
      }
    });
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Heart },
    { id: 'personality', label: 'Personality', icon: Settings }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Knowledge Base</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={saveKnowledge}
              className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={exportKnowledge}
              className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              <Download size={16} />
              Export
            </button>
            <label className="flex items-center gap-1 px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm cursor-pointer">
              <Upload size={16} />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importKnowledge}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex space-x-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 max-h-96 overflow-y-auto">
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={knowledge.personal.name}
                  onChange={(e) => updatePersonal('name', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="text"
                  value={knowledge.personal.age}
                  onChange={(e) => updatePersonal('age', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Your age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input
                  type="text"
                  value={knowledge.personal.occupation}
                  onChange={(e) => updatePersonal('occupation', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Your job/profession"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={knowledge.personal.location}
                  onChange={(e) => updatePersonal('location', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Your location"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship Status</label>
                <select
                  value={knowledge.personal.relationship_status}
                  onChange={(e) => updatePersonal('relationship_status', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Select status</option>
                  <option value="single">Single</option>
                  <option value="dating">Dating</option>
                  <option value="married">Married</option>
                  <option value="complicated">It's complicated</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            {Object.entries(knowledge.preferences).map(([key, items]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {key.replace('_', ' ')}
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder={`Add ${key.replace('_', ' ')}`}
                    onKeyPress={(e) => e.key === 'Enter' && addToArray(key as any)}
                  />
                  <button
                    onClick={() => addToArray(key as any)}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {item}
                      <button
                        onClick={() => removeFromArray(key as any, index)}
                        className="text-red-500 hover:text-red-700 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'personality' && (
          <div className="space-y-6">
            {Object.entries(knowledge.personality).map(([key, items]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {key}
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder={`Add ${key}`}
                    onKeyPress={(e) => e.key === 'Enter' && addToArray(key as any)}
                  />
                  <button
                    onClick={() => addToArray(key as any)}
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                    >
                      {item}
                      <button
                        onClick={() => removeFromArray(key as any, index)}
                        className="text-red-500 hover:text-red-700 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Notes</label>
              <textarea
                value={knowledge.custom_notes}
                onChange={(e) => setKnowledge(prev => ({ ...prev, custom_notes: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows={4}
                placeholder="Add any additional notes about yourself..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}