# Tasks: Streamline CLI Init Workflow

## Phase 1: Streamline CLI Init Implementation
- [x] 1.1 Implement framework auto-detection in `src/cli/install.ts`:
  - Detect `openspec` vs `spec-kit` when only one marker exists in `targetDir`.
  - Prompt user only if ambiguous (both present or neither present) and `--framework` is not provided.
- [x] 1.2 Default to installing all governance commands in `src/cli/install.ts` without prompting when `--commands` is omitted.
- [x] 1.3 Update overwrite behavior in `src/cli/install.ts`:
  - Default overwrite to `'replace'` for skills, commands, and `.architecture-guard/` runtime resources.
  - Eliminate interactive confirmation prompts for overwriting files (`skip/replace/keep both` dialogs) while respecting explicit `--overwrite` flags.
- [x] 1.4 Default Antigravity installation scope to workspace (`.agent/skills` and `.agent/workflows`) without interactive prompt.
- [x] 1.5 Auto-update `AGENTS.md` with governance rules without interactive `(y/n)` prompt.

## Phase 2: Test Suite Adaptation & Validation
- [x] 2.1 Update `src/install.test.ts` to reflect the streamlined interactive flow (single-prompt agent selection when framework is detected, all commands installed by default).
- [x] 2.2 Add and verify test cases for:
  - Framework auto-detection on single marker (`openspec/config.yaml` vs `.specify/`).
  - Framework prompt on ambiguous or absent markers.
  - Default installation of all commands.
  - Automatic overwrite/replace of existing files.
  - Flag overrides: `--commands`, `--framework`, `--overwrite skip`, `--overwrite keep-both`, `--yes`.
- [x] 2.3 Run full test suite (`npm test`) and lint checks.

