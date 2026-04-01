import fs from 'node:fs';
import path from 'node:path';
import type { ToolDefinition } from './toolTypes.js';

const MAX_READ_BYTES = 1024 * 1024; // 1MB hard safety cap
const MAX_WRITE_BYTES = 1024 * 1024; // 1MB hard safety cap

function safeResolve(root: string, target: string): string | null {
  const normalizedRoot = path.resolve(root);
  const resolved = path.resolve(normalizedRoot, target);
  const rel = path.relative(normalizedRoot, resolved);
  const escapesRoot = rel.startsWith('..') || path.isAbsolute(rel);
  return escapesRoot ? null : resolved;
}

export const listFilesTool: ToolDefinition = {
  name: 'list_files',
  description: 'List files in a directory. args: path=.',
  run(args, ctx) {
    const rel = args.path ?? '.';
    const target = safeResolve(ctx.workspaceRoot, rel);
    if (!target) return { ok: false, output: 'Path escapes workspace root.' };
    if (!fs.existsSync(target)) return { ok: false, output: 'Path not found.' };
    const stat = fs.statSync(target);
    if (!stat.isDirectory()) return { ok: false, output: 'Target path is not a directory.' };

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

    const stat = fs.statSync(target);
    if (!stat.isFile()) return { ok: false, output: 'Target path is not a file.' };
    if (stat.size > MAX_READ_BYTES) {
      return { ok: false, output: `File too large to read safely (> ${MAX_READ_BYTES} bytes).` };
    }

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

    const writeBytes = content.length;
    if (writeBytes > MAX_WRITE_BYTES) {
      return { ok: false, output: `Content too large to write safely (> ${MAX_WRITE_BYTES} bytes).` };
    }

    const target = safeResolve(ctx.workspaceRoot, rel);
    if (!target) return { ok: false, output: 'Path escapes workspace root.' };
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, 'utf8');
    return { ok: true, output: `Wrote ${writeBytes} bytes to ${rel}` };
  }
};

export const BUILTIN_TOOLS: ToolDefinition[] = [listFilesTool, readFileTool, writeFileTool];
