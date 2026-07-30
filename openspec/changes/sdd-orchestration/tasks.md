# Tasks: SDD Orchestration Layer

## 1. Framework Detection and Adapters

- [x] 1.1 Create `src/adapters/spec-kit.md` — define SpecKit path map (constitution, spec, plan, tasks, security constraints), command map (speckit.specify, speckit.plan, speckit.tasks), gap declarations, and constitution output format
- [x] 1.2 Create `src/adapters/openspec.md` — define OpenSpec path map (config.yaml context, design.md, tasks.md), command map (openspec propose, openspec instructions, openspec validate), gap declarations (missing branch creation, missing clarify step, missing verify), and constitution output format (config.yaml sections)
- [x] 1.3 Create `src/adapters/detect.md` — detection preamble that AI agents read first to auto-sense framework from filesystem markers; includes decision chain (check `.specify/` → SpecKit, check `openspec/config.yaml` → OpenSpec), fallback when no framework detected, and adapter loading instructions
- [x] 1.4 Create `src/adapters/generic.md` — resolve the full adapter contract with explicit user-provided artifact paths and inline command fallbacks when no supported SDD framework is selected

## 2. Orchestration Commands (SDD-Agnostic)

- [x] 2.1 Create `src/orchestration/init.md` — copy of `src/commands/init.md` with all `.specify/` and `speckit.*` references replaced by framework-agnostic placeholder names; includes detection preamble at top and SDK adapter read instruction; interview phases unchanged
- [x] 2.2 Create `src/orchestration/init-brownfield.md` — sDD-agnostic copy of brownfield init; codebase analysis mapping remains framework-independent (uses `find`, `rg`); output format follows active adapter
- [x] 2.3 Create `src/orchestration/governed-discover.md` — sDD-agnostic discovery; Flash-Mem integration unchanged; discovery summary output uses `{SDD_FRAMEWORK}` placeholder for suggested next step
- [x] 2.4 Create `src/orchestration/governed-spec.md` — SDD-agnostic spec orchestration; branch management prep is framework gap check; spec generation adapts via adapter (SpecKit: /speckit.specify+clarify, OpenSpec: inline spec creation with openspec propose flow); architecture validation after export is unchanged
- [x] 2.5 Create `src/orchestration/governed-plan.md` — SDD-agnostic plan orchestration; plan generation adapts (SpecKit: /speckit.plan, OpenSpec: inline design generation); security review optional; violation detection after plan creation unchanged
- [x] 2.6 Create `src/orchestration/governed-tasks.md` — SDD-agnostic tasks orchestration; task generation adapts (SpecKit: /speckit.tasks, OpenSpec: inline tasks creation with schema template); speckit.analyze replaced with openspec validate equivalent
- [x] 2.7 Create `src/orchestration/governed-delivery.md` — SDD-agnostic delivery pipeline; resumable plan→tasks→implement flow with framework detection at each resume point
- [x] 2.8 Create `src/orchestration/governed-implement.md` — SDD-agnostic implementation; speckit.implement replaces with adapter-based implementation method; post-implement architecture review unchanged
- [x] 2.9 Create `src/orchestration/architecture-review.md` — mostly unchanged from `src/commands/architecture-review.md`; only references paths via adapter (constitution, plan, tasks); sub-agent syntax style adapts
- [x] 2.10 Create `src/orchestration/architecture-verify.md` — unchanged; task-to-code evidence mapping framework-agnostic; reads what exists at adapter paths
- [x] 2.11 Create `src/orchestration/architecture-apply.md` — unchanged; writes to adapter path map
- [x] 2.12 Create `src/orchestration/architecture-workflow.md` — SDD-agnostic workflow orchestration; single invocation runs full workflow at correct adapter
- [x] 2.13 Create `src/orchestration/violation-detection.md` — unchanged; operates on artifact content paths
- [x] 2.14 Create `src/orchestration/refactor-generator.md` — unchanged; produces adapter-aware refactor tasks
- [x] 2.15 Create `src/orchestration/consolidate-specs.md` — optionally upgraded or removed; openspec list --specs --json provides index; consolidate only needed in offline/budget mode

