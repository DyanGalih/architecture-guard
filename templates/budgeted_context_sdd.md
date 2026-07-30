# Budgeted Architecture Context Contract

Use `{adapter_path:governance-config}` when present. Missing, malformed, or unknown values preserve targeted, Flash-Mem-first behavior and produce a warning rather than blocking the workflow.

When `context.mode` is `budgeted`, load context in this order:

1. Read the active artifacts required by the current command and all applicable constitution files. These artifacts remain authoritative and MUST NOT be replaced by memory or fallback context.
2. When Flash-Mem is available, call `get_project_summary`, then call `search_memory` using the active work, affected components, architecture terms, security-sensitive areas, prior decisions, approved exceptions, and related files. Request summaries and metadata first, use at most `initial_result_limit` results (default `5`), and load full content for at most `full_entry_limit` entries (default `3`) unless a named unresolved conflict requires more. Reuse this synthesis throughout the workflow.
3. Treat Flash-Mem as sufficient only when it identifies the applicable constraints, decisions, accepted exceptions, and cross-feature dependencies without unresolved conflicts. Do not load the local fallback merely because budgeted mode is enabled.
4. Load `{adapter_path:fallback-spec-index}` only when the adapter supports it and Flash-Mem is unavailable, irrelevant, incomplete, low-confidence, conflicting, or cannot identify a referenced source. If unsupported, use `{adapter_command:list-specs}` without writing an index.
5. Treat a file fallback as stale when a current `{adapter_path:spec}` source is absent from its manifest, a listed source is missing, a source is newer than the generated file, contents conflict with current artifacts, or freshness cannot be established. With `stale_policy: regenerate`, execute `{adapter_command:consolidate-specs}`. With `stale_policy: targeted`, skip the stale index and open only sources needed for named gaps.
6. If a named gap remains, open only the historical specs referenced by the index or directly relevant to that gap. Record the gap that justified every expansion. Never traverse all historical specs by default.

In targeted mode, preserve the command's existing Flash-Mem-first behavior without imposing retrieval limits or requiring a fallback index.

Every governed summary MUST include:

```markdown
## Context Expansion
- **Fallback Loaded**: [Yes / No]
- **Historical Sources Opened**: [None or `path — named gap` entries]
```
