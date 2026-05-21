# Tasks: @pi/pipeline

## T1 — PipelineManager scaffold
**Scope:** Load config, state management, start/reset/off  
**Depends:** @pi/core, @pi/shared  
**Verify:** `load()` initializes state; `getState()` returns snapshot

## T2 — PhaseExecutor: parallel mode
**Scope:** Promise.all() agent spawning, result merge  
**Depends:** T1, @pi/subagent  
**Verify:** All agents spawn simultaneously; results concatenated

## T3 — PhaseExecutor: sequential mode
**Scope:** Reduce chain, pass output as input  
**Depends:** T2  
**Verify:** Agents run in order; output chains correctly

## T4 — PhaseExecutor: interactive mode
**Scope:** Delegate to primary agent, return user input  
**Depends:** T1  
**Verify:** Returns immediately, preserves state

## T5 — VariableResolver
**Scope:** Substitute $ORIGINAL, $INPUT, $INPUT_N, $CONTEXT  
**Depends:** T1  
**Verify:** All variables replaced in task strings

## T6 — GateManager
**Scope:** Auto/manual gates, approve/reject, review loop  
**Depends:** T1  
**Verify:** Auto-gate passes; manual gate pauses; loop counts

## T7 — Context accumulation
**Scope:** Append phase outputs to accumulated context  
**Depends:** T5  
**Verify:** $CONTEXT grows after each phase

## T8 — Timeline renderer
**Scope:** Text-based vertical timeline with status icons  
**Depends:** T1  
**Verify:** Renders all phases with correct icons

## T9 — Integration: full pipeline
**Scope:** Load → execute all phases → complete  
**Depends:** T1-T8  
**Verify:** Mock pipeline runs end-to-end
