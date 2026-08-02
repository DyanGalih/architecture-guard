## 1. Preparation

- [x] 1.1 Verify current skill names and their generation points in `src/` (e.g., `install.js`, templates).

## 2. Implementation

- [x] 2.1 Update `install.js` to ensure the target skill installation directories use the `ag-` prefix.
- [x] 2.2 Update the skill templates in `src/templates` or equivalent location to use the new names in their markdown contents.
- [x] 2.3 Modify the CLI command mappings in `src/commands/` if they reference specific skill identifiers, changing them to expect the prefixed names.

## 3. Verification

- [x] 3.1 Run local installer tests to ensure skills are properly generated into `.agent/skills/ag-<skill>` and `.codex/skills/ag-<skill>`.
- [x] 3.2 Verify that the generated `SKILL.md` files internally refer to the `ag-` prefixed commands correctly.
