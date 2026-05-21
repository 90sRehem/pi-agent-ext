# Tasks: @pi/team

## T1 — TeamDispatcher scaffold
**Scope:** activate(), dispatch(), getStatus() basics  
**Depends:** @pi/core, @pi/shared  
**Verify:** `activate()` loads team; `dispatch()` returns agent state

## T2 — AgentRegistry
**Scope:** Map-based registry with find/update/cleanup  
**Depends:** T1  
**Verify:** Find idle agent by role; auto-cleanup after delay

## T3 — GridRenderer
**Scope:** Text grid with 1-4 column support  
**Depends:** T2  
**Verify:** Renders correct layout for N agents × M columns

## T4 — Dispatcher mode
**Scope:** Block code tools, allow only dispatch commands  
**Depends:** T1  
**Verify:** read/write/edit/bash blocked; dispatch allowed

## T5 — Team config loading
**Scope:** Load team.json + agent .md definitions  
**Depends:** @pi/shared  
**Verify:** Merges role configs with agent definitions

## T6 — aggregate()
**Scope:** Collect results from completed agents  
**Depends:** T2  
**Verify:** Formats [ROLE]: result for all done agents

## T7 — Integration: full flow
**Scope:** activate → dispatch → complete → aggregate  
**Depends:** T1-T6  
**Verify:** Mock agents run through full lifecycle
