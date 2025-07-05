import { Language } from '../types/ai';

export class LanguageService {
  private languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'bho', name: 'Bhojpuri', nativeName: 'भोजपुरी', flag: '🇮🇳' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', rtl: true },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' }
  ];

  private greetings: { [key: string]: string[] } = {
    en: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
    hi: ['नमस्ते', 'हैलो', 'हाय', 'सुप्रभात', 'शुभ संध्या'],
    bho: ['प्रणाम', 'नमस्कार', 'हैलो'],
    fr: ['bonjour', 'salut', 'bonsoir', 'hello'],
    ta: ['வணக்கம்', 'ஹலோ', 'வாங்க'],
    ur: ['السلام علیکم', 'ہیلو', 'آداب'],
    ar: ['السلام عليكم', 'مرحبا', 'أهلا'],
    bn: ['নমস্কার', 'হ্যালো', 'সালাম'],
    es: ['hola', 'buenos días', 'buenas tardes'],
    de: ['hallo', 'guten tag', 'guten morgen'],
    id: ['halo', 'selamat pagi', 'selamat sore'],
    ja: ['こんにちは', 'おはよう', 'こんばんは']
  };

  getLanguages(): Language[] {
    return this.languages;
  }

  detectLanguage(text: string): string {
    const lowerText = text.toLowerCase();
    
    // Check for specific language patterns
    for (const [langCode, greetingList] of Object.entries(this.greetings)) {
      for (const greeting of greetingList) {
        if (lowerText.includes(greeting.toLowerCase())) {
          return langCode;
        }
      }
    }

    // Unicode range detection for scripts
    if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Devanagari (Hindi/Bhojpuri)
    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil
    if (/[\u0600-\u06FF]/.test(text)) return 'ar'; // Arabic/Urdu
    if (/[\u0980-\u09FF]/.test(text)) return 'bn'; // Bengali
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) return 'ja'; // Japanese

    // Default to English
    return 'en';
  }

  getLanguageName(code: string): string {
    const lang = this.languages.find(l => l.code === code);
    return lang ? lang.name : 'English';
  }

  getLanguagePrompt(code: string): string {
    const prompts: { [key: string]: string } = {
      en: 'Respond in English',
      hi: 'Respond in Hindi (हिन्दी में जवाब दें)',
      bho: 'Respond in Bhojpuri (भोजपुरी में जवाब दें)',
      fr: 'Répondez en français',
      ta: 'தமிழில் பதிலளிக்கவும்',
      ur: 'اردو میں جواب دیں',
      ar: 'أجب باللغة العربية',
      bn: 'বাংলায় উত্তর দিন',
      es: 'Responde en español',
      de: 'Antworten Sie auf Deutsch',
      id: 'Jawab dalam bahasa Indonesia',
      ja: '日本語で答えてください'
    };
    
    return prompts[code] || prompts.en;
  }
}