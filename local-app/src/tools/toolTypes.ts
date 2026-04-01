export type ToolResult = {
  ok: boolean;
  output: string;
};

export type ToolContext = {
  workspaceRoot: string;
};

export type ToolDefinition = {
  name: string;
  description: string;
  run: (args: Record<string, string>, ctx: ToolContext) => ToolResult;
};
