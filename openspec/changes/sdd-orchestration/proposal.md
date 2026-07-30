# Proposal: SDD Orchestration Layer

## Why

Architecture Guard today is a SpecKit extension — every command, path, and hook assumes `.specify/` and `speckit.*`. We need governance rules to work identically across SpecKit, OpenSpec, and future SDD frameworks, so teams don't lose architecture discipline when switching between them. Architecture Guard should orchestrate *on top of* any SDD framework, detecting which one is active and adapting automatically.

## Changes

- **Add framework detection preamble** that auto-senses which SDD framework is active (`.specify/` → SpecKit, `openspec/` → OpenSpec) and selects the correct adapter.
- **Extract SDD-agnostic orchestration commands** from existing SpecKit commands — same governance logic, abstracted from framework-specific paths and tool names.
- **Add adapter files** for SpecKit, OpenSpec, and generic/manual workflows, mapping paths, commands, constitution locations, and gap-filling steps.
- **Add standalone CLI installer** (`install.js`) — pick AI agent type, write command files into the target project's agent directories. Same pattern as pentest/reporting/src.
- **Add gap-filling** — OpenSpec doesn't auto-create branches during `new change`; the orchestrator detects and offers to do it. SpecKit doesn't have architecture verify; the orchestrator covers it. Each adapter declares what gaps to fill.
- **Keep full backward compatibility** — `extension.yml` stays for SpecKit extension users. Existing `commands/*.md` untouched. Adds new `adapters/` and `orchestration/` directories plus `install.js` side-by-side. No existing file is renamed or deleted.
- Support for SpecKit users having **dual behavior**: install as extension (extension.yml path) OR install as standalone AI tooling (install.js path). Both produce usable governance commands.
- **No new dependencies required** — install.js uses Node.js stdlib only.
  - **Publish to npm public registry** — `package.json` with `bin` entry point so users install with `npx architecture-guard` or `npm i -g architecture-guard`.

## Capabilities

### New Capabilities

- `framework-detection`: Detect active SDD framework from project root markers (`.specify/`, `openspec/`) and select the matching adapter. Degrade gracefully when no framework is detected — ask user.
- `sd-adapters`: Adapter contracts per SDD framework mapping artifact paths, CLI commands, constitution file locations, hook events, and known gaps onto a unified orchestration vocabulary.
- `orchestration-commands`: SDD-agnostic governance commands (init, discover, spec, plan, tasks, implement, review, verify, refactor) that detect the framework, load the adapter, then run the governed workflow.
- `installer`: Standalone `install.js` CLI that asks user to pick AI agent type and SDD framework, then writes appropriate command files to the target project's agent directory. Supports 35+ AI tools. Installable via `npx architecture-guard` from npm.
- `gap-filling`: Per-adapter detection of framework-missing capabilities (e.g., no auto-branch in OpenSpec, no architecture verify in SpecKit). Orchestrator offers to fill each gap with inline actions.

### Modified Capabilities

*(No existing OpenSpec specs to modify — this is a greenfield change for this project.)*

## Impact

- **Affected files**: 15 command files in `src/commands/` are left untouched (backward compat). New `src/adapters/`, `src/orchestration/`, and `src/install.js` are added. `src/templates/`, `src/presets/`, `src/hygiene-rules/` unchanged.
- **Structure**: `src/` gains `adapters/` (detection plus 3 adapters), `orchestration/` (copy of 15 commands, de-coupled), `install.js` (1 file). Existing file structure preserved.
- **No runtime dependency** — the entire system runs inside the AI agent's context, not as a separate process (except the installer which is Node.js stdlib-only).
- **Breaking changes**: None. Existing SpecKit users continue via `extension.yml` and `commands/*.md`.
- **Backward compatibility**: Users install as SpecKit extension (no change). Users install standalone (new path). Same governance prompts, same output quality, different invocation.
