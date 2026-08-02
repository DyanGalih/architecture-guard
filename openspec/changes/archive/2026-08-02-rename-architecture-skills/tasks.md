## 1. Rename Internal Directories and Templates

- [x] 1.1 Find and rename all template or skill directories in `src/commands/` from `ag-architecture-*` (or `architecture-*`) to their respective shorter names (`ag-*` or the suffix).
- [x] 1.2 Find and rename any default `.agent/skills/` internal templates if they exist in the repository tree.

## 2. Update Generator and Tests

- [x] 2.1 Update `src/install.js` string interpolations and logic to use `ag-${sk}` where `sk` is the suffix (e.g. `review` instead of `architecture-review`). Wait, if `sk` is already `review`, ensure it's not prefixed with `architecture-` anywhere. Just remove any explicit `ag-architecture-` strings.
- [x] 2.2 Update `src/install.test.js` assertions to check for the new names instead of the old verbose ones.

## 3. Update Documentation and Validate

- [x] 3.1 Update `AGENTS.md` and any READMEs referencing `ag-architecture-` commands to use `ag-`.
- [x] 3.2 Run `cd src && npm test` and ensure all tests pass with the updated naming conventions.
