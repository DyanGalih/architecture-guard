## Context

The interactive installer currently places Antigravity and Codex skills into directories containing an 's' (`.agents` instead of `.agent`) and fails to put the skill content into a `SKILL.md` file within a skill-named directory. This breaks the standard conventions expected by these AI agents for skill discovery.

## Goals / Non-Goals

**Goals:**
- Update `src/install.js` to construct the correct target paths for Antigravity: `.agent/skills/<skill-name>/SKILL.md`
- Update `src/install.js` to construct the correct target paths for Codex: `.codex/skills/<skill-name>/SKILL.md`

**Non-Goals:**
- We are not changing the content or generation logic of the skills themselves, just the file paths where they are saved during initialization.

## Decisions

- We will modify the path generation strings in `src/install.js`.
- If a skill named `governed-spec` is chosen, the resulting file for Antigravity will be `.agent/skills/governed-spec/SKILL.md`.

## Risks / Trade-offs

- **Risk:** Existing users who have run `init` with the old structure may have obsolete files in `.agents`.
- **Mitigation:** We are only fixing the paths for new installations. Users can delete the old `.agents` folder manually if needed.
