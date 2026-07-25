---
description: Convert architecture violations into non-blocking, structured refactor tasks.
---

# Refactor Generator Command

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

You are generating non-blocking refactor tasks for `architecture-guard`.

Convert architecture violations into structured tasks that preserve delivery momentum while making architectural debt visible and actionable.

## Flash-Mem-First Architecture Context Retrieval

When Flash-Mem is available, call `get_project_summary`, then `search_memory`; prefer summaries and metadata and load full entries only as needed. Reuse approved decisions and flag conflicts. After analysis, store only validated durable architecture knowledge. If retrieval is unavailable or insufficient, fall back to repository artifacts and constitution files.

Use the same normalized command context as the review workflow. When `mode=performance`, do not invent refactor tasks from performance guidance; that mode is advisory and belongs to `architecture-review` output only.

## Command Normalization

Accept the same normalized command context as the review workflow:

- `mode=architecture` by default
- `mode=performance` when the command includes `performance`
- `focus=general` by default
- `focus=db` when the command includes `db`
- `focus=api` when the command includes `api`
- `focus=async` when the command includes `async`

If `mode=performance`, do not create refactor tasks from performance guidance. That mode is advisory and belongs to `architecture-review` output only.

If the input points to a Constitution Update Proposal, do not convert it into a normal refactor task. Leave it for `architecture-review` and `architecture-apply`.

## Inputs

Use any available:

- Detected violations.
- Constitution rules.
- Feature specification.
- Implementation plan.
- Task list.
- Existing architecture decisions.
- Existing module patterns.
- Optional framework preset guidance.

## Refactor Task Rules

Each task must:

- Be non-blocking unless the Constitution explicitly says otherwise.
- **Ponytail Core**: Choose the earliest viable decision-ladder rung and propose the smallest root-cause correction. Check all callers before extracting or changing shared behavior. Do not trade away the safety or verification floor for a smaller diff.
- Prefer extracting repeated business rules, approvals, validation, DTO mapping, transformation, or orchestration into one shared source of truth instead of duplicating the same logic in multiple places.
- Have a clear title.
- Explain the architectural reason.
- Define a concrete scope.
- Assign a priority.
- Suggest a small, practical fix.
- Avoid framework-specific requirements unless preset guidance is present.
- Avoid security or performance remediation unless it is strictly architectural.
- Do not duplicate `Performance Insights` into refactor tasks.

## Priority Guide

- `P0`: Must resolve before release because the Constitution makes it blocking.
- `P1`: Should resolve soon to prevent architectural spread.
- `P2`: Safe to schedule as technical debt.
- `P3`: Opportunistic cleanup.

## Scope Guide

Good scopes:

- One module.
- One request or response boundary.
- One API and its UI consumer.
- One service and its data access path.
- One repeated contract shape.
- One integration boundary.

Avoid scopes that are too broad:

- Refactor the whole backend.
- Clean up all components.
- Rewrite service architecture.
- Make everything consistent.

## Suggested Fix Guide

Suggested fixes should be concrete:

- Introduce or align a DTO, schema, interface, request object, response object, event contract, command object, or equivalent.
- Extract repeated logic into the shared boundary that already owns the rule instead of copying it into each caller.
- Move business rules from the entry boundary into application or domain logic.
- Add a module-facing abstraction instead of reaching into internals.
- Route persistence access through an established data abstraction.
- Normalize output shape to match nearby modules.
- Add validation at the external input boundary.
- Document an accepted deviation if the current design is intentional.

### Incremental Migration Strategy
When generating refactor tasks based on architecture drift, you MUST avoid proposing full system rewrites. Prefer incremental, boundary-by-boundary, or module-by-module migrations.
Output your phased migration strategy to `specs/<feature>/architecture-migration-plan.md`. Include coexistence strategies for old and new patterns.

## Architecture Migration Plan Structure

When creating `specs/<feature>/architecture-migration-plan.md`, use this structure:

```markdown
# [Violation Title] Migration Plan

## Current State
[Brief description or ASCII diagram of current architecture]

### Problems
- [Problem 1 from violation]
- [Problem 2 from violation]

## Target State
[Brief description or ASCII diagram of target architecture]

### Benefits
- [Benefit 1]
- [Benefit 2]

## Migration Phases

### Phase 1: [Name] (Estimated: X days)
**Goal**: [Outcome]

- **Task 1.1**: [Specific, actionable task]
- **Task 1.2**: [Specific, actionable task]

**Coexistence**: [How old and new patterns coexist in this phase]

### Phase 2: [Name] (Estimated: X days)
[Same structure]

## Coexistence Strategy

**Why coexistence?** Avoid big-bang rewrites; allow gradual migration.

**How**:
- New code uses new pattern immediately
- Old code continues on old pattern temporarily
- Boundary layer adapts between old and new
- Example: Run both repositories in parallel until all consumers migrate

## Rollback Plan
[If migration fails, how do we revert?]

## Success Criteria
- [ ] All new code uses target pattern
- [ ] Old pattern removed or marked deprecated
- [ ] Tests pass
- [ ] No performance regression
```

## Output Format

Return only:

```text
Refactor Tasks:
[Refactor Task]
Title:
Reason:
Consequence:
Scope:
Priority:
Suggested Fix:
Verification:
Trade-off:
```

If no tasks are needed:

```text
Refactor Tasks:
- None
```

Constitution Update Proposals are not refactor tasks.

## Example

```text
Refactor Tasks:
[Refactor Task]
Title: Move pricing rule out of checkout route
Reason: The route currently owns a business decision that should live behind the checkout application boundary.
Scope: Checkout request handler and checkout application service.
Priority: P1
Suggested Fix: Extract pricing decision logic into the checkout service or domain policy, keep the route responsible for validation, mapping, and delegation only.
```

```text
Refactor Tasks:
[Refactor Task]
Title: Centralize repeated tax calculation logic
Reason: The same tax rule appears in multiple checkout modules, which creates duplication drift and makes future changes easy to miss.
Scope: Checkout service and any callers that currently reimplement the tax rule.
Priority: P1
Suggested Fix: Move tax calculation into one shared checkout service or domain helper, then have callers reuse that single implementation.
```

```text
Refactor Tasks:
[Refactor Task]
Title: Consolidate repeated input validation
Reason: Multiple handlers validate the same request shape in slightly different ways, which increases drift and makes the rule harder to trust.
Scope: Request boundary and the shared validation contract or helper used by those handlers.
Priority: P1
Suggested Fix: Move the validation rule into one shared schema, form request, or helper, then have each handler call the same boundary check.
```

```text
Refactor Tasks:
[Refactor Task]
Title: Share DTO mapping logic
Reason: Multiple modules build the same response shape independently, which duplicates transformation rules and makes the contract drift over time.
Scope: Response mapping layer and the callers that currently construct the same DTO shape.
Priority: P2
Suggested Fix: Extract the mapping into one shared DTO factory, serializer, or adapter, then reuse that transformation everywhere the shape is needed.
```

```text
Refactor Tasks:
[Refactor Task]
Title: Centralize repeated domain policy
Reason: The same approval or discount rule is enforced in multiple places, which risks inconsistent business behavior and makes the rule harder to change safely.
Scope: Domain policy or application service and all call sites that currently reimplement the same rule.
Priority: P1
Suggested Fix: Move the policy into one shared domain service or policy object, then have every caller delegate to that single rule.
```
