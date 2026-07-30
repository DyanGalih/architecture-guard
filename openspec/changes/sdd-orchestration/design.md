# Design: SDD Orchestration Layer

## Context

Architecture Guard today is a SpecKit extension — 15 prompt files, 10 framework presets, 11 hygiene rules, all tied to `.specify/` paths and `speckit.*` slash commands. It works only with SpecKit.

The goal: transform it into an AI-assisted SDD orchestrator that works atop any SDD tooling (SpecKit, OpenSpec, future ones). The governance logic (boundary checks, DRY rules, ponytail contract, architecture review) is already framework-agnostic — only the path references and tool invocations are SpecKit-specific.

Key constraints:
- Backward compatibility must be 100% — no existing file is renamed, moved, or deleted
- No new external dependencies
- Must work as both `extension.yml`-installed extension and standalone `install.js`

## Goals / Non-Goals

**Goals:**
- Framework detection that auto-senses SpecKit vs OpenSpec from filesystem markers
- Adapter contract mapping paths, commands, and gaps per SDD framework
- SDD-agnostic versions of all 15 orchestration commands
- Standalone CLI installer (`install.js`) for any AI agent + any SDD framework
- Gap filling: detect missing features in framework and offer fill actions
- Backward compatibility with existing SpecKit extension usage

