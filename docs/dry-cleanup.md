# DRY Cleanup Guide

Use this guide after the brownfield mapping pass when you are bringing an existing codebase under Architecture Guard and want to collapse duplicated business logic, repeated validation, repeated DTO mapping, or repeated orchestration into one shared source of truth.

## What It Helps With

- Detect repeated business rules, approvals, validation, DTO mapping, transformations, and orchestration.
- Flag Ponytail issues such as unnecessary abstractions or over-engineering.
- Turn duplication drift into small refactor tasks instead of big rewrites.
- Keep refactors non-blocking by default unless the constitution says otherwise.

## Brownfield Flow

1. Run `/ag-init-brownfield`.
2. Review the current-state summary and identify likely duplication hotspots.
3. Run `ag-workflow` from your AI agent.
4. Feed duplication findings into `/ag-refactor-generator`.
5. Apply approved changes with `ag-apply`.
6. Re-run `ag-verify`.

## Common Signals

- The same business rule implemented in more than one place.
- Handler or controller code that revalidates the same request shape differently.
- Multiple modules building the same DTO or response shape.
- Similar orchestration repeated across services, actions, or use cases.
- Extra abstractions that do not reduce duplication or improve clarity.

## Rule Of Thumb

If a rule, transformation, or decision already has a shared owner, keep it there and make other callers delegate to it.

If a second copy exists only because the first one was hard to reach, treat that as a refactor candidate, not a new pattern.

## Good Outcomes

- One shared source of truth for durable business rules.
- Thin callers that validate, map, and delegate.
- Refactor tasks that are small, specific, and incremental.
- A verification pass that confirms the duplication was actually removed.
