import { TrainingData, ChatMessage } from '../types/ai';

export class TrainingService {
  private trainingData: TrainingData[] = [];

  constructor() {
    this.loadTrainingData();
  }

  addTrainingData(input: string, output: string, feedback: 'positive' | 'negative', language: string, context?: string): void {
    const trainingEntry: TrainingData = {
      id: Date.now().toString(),
      input,
      output,
      feedback,
      timestamp: new Date(),
      language,
      context
    };

    this.trainingData.push(trainingEntry);
    this.saveTrainingData();
  }

  getPositiveExamples(language: string, limit: number = 5): TrainingData[] {
    return this.trainingData
      .filter(data => data.feedback === 'positive' && data.language === language)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getTrainingStats(): { total: number; positive: number; negative: number; byLanguage: { [key: string]: number } } {
    const stats = {
      total: this.trainingData.length,
      positive: this.trainingData.filter(d => d.feedback === 'positive').length,
      negative: this.trainingData.filter(d => d.feedback === 'negative').length,
      byLanguage: {} as { [key: string]: number }
    };

    this.trainingData.forEach(data => {
      stats.byLanguage[data.language] = (stats.byLanguage[data.language] || 0) + 1;
    });

    return stats;
  }

  exportTrainingData(): string {
    return JSON.stringify(this.trainingData, null, 2);
  }

  private saveTrainingData(): void {
    try {
      localStorage.setItem('virtual_wife_training', JSON.stringify(this.trainingData));
      
      // Also save to training folder structure (simulated)
      const trainingByDate = this.groupByDate();
      Object.entries(trainingByDate).forEach(([date, data]) => {
        console.log(`Training data for ${date}:`, data);
        // In a real app, you'd save this to the file system
      });
    } catch (error) {
      console.error('Error saving training data:', error);
    }
  }

  private loadTrainingData(): void {
    try {
      const saved = localStorage.getItem('virtual_wife_training');
      if (saved) {
        this.trainingData = JSON.parse(saved).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading training data:', error);
    }
  }

  private groupByDate(): { [key: string]: TrainingData[] } {
    const grouped: { [key: string]: TrainingData[] } = {};
    
    this.trainingData.forEach(data => {
      const date = data.timestamp.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(data);
    });

    return grouped;
  }
}