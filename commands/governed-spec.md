---
description: Orchestrate a governed specification workflow that coordinates flash-mem, Spec Kit specification and clarification, Security Review, and Architecture Guard validation.
---

# Governed Specification Command

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `.specify/extensions/architecture-guard/templates/budgeted_context.md` (or `templates/budgeted_context.md` in the extension source checkout). Applicable constitutions and the newly generated active `spec.md` are authoritative. Flash-Mem and `system_context.md` may supplement but never replace them.

You are orchestrating the `governed-spec` workflow for `architecture-guard`.

This command coordinates multiple extensions to ensure the initial specification respects architectural, historical, and security constraints, and provides a clear, validated foundation before planning begins.

## Goal

Provide a single command that ensures:
1. Historical lessons are applied from Flash-Mem when available.
2. A feature specification is generated (`/speckit.specify`).
3. The specification is clarified to resolve ambiguities (`/speckit.clarify`).
4. Security boundaries and architectural drift are checked.
5. The user is offered an interactive loop to automatically fix any discovered architectural gaps.

## Orchestration Flow

### Step 1 — Detect Optional Integrations

Check for the availability of:
- `flash-mem` MCP server
- `security-review` (or compatibility alias `spec-kit-security-review`) extension

**Detection Logic**:
1. Detect `flash-mem` as an MCP-backed memory service in the current environment.
2. Read `.specify/extensions.yml` and check the `installed` list for `security-review` (or compatibility alias `spec-kit-security-review`).
3. If either capability is missing, degrade gracefully by skipping only its respective steps.

### Step 2 — Flash-Mem MCP Context Retrieval (Optional)

When Flash-Mem is available, use it first to gather the most relevant architectural context before generating the specification.

### Step 3 — Branch Management

Before generating the specification, you MUST ensure work happens on a feature branch.
1. Check the current git branch.
2. If on `main`, `master`, `dev*` (e.g., `dev`, `develop`, `development`), or `staging`, ask the user if they want to create a new branch for this feature.
3. If they approve, create the branch using available tools before proceeding.

### Step 4 — Orchestrate Spec Kit Specification

You must orchestrate the `/speckit.specify` workflow directly.

1. **Seed from Discovery (if available)**: If a Discovery Summary Draft from `/speckit.architecture-guard.governed-discover` is available, use it as the seed input for specification generation instead of starting from scratch. Carry forward its architecture alignment, rejected options, assumptions, and open questions.
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

Detect any `Security-Architecture Conflict` or architectural drift present in the specification's assumptions or boundaries.

### Step 7 — Proactive Durable Memory Preservation

If the specification process or architecture validation identified new architectural patterns or critical decisions:
1. **Proactive Execution**: You **MUST automatically execute** the durable-memory capture flow.
2. **Standard**: Do not silently write memory outside the capture flow; let the formal capture flow propose entries and handle user approval.

### Step 8 — Generate Governance Summary

Produce a final `Governed Specification Summary` outlining memory context, architectural review status, and any violations found.

If `context.mode` is `budgeted` and `stale_policy` is `regenerate`, run `/speckit.architecture-guard.consolidate-specs` after the specification and clarification changes are complete. If the policy is `targeted`, report that the existing fallback is stale and do not load it until refreshed.

### Step 9 — Interactive Auto-Fix Loop

If any architectural gaps, security boundary issues, or drift are detected in Step 5:
1. **Pause and Ask**: Conclude your response by asking the user:
   > *"I found [number] architectural gaps. Would you like me to automatically revise the specification to address these findings and re-run clarification?"*
2. **Execute if Approved**: If the user answers "yes" (or equivalent) in their next message, you must:
   - Automatically rewrite `specs/<feature>/spec.md` to resolve the detected gaps.
   - Run the clarification process again to ensure no new ambiguities were introduced.
   - Present the clean result.
   - Refresh `system_context.md` through `consolidate-specs` when budgeted mode uses the `regenerate` policy.

## Output Structure

The command MUST return:

```markdown
# Governed Specification Summary

## Memory Context
- **Status**: [Synthesized / Skipped / Missing]
- **Key Constraints**: [Bullet points of architectural context used]

## Architecture & Security Review
- **Violations Detected**: [Drift findings, missing boundaries, or Security-Architecture Conflicts in the spec]
- **Consistency Risks**: [How the specification aligns with the Constitution]

## Recommended Actions
- **Durable Memory Preservation**: (Proactively triggered) Review the proposed memory entries below.
- *(If violations are present)* Ask the user if they want to trigger the auto-fix loop.
- *(If no violations are present)* Suggest continuing to `/speckit.architecture-guard.governed-plan`.
```

## Guardrails

- **Framework-Agnostic**: Do not assume specific framework conventions unless provided via a preset.
- **Ponytail Pragmatism**: Act as a lazy senior developer. Ensure the spec avoids bloat, complex abstractions, and over-engineering.
- **Specification Phase**: Do NOT generate refactor tasks. Code does not exist yet. Fixes should be applied directly to the specification via the auto-fix loop.