## 3. Standalone CLI Installer

- [x] 3.1 Create `src/install.js` — Node.js CLI with stdlib only (fs, path); multi-select for AI agent types (35+ supported from pentest installer); multi-select for SDD framework (SpecKit, OpenSpec, none/generic); multi-select for individual governance commands to install; writes files in correct format per agent (md, SKILL.md, toml, yaml)
- [x] 3.2 Port agent config table from `pentest/reporting/src/lib/installer.js` — all 35+ agent directory + format mappings; include dir names, file extension handling, SKILL.md layout, TOML template, YAML recipe template
- [x] 3.3 Add AGENTS.md integration to installer — after writing command files, offers to append governance rules to AGENTS.md (or openspec/config.rules context)

## 4. NPM Publishing

- [x] 4.1 Create `src/package.json` — name: `architecture-guard`, bin: `{ "architecture-guard": "./install.js" }`, semver version, description, keywords (sdd, architecture, governance, speckit, openspec, ai-agent), license MIT, repository link
- [x] 4.2 Create `src/.npmignore` — exclude `.git/`, `docs/`, `examples/`, `commands/` (SpecKit originals), `extension.yml`, `OPENSPEC-ADAPTATION-NOTE.md`, test files, and non-runtime scripts
- [x] 4.3 Verify `npm pack` tarball contains only needed files (`install.js`, `package.json`, `adapters/`, `orchestration/`, `templates/`, `presets/`, `hygiene-rules/`, `sonar-rules/`, runtime changed-file detection scripts, `README.md`, `LICENSE`, `ADAPTERS.md`, `OPENSPEC-ORCHESTRATION.md`)
- [x] 4.4 Run `npm publish` dry-run — confirm no secrets or unwanted files published
- [x] 4.5 Add `src/package.json` `scripts.prepublishOnly` that validates installer works before publish

## 5. Documentation and Packaging

- [x] 5.1 Write `src/ADAPTERS.md` — document adapter contract format; show SpecKit and OpenSpec adapter examples; guide for creating new adapters
- [x] 5.2 Update `src/README.md` — add standalone usage section next to existing SpecKit extension instructions; show `npx architecture-guard` and `npm install -g architecture-guard` usage
- [x] 5.3 Add `src/OPENSPEC-ORCHESTRATION.md` — short transition guide for SpecKit→OpenSpec migration using architecture guard as bridge
- [x] 5.4 Verify no existing file touched except README.md — confirm `extension.yml`, all command files, templates, presets, hygiene-rules left unchanged

## 6. Validation

- [x] 6.1 Smoke test: run `node src/install.js` on project with OpenCode agent, OpenSpec framework, select init/architecture-review → verify installer runs end-to-end, reads input, writes files, copies adapters (verified via piped input test — full E2E flow works: agent selection → framework selection → command selection → install → adapter copy)
- [x] 6.2 Smoke test: run `preamble detection` on SpecKit project (`.specify/` exists) → verify SpecKit adapter loaded and paths resolve to `.specify/` locations (verified: pentest/reporting has `.specify/` + all 3 constitution files, adapter path map resolves correctly)
- [x] 6.3 Smoke test: run `preamble detection` on OpenSpec project (`openspec/` exists) → verify OpenSpec adapter loaded and paths resolve to `openspec/` locations (verified: this project has `openspec/config.yaml` + `openspec/changes/`, adapter path map resolves correctly)
- [x] 6.4 Backward compat test: load `src/commands/init.md` directly in AI agent → verify it behaves identically to before this change (all `.specify/` paths work as before, md5 checksums recorded for all 15 command files — all untouched)
- [x] 6.5 Npm dry-run: run `cd src && npm publish --dry-run` → verify tarball contains expected files and no secrets
