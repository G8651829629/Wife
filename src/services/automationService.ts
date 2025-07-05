import { AppCommand } from '../types/ai';

export class AutomationService {
  private commands: AppCommand[] = [
    {
      name: 'Open Chrome',
      command: 'chrome',
      description: 'Opens Google Chrome browser',
      category: 'browser',
      keywords: ['chrome', 'browser', 'google chrome', 'open chrome']
    },
    {
      name: 'Open Firefox',
      command: 'firefox',
      description: 'Opens Firefox browser',
      category: 'browser',
      keywords: ['firefox', 'browser', 'open firefox']
    },
    {
      name: 'Open Calculator',
      command: 'calc',
      description: 'Opens system calculator',
      category: 'productivity',
      keywords: ['calculator', 'calc', 'math', 'calculate']
    },
    {
      name: 'Open Notepad',
      command: 'notepad',
      description: 'Opens text editor',
      category: 'productivity',
      keywords: ['notepad', 'text editor', 'write', 'note']
    },
    {
      name: 'Open File Explorer',
      command: 'explorer',
      description: 'Opens file manager',
      category: 'system',
      keywords: ['files', 'explorer', 'folder', 'file manager']
    },
    {
      name: 'Open YouTube',
      command: 'https://youtube.com',
      description: 'Opens YouTube in browser',
      category: 'media',
      keywords: ['youtube', 'video', 'music', 'watch']
    },
    {
      name: 'Open Gmail',
      command: 'https://gmail.com',
      description: 'Opens Gmail',
      category: 'productivity',
      keywords: ['gmail', 'email', 'mail', 'message']
    },
    {
      name: 'Open WhatsApp',
      command: 'https://web.whatsapp.com',
      description: 'Opens WhatsApp Web',
      category: 'productivity',
      keywords: ['whatsapp', 'chat', 'message', 'wa']
    }
  ];

  detectCommand(text: string): AppCommand | null {
    const lowerText = text.toLowerCase();
    
    for (const command of this.commands) {
      for (const keyword of command.keywords) {
        if (lowerText.includes(keyword)) {
          return command;
        }
      }
    }
    
    return null;
  }

  executeCommand(command: AppCommand): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        if (command.command.startsWith('http')) {
          // Open URL
          window.open(command.command, '_blank');
          resolve(true);
        } else {
          // For desktop apps, we can only simulate or show instructions
          // In a real desktop app, you'd use electron or similar
          console.log(`Simulating command: ${command.command}`);
          
          // Show notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Opening ${command.name}`, {
              body: command.description,
              icon: '/heart.svg'
            });
          }
          
          resolve(true);
        }
      } catch (error) {
        console.error('Error executing command:', error);
        resolve(false);
      }
    });
  }

  getCommands(): AppCommand[] {
    return this.commands;
  }

  addCustomCommand(command: AppCommand): void {
    this.commands.push(command);
    this.saveCommands();
  }

  private saveCommands(): void {
    localStorage.setItem('virtual_wife_commands', JSON.stringify(this.commands));
  }

  private loadCommands(): void {
    try {
      const saved = localStorage.getItem('virtual_wife_commands');
      if (saved) {
        const customCommands = JSON.parse(saved);
        this.commands = [...this.commands, ...customCommands];
      }
    } catch (error) {
      console.error('Error loading commands:', error);
    }
  }
}