# Roadmap: pi-agent-ext

## Milestones

### M1: Base Monorepo ✅
- [x] Bun workspace + Turborepo
- [x] Biome + TypeScript strict
- [x] Vitest + CI

### M2: Core Packages
- [ ] @pi/core — types, errors
- [ ] @pi/shared — config loader, parser, render utils

### M3: Subagent System
- [ ] @pi/subagent — spawn, sessions, watchdog
- [ ] pi-subagent — commands, widgets

### M4: Pipeline System
- [ ] @pi/pipeline — phases, gates, context
- [ ] pi-pipeline — commands, timeline

### M5: Team System
- [ ] @pi/team — dispatcher, grid, roles
- [ ] pi-team — commands, dashboard

### M6: CLI + Polish
- [ ] @pi/cli — extension management
- [ ] Publish to npm

## Implementation Order

1. `@pi/core` (no deps) → Small
2. `@pi/shared` (deps: core) → Small
3. `@pi/subagent` (deps: core, shared) → Large
4. `pi-subagent` (deps: @pi/subagent) → Medium
5. `@pi/pipeline` (deps: core, subagent, shared) → Large
6. `pi-pipeline` (deps: @pi/pipeline) → Medium
7. `@pi/team` (deps: core, subagent, shared) → Large
8. `pi-team` (deps: @pi/team) → Medium
