import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import type { AppConfig } from '../config.js';
import { SessionService } from '../services/sessionService.js';
import { ToolRegistry } from '../services/toolRegistry.js';
import { planResponse } from '../services/localAssistant.js';
import type { ChatMessage } from '../models/message.js';

export class ChatController {
  private readonly sessionService: SessionService;
  private readonly toolRegistry: ToolRegistry;

  constructor(private readonly config: AppConfig) {
    this.sessionService = new SessionService(config.dataDir, config.maxHistoryMessages);
    this.toolRegistry = new ToolRegistry();
  }

  async run(): Promise<void> {
    const rl = readline.createInterface({ input, output });
    const sessionId = 'default-session';
    let session = this.sessionService.loadOrCreate(sessionId);

    output.write(`\n${this.config.appName}\n`);
    output.write('Type /help for commands, /exit to quit.\n\n');

    while (true) {
      const line = (await rl.question('you> ')).trim();
      if (!line) continue;

      if (line === '/exit') break;
      if (line === '/help') {
        output.write(['/help', '/tools', '/history', '/exit'].join('\n') + '\n');
        continue;
      }
      if (line === '/tools') {
        const tools = this.toolRegistry.list().map(t => `- ${t.name}: ${t.description}`);
        output.write(tools.join('\n') + '\n');
        continue;
      }
      if (line === '/history') {
        const rendered = session.messages.map(m => `[${m.role}] ${m.content}`);
        output.write((rendered.join('\n') || '(no history)') + '\n');
        continue;
      }

      const userMsg: ChatMessage = { role: 'user', content: line, timestamp: new Date().toISOString() };
      session = this.sessionService.appendMessage(session, userMsg);

      const directive = planResponse(line, session.messages);
      let assistantText: string;

      if (directive.type === 'tool') {
        const result = this.toolRegistry.run(directive.toolName, directive.args, this.config.workspaceRoot);
        assistantText = result.ok ? `tool(${directive.toolName}) success:\n${result.output}` : `tool(${directive.toolName}) error: ${result.output}`;
      } else {
        assistantText = directive.text;
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: assistantText,
        timestamp: new Date().toISOString()
      };
      session = this.sessionService.appendMessage(session, assistantMsg);
      output.write(`assistant> ${assistantText}\n`);
    }

    rl.close();
  }
}
