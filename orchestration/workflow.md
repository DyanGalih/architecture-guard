---
description: Run a single architecture workflow with optional memory context and Security Review handoff.
---

# Architecture Workflow Command

## SDD Adapter Resolution

Before executing command, read `adapters/resolve.md` to resolve the selected SDD adapter. Load `adapters/{tool}.md` for path maps, command maps, and gap fills. All paths and commands below use the loaded adapter.

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `{adapter_path:ponytail-template}` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

You are running `architecture-guard` as the single orchestration entry point for architecture review.

Use this command when the user wants one pass that covers architecture review, memory-first context when available, Security Review handoff when available, and optional performance mode without manually chaining multiple commands.

## Flash-Mem-First Architecture Context Retrieval

Try Flash-Mem first: query summary and metadata context before performing architecture analysis.

1. Search Flash-Mem for relevant architecture context:
   - architecture decisions
   - ADRs
   - design constraints
   - coding conventions
   - prior guard findings
   - approved exceptions
   - architectural patterns
2. Prefer summary-first retrieval:
   - use summaries
   - use metadata
   - use confidence
   - use tags
   - use related files
3. Load full memory content only when summaries are insufficient.
4. Reuse approved architectural decisions whenever possible.
5. Flag conflicts between proposed changes and existing architectural decisions.
6. After analysis, propose durable architecture knowledge for Flash-Mem and write it only after explicit user approval:
   - new architecture decisions
   - approved exceptions
   - recurring violations
   - architectural constraints
   - project conventions
   - validated design patterns

If Flash-Mem is unavailable or the retrieved summaries are insufficient, continue with the repository artifacts and constitution files available in the workspace.

This command accepts the same normalized command context as `ag-review-artifacts` and `ag-review-implementation`, including semantic and dot-style aliases.

The workflow is serial and ownership-aware:

1. Read Flash-Mem context first when it is available, then fall back to repository files if needed.
2. Normalize `mode` and `focus` from the incoming command.
3. Run the architecture review against the Constitution, memory synthesis, and generic architecture principles.
4. If `mode=performance`, keep the pass advisory and route output to `Performance Insights` only.
5. Route security-first findings to Security Review instead of duplicating them here.
6. Treat repeated business rules, approvals, validation, DTO mapping, or orchestration as DRY drift and route it to refactor extraction rather than allowing parallel copies.
   - Prefer one shared source of truth for the repeated rule, contract, transformation, or decision.
7. If `mode=architecture` and a Constitution Update Proposal is warranted, surface it and leave application to `ag-apply`.
8. Produce refactor tasks or an apply recommendation for architecture findings.

## Goal

Review one resolved active specification, plan, task list, or implementation set with a single workflow and produce the most useful next step.

## Inputs To Consider

Resolve explicit user paths first; otherwise use `{adapter_path:spec}`, `{adapter_path:plan}`, `{adapter_path:tasks}`, and `{adapter_path:security-constraints}` for one active adapter artifact set. If branch metadata and adapter paths identify different sets, or multiple sets remain plausible, stop and ask the user instead of combining them. Read resolved files explicitly because they may be ignored by search.

1. **Governance & Security Constitution**:
   - `{adapter_path:constitution}`
   - `{adapter_path:security-constitution}`

2. **Architecture Constitution**:
   - `{adapter_path:arch-constitution}`

3. **Feature-Specific Context**:
    - `{adapter_path:security-constraints}`
    - `{adapter_path:spec}`, `{adapter_path:plan}`, and `{adapter_path:tasks}`
   - Stored architecture decisions from Flash-Mem, if present.
   - Security Review findings, if present.
   - Optional preset guidance, if present.

## Workflow

1. Read Flash-Mem context first if it is available in the project or workflow context, then fall back to repository files if needed.
2. Review the current work against the Constitution and generic architecture principles.
3. Detect Security Review independently from host registrations, not adapter extension support, and identify whether any finding is primarily security-related.
4. If Security Review is available, hand off security-first findings. If unavailable, report the capability as unavailable, perform only constitution-required architecture-visible security checks, and mark security coverage degraded without claiming a security pass.
5. Produce refactor tasks or an apply recommendation as needed.
6. Prefer a single concise summary that tells the user what to fix next.
7. Run hygiene rules only across the resolved review scope plus repository-level files explicitly required by each rule. Apply configured exclusions, preserve policy severity, and record blocking status separately.

## Rules

- Do not invent framework-specific conventions.
- Do not invent unsupported framework APIs; use adapter behavior and fallbacks.
- Do not block implementation by default. Block only architecture P0 or findings whose applicable security/hygiene policy explicitly designates them blocking; capability availability and finding category do not imply severity.
- Do not replace Security Review; route security-first findings to Security Review when available.
- Do not require `flash-mem`; treat it as optional read-only context only.
- Do not duplicate Security Review findings in the architecture output unless the issue is specifically an architectural boundary problem.
- Do not write security follow-up items into architecture tasks or plan updates.
- Do not write memory conclusions into architecture follow-up items.

When `mode=performance`, do not produce violations or refactor tasks.

## Output Format

All governance reports MUST follow this standard template:

```markdown
# Architecture Governance Report

## Input Summary
- **Artifacts Scanned**: [list]
- **Capabilities Used**: [`flash-mem`: yes/no, Security Review: available/unavailable]
- **Mode**: [architecture/performance]
- **Focus**: [general/db/api/async]

## Findings

### Violations
[Table format with: ID | Category | Severity | Location | Summary | Evidence]

### Refactor Tasks (if any)
[Task list or "None"]

### Constitution Update Proposals (if any)
[Proposals or "None"]

## Context Applied
- **`flash-mem`**: [Used context or "Not available"]
- **Security Review**: [Findings routed or "Not available"]
- **Security Coverage**: [Independent / Degraded]

## Recommended Next Step
[Single clear action]
```

## Backward Compatibility

The original SpecKit-specific version remains in the repository source checkout under `commands/workflow.md` for direct SpecKit use.
