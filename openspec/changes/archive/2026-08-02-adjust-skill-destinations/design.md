## Context

Currently, skill installation paths are geared towards older agent structures (like Codex) or incorrect Antigravity directories. The Antigravity (agy) agent uses specific directory structures for skills based on scope (workspace, global, and shared). We need to align the skill generation logic to place `SKILL.md` files in the correct locations for agy.

## Goals / Non-Goals

**Goals:**
- Update the skill creation logic to use the new standard agy paths for workspace, global, and shared scopes.
- Ensure the directories are created if they do not exist.
- Update any relevant documentation and specifications to reflect this change.

**Non-Goals:**
- Removing old skills from the file system.
- Completely removing codex-specific logic if it is still required by other tools (just correcting the agy destinations).

## Decisions

- **Decision 1: Path Structure**: The paths will be mapped as follows:
  - Workspace: `.agents/skills/{skill_name}/SKILL.md` (Note: `.agents` not `.agent`)
  - Global: `~/.gemini/antigravity-cli/skills/{skill_name}/SKILL.md`
  - Shared: `~/.gemini/skills/{skill_name}/SKILL.md`
  *Rationale*: These are the exact paths requested by the user and used by the Antigravity system.

- **Decision 2: Skill Prefixing**: The existing `ag-` prefixing rules from the `interactive-installer` should be preserved or updated if `skill_name` already implies it, but we will ensure the new directories are correctly structured.

- **Decision 3: Default Scopes and Permissions**: If the user provides a path, the skill is installed in the Workspace scope by default. If no path is provided, it defaults to Global installation, which requires displaying a confirmation prompt to the user and requesting necessary permissions before proceeding.

- **Decision 4: Batch Overwrite Prompting**: When generating multiple skills, the system will check for existing skills upfront. If any exist, the user will be prompted once for overwrite confirmation, applying that decision to all existing skills being generated, rather than prompting individually.

- **Decision 5: Dual Installation for Antigravity**: For the `antigravity` agent target, the installer will simultaneously write two outputs for each command:
  1. A Skill definition at `.agents/skills/ag-<name>/SKILL.md` (to be used by autonomous agents)
  2. A Workflow file at `.agent/workflows/agx-<name>.md` (to act as an interactive slash command for users)

## Risks / Trade-offs

- **Risk**: Existing users might expect skills in the old `.agent/skills/ag-<skill>` location.
  - **Mitigation**: This is an internal configuration correction. If the CLI command was previously creating skills in an unused directory, this fixes it so they are discovered correctly.
