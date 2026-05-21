# Feature: @pi/team

## Summary

Team-based dispatch with grid dashboard, role assignment, and dispatcher mode.

## Scope

**Size:** Large  
**Type:** Library package  
**Depends:** @pi/core, @pi/subagent, @pi/shared

## Requirements

### [REQ-001] TeamDispatcher

```typescript
class TeamDispatcher {
  activate(teamName: string): void;
  dispatch(role: string, task: string): AgentState;
  getStatus(): AgentState[];
  aggregate(): string;
  setGridColumns(n: number): void;
  clear(): void;
}
```

**activate:**
1. Load team config from `team.json`
2. Initialize agents for each role in team
3. Set all to "idle"

**dispatch:**
1. Find idle agent with matching role
2. If none: spawn new via `SubagentManager.spawn(role, task)`
3. Update status to "running"
4. Return agent state

**aggregate:**
```typescript
const summary = Object.entries(results)
  .map(([role, output]) => `[${role.toUpperCase()}]: ${output}`)
  .join("\n\n");
```

### [REQ-002] Dispatcher Mode

- Block codebase tools: read, write, edit, bash
- Allow only: dispatch, status, aggregate, grid, clear
- Primary agent becomes coordinator only

### [REQ-003] Agent Registry

```typescript
interface AgentState {
  id: string;
  role: string;
  status: AgentStatus;
  startTime?: number;
  elapsed?: number;
  toolsUsed: number;
  result?: string;
}
```

- `Map<string, AgentState>` keyed by ID
- Auto-cleanup completed agents after `autoRemoveDelayMs`

### [REQ-004] GridRenderer

```typescript
function renderGrid(agents: AgentState[], cols: number): string[];
```

Cell layout:
```
┌─────────────────┐
│ ● ROLE          │
│ (Xs, Y tools)   │
│ Current task... │
└─────────────────┘
```

Status: idle (○ gray), running (● blue), done (✓ green), error (✗ red)

### [REQ-005] Team Config

- Load `~/.pi/agent/config/team.json`
- Load agent definitions from `~/.pi/agent/agents/*.md`
- Merge role configs with agent definitions

## Design

```
TeamDispatcher
├── activate(teamName)
│   ├── config = loadTeamConfig()
│   ├── roles = config.teams[teamName]
│   └── agents = roles.map(r => ({ id, role: r, status: "idle" }))
├── dispatch(role, task)
│   ├── idle = agents.find(a => a.role === role && a.status === "idle")
│   ├── if !idle: spawn via SubagentManager
│   └── update status to "running"
├── getStatus()
│   └── return Array.from(agents.values())
├── aggregate()
│   └── collect results from done agents
```

## Tasks

1. **T1:** `TeamDispatcher` with activate/dispatch/getStatus
2. **T2:** Agent registry with auto-cleanup
3. **T3:** `GridRenderer` with 1-4 column support
4. **T4:** Dispatcher mode (block tools)
5. **T5:** Team config loading + agent definition merge
6. **T6:** `aggregate()` result collection
7. **T7:** Integration: dispatch → complete → aggregate

## Verification

- [ ] `activate` loads team, initializes agents
- [ ] `dispatch` assigns task to idle agent
- [ ] Dispatcher mode blocks code tools
- [ ] Grid renders N columns correctly
- [ ] `aggregate` collects all completed results
- [ ] Auto-cleanup removes old agents
