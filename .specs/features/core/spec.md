# Feature: @pi/core

## Summary

Core types, interfaces, errors, and utilities. Zero external dependencies. Foundation for all other packages.

## Scope

**Size:** Small  
**Type:** Library package  
**Depends:** None

## Requirements

### [REQ-001] Agent Types

```typescript
interface AgentDef {
  name: string;
  description: string;
  tools: string[];
  model: string;
  timeoutMs: number;
  systemPrompt?: string;
}

interface RoleConfig {
  model: string;
  timeoutMs: number;
  tools: string[];
}

type AgentStatus = "idle" | "running" | "done" | "error";
```

### [REQ-002] Pipeline Types

```typescript
interface PipelineConfig {
  name: string;
  description: string;
  phases: PhaseDef[];
  reviewMaxLoops?: number;
}

interface PhaseDef {
  name: string;
  description: string;
  mode: "interactive" | "parallel" | "sequential";
  agents: AgentRole[];
  approvalRequired?: boolean;
  maxLoops?: number;
}

interface PhaseResult {
  name: string;
  output: string;
  status: "pending" | "active" | "done" | "error";
}
```

### [REQ-003] Team Types

```typescript
interface TeamDef {
  name: string;
  agents: string[];
}

interface TeamConfig {
  defaultGridColumns: number;
  autoRemoveDelayMs: number;
  teams: Record<string, string[]>;
  roles: Record<string, RoleConfig>;
}
```

### [REQ-004] Subagent Types

```typescript
type SubagentEvent =
  | { type: "message_update"; delta: string }
  | { type: "tool_execution_start"; tool: string }
  | { type: "tool_execution_end"; tool: string; success: boolean }
  | { type: "complete"; result: string }
  | { type: "error"; message: string };

type SubagentCommand =
  | { type: "task"; task: string }
  | { type: "kill" }
  | { type: "pause" };

interface SessionFile {
  id: string;
  role: string;
  task: string;
  history: SubagentEvent[];
  createdAt: number;
}
```

### [REQ-005] Error Types

```typescript
class PiExtError extends Error {
  code: string;
  constructor(code: string, message: string);
}

class ConfigError extends PiExtError {}
class SpawnError extends PiExtError {}
class TimeoutError extends PiExtError {}
class PipelineError extends PiExtError {}
class TeamError extends PiExtError {}
```

### [REQ-006] Utility Types

```typescript
type MergeStrategy = "concat" | "summarize";

interface VariableMap {
  $ORIGINAL: string;
  $INPUT: string;
  $INPUT_1: string;
  $INPUT_2: string;
  $CONTEXT: string;
}

type WidgetStatus = "running" | "done" | "error" | "pending";
```

## Verification

- [ ] All types exported from `src/index.ts`
- [ ] Error classes have `code` property
- [ ] Zero external dependencies
- [ ] `tsc --noEmit` passes with strict mode
