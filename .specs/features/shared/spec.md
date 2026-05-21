# Feature: @pi/shared

## Summary

Shared utilities: config loading, agent definition parsing, rendering helpers. Used by subagent, pipeline, and team packages.

## Scope

**Size:** Small  
**Type:** Library package  
**Depends:** @pi/core

## Requirements

### [REQ-001] Config Loader

```typescript
function loadConfig<T>(path: string): T;
function loadDirConfigs<T>(dir: string): Map<string, T>;
```

- Load JSON config with basic validation (throw `ConfigError` on invalid)
- `loadDirConfigs` loads all `.json` files from directory
- Config priority: explicit path > default location

### [REQ-002] Agent Definition Parser

```typescript
function parseAgentDef(mdContent: string): AgentDef;
```

- Parse YAML frontmatter between `---` delimiters
- Extract: name, description, tools, model, systemPrompt
- Return body text after frontmatter as `description`

### [REQ-003] Render Utilities

```typescript
function formatElapsed(ms: number): string;     // "45s", "2m 30s"
function formatTools(count: number): string;    // "12 tools"
function truncate(text: string, max: number): string;
function box(lines: string[]): string[];
function grid(cells: string[][], cols: number): string[];
```

### [REQ-004] Defaults

```typescript
const DEFAULT_TIMEOUT_MS = 600000;
const DEFAULT_MODEL = "minimax-m2.7";
const WATCHDOG_GRACE_MS = 30000;
const DEFAULT_GRID_COLUMNS = 2;
```

### [REQ-005] Session Utilities

```typescript
function generateSessionId(): string;
function getSessionPath(id: string): string;
function ensureDir(path: string): void;
```

## Verification

- [ ] `loadConfig` parses and validates JSON
- [ ] `parseAgentDef` extracts frontmatter correctly
- [ ] Render utils produce expected strings
- [ ] Defaults match PRD values
