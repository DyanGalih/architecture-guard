# Plan

## Objective
Enhance the `architecture-guard init` CLI command to automatically detect and prioritize installed AI agents based on the presence of their configuration directories in the target workspace.

## Architecture
- Modify `src/cli/install.ts` to iterate over `AGENT_CONFIGS`.
- Use `fs.existsSync` to check if `AGENT_CONFIGS[agentName].dir` exists in the target directory.
- Move detected agents to the top of the prompt list and mark them as `checked: true`.
- Sort detected agents alphabetically.
- Sort undetected agents alphabetically underneath.

## Security
- No new security dependencies; relies on local `fs` read access which the CLI already requires.

## Migration
- Fully backward compatible. No breaking changes.
