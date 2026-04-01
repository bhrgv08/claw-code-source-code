import type { ToolDefinition, ToolResult } from '../tools/toolTypes.js';
import { BUILTIN_TOOLS } from '../tools/builtinTools.js';

export class ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition>();

  constructor() {
    for (const tool of BUILTIN_TOOLS) this.tools.set(tool.name, tool);
  }

  list(): ToolDefinition[] {
    return [...this.tools.values()];
  }

  run(name: string, args: Record<string, string>, workspaceRoot: string): ToolResult {
    const tool = this.tools.get(name);
    if (!tool) return { ok: false, output: `Unknown tool: ${name}` };

    try {
      return tool.run(args, { workspaceRoot });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, output: `Tool execution failed (${name}): ${message}` };
    }
  }
}
