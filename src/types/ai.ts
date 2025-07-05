export interface AIProvider {
  name: string;
  id: string;
  icon: string;
  enabled: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  provider?: string;
  language?: string;
  feedback?: 'positive' | 'negative';
}

export interface AIResponse {
  content: string;
  provider: string;
  emotion?: string;
  animation?: string;
  language?: string;
  confidence?: number;
}

export interface TrainingData {
  id: string;
  input: string;
  output: string;
  feedback: 'positive' | 'negative';
  timestamp: Date;
  language: string;
  context?: string;
}

export interface UserKnowledge {
  personal: {
    name: string;
    age: string;
    occupation: string;
    location: string;
    relationship_status: string;
  };
  preferences: {
    hobbies: string[];
    favorite_music: string[];
    favorite_movies: string[];
    favorite_food: string[];
    interests: string[];
  };
  personality: {
    traits: string[];
    goals: string[];
    dreams: string[];
    memories: string[];
  };
  custom_notes: string;
}

export interface AppCommand {
  name: string;
  command: string;
  description: string;
  category: 'browser' | 'system' | 'media' | 'productivity';
  keywords: string[];
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}