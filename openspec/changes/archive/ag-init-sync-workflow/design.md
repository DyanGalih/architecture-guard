# Plan

## Objective
Update the `init` workflow to scaffold `.architecture-guard/sync.yml` when a team issue tracker is selected.

## Architecture
- Modify the existing interactive init prompt files (`src/commands/init.md` and `src/orchestration/init.md`).
- Add an instruction to scaffold the YAML file natively via the orchestrator agent, adhering to Ponytail pragmatism (YAGNI).

## Security
- No new external inputs or executing logic introduced.

## Migration
- No backward compatibility issues. Existing projects remain unaffected until re-initialized.
