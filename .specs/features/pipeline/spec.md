# Feature: @pi/pipeline

## Summary

Pipeline orchestration with phases, parallel/sequential execution, gates, and context accumulation.

## Scope

**Size:** Large  
**Type:** Library package  
**Depends:** @pi/core, @pi/subagent, @pi/shared

## Requirements

### [REQ-001] PipelineManager

```typescript
class PipelineManager {
  load(config: PipelineConfig): PipelineState;
  start(): Promise<PipelineResult>;
  reset(): void;
  getState(): PipelineState;
  off(): void;
}
```

**State:**
```typescript
interface PipelineState {
  config: PipelineConfig;
  currentPhaseIndex: number;
  phaseStates: PhaseResult[];
  accContext: string;
  reviewLoopCount: number;
}
```

### [REQ-002] PhaseExecutor

```typescript
class PhaseExecutor {
  execute(phase: PhaseDef, context: string): Promise<PhaseResult>;
}
```

**Modes:**
- `interactive`: Delegate to primary agent, wait for user input
- `parallel`: Spawn all agents via `SubagentManager`, `Promise.all()`, merge results
- `sequential`: Spawn agents one by one, pass previous output as `$INPUT`

**Merge strategies:**
- `"concat"`: Join with `\n\n---\n\n`
- `"summarize"`: Future (via summarizer agent)

**Variable substitution:**
- `$ORIGINAL` → user's original input
- `$INPUT` → previous phase output
- `$INPUT_N` → output of phase N (1-indexed)
- `$CONTEXT` → accumulated context from all previous phases

### [REQ-003] GateManager

```typescript
class GateManager {
  check(phase: PhaseDef): Promise<"approved" | "waiting" | "rejected">;
  approve(): void;
  reject(): void;
}
```

- Auto-approve if `approvalRequired: false`
- Pause if `approvalRequired: true`, emit "gate_wait" event
- Review loop: if `maxLoops` set, allow re-dispatch up to N times

### [REQ-004] Context Accumulation

After each phase:
```typescript
accContext += `\n\n[PHASE: ${phase.name}]\n${phaseOutput}`;
```

### [REQ-005] Timeline Renderer

```typescript
function renderTimeline(state: PipelineState): string[];
```

```
┌─ PIPELINE: plan-build-review ────────────────┐
│                                               │
│ ✓ understand   Complete                      │
│   └── scout done (45s, 8 tools)              │
│                                               │
│ ● gather       Running                        │
│   ├── scout running (30s, 5 tools)          │
│   └── scout running (28s, 4 tools)          │
│                                               │
│ ○ plan         Pending                        │
└───────────────────────────────────────────────┘
```

## Design

```
PipelineManager
├── load(config)
│   └── state = { config, currentPhaseIndex: 0, ... }
├── start()
│   └── while currentPhaseIndex < phases.length
│       ├── phase = phases[currentPhaseIndex]
│       ├── gate = GateManager.check(phase)
│       ├── if gate === "waiting": pause, emit event
│       ├── result = PhaseExecutor.execute(phase, accContext)
│       ├── accContext += [PHASE: name] + output
│       ├── currentPhaseIndex++
│       └── emit "phase_complete"
│   └── emit "pipeline_complete"
├── reset()
│   └── state.currentPhaseIndex = 0
```

PhaseExecutor
├── execute(phase, context)
│   ├── if parallel: Promise.all(agents.map(a => SubagentManager.spawn(...)))
│   ├── if sequential: agents.reduce(chain)
│   └── merge results
```

## Tasks

1. **T1:** `PipelineManager` with load/start/reset/getState
2. **T2:** `PhaseExecutor` with parallel/sequential/interactive modes
3. **T3:** `GateManager` with auto/manual gates + review loop
4. **T4:** Variable substitution ($ORIGINAL, $INPUT, $CONTEXT)
5. **T5:** Context accumulation across phases
6. **T6:** Timeline renderer
7. **T7:** Integration: full pipeline execution test

## Verification

- [ ] Pipeline executes phases in order
- [ ] Parallel agents run simultaneously
- [ ] Context accumulates between phases
- [ ] Manual gates pause execution
- [ ] Review loop works up to maxLoops
- [ ] Timeline renders correctly
