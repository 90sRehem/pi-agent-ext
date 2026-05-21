# Design: @pi/subagent

## Architecture

```
SubagentManager (facade)
├── SessionManager (file I/O)
├── WatchdogTimer (timeout control)
└── EventEmitter (event bus)
```

## Components

### SubagentManager
- Maintains `Map<string, ChildProcess>` of active subagents
- Coordinates spawn → session → watchdog → events → cleanup
- Public API: `spawn()`, `continue()`, `kill()`, `killAll()`, `list()`

### SessionManager
- Directory: `~/.pi/agent/sessions/subagents/`
- Format: JSONL (metadata line + event lines)
- Thread-safe: one session per file, append-only writes

### WatchdogTimer
- Extends EventEmitter
- Node.js `setTimeout` based
- Grace period: SIGTERM → wait → SIGKILL

### Event Parser
- Splits stdout by newlines
- Tries `JSON.parse` on each line
- Non-JSON forwarded as raw `message_update` events

## Data Flow

```
User calls spawn(role, task)
  → SessionManager.create(role, task) → SessionFile
  → child_process.spawn("pi", args)
  → WatchdogTimer.start(timeoutMs)
  → stdout.on("data") → parse NDJSON → emit SubagentEvent
  → process.on("exit") → WatchdogTimer.stop() → cleanup
```

## Error Handling

- Spawn failure → `SpawnError`
- Timeout → `TimeoutError` (emitted, process killed)
- Parse error → Raw event forwarded
- Session file missing → `ConfigError`

## Testing Strategy

- Unit: SessionManager (mock fs)
- Unit: WatchdogTimer (mock timers)
- Integration: Full spawn → complete flow (mock child process)
- Integration: Timeout → force kill (mock child process)
