# Design: @pi/team

## Architecture

```
TeamDispatcher (coordinator)
├── AgentRegistry (state tracking)
├── GridRenderer (output formatter)
└── SubagentManager (agent spawning)
```

## Dispatcher Mode

When active:
- Primary agent tools: blocked (read, write, edit, bash)
- Allowed commands: dispatch, status, aggregate, grid, clear
- Specialist agents handle all code operations

## Component Details

### TeamDispatcher
- `activate(teamName)`: Load team config, initialize agents
- `dispatch(role, task)`: Find or spawn agent with role
- `getStatus()`: Return all agent states
- `aggregate()`: Collect results from completed agents
- `setGridColumns(n)`: Update layout (1-4)

### AgentRegistry
- `Map<string, AgentState>` keyed by agent ID
- Auto-cleanup: completed agents removed after `autoRemoveDelayMs`
- Find algorithm: match role + status === "idle" (oldest first)

### GridRenderer
- Calculate rows: `Math.ceil(agents.length / cols)`
- Cell width: `Math.floor(termWidth / cols) - padding`
- Status color mapping via ANSI codes

## Data Flow

```
activate("herald-team")
  → load team.json
  → get roles for team
  → create AgentState for each role (idle)

dispatch("scout", "analyze deps")
  → find idle scout in registry
  → if found: SubagentManager.spawn(role, task)
  → update status to "running"
  → subscribe to events
  → on complete: update status to "done", store result

aggregate()
  → filter agents with status === "done"
  → format: [ROLE]: result
  → join with separators
```

## Testing Strategy

- Unit: AgentRegistry (find, update, cleanup)
- Unit: GridRenderer (various column counts)
- Unit: Dispatcher mode (tool blocking)
- Integration: Full dispatch → complete → aggregate
