## 1. Setup and Scaffolding

- [x] 1.1 Add CLI parsing library (e.g., commander) to `src/package.json` if not already present
- [x] 1.2 Create the main entrypoint file `src/bin/cli.ts` (or equivalent) for the new application
- [x] 1.3 Update `package.json` `bin` field to point to the new CLI entrypoint

## 2. Command Migration

- [x] 2.1 Migrate functionality of `src/install.js` to `src/commands/install.ts`
- [x] 2.2 Identify all existing `.sh` and `.ps1` scripts in `src/scripts/` (and any other relevant directories)
- [x] 2.3 Port each identified shell script's logic into dedicated TypeScript modules under `src/commands/`
- [x] 2.4 Wire up each new TypeScript command to the main CLI entrypoint parser in `src/bin/cli.ts`

## 3. Cleanup and Integration

- [x] 3.1 Delete the old `install.js` script
- [x] 3.2 Delete all migrated `.sh` and `.ps1` scripts from the repository
- [x] 3.3 Test the compiled CLI application locally (e.g., using `npm link` or similar) to ensure all commands function across platforms (or at least within the primary dev environment)
- [x] 3.4 Update any internal documentation or GitHub Actions workflows that previously invoked the shell scripts directly
