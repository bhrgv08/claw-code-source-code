import type { ChatMessage } from '../models/message.js';

function parseArgs(argString: string): Record<string, string> {
  const args: Record<string, string> = {};
  const regex = /(\w+)=(("[^"]*")|([^\s]+))/g;
  for (const match of argString.matchAll(regex)) {
    const key = match[1];
    const raw = match[2];
    args[key] = raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
  }
  return args;
}

export type AssistantDirective =
  | { type: 'tool'; toolName: string; args: Record<string, string> }
  | { type: 'text'; text: string };

export function planResponse(input: string, history: ChatMessage[]): AssistantDirective {
  if (input.startsWith('tool:')) {
    const body = input.slice('tool:'.length).trim();
    const [name, ...rest] = body.split(' ');
    return { type: 'tool', toolName: name, args: parseArgs(rest.join(' ')) };
  }

  if (input.toLowerCase().includes('summarize history')) {
    const userMsgs = history.filter(m => m.role === 'user').length;
    const assistantMsgs = history.filter(m => m.role === 'assistant').length;
    return {
      type: 'text',
      text: `Session summary: ${history.length} messages (${userMsgs} user / ${assistantMsgs} assistant).`
    };
  }

  return {
    type: 'text',
    text: [
      'Local assistant response (offline mode).',
      'Tip: invoke tools with syntax:',
      '  tool:list_files path=.',
      '  tool:read_file path=README.md',
      '  tool:write_file path=notes.txt content="hello"'
    ].join('\n')
  };
}
