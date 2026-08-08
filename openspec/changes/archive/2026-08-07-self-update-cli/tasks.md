## Implementation Tasks

- [x] 1.1 Create `src/cli/self-update.ts` to handle the core update logic (checking npm registry, comparing versions, running `npm install -g`).
- [x] 1.2 Modify `src/bin/cli.ts` to register the `update` (and `self-update` alias) command, acting as the entry point.
- [x] 2.1 Implement version checking by executing `npm view architecture-guard version` in the script.
- [x] 2.2 Parse current version (from runtime or `package.json`) and compare it to the retrieved latest version.
- [x] 2.3 If a newer version exists, spawn child process to execute `npm install -g architecture-guard@latest`.
- [x] 2.4 Output informative messages to the user ("Already up to date" or "Successfully updated to vX.Y.Z").