**Non-Goals:**
- Automatically install Architecture Guard into the SpecKit catalog (that's OpenSpec CLI territory)
- Write SDD framework tooling itself (Architecture Guard won't replace `openspec` or `speckit` CLIs)
- Real-time AST analysis or static code parsing
- Framework autodetection in polyglot/asymmetric repos (too expensive for this scope)

## Decisions

### Decision 1: Self-contained markdown adapter files (not code-based adapter objects)

**Alternative considered**: TypeScript/JavaScript adapter modules with programmatic path resolution.
**Decision**: Markdown tables with "canonical" names mapped to concrete paths.

**Rationale**: Architecture Guard's commands are markdown prompts. Composing them with markdown adapters means the AI agent reads both files, combines them, and follows from there. No parser, no runtime evaluation. It works identically across 35+ agent implementations.

The adaptor provides:
```markdown
## Path Map
| Canonical Name | SpecKit Path | OpenSpec Path |
|----------------|--------------|---------------|
| constitution | `.specify/memory/constitution.md` | `openspec/config.yaml` (context section) |
| arch-constitution | `.specify/memory/architecture_constitution.md` | `openspec/architecture.md` |

## Command Map
### Generate spec
- **SpecKit**: `/speckit.specify`
- **OpenSpec**: Read `openspec instructions specs --change <name>`, then create file

## Gap Fill
1. **Branch creation** — OpenSpec `new change` does not create a git branch.
   - Fill: `git checkout -b <name>` before creating the change.
```

This makes adapters small — roughly 60-80 lines each.

### Decision 2: Installer follows pentest/reporting/src install pattern (no new build system)

**Alternative**: Use OpenSpec skill generation pipeline (pulling template from TypeScript like `skill-templates.ts`).
**Decision**: Standalone `install.js` using Node.js stdlib.

**Rationale**: The OpenSpec skill pipeline assumes skills are compiled into the OpenSpec binary and shipped with `openspec init`. Architecture Guard is not an OpenSpec primitive — volunteers can use it alongside OpenSpec but can't embed it. A standalone installer is the only path that avoids coupling.

The pentest/reporting installer JS procedurally demonstrates the exact pattern: detect AI agent, determine format (markdown, SKILL.md, TOML, YAML), write command file, add generated SKILL frontmatter. With 35+ agent configs already mapped.

All 15 governance commands are written to either `*.md` (command files) or `*/SKILL.md` (skill files) or `*.toml` or `*.yaml` depending on the tool's native format.

### Decision 3: Orchestration commands are marked copies, not rewritten originals

**Alternative**: Delete existing commands and replace with orchestration versions. Or geneate them from a template.

**Decision**: Create `src/orchestration/` directive containing SDD-agnostic copies of all 15 command files, stripped of `.specify/` and `speckit.*` references. Each file starts with a detection preamble:

```markdown
## SDD canny Detection

Read `adapters/detect.md` to determine the active SDD framework.
Then load `adapters/<framework>.md`.
All paths and commands below use adapter-mapped names.
```

The original `src/commands/*.md` stays untouched.

### Decision 4: Installer also handles OpenSpec init integration

**Alternative**: Separate integration layer that OpenSpec users manually configure.

**Decision**: After installing Architecture Guard commands into an AI agent's directory, the installer also appends governance rules to the project's `AGENTS.md` (or `openspec/config.rules` section). Rules like:

```markdown
### Architecture Guard
After each openspec phase (spec/plan/tasks/apply), run architecture-guard review.
Check for boundary violations, DRY drift, and repository hygiene before archiving.
```

This ensures Architecture Guard runs implicitly — the agent self-audits — without developer having to remember to run it.

### Decision 5: Publish to npm as `architecture-guard`

**Alternative**: Ship only as GitHub repository (clone + `node install.js`) or have users download manually.
**Decision**: Publish as `architecture-guard` on npm public registry. Name verified available (npm returns 404). Add `package.json` with `bin: { "architecture-guard": "./install.js" }`, SemVer versioning, `.npmignore` to exclude non-installer files.

**Rationale**: Users type `npx architecture-guard` and the installer runs immediately, no clone needed. `npm install -g architecture-guard` also works. This is the standard distribution method for Node.js CLIs.

The `package.json` is added at `src/package.json` and published from that directory. It depends on zero external packages (stdlib only: `fs`, `path`, `readline`). The `.npmignore` excludes `.git/`, `docs/`, `examples/`, `commands/` (SpecKit-only originals), and `OPENSPEC-ADAPTATION-NOTE.md`. The package includes only the two runtime detection scripts used by orchestration.

Published package contains:
- `install.js` (CLI entry)
- `adapters/` (framework adapters)
- `orchestration/` (15 governance commands)
- `templates/` (ponytail_core, constitutions, budgeted context)
- `presets/` (10 framework presets)
- `hygiene-rules/` (11 code quality rules)
- `sonar-rules/` and the two changed-file detection scripts used by standalone review
- `package.json`, `README.md`, `LICENSE`

## Risks / Trade-offs

- **AI non-determinism**: The detection preamble and adapter interpretation rely on AI agent following instructions correctly. Mitigation: using explicit markers (check files exist, then read). Second mitigation: installer pre-configures adapter in AGENTS.md.

- **Two copies of command logic**: `commands/` and `orchestration/` will diverge if only one side gets updated. Mitigation: `orchestration/` is the new canonical home. Commands in `commands/` are deprecated and frozen for backward compat. Future updates go into `orchestration/`, not `commands/`. In practice the fix "bound governed-plan memory discovery" (submodule commit `6859743`) was applied to both sides — `commands/governed-plan.md` got the SpecKit-specific Memory MD runtime detection, `orchestration/governed-plan.md` got the framework-decoupled equivalent ("host-exposed Memory MD CLI"). The port is verified: both copies carry the bound-degradation logic in their Step 1 / Step 2 / Step 6 sections.

- **OpenSpec skill shipping**: `Workflow_Orchestration_s.txt` alternatively ship as OpenSpec skills through `./skills/` directory structure. The method is described in README. Scope invokes using that kernel: a second path for users preferred by the OpenSpec ecosystem.

## Implementation History Note

The change went through one rejected design iteration before settling on the markdown-adapter approach. Recorded for accuracy, not as guidance:

1. **Initial attempt** (submodule commit `015edcb feat: add portable architecture guard CLI`): introduced a programmatic CLI at `bin/architecture-guard.js` (~253 lines) backed by `lib/config.js`, `lib/artifacts.js`, `lib/contract.js`, `lib/findings.js`, `lib/profile.js`, `lib/render.js`. This directly contradicted Decision 1 (self-contained markdown adapter files, not code-based adapter objects) because adapters were compiled into JS. That same commit also touched 8 `commands/*.md` files (governed-discover, governed-plan, governed-spec, governed-tasks, init, init-brownfield, architecture-review, architecture-workflow), contradicting Decision 3 / task 5.4's "no existing file touched except README.md".

2. **Reversal**: the `bin/` and `lib/` paths were dropped from the worktree in later commits, and the `commands/*.md` files were reverted to their pre-touch state (current `git -C src status` shows only `README.md` modified — `commands/` and `extension.yml` are back to fixed backward-compat originals). The current implementation is the markdown-adapter + `install.js` approach Decision 1 describes, plus the SDD-agnostic `orchestration/` copies Decision 3 describes. The earlier rejected attempt left no trace in the shipped deliverable but is committed in submodule history.

3. **Why recorded**: future readers may find these leftover commits in `git -C src log` and either (a) think the programmatic-adapter path is the active design, or (b) re-propose the rejected approach. Decision 1 still holds — markdown adapters were chosen because the prompts cross 35+ AI tools with no shared runtime.

## Open Questions

- Where should `src/orchestration/` refer to for Ponytail Core? Currently `commands/*.md` reference templates at `.specify/extensions/architecture-guard/templates/ponytail_core.md`. Proposed orchestrator references `templates/ponytail_core.md` directly sans framework paths. Adapts load and verify.

- How is framework detection stored across sessions? Not persisted to files (session-only variable). If needed for persistence later, add to adapter contract.

- OpenSpec's `spec-driven` schema or users custom schemas? The adapter detects the schema but the orchestration commands don't alter the schema — they run *alongside* it. Future: possibly inject, but not now.

## Files Structure Change

```
src/
  adapters/              ← NEW (detection plus 3 adapters)
    detect.md
    spec-kit.md
    openspec.md
    generic.md
  commands/              ← untouched (backward compat)
    commands/...
  orchestration/         ← NEW: 15 files (copies, decoupled)
    orchestration/init.md
    orchestration/governed-discover.md
    orchestration/...
  hygiene-rules/         ← untouched
  presets/               ← untouched
  templates/             ← untouched
  scripts/               ← untouched
  extension.yml          ← untouched (SpecKit backward compat)
  install.js             ← NEW (standalone CLI installer)
```
