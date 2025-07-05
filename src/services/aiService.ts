import { OpenAI } from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { AIResponse, UserKnowledge, TrainingData } from '../types/ai';
import { LanguageService } from './languageService';
import { TrainingService } from './trainingService';
import { AutomationService } from './automationService';

export class AIService {
  private openai: OpenAI | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private groq: Groq | null = null;
  private togetherApiKey: string | null = null;
  private languageService: LanguageService;
  private trainingService: TrainingService;
  private automationService: AutomationService;
  private userKnowledge: UserKnowledge | null = null;

  constructor() {
    this.languageService = new LanguageService();
    this.trainingService = new TrainingService();
    this.automationService = new AutomationService();
    this.initializeProviders();
    this.loadUserKnowledge();
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

  private loadUserKnowledge() {
    try {
      const saved = localStorage.getItem('virtual_wife_knowledge');
      if (saved) {
        this.userKnowledge = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading user knowledge:', error);
    }
  }

  setUserKnowledge(knowledge: UserKnowledge) {
    this.userKnowledge = knowledge;
  }

  async sendMessage(
    message: string, 
    provider: string, 
    context?: string,
    autoDetectLanguage: boolean = true,
    selectedLanguage: string = 'en'
  ): Promise<AIResponse> {
    // Detect or use selected language
    const detectedLanguage = autoDetectLanguage 
      ? this.languageService.detectLanguage(message)
      : selectedLanguage;

    // Check for app commands
    const command = this.automationService.detectCommand(message);
    if (command) {
      const success = await this.automationService.executeCommand(command);
      const responseContent = success 
        ? `I've opened ${command.name} for you! 😊`
        : `Sorry, I couldn't open ${command.name}. Please try again.`;
      
      return {
        content: responseContent,
        provider,
        emotion: success ? 'happy' : 'sad',
        animation: success ? 'Happy' : 'Sad Idle',
        language: detectedLanguage
      };
    }

    // Build context-aware system prompt
    const systemPrompt = this.buildSystemPrompt(detectedLanguage, context);

    try {
      let response: AIResponse;
      
      switch (provider) {
        case 'openai':
          response = await this.callOpenAI(message, systemPrompt, detectedLanguage);
          break;
        case 'gemini':
          response = await this.callGemini(message, systemPrompt, detectedLanguage);
          break;
        case 'groq':
          response = await this.callGroq(message, systemPrompt, detectedLanguage);
          break;
        case 'together':
          response = await this.callTogether(message, systemPrompt, detectedLanguage);
          break;
        default:
          response = await this.callGemini(message, systemPrompt, detectedLanguage);
      }

      response.language = detectedLanguage;
      return response;
    } catch (error) {
      console.error(`Error with ${provider}:`, error);
      return {
        content: this.getErrorMessage(detectedLanguage),
        provider,
        emotion: 'sad',
        animation: 'Sad Idle',
        language: detectedLanguage
      };
    }
  }

  private buildSystemPrompt(language: string, context?: string): string {
    const languagePrompt = this.languageService.getLanguagePrompt(language);
    
    // Get positive training examples for context
    const trainingExamples = this.trainingService.getPositiveExamples(language, 3);
    const trainingContext = trainingExamples.length > 0 
      ? `\n\nPrevious successful interactions:\n${trainingExamples.map(ex => `User: ${ex.input}\nYou: ${ex.output}`).join('\n\n')}`
      : '';

    // Build knowledge context
    const knowledgeContext = this.userKnowledge 
      ? this.buildKnowledgeContext()
      : '';

    return `You are a loving, caring virtual wife. You are warm, affectionate, supportive, and genuinely interested in your partner's life. 

${languagePrompt}. Always respond naturally and conversationally in the detected language.

${knowledgeContext}

${context ? `Visual/Audio context: ${context}` : ''}

${trainingContext}

Keep responses personal, caring, and engaging. Show genuine interest and emotion.

At the end of your response, suggest an emotion and animation from these options:
Emotions: happy, sad, angry, laughing, praying, greeting
Animations: Hip Hop Dancing, Rumba Dancing, Kiss, Happy, Sad Idle, Angry, Laughing, Praying, Standing Greeting, Female Laying Pose

Format: [EMOTION:happy] [ANIMATION:Happy]`;
  }

  private buildKnowledgeContext(): string {
    if (!this.userKnowledge) return '';

    const { personal, preferences, personality } = this.userKnowledge;
    
    let context = '\nPersonal Information about your partner:\n';
    
    if (personal.name) context += `- Name: ${personal.name}\n`;
    if (personal.age) context += `- Age: ${personal.age}\n`;
    if (personal.occupation) context += `- Occupation: ${personal.occupation}\n`;
    if (personal.location) context += `- Location: ${personal.location}\n`;
    if (personal.relationship_status) context += `- Relationship Status: ${personal.relationship_status}\n`;

    if (preferences.hobbies.length > 0) {
      context += `- Hobbies: ${preferences.hobbies.join(', ')}\n`;
    }
    if (preferences.interests.length > 0) {
      context += `- Interests: ${preferences.interests.join(', ')}\n`;
    }

    if (personality.traits.length > 0) {
      context += `- Personality Traits: ${personality.traits.join(', ')}\n`;
    }
    if (personality.goals.length > 0) {
      context += `- Goals: ${personality.goals.join(', ')}\n`;
    }

    if (this.userKnowledge.custom_notes) {
      context += `- Additional Notes: ${this.userKnowledge.custom_notes}\n`;
    }

    context += '\nUse this information to personalize your responses and show that you care about and remember details about your partner.\n';
    
    return context;
  }

  private async callOpenAI(message: string, systemPrompt: string, language: string): Promise<AIResponse> {
    if (!this.openai) throw new Error('OpenAI not initialized');
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 200,
      temperature: 0.8
    });

    const content = response.choices[0]?.message?.content || '';
    return this.parseResponse(content, 'openai');
  }

