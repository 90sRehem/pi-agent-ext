# Project: pi-agent-ext

## Vision

TypeScript monorepo for Pi agent extensions: subagent spawning, pipeline orchestration, and team dispatch — all with live visual feedback.

## Goals

1. Reusable packages (`@pi/core`, `@pi/shared`, `@pi/subagent`, `@pi/pipeline`, `@pi/team`)
2. Pi extension wrappers (`pi-subagent`, `pi-pipeline`, `pi-team`)
3. Config-driven (JSON pipelines, teams, agent definitions)
4. Type-safe with strict TypeScript

## Stack

| Layer | Technology |
|-------|------------|
| Runtime | Bun |
| Monorepo | Turborepo |
| Package Manager | Bun |
| Lint/Format | Biome |
| Testing | Vitest |
| Language | TypeScript (strict) |

## Architecture

```
pi-agent-ext/
├── packages/
│   ├── @pi/core/         # Types + errors (no deps)
│   ├── @pi/shared/       # Config loader, parser, render utils
│   ├── @pi/subagent/     # Spawn, sessions, watchdog
│   ├── @pi/pipeline/     # Phases, gates, context accumulation
│   ├── @pi/team/         # Dispatcher, grid, roles
│   └── @pi/cli/          # CLI tools
└── extensions/
    ├── pi-subagent/       # /sub, /subcont, /subkill commands
    ├── pi-pipeline/       # /pipeline, /pipeline-status commands
    └── pi-team/           # /team, /dispatch, /status commands
```

## Repo

https://github.com/90sRehem/pi-agent-ext
**Location:** `~/projects/pi-agent-ext/`
