<!-- flash-mem-protocol-start v8 -->
# flash-mem

## Goal
Keep durable project memory current and easy to retrieve.

## Rules
- Treat flash-mem as the source of truth for durable project memory.
- Search first: read `get_project_summary` and `search_memory` before planning, drafting, or changing code.
- Prefer summaries, metadata, tags, confidence, and related files before loading full memory content.
- Store only durable knowledge: decisions, conventions, constraints, bugs, workflows.
- Use `update_memory` when refining an existing memory; use `add_memory` for genuinely new durable facts.
- Attach relationships when a memory depends on or explains another memory.
- Write immediately: use `add_memory` for new durable facts and `update_memory` for changes.
- If flash-mem retrieval is empty or incomplete, inspect the markdown file and do not skip `capture_artifact_memory`; if it contains durable knowledge, capture it before treating it as current context.
- If `capture_artifact_memory` still returns nothing useful, keep the markdown file as the backup artifact.
- Update summaries when architecture or shared conventions change.
- Prefer explicit deletion with audit trail.

## Memory Quality
- Capture validated outcomes and stable constraints, not transient status updates.
- Include confidence-aware summaries; avoid low-confidence assertions unless clearly marked for verification.
- Keep entries scoped and deduplicated: one durable concept per memory.
- Never store secrets, credentials, tokens, or private keys in memory content.

## Tools
- Read: `get_project_summary`, `search_memory`, `get_relevant_context`
- Write: `add_memory`, `update_memory`, `delete_memory`
- Maintain: `capture_artifact_memory`, `export_markdown`

## Workflow
1. Read summary.
2. Search memory.
3. Load full memory only when the summary is not enough.
4. Add or update durable memory.
5. Update summary when needed.

## Workflow By Intent
- Planning: read summary, search relevant memories, then constrain plans to validated decisions and conventions.
- Implementation: consult related memories first; record only validated architecture or behavior changes.
- Incident/Fix: capture root cause, fix pattern, and prevention guidance as durable memory.

## Maintenance
- Prefer `capture_artifact_memory` for markdown file changes and new markdown artifacts when the file contains durable knowledge, and never skip capture just because the file already exists.
- Keep the markdown file as the backup artifact only when capture returns nothing useful.
- Use `rebuild_index` only when you need a rare full markdown rescan.

## Do Not
- Do not write duplicate synthesis snapshots as separate durable memories.
- Do not dump broad low-confidence notes without verification markers.
- Do not overwrite unrelated memory content when a targeted update is sufficient.

Use `flash-mem update` to refresh this block if it changes.
<!-- flash-mem-protocol-end -->

## Architecture Guard

Use these governance rules across all SDD workflow phases.
Read the installed governance commands or skills at:
- `.agent/skills/*`
- `.opencode/commands/*`

- **Ponytail Core Contract**: Before spec/plan/tasks/implement, read and apply the ponytail pragmatism contract.
- **After each phase**: Run architecture review for boundary drift, DRY violations, and repository hygiene.
- **Framework detection**: Project uses auto-detected SDD framework. Read `adapters/detect.md` before first command.
