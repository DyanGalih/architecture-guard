---
status: approved
---

# User Story: ag-init-sync-workflow

## Business Objective
Close the integration gap in the Team Development initialization flow by ensuring that `.architecture-guard/sync.yml` is automatically generated when an issue tracker is selected. This removes manual configuration friction and ensures that subsequent `ag-governed-delivery-team` workflows can successfully sync new stories to external issue trackers.

## User Stories
- **As a team lead setting up Architecture Guard**, I want `/ag-init` to interactively prompt me for my specific issue tracker configuration (like the GitHub repo name) if I select a tracker, so that my team's sync capabilities work out-of-the-box without manual file editing.

## Acceptance Criteria
1. When `/ag-init` is run and the user selects "Team Development" followed by an issue tracker (e.g., `github-mcp-server`), the command MUST execute a sub-interview to capture required configuration (e.g., repository string `owner/repo`, default labels).
2. The command MUST output a fully functional `.architecture-guard/sync.yml` file based on those answers.
3. The generated file MUST NOT use empty placeholders that would cause sync failures.

## Business Rules
- The sub-interview only triggers if a valid issue tracker is selected during the Team Development path.
- Configuration defaults (like `enabled: true`) should be intelligently assumed to minimize friction.

## Out of Scope Items
- We are not implementing the actual push mechanism here; that already exists in `ag-governed-delivery-team`. This is strictly about initialization setup.

## Assumptions
- The user knows their GitHub repository location when running `/ag-init`.

## Risks
- Minor risk of user abandonment if the init interview becomes too long. The questions should be concise.

## Open Questions
- What are the exact YAML fields needed by `validate-sync-config.ts`? (This must be checked during the technical planning phase).