  private async callGemini(message: string, systemPrompt: string, language: string): Promise<AIResponse> {
    // Use a default key for demo purposes if no API key is set
    const apiKey = localStorage.getItem('gemini_api_key') || 'demo';
    const gemini = new GoogleGenerativeAI(apiKey);
    
    try {
      const model = gemini.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(`${systemPrompt}\n\nUser: ${message}`);
      const content = result.response.text();
      return this.parseResponse(content, 'gemini');
    } catch (error) {
      // Fallback response for demo
      const fallbackResponses = {
        en: "Hello my love! I'm here for you. How can I make your day better? 💕",
        hi: "नमस्ते मेरे प्यार! मैं यहाँ आपके लिए हूँ। मैं आपका दिन कैसे बेहतर बना सकती हूँ? 💕",
        es: "¡Hola mi amor! Estoy aquí para ti. ¿Cómo puedo hacer tu día mejor? 💕",
        fr: "Bonjour mon amour! Je suis là pour toi. Comment puis-je améliorer ta journée? 💕"
      };
      
      return {
        content: fallbackResponses[language as keyof typeof fallbackResponses] || fallbackResponses.en,
        provider: 'gemini',
        emotion: 'happy',
        animation: 'Happy'
      };
    }
  }

  private async callGroq(message: string, systemPrompt: string, language: string): Promise<AIResponse> {
    if (!this.groq) throw new Error('Groq not initialized');

    const response = await this.groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      model: 'mixtral-8x7b-32768',
      max_tokens: 200,
      temperature: 0.8
    });

    const content = response.choices[0]?.message?.content || '';
    return this.parseResponse(content, 'groq');
  }

  private async callTogether(message: string, systemPrompt: string, language: string): Promise<AIResponse> {
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
        max_tokens: 200,
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

  private getErrorMessage(language: string): string {
    const errorMessages = {
      en: "I'm sorry, I'm having trouble right now. Please try again or check your API settings.",
      hi: "मुझे खुशी है, मुझे अभी परेशानी हो रही है। कृपया फिर से कोशिश करें या अपनी API सेटिंग्स जांचें।",
      es: "Lo siento, estoy teniendo problemas ahora. Por favor, inténtalo de nuevo o verifica tu configuración de API.",
      fr: "Je suis désolée, j'ai des difficultés en ce moment. Veuillez réessayer ou vérifier vos paramètres API."
    };
    
    return errorMessages[language as keyof typeof errorMessages] || errorMessages.en;
  }

  addTrainingFeedback(input: string, output: string, feedback: 'positive' | 'negative', language: string, context?: string) {
    this.trainingService.addTrainingData(input, output, feedback, language, context);
  }

  getTrainingService(): TrainingService {
    return this.trainingService;
  }

  getAutomationService(): AutomationService {
    return this.automationService;
  }

  setApiKey(provider: string, apiKey: string) {
    localStorage.setItem(`${provider}_api_key`, apiKey);
    this.initializeProviders();
  }

  getApiKey(provider: string): string | null {
    return localStorage.getItem(`${provider}_api_key`);
  }
}