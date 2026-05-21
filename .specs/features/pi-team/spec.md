# Feature: pi-team

## Summary

Pi extension wrapper for @pi/team. Commands and grid dashboard.

## Scope

**Size:** Medium  
**Type:** Pi Extension  
**Depends:** @pi/team, @pi/core, @pi/shared

## Requirements

### [REQ-001] Commands

- `/team [NAME]` — Switch active team
  - Show selector if no name
  - Load from `team.json`
- `/dispatch [ROLE] [TASK]` — Dispatch to specialist
  - Find or spawn agent with role
  - Track in grid
- `/status` — Show all agent states
- `/grid [N]` — Set column count (1-4)
- `/clear` — Clear all widgets

### [REQ-002] Grid Widget

```
HERALD TEAM
┌───────────────────┬───────────────────┐
│ ● SCOUT           │ ● SAGE            │
│ (45s, 12 tools)   │ (30s, 8 tools)    │
│ Analyzing deps... │ Creating plan...  │
├───────────────────┼───────────────────┤
│ ✓ FORGE           │ ○ WARD            │
│ (120s, 45 tools)  │ (idle)            │
└───────────────────┴───────────────────┘
```

- Team name header
- Cells: role, status, elapsed, tools, activity
- Dynamic columns (1-4)
- Auto-resize based on terminal width

### [REQ-003] Dispatcher UI

When active:
- Block direct code tools
- Show available specialists
- Task queue display
- Quick dispatch buttons

## Design

```
pi-team extension
├── onActivate(pi)
│   ├── dispatcher = new TeamDispatcher()
│   ├── registerCommand("/team", handleTeam)
│   ├── registerCommand("/dispatch", handleDispatch)
│   ├── registerCommand("/status", handleStatus)
│   ├── registerCommand("/grid", handleGrid)
│   └── registerCommand("/clear", handleClear)
├── handleTeam(name)
│   ├── dispatcher.activate(name)
│   └── pi.ui.addWidget("team", renderGrid)
├── handleDispatch(role, task)
│   ├── agent = dispatcher.dispatch(role, task)
│   └── pi.ui.updateWidget("team", renderGrid)
```

## Verification

- [ ] `/team herald-team` activates + shows grid
- [ ] `/dispatch scout analyze` spawns + updates grid
- [ ] `/status` shows all agent states
- [ ] `/grid 3` changes layout
- [ ] Dispatcher mode blocks tools
