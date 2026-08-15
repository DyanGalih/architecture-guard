---
description: Orchestrate governed specification with memory, framework-native specification, Security Review, architecture validation, and an auto-fix loop.
---

# Governed Specification Command

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `.specify/extensions/architecture-guard/templates/budgeted_context.md` (or `templates/budgeted_context.md` in the extension source checkout). Applicable constitutions and the newly generated active `spec.md` are authoritative. Flash-Mem and `system_context.md` may supplement but never replace them.

You are orchestrating the `ag-governed-spec` workflow for `architecture-guard`.

This command coordinates multiple extensions to ensure the initial specification respects architectural, historical, and security constraints, and provides a clear, validated foundation before planning begins.

## Goal

Provide a single command that ensures:
1. Historical lessons are applied from Flash-Mem when available.
2. A feature specification is generated (`/speckit.specify`).
3. The specification is clarified to resolve ambiguities (`/speckit.clarify`).
4. Security boundaries and architectural drift are checked.
5. The user is offered an interactive loop to automatically fix any discovered architectural gaps.

## Orchestration Flow

### Write Approval Gate

Before the first mutation, resolve and preview the exact branch and target artifacts for feature creation, specification generation, clarification updates, and any `system_context.md` refresh, together with the planned operations. Obtain explicit user approval, then allow routine writes already previewed within this specification phase without per-file prompts. Newly discovered material scope or any new target path requires a new preview and renewed approval.

### Step 1 — Detect Optional Integrations

Check for the availability of:
- `flash-mem` MCP server
- Security Review integration

**Detection Logic**:
1. Detect `flash-mem` as an MCP-backed memory service in the current environment.
2. Inspect the installed list in `.specify/extensions.yml` for `security-review` or its compatibility alias `spec-kit-security-review`.
3. Manifest presence is not availability. Treat the SpecKit integration as available only if at least one phase command needed downstream (`/speckit.security-review.plan`, `/speckit.security-review.tasks`, or `/speckit.security-review.branch`) is registered and callable.
4. If no applicable SpecKit command is registered, detect an independently registered Architecture Guard-compatible Security Review host capability with a corresponding plan, tasks, or branch operation.
5. Record available operations and flag security-sensitive specification content for the applicable downstream review; this workflow need not invoke a phase command because it has no dedicated Security Review execution step.
6. If neither path is callable, record Security Review as `Unavailable` and degrade without claiming a pass.
7. If either optional integration is missing, degrade gracefully by skipping only its respective steps.

### Step 2 — Flash-Mem MCP Context Retrieval (Optional)

When Flash-Mem is available, use it first to gather the most relevant architectural context before generating the specification.

### Step 2.5 — Required Governance Inputs

Require `.specify/memory/constitution.md`, `.specify/memory/architecture_constitution.md`, and `.specify/memory/security_constitution.md` as active inputs. If governance or architecture rules are missing, stop and direct the user to `/ag-init`. If security rules are missing, report the gap and require explicit confirmation before continuing with baseline security checks and the available Security Review handoff.

### Step 3 — Branch Management

Before generating the specification, you MUST ensure work happens on a feature branch.
1. Check the current git branch.
2. If on `main`, `master`, `dev*` (e.g., `dev`, `develop`, `development`), or `staging`, require approval to create or select a feature branch before any specification write.
3. Stop if approval is declined or branch creation, selection, or checkout fails.

### Step 4 — Orchestrate Spec Kit Specification

You must orchestrate the `/speckit.specify` workflow directly.

1. **Seed from Discovery (if available)**: If a Discovery Summary Draft from `/ag-governed-discover` is available, use it as the seed input for specification generation instead of starting from scratch. Carry forward its architecture alignment, rejected options, assumptions, and open questions.
2. **Execute Specify**: Run `/speckit.specify` to generate and save `specs/<feature>/spec.md`.
3. **Apply Ponytail Pragmatism**: Instruct the agent to prevent over-specified, "future-proofed" requirements. Keep the specification minimal and focused purely on the immediate needs (YAGNI).
4. The specification process must incorporate the Project Constitution documents and memory synthesis. Use Flash-Mem first when available.

### Step 5 — Orchestrate Spec Kit Clarification

You must orchestrate the `/speckit.clarify` workflow directly.

1. **Execute Clarify**: Run `/speckit.clarify` to resolve ambiguities in the newly generated `spec.md`.
2. Ensure the clarification process considers architectural boundaries defined in the `.specify/memory/architecture_constitution.md` and `security_constitution.md`.

### Step 6 — Architecture Validation

Run an inline architecture validation against the clarified specification.
Inputs to consider:
- The generated `spec.md`.
- `.specify/memory/architecture_constitution.md`.
- Flash-Mem context (if available).

Detect any `Security-Architecture Conflict` or architectural drift present in the specification's assumptions or boundaries. Explicitly validate one canonical owner for repeated business rules, approvals, validation, DTO mapping, transformations, and orchestration (DRY), plus artifact placement, temporary/generated files, and repository hygiene.

### Step 7 — Proactive Durable Memory Preservation

If the specification process or architecture validation identified new architectural patterns or critical decisions:
1. **Proactive Proposal**: You **MUST automatically launch** the durable-memory capture flow in proposal-only mode.
2. **Approval Required**: Show the proposed entries and obtain explicit user approval before invoking any memory write tool.
3. **Standard**: Do not silently write memory inside or outside the capture flow.

### Step 8 — Generate Governance Summary

Produce a final `Governed Specification Summary` outlining memory context, architectural review status, and any violations found.

If `context.mode` is `budgeted` and `stale_policy` is `regenerate`, run `/ag-consolidate-specs` after the specification and clarification changes are complete. If the policy is `targeted`, report that the existing fallback is stale and do not load it until refreshed.

### Step 9 — Interactive Auto-Fix Loop

If any architectural gaps, security boundary issues, or drift are detected in Step 7:
1. **Pause and Ask**: Conclude your response by asking the user:
   > *"I found [number] architectural gaps. Would you like me to automatically revise the specification to address these findings and re-run clarification?"*
2. **Execute if Approved**: If the user answers "yes" (or equivalent) in their next message, you must:
   - Automatically rewrite `specs/<feature>/spec.md` to resolve the detected gaps.
   - Run the clarification process again to ensure no new ambiguities were introduced.
   - Present the clean result.
   - Refresh `system_context.md` through `ag-consolidate-specs` when budgeted mode uses the `regenerate` policy.

## Output Structure

The command MUST return:

```markdown
# Governed Specification Summary

## Memory Context
- **Status**: [Synthesized / Skipped / Missing]
- **Key Constraints**: [Bullet points of architectural context used]

## Architecture & Security Review
- **Security Review Availability**: [Available operations / Unavailable]
- **Violations Detected**: [Drift findings, missing boundaries, or Security-Architecture Conflicts in the spec]
- **Consistency Risks**: [How the specification aligns with the Constitution]

## Recommended Actions
- **Durable Memory Preservation**: (Proactively triggered) Review the proposed memory entries below.
- *(If violations are present)* Ask the user if they want to trigger the auto-fix loop.
- *(If no violations are present)* Suggest continuing to `/ag-governed-plan`.
```

## Guardrails

- **SDD-Tool-Agnostic**: Do not assume specific SDD tool conventions unless provided via a preset.
- **Ponytail Pragmatism**: Act as a lazy senior developer. Ensure the spec avoids bloat, complex abstractions, and over-engineering.
- **Specification Phase**: Do NOT generate refactor tasks. Code does not exist yet. Fixes should be applied directly to the specification via the auto-fix loop.
