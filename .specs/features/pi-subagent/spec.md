# Feature: pi-subagent

## Summary

Pi extension wrapper for @pi/subagent. Registers commands and renders live widgets.

## Scope

**Size:** Medium  
**Type:** Pi Extension  
**Depends:** @pi/subagent, @pi/core, @pi/shared

## Requirements

### [REQ-001] Commands

- `/sub [ROLE] [TASK]` — Spawn subagent
  - ROLE: ALL-CAPS or defaults to "AGENT"
  - If no task: show usage
  - Spawn via `SubagentManager.spawn()`
  - Register widget for live updates

- `/subcont [ID] [TASK]` — Continue subagent
  - Find by ID, resume with optional new task
  - If no ID: show list of available sessions

- `/subkill [ID|all]` — Kill subagent(s)
  - Single ID or "all" keyword
  - Graceful then force kill

- `/subclear` — Clear all widgets
  - Remove from UI, keep sessions running

### [REQ-002] Widget Rendering

```
┌─────────────────────────────────────────────────────────┐
│ ● SCOUT - SA1 | (45s) | Tools: 12 | model: flash       │
│   Summarizing API patterns...                          │
└─────────────────────────────────────────────────────────┘
```

- Line 1: Status icon + Role + ID + Elapsed + Tools + Model
- Line 2: Current activity (truncated 60 chars)
- Animated spinner: `⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏`
- Timeout warning: "X remaining" at 80%, "TIMING OUT" at 95%

### [REQ-003] Event Handling

- Subscribe to `SubagentManager` events
- On `message_update`: update activity text
- On `tool_execution_start/end`: update tool count
- On `complete`: show ✓, auto-remove after delay
- On `error`: show ✗, keep visible

## Design

```
pi-subagent extension
├── onActivate(pi: ExtensionAPI)
│   ├── manager = new SubagentManager()
│   ├── registerCommand("/sub", handleSub)
│   ├── registerCommand("/subcont", handleSubCont)
│   ├── registerCommand("/subkill", handleSubKill)
│   └── registerCommand("/subclear", handleSubClear)
├── handleSub(args)
│   ├── session = manager.spawn(role, task)
│   └── pi.ui.addWidget(session.id, renderWidget)
├── handleWidgetUpdate(event)
│   └── pi.ui.updateWidget(event.id, renderWidget)
```

## Verification

- [ ] `/sub SCOUT analyze` spawns + shows widget
- [ ] `/subcont 1 fix` continues conversation
- [ ] `/subkill 1` terminates + updates widget
- [ ] Widget updates in real-time on events
