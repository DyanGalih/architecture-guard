# Change: Streamline CLI Init Workflow

## Why
The interactive `architecture-guard init` command currently requires multiple interactive confirmation prompts after agent selection: framework selection (even when workspace markers exist), command selection (even though nearly all users install all commands), batch overwrite confirmation prompts, runtime resource prompts, Antigravity scope prompts, and `AGENTS.md` update confirmation prompts. This causes significant prompt fatigue and slows down onboarding.

## What Changes
1. **Single SDD Tool Auto-detection**: Automatically detect and select `openspec` (if `openspec/config.yaml` exists) or `spec-kit` (if `.specify/` exists) when only one marker exists. Only prompt if ambiguous (both or neither exist) and `--framework` was not specified.
2. **Default All Commands**: Automatically select all governance commands without prompting unless `--commands` is explicitly passed.
3. **Auto-Replace Overwrite**: Automatically overwrite existing skills and `.architecture-guard/` runtime resources by default without asking for interactive confirmation, while preserving `--overwrite skip` and `--overwrite keep-both` flag overrides.
4. **Antigravity Scope Default**: Default Antigravity installation directly to workspace (`.agent/skills` and `.agent/workflows`) without prompting.
5. **Auto-Update `AGENTS.md`**: Automatically append or update governance rules in `AGENTS.md` without an interactive `(y/n)` prompt.
6. **Preserve CLI Flags**: Maintain full support for `--framework`, `--commands`, `--overwrite`, `--agent`, and `--yes` CLI flags.
7. **Test Suite Updates**: Update `src/install.test.ts` to reflect the streamlined interactive flow and verify that flag overrides continue to function.

## Impact
- Significantly faster onboarding experience with minimal clicks/keystrokes.
- Backward compatibility preserved for automated scripts and CI pipelines.
