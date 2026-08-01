## 1. Update Antigravity Agent Path

- [x] 1.1 Locate the path generation logic for Antigravity in `src/install.js`
- [x] 1.2 Modify the logic so it writes to `.agent/skills/<skill-name>/SKILL.md` (no 's' in `.agent` and places content in `SKILL.md`)

## 2. Update Codex Agent Path

- [x] 2.1 Locate the path generation logic for Codex in `src/install.js`
- [x] 2.2 Modify the logic so it writes to `.codex/skills/<skill-name>/SKILL.md` (places content in `SKILL.md` within a folder named after the skill)

## 3. Verify Changes

- [x] 3.1 Verify the updated paths correctly create `.agent` and `.codex` folders without errors during `init`
