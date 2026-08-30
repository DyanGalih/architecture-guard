## 2.5.0

- Added dynamic CLI resource resolver (`architecture-guard resolve <category> [name]`) for on-demand resolution of immutable engine templates, presets, hygiene rules, and SonarLint rules.
- Implemented lean workspace initialization: `architecture-guard init` now writes a compact `.architecture-guard/config.yml` and avoids copying static unmodifiable files into target repositories.
- Added legacy static directory purge during `init` to remove obsolete asset folders from `.architecture-guard/`.
- Added `--vendor` / `--full` flag to `architecture-guard init` for air-gapped setups requiring full local copying.
- Enforced clean force-replacement of `ag-*` agent skills/commands across selected agent directories.
- Implemented strict path traversal bounds validation (CWE-22) in resource resolution.

## 2.4.0

- Added Angular architecture preset (`presets/angular.md`) supporting modern Angular conventions (Signals, Standalone components, `inject()` DI, `OnPush` change detection, typed reactive forms, DTOs, and functional guards/interceptors).
- Added deep interactive interview inquiry flow for Angular-specific concerns (Signals-to-RxJS interop, Hydration/SSR & `@defer`, Micro-frontends/Module Federation, and `@angular-eslint`).
- Added Deprecated & Dangerous Code hygiene rule (`hygiene-rules/deprecated-and-dangerous-code.md`) with default Critical (blocking) severity, cataloging obsolete language and framework patterns (PHP, JS/TS, Node.js, Angular, React, Security).
- Added pre-implementation and task preflight deprecation checks to `governed-implement` workflow.
- Streamlined interactive CLI initialization: auto-detects single SDD frameworks, installs all commands by default, automatically replaces skills/resources, scopes Antigravity to workspace, and auto-updates `AGENTS.md` without prompt fatigue.
- Updated preset documentation, repository hygiene documentation, templates, and init command options.



## 2.3.6

- Aligned SDD orchestration and legacy skills across adapters, commands, and workflows.
- Fixed adapter path resolution in legacy commands.
- Improved installer failure reporting and added regression coverage.

## 2.3.5
- Hardened archive framework routing: preserve SpecKit feature history in `specs/<feature>/` and incrementally update `specs/system_context.md`.
- Enhanced governed delivery active feature resolution via `.specify/feature.json`.

## 2.3.4
- Evolved `ag-apply` into an orchestrator that resolves findings across all artifact types (`proposal.md`, `spec.md`, `design.md`, `tasks.md`).
- Added pre-classification `Target:` fields to `ag-review-artifacts` and `ag-verify` output.
- Delegated upstream artifact fixes (`proposal.md`, `spec.md`) to SDD native update capabilities after user confirmation.

## 2.3.3
- Removed generated dist artifacts from version control while preserving build and npm packaging behavior.

## 2.3.2
- Fixed the sync-config validator build by declaring its `yaml` and `zod` runtime dependencies.

## 2.3.1
- Added AI agent auto-detection during installation to seamlessly select installed agents based on directory presence.
- Added an explicit `archive` command to fully clean up empty source directories during feature archival.

## 2.3.0
- Added: Enhanced `/ag-init` workflow to interactively scaffold `.architecture-guard/sync.yml` when a team issue tracker is selected.
- Added: One-way sync feature for User Stories to external issue trackers (GitHub/Jira) via `.architecture-guard/sync.yml`.
- Added framework-agnostic governed delivery and team User Story workflows.
- Synchronized adapter contracts, prompt descriptions, installer registration, and project-relative command examples.
- Added CLI update and JSON changed-file capabilities.
- Added a verification-gated `governed-archive` workflow for OpenSpec, SpecKit, and generic Markdown projects.

## 2.1.2
- Fixed `ag-review-artifacts` ambiguity by removing auto-detection for pre-implementation reviews. It now requires an explicit `--artifacts-only` flag to ignore codebase implementations.

## 2.1.1
- Added `Branch Management` safety check to `ag-governed-delivery` to prevent accidental generation on protected branches (matching `ag-governed-spec` behavior).

## 2.1.0
- Rebuilt installer as a unified TypeScript CLI (`cli.ts`).
- Generalized command prompts to support both SpecKit (`spec.md`, the technical design artifact) and OpenSpec (`design.md`) artifacts natively.
- Fixed command prompt prefixing to consistently use `.ag-` for extensions and `ag-` for standalone environments.
- Added explicit Pre-Implementation and Post-Implementation review gates in the documentation workflows.

# Release Notes

## 2.0.1

- Repositioned Architecture Guard as a standalone SDD Tools Orchestration layer for discovery, specification, planning, implementation, and verification.
- Kept Spec Kit extension installation as a backward-compatible integration path.
- Updated version references and release-artifact examples to `2.0.1`.


## 1.15.1

- Fixed memory-tool discovery in `governed-plan` capability-detection: `rg --files` respects `.gitignore` hiding `dist/` — switched to `find` or `rg --files -uu` for paths under `.specify/extensions/`.
- Removed the phantom "shared-memory promotion" / global-lesson step that stalled the workflow when the MCP tool was not exposed — local capture is the terminal step; global publication is out of scope for governed-plan.

## 1.15.0

- Added Budgeted Architecture Context Retrieval with bounded Flash-Mem expansion and mandatory active-feature authority.
- Added `consolidate-specs` and the non-authoritative `specs/system_context.md` fallback contract.
- Added project configuration, freshness handling, context-expansion reporting, benchmark fixtures, and a reproducible token benchmark protocol.
- Made optional sub-agent delegation capability-gated so governed workflows fall back inline when companion commands are unavailable.

