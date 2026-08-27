## Architecture Guard

Use these governance rules across all SDD workflow phases.
Read the installed governance commands or skills at:
- `.agent/skills/*`

- **Ponytail Core Contract**: Before spec/plan/tasks/implement, read and apply the ponytail pragmatism contract.
- **After each phase**: Run architecture review for boundary drift, DRY violations, and repository hygiene.
- **SDD Adapter Resolution**: Project uses the adapter selected during CLI init. Read `adapters/resolve.md` before first command.
- **Direct Discovery Guard**: When checking adapter-resolved hidden paths such as `.architecture-guard/**`, use direct directory inspection first, then read listed files. A Glob no-match result is inconclusive and MUST NOT be reported as missing. Report a path as unavailable only after direct inspection confirms it does not exist. Always include loaded rule files and counts in governance reports.
