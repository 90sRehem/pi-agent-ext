# Tasks: @pi/subagent

## T1 — SubagentManager scaffold
**Scope:** Create SubagentManager class with spawn/kill/list  
**Depends:** None  
**Verify:** `spawn()` returns session with id, status="running"; `list()` returns all sessions

## T2 — SessionManager
**Scope:** JSONL read/write for session files  
**Depends:** T1  
**Verify:** `create()` writes file; `read()` parses correctly; `append()` adds event line

## T3 — WatchdogTimer
**Scope:** Timer with start/stop/extend, SIGTERM→SIGKILL  
**Depends:** T1  
**Verify:** `start()` sets timer; `stop()` clears; timeout emits event

## T4 — Event Parser
**Scope:** NDJSON parsing from stdout stream  
**Depends:** T1  
**Verify:** Parses valid JSON events; forwards non-JSON as raw

## T5 — Continue flow
**Scope:** `continue(id, task)` with history preservation  
**Depends:** T2  
**Verify:** Reads history, spawns with context, increments turn

## T6 — Integration: full lifecycle
**Scope:** spawn → events → complete → cleanup  
**Depends:** T1-T5  
**Verify:** Mock child process simulates full flow

## T7 — Integration: timeout kill
**Scope:** spawn → timeout → SIGTERM → SIGKILL  
**Depends:** T3  
**Verify:** Process killed after timeout + grace period
