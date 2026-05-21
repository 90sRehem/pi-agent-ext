# Feature: pi-pipeline

## Summary

Pi extension wrapper for @pi/pipeline. Commands and timeline widget.

## Scope

**Size:** Medium  
**Type:** Pi Extension  
**Depends:** @pi/pipeline, @pi/core, @pi/shared

## Requirements

### [REQ-001] Commands

- `/pipeline [NAME]` — Select/activate pipeline
  - Show selector UI if no name
  - Load from `~/.pi/agent/config/pipelines/*.json`
- `/pipeline-status` — Show current state
- `/pipeline-reset` — Reset to phase 0
- `/pipeline-clear` — Hide widget (keep state)
- `/pipeline-off` — Deactivate

### [REQ-002] Timeline Widget

- Vertical timeline with all phases
- Phase status: pending (○), active (● + animated), done (✓), error (✗)
- Active phase: show agent lines (role, status, elapsed, tools)
- Gate indicator for manual approval phases

### [REQ-003] Gate UI

- Approval panel when gate reached
- Show review summary
- Buttons: Approve, Re-dispatch, Abort
- Show loop count: "Review 2/3"

## Design

```
pi-pipeline extension
├── onActivate(pi)
│   ├── manager = new PipelineManager()
│   ├── registerCommand("/pipeline", handlePipeline)
│   ├── registerCommand("/pipeline-status", handleStatus)
│   ├── registerCommand("/pipeline-reset", handleReset)
│   ├── registerCommand("/pipeline-clear", handleClear)
│   └── registerCommand("/pipeline-off", handleOff)
├── handlePipeline(name)
│   ├── config = loadPipelineConfig(name)
│   ├── manager.load(config)
│   └── manager.start()
├── onPhaseUpdate(event)
│   └── pi.ui.updateWidget("pipeline", renderTimeline)
```

## Verification

- [ ] `/pipeline plan-build-review` activates
- [ ] Timeline shows correct phase status
- [ ] Parallel agents display simultaneously
- [ ] Gate pauses with approval UI
- [ ] Review loop allows re-dispatch
