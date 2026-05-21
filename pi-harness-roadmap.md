# Pi Harness Roadmap

## Completed

1. **customizable keybinds via config** [x]
2. **modes** [x]
3. **mcp** [x]
4. **damage-control** [x]

---

## In Progress

### Phase 1: PRDs Created ✅

| PRD | Description | Lines |
|-----|-------------|-------|
| `001-subagent-widget.md` | Subagent spawning, widgets, context isolation | 288 |
| `002-pipeline-orchestrator.md` | Visual pipeline, phases, parallel dispatch | 398 |
| `003-team-dispatcher.md` | Grid dashboard, dispatcher mode, teams | 421 |
| `004-monorepo-structure.md` | Package architecture, publish to npm | 494 |

**Location:** `~/.pi/docs/prd/`

---

### Phase 2: Implementation (Planned)

#### Step 1: Monorepo Setup ✅
- [x] Create `pi-agent-ext` monorepo structure
- [x] Setup Bun workspaces
- [x] Configure Turborepo
- [x] Configure TypeScript base
- [x] Setup Biome (linting + formatting)
- [x] Setup Vitest
- [x] Add GitHub Actions CI

#### Step 2: @pi/core
- [ ] Types: Agent, Pipeline, Team interfaces
- [ ] Errors and utilities

#### Step 3: @pi/shared
- [ ] `agent-defs.ts` - Parse .md files
- [ ] `config-loader.ts` - Load JSON configs
- [ ] `render.ts` - Common rendering utilities

#### Step 4: @pi/subagent
- [ ] SubagentManager class
- [ ] SessionManager class
- [ ] WatchdogTimer
- [ ] Spawn utilities
- [ ] Widget rendering

#### Step 5: pi-subagent Extension
- [ ] Wrap @pi/subagent for Pi
- [ ] `/sub`, `/subcont`, `/subkill`, `/subclear` commands

#### Step 6: @pi/pipeline
- [ ] PipelineManager class
- [ ] PhaseExecutor (parallel + sequential)
- [ ] GateManager
- [ ] Timeline widget

#### Step 7: pi-pipeline Extension
- [ ] Wrap @pi/pipeline for Pi
- [ ] `/pipeline`, `/pipeline-status`, `/pipeline-reset` commands

#### Step 8: @pi/team
- [ ] TeamDispatcher class
- [ ] GridRenderer
- [ ] Role assignment

#### Step 9: pi-team Extension
- [ ] Wrap @pi/team for Pi
- [ ] `/team`, `/dispatch`, `/status`, `/grid` commands

---

## Key Decisions

### Context Isolation
- **New `/sub`** = fresh context
- **Same pipeline** = shared context
- **`/subcont`** = preserved context

### Config Format
- **Pipeline** = JSON (preferred)
- **Teams** = JSON
- **Agents** = Markdown frontmatter + JSON config

### Config Priority (highest to lowest)
1. `settings.json` - global + extension
2. `config/*.json` - package-specific
3. `configs/pipelines/*.json` - pipeline configs
4. `agents/*.md` - agent definitions

---

## Architecture

```
pi-agent-ext/
├── packages/
│   ├── @pi/core/          # Types + interfaces
│   ├── @pi/subagent/      # Subagent spawning
│   ├── @pi/pipeline/      # Pipeline orchestrator
│   ├── @pi/team/          # Team dispatcher
│   ├── @pi/shared/        # Shared utilities
│   └── @pi/cli/           # CLI tools
│
├── configs/
│   ├── agents/            # .md definitions
│   ├── pipelines/         # .json configs
│   └── teams/            # .json definitions
│
└── extensions/            # Pi wrappers
    ├── pi-subagent/
    ├── pi-pipeline/
    └── pi-team/
```

---

## Dependencies

```
@pi/cli
    │
    ├── @pi/subagent ─── @pi/core
    │       │
    │       └── @pi/shared ─── @pi/core
    │
    ├── @pi/pipeline ─── @pi/core
    │       │
    │       └── @pi/subagent
    │
    └── @pi/team ─── @pi/core
            │
            └── @pi/subagent
```

---

## Sources Reference

Inspired by concepts from (NOT cloning):
- https://github.com/disler/pi-vs-claude-code
- https://github.com/ruizrica/agent-pi

**We build our own** based on our requirements.

---

## Next Steps

1. Review PRDs in `~/.pi/docs/prd/`
2. Approve or request changes
3. Start implementation with monorepo setup
4. Build packages in order: core → shared → subagent → pipeline → team
