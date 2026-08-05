# Workflows

This document covers the governed discovery, specification, planning, task, and implementation flows used by Architecture Guard.

## Suggested Governed Delivery Workflow

Use `governed-delivery` once you already have a clear spec or a discovery draft that has been converted into a spec-ready direction:

```text
/speckit.architecture-guard.governed-delivery
```

If the work is still just an idea, request, or rough problem statement, start with `governed-discover` first and then `governed-spec` before delivery. That keeps the discovery and specification phases ahead of planning and task generation.

The command retrieves Flash-Mem context when available, generates or reuses the plan, applies security and architecture plan gates, generates or reconciles tasks, and runs task security review, architecture refactor generation, and `/speckit.analyze`. It resumes from the first invalid phase and never generates tasks from a plan with unresolved P0 architecture or Critical security findings. It also loads the shared Ponytail Core contract so every resumed phase uses the same decision ladder, safety floor, root-cause rules, and verification expectations.

The separate `governed-plan` and `governed-tasks` commands remain available for targeted recovery. If a plan changes materially, rerun both phases; if only tasks are defective, rerun `governed-tasks`.

## Governed Discovery Workflow

Use `governed-discover` when the work starts as an idea, request, or rough problem statement and you need to turn it into a spec-ready direction. It is the right entry point before specification when you still need to explore options, test assumptions, or check the idea against the current architecture.

Architecture Guard can orchestrate a brainstorming phase *before* a formal specification is written, helping new feature ideas align with existing architecture constraints from the very beginning.

The orchestrated workflow is:

1. Memory synthesis: scoped retrieval of historical decisions before broader file reads
2. Implementation context: check the codebase for similar patterns (if requested)
3. Interactive discussion: an architecture-aware chat to refine the idea
4. Draft generation: output a clean feature draft to hand off to the specification phase

### Example Orchestration

```text
/speckit.architecture-guard.governed-discover "I want a new feature..."
```

## Governed Specification Workflow

Architecture Guard can orchestrate specification workflows across `flash-mem`, Security Review, and Architecture Guard validation when companion extensions are installed.

The orchestrated workflow is:

1. Memory synthesis: scoped retrieval of historical decisions before broader file reads
2. Specification generation: Spec Kit spec generation using that synthesis, enforcing Ponytail minimalism
3. Clarification: resolve ambiguities with architecture context in mind
4. Architecture validation: detect drift, bloat, and security-architecture conflicts
5. Governance summary: final overview of architecture and security risks
6. Interactive Auto-Fix Loop: option to automatically revise the specification if architectural gaps are found

### Example Orchestration

```text
/speckit.architecture-guard.governed-spec
```

## Governed Planning Workflow

Architecture Guard can orchestrate planning workflows across `flash-mem`, Security Review, and Architecture Guard validation when companion extensions are installed.

The orchestrated workflow is:

1. Memory synthesis: scoped retrieval of historical decisions before broader file reads
2. Plan generation: Spec Kit technical planning using that synthesis, enforcing Ponytail minimalism
3. Security validation: review the plan against trust boundaries
4. Architecture validation: detect drift, bloat, and security-architecture conflicts
5. Governance summary: final overview of architecture and security risks

### Example Orchestration

```text
/speckit.architecture-guard.governed-plan
```

## Governed Task Workflow

Architecture Guard can orchestrate governance checks throughout task generation when companion extensions are installed.

Flow:

memory synthesis -> tasks (with Ponytail minimalism) -> security task review -> architecture refactor generation -> analysis -> automatic analyst loop -> task governance summary

```text
/speckit.architecture-guard.governed-tasks
```

## Governed Implementation Workflow

Architecture Guard can orchestrate governance checks during implementation when companion extensions are installed.

Flow:

memory synthesis -> implement (with Ponytail pragmatism) -> security review -> architecture review (with Ponytail Audit) -> refactor or fix recommendations

```text
/speckit.architecture-guard.governed-implement
```

> Companion extensions are optional. Architecture Guard degrades gracefully and does not require `flash-mem` or Security Review to function. It orchestrates workflows only when companion artifacts or extensions are available.

## Practical Quick Flow

Choose the path that matches the repository state.

### Brownfield

1. Install Architecture Guard.
2. Run `/speckit.architecture-guard.init-brownfield`.
3. Review the current-state findings.
4. Run `ag-workflow` from your AI agent.
5. Apply approved refactors into plan and task artifacts.

If you are specifically cleaning up duplicated logic, follow the [DRY Cleanup Guide](dry-cleanup.md) after the brownfield mapping pass.

### Greenfield

1. Install Architecture Guard.
2. Run `/speckit.architecture-guard.init`.
3. Review the constitution output.
4. Run `ag-workflow` from your AI agent.
5. Apply approved refactors into plan and task artifacts.

This keeps architecture concerns visible throughout the delivery lifecycle instead of concentrating them at the end.
