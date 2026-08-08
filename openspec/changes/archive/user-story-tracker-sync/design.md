## Context
The `ag-governed-delivery-team` workflow currently halts after a User Story is approved. We need to implement a one-way sync to push the approved User Story to an external project management tool (like GitHub Issues or Jira). This respects the YAGNI and minimalist principles in our architecture by keeping integrations simple and configurable via `.architecture-guard/sync.yml`.

## Goals / Non-Goals

**Goals:**
- Implement a one-way push of approved User Stories to an external tracker.
- Store configuration in `.architecture-guard/sync.yml`.
- Record a `sync_status` or external reference ID locally.
- Handle failures gracefully without blocking local delivery workflows.

**Non-Goals:**
- Two-way sync (polling or webhooks).
- Blocking the workflow on network failure.
- Embedding complex SDK dependencies inside the core tool (rely on MCP server or standard CLI commands where possible).

## Decisions
- **One-Way Push**: We will only create the issue initially. Rationale: YAGNI. Two-way sync adds massive complexity.
- **Config Storage**: `.architecture-guard/sync.yml`. Rationale: Keeps sync config decoupled from core `openspec/config.yaml`.
- **Config Validation**: The loaded YAML configuration must be strictly validated as untrusted input (e.g., using a schema validator) to prevent crashes or malicious overrides. Rationale: Mandatory Security Constitution rule.
- **Graceful Failure**: If sync fails, we log a warning and write `sync_status: failed`. Rationale: Network issues should not block local development.

## Risks / Trade-offs
- **Risk**: Users might want updates to flow both ways. **Mitigation**: Document that it is a one-way sync and provide a manual CLI command to retry or force push updates.
