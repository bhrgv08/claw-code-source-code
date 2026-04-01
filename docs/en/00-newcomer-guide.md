# Newcomer Guide to This Codebase

This repository is an **unbundled TypeScript reconstruction** of `@anthropic-ai/claude-code` v2.1.88, intended for research/analysis rather than production development.

## 1) Big Picture

At a high level, the app is a CLI agent runtime with four core layers:

1. **Entrypoint + bootstrap** (`src/main.tsx`): startup side effects, CLI parsing, initialization, policy/settings loading, and session launch.
2. **Command system** (`src/commands.ts` + `src/commands/**`): slash-style commands and non-interactive command handlers.
3. **Tool system** (`src/tools.ts` + `src/tools/**`): tool registry and capability gating.
4. **Task/state runtime** (`src/tasks/**`, `src/state/**`): active task orchestration, progress tracking, and UI state transitions.

A practical way to think about flow:

- User input/CLI flags enter via `src/main.tsx`
- Commands are resolved through `src/commands.ts`
- Agent turns invoke tools listed in `src/tools.ts`
- Task objects and app state track progress/results

## 2) Repository Structure You Should Know

- `src/`: main TypeScript source (runtime, commands, tools, services, UI logic)
- `src/commands/`: command handlers and command-local utilities
- `src/tools/`: built-in tool implementations (file, shell, search, MCP, task, etc.)
- `src/tasks/`: task lifecycles (agent tasks, shell tasks, remote tasks)
- `src/state/`: app state store, selectors, and state transition helpers
- `src/services/`: integrations and domain services (MCP, analytics, settings sync, limits)
- `src/utils/`: shared utility code used across all layers
- `scripts/`: source preparation/build scripts
- `stubs/`: Bun macro/feature stubs used for non-Bun reconstruction
- `docs/`: analysis reports in multiple languages
- `vendor/`: source stubs for native integrations

## 3) Important Design Traits (Read This Early)

### Feature-flagged dead-code branching

The codebase heavily relies on `feature('...')` checks from `bun:bundle` for compile-time gating and dead-code elimination.

This means:
- many paths are conditionally present
- some referenced modules are intentionally absent in this reconstruction
- behavior differs depending on build/runtime gating assumptions

### Dynamic imports and lazy requires

Many large or circular modules are loaded lazily to reduce startup cost and break dependency cycles. New contributors should preserve this style when touching startup-heavy code.

### Central registries are the “map”

If you are lost, start at these files:
- `src/main.tsx` for lifecycle and startup sequence
- `src/commands.ts` for user-facing command surface
- `src/tools.ts` for available tools and enablement gates

### This is not a “normal app source drop”

Per project docs, this repo is reverse-structured from a bundled artifact and may not fully compile as-is without additional stubbing/transform steps.

## 4) Suggested Learning Path (First Week)

### Step 1: Understand startup and control flow
Read:
- `src/main.tsx`

Goal:
- know how config, auth, policy, plugins, and session state are initialized

### Step 2: Understand commands
Read:
- `src/commands.ts`
- then 3–5 specific command modules in `src/commands/` (e.g. `help`, `config`, `mcp`, `review`)

Goal:
- understand how user intent enters the runtime

### Step 3: Understand tools
Read:
- `src/tools.ts`
- then inspect canonical tools (file read/edit, shell, grep/glob, web)

Goal:
- understand what the agent can do, and where permissions/enablement are enforced

### Step 4: Understand task execution
Read:
- `src/tasks/LocalAgentTask/LocalAgentTask.tsx`
- `src/tasks/LocalShellTask/LocalShellTask.tsx`
- `src/state/AppStateStore.ts`

Goal:
- understand execution state, progress updates, and background/foreground task behavior

## 5) “Where do I change X?” Quick Pointers

- **New command** → `src/commands/<name>/` + registry in `src/commands.ts`
- **New tool** → `src/tools/<ToolName>/` + registry in `src/tools.ts`
- **State/UI behavior** → `src/state/*`, `src/tasks/*`, and related components
- **Policies/managed settings** → `src/services/policyLimits/*`, `src/services/remoteManagedSettings/*`, `src/utils/settings/*`
- **MCP integration** → `src/services/mcp/*` and MCP-related tools/commands

## 6) Good Next Topics to Learn

1. **Permission and safety model** (tool gating, auto mode, dangerous permission stripping)
2. **MCP server/resource flow** (config parsing, command/resource filtering)
3. **Plugin + skill loading** (bundled and dynamic)
4. **Session persistence/recovery** (session storage and resume logic)
5. **Telemetry + policy interactions** (for understanding production/runtime behavior)

## 7) Practical Working Tips

- Prefer tracing from registries (`main.tsx`, `commands.ts`, `tools.ts`) into implementation files.
- Expect conditional paths; verify feature flags before assuming code is reachable.
- Keep startup-sensitive code lightweight; follow existing lazy-load patterns.
- When in doubt, start with one vertical slice (command → tool call → task/state update) and map it end-to-end.
