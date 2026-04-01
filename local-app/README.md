# Local Claude-Like Runtime (TypeScript, Offline)

This folder provides a **fully local, runnable TypeScript application** inspired by the reconstructed Claude-like architecture:

- Entry point (`src/index.ts`)
- Config (`src/config.ts`)
- Controller (`src/controllers/chatController.ts`)
- Services (`src/services/*`)
- Models (`src/models/*`)
- Tool system (`src/tools/*`)
- Persistent session state (`local-app/data/*.json`)

> Important: this is a practical local runtime scaffold, **not** the original full proprietary cloud product. The upstream reconstruction indicates missing feature-gated internal modules, so a 1:1 full rebuild is not possible from published artifacts alone.

## Features

- Interactive terminal chat loop
- Local session persistence to JSON
- Built-in tool registry with safe workspace-scoped tools:
  - `list_files`
  - `read_file`
  - `write_file`
- Slash commands:
  - `/help`
  - `/tools`
  - `/history`
  - `/exit`
- Automated smoke test (`npm test`)

## Security Notes

- All tool file paths are constrained to the workspace root.
- Read/write size limits are enforced (1MB max per operation) to reduce abuse risk.
- `list_files` validates that target paths are directories, and `read_file` validates file targets.

## Requirements

- Node.js 18+
- npm 9+

## Setup

```bash
cd local-app
npm install
npm run build
npm test
npm start
```

## Usage

Inside the app:

- Ask any prompt (offline local assistant response)
- Run tools explicitly:

```text
tool:list_files path=.
tool:read_file path=README.md
tool:write_file path=notes.txt content="hello"
```

- Show available tools: `/tools`
- Show session history: `/history`
- Exit: `/exit`

## Suggested Extension Points

- Replace `planResponse` in `src/services/localAssistant.ts` with a richer planner or local model integration.
- Add new tools in `src/tools/builtinTools.ts` and register them via `ToolRegistry`.
- Expand session format in `src/models/session.ts` for metadata (token estimates, tool telemetry, etc.).
- Add permission rules and sandboxing middleware around tool execution.
