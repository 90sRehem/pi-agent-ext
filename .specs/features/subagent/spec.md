# Feature: @pi/subagent

## Summary

Spawn and manage background Pi subagents with session isolation, watchdog timers, and event streaming. Core building block for pipeline and team packages.

## Scope

**Size:** Large  
**Type:** Library package  
**Depends:** @pi/core, @pi/shared

## Requirements

### [REQ-001] SubagentManager

```typescript
class SubagentManager {
  spawn(role: string, task: string): SubagentSession;
  continue(id: string, task?: string): SubagentSession;
  kill(id: string): void;
  killAll(): void;
  list(): SubagentSession[];
  clear(): void;
}
```

**Spawn behavior:**
1. Parse role (ALL-CAPS) or default to "AGENT"
2. Load role config from `subagent.json`
3. Create session via `SessionManager`
4. Spawn `pi` child process with `--session`, `--model`, `--agent-mode`
5. Register stdout/stderr event listeners
6. Start `WatchdogTimer` with role timeout
7. Return session with id, status="running", startTime

**Continue behavior:**
1. Find session by ID via `SessionManager.read`
2. If running: queue task (send via stdin)
3. If done: spawn new process with session history
4. Increment turn count in session

**Kill behavior:**
1. Send `SIGTERM` to child process
2. Wait `watchdogGraceMs` (30s)
3. If still running: `SIGKILL`
4. Mark status as "error"
5. Schedule session cleanup after delay

### [REQ-002] SessionManager

```typescript
class SessionManager {
  create(role: string, task: string): SessionFile;
  read(id: string): SessionFile;
  append(id: string, event: SubagentEvent): void;
  cleanup(id: string): void;
}
```

- Session directory: `~/.pi/agent/sessions/subagents/`
- File format: JSONL (one JSON object per line)
- First line: metadata (id, role, task, createdAt)
- Subsequent lines: events (SubagentEvent)
- `cleanup` removes file after `autoRemoveDelayMs`

### [REQ-003] WatchdogTimer

```typescript
class WatchdogTimer extends EventEmitter {
  start(timeoutMs: number): void;
  stop(): void;
  extend(additionalMs: number): void;
}
```

- `start`: Set timeout, emit "timeout" on expiry
- `stop`: Clear timer (call on normal process exit)
- `extend`: Add time to running timer
- On timeout: emit "timeout", force kill process

### [REQ-004] Event System

- Parse NDJSON from child stdout (each line is a JSON event)
- Valid event types: `message_update`, `tool_execution_start`, `tool_execution_end`, `complete`, `error`
- Emit parsed events via `SubagentManager` EventEmitter
- Non-JSON lines logged as raw output

### [REQ-005] Context Isolation

- Each `spawn` creates fresh session (no shared state)
- `continue` preserves conversation history
- Sessions stored as separate files (no memory sharing)

## Design

```
SubagentManager
├── spawn(role, task)
│   ├── SessionManager.create(role, task) → SessionFile
│   ├── child_process.spawn("pi", args)
│   ├── WatchdogTimer.start(timeoutMs)
│   └── EventEmitter.on("data") → parse NDJSON
├── continue(id, task)
│   ├── SessionManager.read(id) → SessionFile
│   └── spawn with history context
├── kill(id)
│   ├── process.kill("SIGTERM")
│   ├── setTimeout → process.kill("SIGKILL")
│   └── SessionManager.cleanup(id)
```

## Tasks

1. **T1:** Create `SubagentManager` class with spawn/kill/list
2. **T2:** Create `SessionManager` with JSONL read/write
3. **T3:** Create `WatchdogTimer` with start/stop/extend
4. **T4:** Implement NDJSON event parser from stdout
5. **T5:** Integration tests: spawn → complete → cleanup
6. **T6:** Integration tests: spawn → timeout → force kill

## Verification

- [ ] `spawn` creates child process, session file, widget
- [ ] `kill` gracefully terminates (SIGTERM → SIGKILL)
- [ ] `continue` preserves history across calls
- [ ] Watchdog force-kills after timeout
- [ ] Events parsed and emitted correctly
- [ ] Context isolation: two spawns don't share state