## 1.14.0

- Moved framework-specific initialization questions into preset-owned `## Init Interview` sections while keeping `init` focused on generic orchestration and portable architecture decisions.
- Expanded all built-in preset interviews with framework-appropriate application structure, dependency wiring, persistence, contracts, authorization, and async infrastructure choices without forcing optional patterns.
- Added React Native as a built-in preset with mobile navigation, state and offline behavior, platform isolation, typed native boundaries, device infrastructure, and background-work guidance.
- Added the Framework Presets guide with supported-preset comparison, selection guidance, guardrails, and a custom-preset contract.

## 1.13.1

- Clarified the README, beginner guide, and workflow docs so `governed-discover` is clearly documented as the idea-stage entry point before `governed-spec` and `governed-delivery`.
- Reworked the README quick-start and command directory so discovery, specification, delivery, implementation, and verification appear in the correct order.
- Added a compact choose-your-path flow in the README to show when to start with discovery versus when to go straight to delivery.

## 1.13.0

- Added `governed-delivery` as the suggested resumable plan-to-tasks workflow, with mandatory Flash-Mem preflight when available, architecture and applicable security plan gates, task staleness handling, and formal analysis.
- Kept `governed-plan` and `governed-tasks` as targeted recovery commands and moved the manual sequence to the bottom of the README as the legacy workflow.
- Standardized Security Review detection around `security-review` while accepting `spec-kit-security-review` as a compatibility alias in the new orchestrator.
- Added a shared Ponytail Core contract with an ordered decision ladder, root-cause caller tracing, safety and verification floors, and explicit phase guidance.
- Wired every command to the shared contract and expanded architecture detection to catch unsafe simplification and caller-specific symptom patches.
- Added a senior-engineering lens to every framework preset and replaced the strongest line-count, mandatory-layer, and dependency cargo-cult rules with evidence- and tradeoff-based guidance.
- Standardized Security Review detection across all governed phases and expanded findings with consequence, smallest-fix, verification, and tradeoff guidance.

## 1.12.1

- Fix SonarLint rules bundling issue by moving rules into the extension source directory so they are packaged correctly on install.

## 1.12.0

- Added the `governed-discover` orchestrator command to shape raw feature ideas into architecture-aware discovery briefs before formal specification.

## 1.11.0

- Added DRY cleanup guidance across the architecture prompts and documentation so brownfield projects can more easily collapse duplicated business logic, validation, DTO mapping, and orchestration into one shared source of truth.
- Added a dedicated DRY Cleanup Guide, linked it from the onboarding and reference docs, and aligned the README feature set around Ponytail Pragmatism, DRY Cleanup Guidance, Brownfield Discovery + Verification, and Repository Hygiene Guard.

## 1.10.1

- Add branch management to governed-spec flow

## 1.10.0

- Repository Hygiene Guard (Full Changelog: [v1.9.0...v1.10.0](https://github.com/DyanGalih/architecture-guard/compare/v1.9.0...v1.10.0))

## 1.9.0

- **Ponytail Pragmatism Integration**: Adopted the Ponytail "lazy senior developer" philosophy natively across all orchestrator commands.
  - Initialized constitutions now bake in YAGNI and standard library preference.
  - `governed-implement` enforces writing the absolute minimum code and favors one-line solutions.
  - `architecture-review` now features a "Ponytail Audit" phase to catch and flag bloat, over-engineering, and unnecessary abstractions.
  - Specification, planning, and task generation orchestrators strictly enforce minimalism to prevent future-proofing.

## 1.8.19

- Clarified installation instructions in the README to explicitly show both the default registry path and the direct artifact URL.

## 1.8.18

- Introduced the `governed-spec` orchestrator command. This command fills the gap before the `governed-plan` phase by chaining `speckit.specify` and `speckit.clarify` together.
- Formalized the `speckit.analyze` Analyst step inside the `governed-tasks` flow, introducing an Automatic Analyst Loop that pauses to repair execution gaps before moving to implementation.
- Updated README with clearer reasoning on why developers should use the governed orchestration flows.

## 1.8.17

- Centralized brownfield and greenfield onboarding guidance in the README quick start and trimmed duplicate references across supporting docs.
- Added and registered the `init-brownfield` command for existing codebases.
- Bumped the extension version and aligned the release badge and download links to `v1.8.17`.

## 1.8.15

- Refined the Flash-Mem-first orchestration wording across governed and architecture prompts.
- Synced the release artifacts, download links, and badge to `v1.8.15`.

## 1.8.14

- Enhanced the architecture commands with Flash-Mem context retrieval guidance.
- Aligned the install artifacts and badge with `v1.8.14`.

## 1.8.13

- Tightened the architecture workflow handoffs and related orchestration notes.
- Aligned the install artifacts and badge with `v1.8.13`.

## 1.8.12

- Made the `update_project_summary` execution in the architecture init command conditional upon `flash-mem` availability to ensure backward compatibility.

## 1.8.11

- Bumped the extension version to 1.8.11 and aligned the install artifacts and badges with the new release tag.
- Preserved the `flash-mem` backend migration so governed workflows continue to use `flash-mem` as the canonical MCP source.

## 2026-05-13

- Updated governed Architecture Guard workflows to be memory-first when `flash-mem` is available.
- `governed-plan`, `governed-tasks`, `governed-implement`, `architecture-workflow`, `architecture-review`, `architecture-apply`, and `architecture-verify` now prefer `memory-synthesis.md` before broader scans.
- README and command registry descriptions now reflect the memory-first orchestration model instead of treating `flash-mem` as merely supplemental.
