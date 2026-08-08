## 1. Command Foundation

- [x] 1.1 Create `src/orchestration/governed-archive.md` file.
- [x] 1.2 Setup the standard Architecture Guard preamble to detect and load the active SDD adapter.

## 2. Archive Operations

- [x] 2.1 Implement logic to check the active adapter and trigger `openspec archive` for OpenSpec projects.
- [x] 2.2 Implement logic to check the active adapter and trigger `architecture-verify` and `consolidate-specs` for SpecKit projects.

## 3. Automations

- [x] 3.1 Implement Changelog generation logic that parses the feature's purpose/specs and appends to `CHANGELOG.md`.
- [x] 3.2 Implement the interactive Git prompt (Commit, Push, PR) with auto-generated messages.
- [x] 3.3 Implement a check for the `flash-mem` MCP server and, if available, extract lessons learned from the `design.md`.
- [x] 3.4 Implement the final workspace cleanup step to prompt the user, check out `main`, and delete the local feature branch.
