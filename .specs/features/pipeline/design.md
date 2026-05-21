# Design: @pi/pipeline

## Architecture

```
PipelineManager (orchestrator)
├── PhaseExecutor (execution engine)
│   ├── SubagentManager (for parallel/sequential agents)
│   └── VariableResolver (context substitution)
├── GateManager (flow control)
└── TimelineRenderer (output formatter)
```

## State Machine

```
[Idle] → load(config) → [Loaded]
[Loaded] → start() → [Running]
[Running] → phase_complete → [Running|Gate]
[Gate] → approve() → [Running]
[Gate] → reject() → [Aborted]
[Running] → pipeline_complete → [Done]
[Running] → reset() → [Loaded]
[Done|Aborted] → reset() → [Loaded]
```

## Component Details

### PipelineManager
- Holds `PipelineState` (mutable during execution)
- `start()` runs async loop over phases
- Emits events: phase_start, phase_complete, gate_wait, pipeline_complete, error
- `reset()` clears accumulated context

### PhaseExecutor
- `interactive`: Returns immediately, delegates to caller
- `parallel`: `Promise.all()` over agents, merge with strategy
- `sequential`: `agents.reduce()` chaining outputs
- Variable substitution before passing to subagent

### GateManager
- Returns Promise that resolves on approve/reject
- For auto-gates: resolves immediately
- For manual gates: emits "gate_wait", waits for user action

### Context Accumulation

```typescript
// After each phase:
accContext += `\n\n[PHASE: ${phase.name}]\n${phaseOutput}`;

// Variable resolution:
$ORIGINAL → pipeline input
$INPUT    → previous phase output
$INPUT_N  → phase N output (1-indexed)
$CONTEXT  → accContext
```

## Testing Strategy

- Unit: PhaseExecutor modes (mock SubagentManager)
- Unit: GateManager (mock events)
- Unit: VariableResolver
- Integration: Full pipeline with mock phases
- Integration: Review loop (maxLoops)
