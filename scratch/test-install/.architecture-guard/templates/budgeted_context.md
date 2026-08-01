# Budgeted Architecture Context Contract

Use `.specify/config/architecture_guard.yml` when present. Missing, malformed, or unknown values preserve the existing targeted, Flash-Mem-first behavior and must produce a warning rather than blocking the workflow.

When `context.mode` is `budgeted`, load context in this order:

1. Read the active feature artifacts required by the current command and all applicable constitution files. These artifacts remain authoritative and MUST NOT be replaced by memory or fallback context.
2. When Flash-Mem is available, call `get_project_summary`, then call `search_memory` using the active feature, affected components, architecture terms, security-sensitive areas, prior decisions, approved exceptions, and related files. Request summaries and metadata first, use at most `initial_result_limit` results (default `5`), and load full content for at most `full_entry_limit` entries (default `3`) unless a named unresolved conflict requires more. Reuse this synthesis throughout the workflow.
3. Treat Flash-Mem as sufficient only when it identifies the applicable constraints, decisions, accepted exceptions, and cross-feature dependencies without unresolved conflicts. Do not load the local fallback merely because budgeted mode is enabled.
4. Load `fallback_file` (default `specs/system_context.md`) only when Flash-Mem is unavailable, returns no relevant context, is incomplete or low-confidence, conflicts with active work, or cannot identify a referenced source.
5. Treat the fallback as stale when a current `specs/**/spec.md` source is absent from its manifest, a listed source is missing, a source is newer than the generated file, its contents materially conflict with current artifacts, or freshness cannot be established confidently. With `stale_policy: regenerate`, execute `/speckit.architecture-guard.consolidate-specs` before use. With `stale_policy: targeted`, skip the stale index and open only sources needed for named gaps.
6. If a named gap remains, open only the historical specs referenced by the index or directly relevant to that gap. Record the gap that justified every expansion. Never traverse all historical specs by default.

In targeted mode, preserve the command's existing Flash-Mem-first behavior without imposing retrieval limits or requiring `system_context.md`.

Every governed summary MUST include:

```markdown
## Context Expansion
- **Fallback Loaded**: [Yes / No]
- **Historical Sources Opened**: [None or `path — named gap` entries]
```
