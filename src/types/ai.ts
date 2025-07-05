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
}

export interface AIResponse {
  content: string;
  provider: string;
  emotion?: string;
  animation?: string;
}