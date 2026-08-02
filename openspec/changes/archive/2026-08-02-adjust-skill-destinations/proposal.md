## Why

The current skill installation paths need to be updated to match the correct Antigravity (agy) skill locations across different scopes (workspace, global, and shared). This ensures skills are generated in the correct locations where the agent can actually discover and load them.

## What Changes

- Modify skill generation and installation logic to target the correct paths based on scope:
  - Workspace scope: `.agents/skills/{skill_name}/SKILL.md` (Default if path is defined)
  - Global scope: `~/.gemini/antigravity-cli/skills/{skill_name}/SKILL.md` (Default if no path is defined, requires confirmation and permissions)
  - Shared scope: `~/.gemini/skills/{skill_name}/SKILL.md`
- Remove outdated Codex agent references if they are no longer applicable or adjust them as needed.
- Implement batch overwrite confirmation: if multiple skills already exist, ask for confirmation to replace them once rather than prompting per-skill.
- Implement dual-installation pattern for Antigravity: Generate both a Skill (`ag-` prefix) and a Workflow slash command (`agx-` prefix) simultaneously from the same source command.

## Capabilities

### New Capabilities
- `skill-generation`: New capability defining the rules and paths for generating new skills across workspace, global, and shared scopes.
- `workflow-generation`: New capability defining the rules for generating companion slash command workflows alongside skills.

### Modified Capabilities
- `interactive-installer`: Modify "Skill Installation Paths for Agents" requirement to align with the new workspace, global, and shared path structures for Antigravity.

## Impact

- Impacts the `init` or `new skill` commands in `src/commands/` and their respective orchestration logic.
- Affects how skills are created or installed, ensuring compatibility with current Antigravity configuration paths.
