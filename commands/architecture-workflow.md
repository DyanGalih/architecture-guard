---
description: Run a single architecture workflow that prefers memory-first context and can incorporate security review when available.
---

# Architecture Workflow Command

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

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
6. After analysis, store durable architecture knowledge back into Flash-Mem:
   - new architecture decisions
   - approved exceptions
   - recurring violations
   - architectural constraints
   - project conventions
   - validated design patterns

If Flash-Mem is unavailable or the retrieved summaries are insufficient, continue with the repository artifacts and constitution files available in the workspace.

This command accepts the same normalized command context as `architecture-review`, including semantic and dot-style aliases.

The workflow is serial and ownership-aware:

1. Read Flash-Mem context first when it is available, then fall back to repository files if needed.
2. Normalize `mode` and `focus` from the incoming command.
3. Run the architecture review against the Constitution, memory synthesis, and generic architecture principles.
4. If `mode=performance`, keep the pass advisory and route output to `Performance Insights` only.
5. Route security-first findings to Security Review instead of duplicating them here.
6. Treat repeated business rules, approvals, validation, DTO mapping, or orchestration as DRY drift and route it to refactor extraction rather than allowing parallel copies.
   - Prefer one shared source of truth for the repeated rule, contract, transformation, or decision.
7. If `mode=architecture` and a Constitution Update Proposal is warranted, surface it and leave application to `architecture-apply`.
8. Produce refactor tasks or an apply recommendation for architecture findings.

## Goal

Review the current specification, plan, task list, or implementation with a single workflow and produce the most useful next step.

## Inputs To Consider

Review any available artifacts from these common locations. **IMPORTANT**: You MUST read these files explicitly using your file-reading tools (absolute or relative paths). Do not rely solely on workspace search or semantic indexers, as these files are often in `.gitignore`:

1. **Governance & Security Constitution**:
   - `.specify/memory/constitution.md`
   - `.specify/memory/security_constitution.md`

2. **Architecture Constitution**:
   - `.specify/memory/architecture_constitution.md`

3. **Feature-Specific Context**:
   - `specs/<feature>/security-constraints.md`
   - `spec.md`, `plan.md`, `tasks.md`, `data-model.md`
   - Stored architecture decisions from Flash-Mem, if present.
   - Security Review findings, if present.
   - Optional preset guidance, if present.

## Workflow

1. Read Flash-Mem context first if it is available in the project or workflow context, then fall back to repository files if needed.
2. Review the current work against the Constitution and generic architecture principles.
3. Identify whether any finding is primarily security-related.
4. If a finding is security-related, flag it as a handoff to Security Review rather than treating it as a core architecture finding.
5. Produce refactor tasks or an apply recommendation as needed.
6. Prefer a single concise summary that tells the user what to fix next.

## Rules

- Do not invent framework-specific conventions.
- Do not invent unsupported Spec Kit APIs.
- Do not block implementation by default.
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
- **Extensions Used**: [`flash-mem`: yes/no, Security Review: yes/no]
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

## Recommended Next Step
[Single clear action]
```
