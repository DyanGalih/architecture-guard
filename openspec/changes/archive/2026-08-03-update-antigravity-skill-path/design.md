## Context

Currently, the installation scripts/commands in `src/` place the Architecture Guard skill files (like `ag-init-brownfield`) into a directory called `.agents/skills`. However, Google Antigravity looks for project-specific skills strictly in `.agent/skills` (singular). This mismatch prevents the slash commands from automatically populating in the user's Antigravity environment.

## Goals / Non-Goals

**Goals:**
- Update all occurrences of `.agents/skills` to `.agent/skills` within the installation logic.
- Ensure that newly installed skills seamlessly appear in Google Antigravity without requiring manual directory renaming.

**Non-Goals:**
- No changes to the actual skill command execution logic or orchestration.
- We will not automatically rename existing `.agents` folders in existing user projects (users can do this manually).

## Decisions

- **Direct String Replacement in Installer:** We will search for `.agents/skills` in the `src/` directory (where the installer and scripts live) and replace it with `.agent/skills`.
- **Reasoning:** The installation process itself is likely just performing file copies using paths. By correcting the paths at the source, all future installations will behave correctly without adding extra complexity or migration code.

## Risks / Trade-offs

- **[Risk]** Existing users might reinstall and get a duplicate `.agent/skills` directory alongside their old `.agents/skills`. 
  → **Mitigation:** The old `.agents/skills` is ignored by Antigravity anyway, so they won't get duplicate commands in the UI. It's a harmless duplicate artifact.
