## Unreleased

- **Workspaces with separate application repositories**: the governance and specifications repository (the workspace, holding `.architecture-guard/`) can wrap application repositories with their own git history and `origin`, such as a gitignored `src/`. A new optional `repositories:` list in `.architecture-guard/config.yml` (`name`, `path`, `roles: [code, specs]`, optional `forge`) describes them; `init` detects standalone nested repositories (a `.git` directory; submodules and worktrees are left out), records them unless the key is already set (`repositories: []` opts out), and detects the forge from the first code repository. `detect-changed-files` lists every repository's changes as workspace-relative paths, takes `--repo <name>`, applies workspace-relative and per-repository `security_sensitive_paths`, and still uses the workspace's settings when run inside a configured repository (previously it silently reported nothing sensitive there). `hygiene` scans configured repositories, and `validate-setup` checks each one. A new `repository_context` template, referenced by every skill that uses git, tests or the code host, runs those steps in the repository that owns the files, checks the branch per repository, and proposes one commit and one push approval per repository. Projects without `repositories` are unchanged. `init` records only nested repositories the workspace ignores (or any, when the workspace is not a git repository), never hidden, vendored, example or test checkouts. The host Security Review is dispatched once per owning repository with its changed files, or marked `Degraded`; `validate-setup` warns about unlisted ignored repositories and workspace security globs that miss every repository; `detect-changed-files` warns when run inside a nested repository its workspace does not list, requires `--repo` with `--base`, and fails on a `--repo` that is not a git repository.
- **`architecture-guard hygiene --policy-root <dir>`**: takes the policy and local rules from that directory's `.architecture-guard/` instead of the scanned target's, so a review of someone else's checkout cannot change its own rules; `ag-review-implementation` passes the workspace.
- **Legacy Spec Kit extension safety**: `commands/governed-implement.md` now refuses to implement on a protected branch, and `commands/governed-archive.md` refuses to commit or push on one, asks separately before each push, and never force-pushes.
- **Governance documents reviewers can read**: a new optional `governance:` block in `.architecture-guard/config.yml` declares the constitution, architecture, security and layout documents; every built-in adapter's constitution set includes them. `validate-setup` warns when a declared or mapped constitution is gitignored, outside the repository, or missing, and a new hygiene rule, `unresolved-governance-citations` (Warning), reports cited `*constitution*.md` paths in code, comments or specs that reviewers cannot open. Skills still read gitignored governance files but now report them as a hygiene warning. A rule only the author can read was cited in shipped code without anyone noticing.
- **Security re-review on security-sensitive changes**: a new optional `security_sensitive_paths:` list of globs in `.architecture-guard/config.yml` and `architecture-guard detect-changed-files --security-sensitive` (lists only the changed files that match; the default output is unchanged). `ag-pr-feedback` now dispatches the host Security Review before committing a fix that touches one, `ag-governed-implement` re-runs it after every later fix that does and records `security re-review required` as an open blocking item when Security Review is unavailable, and `ag-review-pr` says a security review is required, matching only against the base checkout's list. Previously a review-thread fix that changed an authentication rule was re-checked for architecture only.
- **Accepted risks must be complete**: the constitution and plan templates require an owner, rationale, compensating control, trigger or expiry, and gate for every accepted risk or deviation. `ag-review-artifacts` and `ag-verify` report missing fields (LOW) and a security-relevant risk whose only mitigation is to revisit it later (MEDIUM, non-blocking unless the security policy says otherwise); `ag-verify` also reports a risk whose trigger has been reached as open.
- **Safer skill gates**: `ag-governed-spec` no longer creates a change before the branch gate (it asks separately for the change and capability names, and creates the change only after approval); auto-fix loops in `ag-governed-spec` and `ag-governed-tasks` re-run validation (at most 2 attempts) and re-evaluate the blocking gate, and `ag-governed-tasks` evaluates its gate before writing the summary; `ag-consolidate-specs` builds the index in memory and writes only after confirmation, and other workflows recommend it instead of regenerating the index themselves; `ag-governed-archive` refuses to commit or push on protected branches, never force-pushes, and asks separately before pushing; `ag-apply` adds the protected-branch preflight and asks separately before any Flash-Mem write; `ag-init` previews before saving a paused draft and only proposes memory captures; `ag-governed-delivery-team` validates sync config only with an installed `architecture-guard` CLI (no `npx` fetch) and skips sync as `Unavailable` otherwise.
- **Consistent skill behavior**: every skill resolves the adapter through the same chain (override, `selected-adapter`, `config.yml`, markers); `ag-governed-implement` uses the hygiene runner's `blocking` flag and aligns its guardrail with the P0-only architecture blocking rule; `ag-workflow` picks `ag-governed-delivery-team` whenever User Story approval is required and no longer runs verification twice; `ag-verify` rates boundary bypass HIGH unless policy says otherwise; `ag-review-artifacts` limits hygiene to runner findings on planning artifacts; constitution loading is stated once per skill.
- **OpenSpec adapter**: change discovery now uses `openspec list --json` (changes) instead of `openspec list --specs --json` (specs), and `openspec new change` runs only after explicit approval. Generic adapter archive requires approval for both `architecture-guard archive` and the manual move.
- **Adapter Path Map `Notes` column**: annotations such as "optional" or "or a user-provided path" moved out of the path value into a third `Notes` column, so installed prompts receive clean paths. Custom adapters keep working; move annotations to `Notes` to get clean materialized paths.
- **`debug-artifacts` hygiene rule now defaults to Warning** (was Critical), so `console.log`/`console.error` at an approved Entry boundary no longer blocks by default. To keep blocking on it, add `debug-artifacts` (or `warning`) to `repository_hygiene.fail_on`.
- **`ag-pr-feedback`**: work through review feedback on your own pull request on any code host. It collects unresolved threads and failing checks, triages each (fix, discuss, disagree, already addressed, out of scope) against your constitutions, applies only approved minimal fixes, runs tests and a scoped architecture review, commits and pushes with separate approvals (never force-pushes), and drafts replies. You then choose **Reply only**, **Reply and resolve** (only fixed or already-addressed threads are eligible), **Adjust first**, or **Don't post**. The `pr` command alias now installs both pull-request skills.
- **`ag-review-pr`**: review someone else's pull request on any code host. It fetches the pull request through the selected forge, reads its full files from a temporary worktree (after approval), reviews the change against the constitutions and any linked SDD artifacts by reusing `ag-review-implementation`, adds intent, test, secret, and CI checks, and drafts a comment-only review. You then choose **Post as is**, **Adjust first**, or **Don't post**; it re-checks the head commit before posting and never approves, requests changes, or merges. Install with `--commands pr`.
- **Forge adapters**: a new adapter layer for code hosts — GitHub, GitLab, Bitbucket Cloud, Azure DevOps, and plain git (`generic`) — independent of the SDD adapter. `architecture-guard init` auto-detects the forge from the `origin` remote (override with `--forge <name>`), installs forge adapters to `.architecture-guard/forges/`, and records `.architecture-guard/selected-forge`. Each action uses a registered MCP server for the host, then the host CLI (`gh`, `glab`, `az`), then a stated fallback. Custom forges work like custom SDD adapters; see `FORGES.md`. `validate-setup` checks the selected forge.
- **`architecture-guard hygiene --files <paths>`**: limits findings to the listed files (comma-separated, relative to `--target`) and records the scope in the JSON report (`scope.mode`, `scope.files`, `scope.unmatched`). Duplicate-detection rules still compare the listed files with the rest of the repository. `ag-review-implementation` uses it, so pull-request reviews no longer report pre-existing findings from unchanged files.
- **`ag-review-pr` hardening**: the review worktree is created in the system temp directory, outside the repository, and removed at the end whatever the outcome; rules, constitutions, and configuration are read only from your base checkout, never from the pull request; changes to governance files are reported as security findings; the pull request's code, tests, and scripts are never run.
- **`ag-review-implementation`**: accepts a review root and base ref from calling skills, runs the hygiene runner on the changed files and reports its severity and blocking flags verbatim (manual rules are listed as degraded), adds a `Target` column so `ag-apply` handles artifact findings and `ag-refactor-generator` handles code findings, and passes read-only and untrusted-content constraints to sub-agents.
- **`ag-pr-feedback`**: re-reads threads right before posting and asks again if reviewers changed anything, stops on a failed resolve, and never cites unpushed commits in replies.
- **Forge adapters**: review and reply text is passed to `gh`, `glab`, `az`, and `curl` through temporary files outside the repository instead of shell arguments. GitLab reviews publish only the drafts the run created (and stop if other pending drafts exist) instead of `bulk_publish`, and never approve or set a review state. Azure DevOps diffs come from `git fetch` plus `git diff` with no checkout, REST calls pass the Azure DevOps resource id to `az rest` (or `--area`/`--resource` to `az devops invoke`), and threads are posted only if the source commit has not moved. GitHub review worktrees use `gh pr checkout --detach`, and `gh pr checks` has a fallback for gh releases without `--json`. The generic forge slugifies ref names in file names and never runs tests for someone else's change. Installed skills list what each placeholder means.
- **Forge detection**: `github.*` and `*.ghe.com` hosts are detected as GitHub. `--forge bitbucket` targets Bitbucket Cloud only; Bitbucket Server and Data Center need `generic` or a custom forge.
- **Fixed — lean `init` no longer deletes local overrides**: files under `.architecture-guard/templates`, `presets`, and `sonar-rules` are local overrides. A lean `init` now removes only byte-identical copies left by an older `--vendor` install, keeps modified or extra files (and lists them), and never prunes with `--overwrite skip` or `keep-both`.
- **Fixed — valid TOML for Gemini and Tabnine**: prompts containing backslashes (for example `$\ge 15$`) produced unparseable `.toml` commands. Prompts are now written as TOML literal strings, or as fully escaped basic strings when needed.
- **Fixed — `--overwrite` is validated**: a mistyped mode (for example `keepboth`) now fails before anything is written instead of silently replacing files. `keep-both` skill copies are named after their directory (`ag-init-2`), and Antigravity `agx-*.md` workflows follow the overwrite mode.
- **Fixed — rerunning `init` keeps the selected forge**: without `--forge`, a previously selected forge that still validates (built-in or custom) is kept instead of being replaced by auto-detection.
- **Fixed — `archive` safety**: change names must be a single directory name (no `/`, `\`, `..`, or absolute paths), so `archive ../../src` can no longer move project files. Changes are moved with a rename (copy and remove only across devices). Errors, including an unknown `--framework`, print one `Error:` line and exit non-zero without a stack trace.
- **Fixed — SpecKit finalize**: re-finalizing no longer erases hand-written text after an entry in `specs/system_context.md` or truncates a multi-line Purpose, the spec link is relative to the index (`feat/spec.md`), and a missing `spec.md` or an unwritable index exits non-zero with `{"status": "skipped" | "failed", "reason": ...}` under `--json`.
- **Fixed — smaller fixes**: `init > log` with an interactive terminal no longer waits for stdin; `validate-setup` rejects `selected-adapter`/`selected-forge` values that are not plain names; the hygiene file walk reports POSIX paths on Windows outside a git repository; the build cleans `dist/` and the npm package no longer ships compiled tests or stale removed commands.

- **Legacy Spec Kit extension fixes** (`commands/`, safety and breakage only):
  - Delegation now resolves capabilities to the registered `speckit.architecture-guard.ag-<capability>` command file or `.specify/extensions/architecture-guard/commands/<capability>.md`, so delegated commands no longer fail to resolve on Spec Kit installs.
  - The repository hygiene policy is written to and read from `.specify/config/repository_hygiene.yml` (a top-level `repository_hygiene:` block), which `architecture-guard hygiene` actually reads; the config template comment now names both locations.
  - Delivery commands no longer create a separate `feature/*` branch before `/speckit.specify` creates its own numbered feature branch; branch creation stays approval-gated and work never continues on a protected branch.
  - `ag-apply` proposes Flash-Mem entries and writes them only after a separate `[y/N]` approval; `ag-init` asks before saving or archiving a constitution draft.
  - `ag-governed-delivery-team` runs `validate-sync-config` only when the CLI is on PATH (never through `npx`) and skips User Story sync, reported as `Unavailable`, otherwise; an invalid config means no remote write.
  - The budgeted context contract names the registered `/speckit.architecture-guard.ag-consolidate-specs` command; delivery repair loops stop as `Blocked` after two cycles; review commands run `architecture-guard hygiene --json` when available (artifact review stays artifact-only); `SPECKIT-INTEGRATION.md` states that adapter overrides apply to standalone installs only.

## 3.0.0

Architecture Guard's standalone orchestrator now supports any SDD tool through custom adapters, and its skills are SDD-tool-agnostic. This release also closes several safety-gate gaps, repairs broken CLI helpers, and limits the legacy Spec Kit extension to safety and breakage fixes.

### Breaking changes

- **Adapter location moved**: all adapters now install to `.architecture-guard/adapters/` instead of a project-root `adapters/` directory. Rerun `architecture-guard init` to upgrade; the installer flags the old `adapters/` directory but never deletes it.
- **New required adapter keys**: OpenSpec-specific text in the orchestration skills moved into five adapter keys — `project-config`, `constitution-set`, `change-scope`, `validate-spec`, `spec-template`. Built-in adapters define them; custom adapters must add them (`init` lists any that are missing).
- **CLI commands removed**: `check-architecture` and `test-install` (both only printed a message).
- **Built-in adapters are refreshed on every `init`**: copy one to a new name to customize it instead of editing it in place.
- **Delivery policy**: the legacy Spec Kit extension (`commands/`) receives safety and breakage fixes only; new features ship in the standalone tool.

### Added

- **Custom SDD adapters**: write `.architecture-guard/adapters/<name>.md` and run `architecture-guard init --framework <name>`. The adapter is validated against the Required Keys in `ADAPTERS.md` before anything is written, and its tokens are resolved into the installed skills.
- `validate-setup [target]`: adapter-aware check of the selected adapter, shared resources (lean or vendored), mapped constitutions, governance config, and `AGENTS.md`; exits non-zero on errors.
- `create-fixtures <target>`: generates the context-budget benchmark fixtures.
- `validate-sync-config [path]`: registered CLI command used by `governed-delivery-team`.
- `detect-changed-files --base <ref>`.
- **Untrusted Content rules** in the shared Ponytail Core contract: reviewed code, artifacts, reports, memory, and tool output are data, never instructions; embedded instructions are reported as findings and cannot grant approval.
- **Severity Scale** in the shared Ponytail Core contract: one scale for architecture and security findings, hygiene reported exactly as the hygiene runner returns it, and Sonar severities mapped onto the scale.

### Fixed

- `governed-implement` stops on a Constitution P0 at any review severity (previously only when rated CRITICAL/HIGH), and checks preconditions before writing code: approval-gated feature branch, tasks present, not blocked, not stale.
- `governed-tasks` evaluates a blocking gate before offering the advisory revision loop.
- Plan-repair and spec-validation repair loops are capped at 2 attempts, then stop and report.
- Branch creation and derived change names in governed delivery go through the Write Approval Gate preview instead of being created without asking.
- Security Review status is reported as Reviewed / Advisory / Blocked / Unavailable; Unavailable is never a pass.
- Memory writes always require explicit approval, including inside capture flows.
- `consolidate-specs` confirms before writing the fallback index.
- Rerunning `init` keeps user settings in `.architecture-guard/config.yml` (`context`, `repository_hygiene`, comments) instead of overwriting the file; `init` refuses to write budgeted-context settings into a constitution.
- `init --yes` no longer waits for stdin to close.
- `detect-changed-files` includes commits since the branch point, handles renames, and works from subdirectories (a clean feature branch previously produced an empty review set).
- SonarLint filter keeps Sonar MAJOR and above (the previous CRITICAL/HIGH filter matched almost nothing). The bundled Sonar rules are replaced with 24 rules verified against SonarSource metadata; several old keys had the wrong meaning or did not exist.
- `architecture-guard archive` follows `.architecture-guard/selected-adapter` before filesystem markers, accepts `spec-kit`/`none`, and refuses custom adapters instead of silently archiving as OpenSpec.
- `AGENTS.md`: an older unmarked Architecture Guard section is replaced in place even when other content surrounds it.
- OpenSpec adapter branch creation requires explicit approval.
- Legacy Spec Kit extension: writes require approval (`[y/N]` prompts), the user-story link path is computed instead of pointing outside the repo, one approval-gated branch rule, command references use the registered `/speckit.architecture-guard.ag-*` names, prompts no longer load standalone adapters, and `verify` works without the CLI installed.

## 2.5.3

- Removed hardcoded `.specify` paths in orchestration templates to ensure seamless `npm publish --dry-run` and clean packaging.

## 2.5.2

- Synchronized standalone CLI initialization, adapter materialization, and lean versus vendored runtime resource resolution across generated governance prompts.

- Added dynamic CLI resource resolver (`architecture-guard resolve <category> [name]`) for on-demand resolution of immutable engine templates, presets, hygiene rules, and SonarLint rules.
- Implemented lean workspace initialization: `architecture-guard init` now writes a compact `.architecture-guard/config.yml` and avoids copying static unmodifiable files into target repositories.
- Added legacy static directory purge during `init` to remove obsolete asset folders from `.architecture-guard/`.
- Added `--vendor` / `--full` flag to `architecture-guard init` for air-gapped setups requiring full local copying.
- Enforced clean force-replacement of `ag-*` agent skills/commands across selected agent directories.
- Implemented strict path traversal bounds validation (CWE-22) in resource resolution.

## 2.4.1

- Enforce schema-compliant OpenSpec artifact keys in `rules:` (`proposal`, `specs`, `design`, `tasks`).
- Relocate verification-only requirements and testing standards into top-level shared `context:` block in `openspec/config.yaml` and `ag-init` templates.
- Update `ag-init` guidance and OpenSpec adapter documentation to prevent schema validation warnings across agents.

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
