import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { AIResponse } from '../types/ai';

export class AIService {
  private openai: OpenAI | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private groq: Groq | null = null;
  private togetherApiKey: string | null = null;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize OpenAI
    const openaiKey = localStorage.getItem('openai_api_key');
    if (openaiKey) {
      this.openai = new OpenAI({
        apiKey: openaiKey,
        dangerouslyAllowBrowser: true
      });
    }

    // Initialize Gemini
    const geminiKey = localStorage.getItem('gemini_api_key');
    if (geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
    }

    // Initialize Groq
    const groqKey = localStorage.getItem('groq_api_key');
    if (groqKey) {
      this.groq = new Groq({
        apiKey: groqKey,
        dangerouslyAllowBrowser: true
      });
    }

    // Initialize Together AI
    this.togetherApiKey = localStorage.getItem('together_api_key');
  }

  async sendMessage(message: string, provider: string, context?: string): Promise<AIResponse> {
    const systemPrompt = `You are a loving virtual wife. Respond warmly, caringly, and affectionately. 
    Keep responses conversational and personal. Show interest in the user's day and feelings.
    ${context ? `Visual context: ${context}` : ''}
    
    At the end of your response, suggest an emotion and animation from these options:
    Emotions: happy, sad, angry, laughing, praying, greeting
    Animations: Hip Hop Dancing, Rumba Dancing, Kiss, Happy, Sad Idle, Angry, Laughing, Praying, Standing Greeting
    
    Format: [EMOTION:happy] [ANIMATION:Happy]`;

    try {
      switch (provider) {
        case 'openai':
          return await this.callOpenAI(message, systemPrompt);
        case 'gemini':
          return await this.callGemini(message, systemPrompt);
        case 'groq':
          return await this.callGroq(message, systemPrompt);
        case 'together':
          return await this.callTogether(message, systemPrompt);
        default:
          return await this.callGemini(message, systemPrompt); // Default to Gemini
      }
    } catch (error) {
      console.error(`Error with ${provider}:`, error);
      return {
        content: "I'm sorry, I'm having trouble connecting right now. Please check your API keys or try a different provider.",
        provider,
        emotion: 'sad',
        animation: 'Sad Idle'
      };
    }
  }

  private async callOpenAI(message: string, systemPrompt: string): Promise<AIResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized');
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 150,
      temperature: 0.8
    });

    const content = response.choices[0]?.message?.content || '';
    return this.parseResponse(content, 'openai');
  }

  private async callGemini(message: string, systemPrompt: string): Promise<AIResponse> {
    if (!this.gemini) {
      // Use default Gemini if no API key is set
      const model = this.gemini?.getGenerativeModel({ model: 'gemini-pro' }) || 
                   new GoogleGenerativeAI('default').getGenerativeModel({ model: 'gemini-pro' });
      
      const result = await model.generateContent(`${systemPrompt}\n\nUser: ${message}`);
      const content = result.response.text();
      return this.parseResponse(content, 'gemini');
    }

    const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(`${systemPrompt}\n\nUser: ${message}`);
    const content = result.response.text();
    return this.parseResponse(content, 'gemini');
  }

  private async callGroq(message: string, systemPrompt: string): Promise<AIResponse> {
    if (!this.groq) throw new Error('Groq not initialized');

    const response = await this.groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'mixtral-8x7b-32768',
      max_tokens: 150,
      temperature: 0.8
    });

    const content = response.choices[0]?.message?.content || '';
    return this.parseResponse(content, 'groq');
  }

  private async callTogether(message: string, systemPrompt: string): Promise<AIResponse> {
    if (!this.togetherApiKey) throw new Error('Together AI not initialized');

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.togetherApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.8
      })
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    return this.parseResponse(content, 'together');
  }

  private parseResponse(content: string, provider: string): AIResponse {
    // Extract emotion and animation from response
    const emotionMatch = content.match(/\[EMOTION:(\w+)\]/);
    const animationMatch = content.match(/\[ANIMATION:([^\]]+)\]/);
    
    // Clean the content by removing the tags
    const cleanContent = content
      .replace(/\[EMOTION:\w+\]/g, '')
      .replace(/\[ANIMATION:[^\]]+\]/g, '')
      .trim();

    return {
      content: cleanContent || "I'm here for you, my love! 💕",
      provider,
      emotion: emotionMatch?.[1] || 'happy',
      animation: animationMatch?.[1] || 'Happy'
    };
  }

  setApiKey(provider: string, apiKey: string) {
    localStorage.setItem(`${provider}_api_key`, apiKey);
    this.initializeProviders();
  }

  getApiKey(provider: string): string | null {
    return localStorage.getItem(`${provider}_api_key`);
  }
}