# Technical Design: Streamline CLI Init Workflow

## Overview
This design updates `src/cli/install.ts` (and its compiled output/tests) to eliminate unnecessary interactive prompts during `architecture-guard init`. By streamlining default choices (auto-framework detection, installing all commands, automatic file replacement, local workspace Antigravity scoping, and auto-updating `AGENTS.md`), users experience an immediate, zero-friction setup right after selecting their AI agent(s).

## Implementation Details

### 1. Framework Auto-Detection (`runInit` in `src/cli/install.ts`)
- Inspect target directory:
  - Check `hasOpenspec = fs.existsSync(path.join(targetDir, 'openspec', 'config.yaml'))` (or `openspec` dir).
  - Check `hasSpeckit = fs.existsSync(path.join(targetDir, '.specify'))`.
- If only `hasOpenspec` is true: auto-select `openspec`.
- If only `hasSpeckit` is true: auto-select `spec-kit`.
- If both or neither exist (and `--framework` was not supplied): prompt the user via `ask('\nSelect SDD framework:', frameworks, false)`.
- If `--framework` is explicitly passed: honor the user's flag.

### 2. Default All Commands Without Prompting
- If `opts.commands` is provided: filter and install the specified commands.
- If `opts.commands` is omitted: default directly to `[...COMMANDS]` without showing the interactive commands checkbox prompt.

### 3. Automatic Replace / Overwrite Behavior
- In `runInit` and `installCommand`:
  - When `--overwrite` is not passed (`null`/`undefined`), default overwrite behavior to `'replace'`.
  - Remove interactive prompts asking:
    - `"Some files already exist for <agent>. What would you like to do for all of them?"`
    - `"  <path> exists: skip / replace / keep both"`
  - If the user explicitly passes `--overwrite skip` or `--overwrite keep-both`, honor that behavior without prompting.
- In `installRuntimeResources`:
  - Default action to `'replace'` without asking `"Runtime resources exist: skip / replace"`, unless `--overwrite skip` was explicitly provided.

### 4. Antigravity Scope Default
- For `antigravity` agent when no target path is supplied:
  - Default `agyScope` to `'workspace'` (`.agent/skills` and `.agent/workflows`) without showing the interactive scope selection prompt.

### 5. Automatic `AGENTS.md` Update
- Automatically call `appendAgentsMd(targetDir, selectedAgents)` without prompting `"Append governance rules to AGENTS.md? (y/n)"`.

### 6. Test Suite Adaptation (`src/install.test.ts`)
- Update mock interactive prompt inputs in `src/install.test.ts` (since fewer piped answers are required for interactive runs).
- Add tests verifying:
  - Framework auto-detection when only one marker is present.
  - Framework prompt fallback when markers are ambiguous or absent.
  - All commands installed by default without prompting.
  - Automatic overwrite/replace of existing files.
  - Explicit `--overwrite skip`, `--overwrite keep-both`, `--commands`, and `--framework` flags continue to work as expected.

## Verification Plan
- Run `npm test` to verify all test suites pass.
- Run `npm run prepublishOnly` to verify linting and clean builds.
