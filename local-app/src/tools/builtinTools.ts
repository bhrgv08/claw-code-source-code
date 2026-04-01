import fs from 'node:fs';
import path from 'node:path';
import type { ToolDefinition } from './toolTypes.js';

function safeResolve(root: string, target: string): string | null {
  const resolved = path.resolve(root, target);
  return resolved.startsWith(root) ? resolved : null;
}

export const listFilesTool: ToolDefinition = {
  name: 'list_files',
  description: 'List files in a directory. args: path=.',
  run(args, ctx) {
    const rel = args.path ?? '.';
    const target = safeResolve(ctx.workspaceRoot, rel);
    if (!target) return { ok: false, output: 'Path escapes workspace root.' };
    if (!fs.existsSync(target)) return { ok: false, output: 'Path not found.' };
    const entries = fs.readdirSync(target, { withFileTypes: true }).slice(0, 200);
    const lines = entries.map((e: any) => (e.isDirectory() ? `[dir] ${e.name}` : `[file] ${e.name}`));
    return { ok: true, output: lines.join('\n') || '(empty directory)' };
  }
};

export const readFileTool: ToolDefinition = {
  name: 'read_file',
  description: 'Read a UTF-8 text file. args: path=README.md',
  run(args, ctx) {
    const rel = args.path;
    if (!rel) return { ok: false, output: 'Missing required arg: path.' };
    const target = safeResolve(ctx.workspaceRoot, rel);
    if (!target) return { ok: false, output: 'Path escapes workspace root.' };
    if (!fs.existsSync(target)) return { ok: false, output: 'File not found.' };
    const content = fs.readFileSync(target, 'utf8');
    const truncated = content.length > 8000 ? `${content.slice(0, 8000)}\n\n[truncated]` : content;
    return { ok: true, output: truncated };
  }
};

export const writeFileTool: ToolDefinition = {
  name: 'write_file',
  description: 'Write UTF-8 text to file. args: path=notes.txt content="hello"',
  run(args, ctx) {
    const rel = args.path;
    const content = args.content;
    if (!rel || content === undefined) {
      return { ok: false, output: 'Missing args. Required: path, content.' };
    }
    const target = safeResolve(ctx.workspaceRoot, rel);
    if (!target) return { ok: false, output: 'Path escapes workspace root.' };
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, 'utf8');
    return { ok: true, output: `Wrote ${content.length} bytes to ${rel}` };
  }
};

export const BUILTIN_TOOLS: ToolDefinition[] = [listFilesTool, readFileTool, writeFileTool];
