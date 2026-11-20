# Performance Review Contract

Shared rules for performance analysis in reviews, planning, and verification. Ponytail Core applies: performance work must answer a declared constraint or concrete evidence, never speculation.

## Declared Constraints

1. Read the `Performance Constraints` section of the authoritative architecture constitution, or the equivalent section the selected adapter's constitution layout names. Each entry is a constraint, for example a latency target, a page-size limit, an expected data volume, a caching rule, or an operation that must stay off the request path.
2. If no section exists or it says `Not applicable`, report `Performance constraints: none declared`. General performance concerns are then advisory only (never blocking, and never invent targets on the project's behalf), while concrete crash, OOM, or unbounded stream-to-RAM resource-exhaustion defects remain actionable.
3. A change that breaks a declared constraint is a Constitution finding. Take severity and blocking status from the constitution; when it states neither, use HIGH and non-blocking.

## Checklist by Focus

Always apply `general`, then the selected `focus` (`db`, `api`, or `async`). When running in default `mode=architecture` (rather than dedicated `mode=performance`), apply `general` always and apply `db`, `api`, or `async` items only when the changed files touch those boundaries. Also apply every adapter-resolved preset rule tagged `[Focus: <focus>]`.

- **general**: I/O, queries, or remote calls repeated per item inside a loop; unbounded collections loaded into memory; full-file stream-to-RAM buffering of unbounded files or exports (such as reading a generated export into a memory string before upload instead of streaming a handle); nested scans over growing input where a lookup map would do; expensive work the change recomputes on every call; payload or bundle size the change adds.
- **db**: N+1 queries (lazy relation access inside a loop); reads without a limit or pagination; filters, sorts, or joins on columns with no supporting index in the schema or migrations; loading whole rows or entities to read one field; writes in a loop instead of a batch; transactions held open across remote calls.
- **api**: list endpoints without a bounded page size; chatty contracts that force one call per item; response shapes that over-fetch; outbound calls without a timeout; caching rules the constitution requires but the change ignores.
- **async**: blocking I/O or CPU-heavy work on the request path or event loop; operations the constitution says must never block requests running synchronously; unbounded concurrency or fan-out; retries without backoff or idempotency; independent awaits run one after another.

## Actionable vs. Advisory Classification (Default Architecture Mode)

- **Declared `Performance Constraints` breach**: Constitution finding (severity and blocking status from the constitution, or `HIGH` non-blocking when unspecified).
- **Concrete crash, OOM, or unbounded stream-to-RAM resource exhaustion**: Actionable finding with a Refactor Task even when the Constitution declares no `Performance Constraints`, subject to the **Architecture ↔ Performance Conflict Gate** when the fix conflicts with an architectural boundary or Constitution rule.
- **Other concrete growth-driver improvements**: Advisory, non-blocking `### Performance Insights` only (no speculative caches, queues, or extra services).

## Artifact Reviews

When reviewing planning artifacts instead of code, check that the plan states how it meets each declared constraint that applies to the change, and flag planned designs that match a checklist item (for example a planned list endpoint with no page size).

## Evidence

- Cite `file:line` (or the artifact section) and the growth driver: what grows to make it slow (rows, items, users, payload).
- Static analysis is not measurement. Label findings `Static analysis; not measured` unless benchmark or profiling output was provided, and never claim a measured regression without it.
- State the trade-off of every suggestion, including invalidation and consistency costs for caching, denormalization, or parallelism.

## Ponytail Guard

Prefer the smallest fix: eager loading, a limit, an index, a batch, or moving work off the request path. Do not propose new caches, queues, or services unless a declared constraint cannot otherwise be met.
