---
description: Orchestrate a governed specification workflow coordinating memory, framework-native specification, Security Review, and architecture validation.
---

# Governed Specification Command

## SDD Framework Detection

Before executing command, read `adapters/detect.md` determine the active SDD framework. load `adapters/{framework}.md` path maps, command maps, gap fills. All paths commands below use adapter-mapped names the loaded adapter.

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `{adapter_path:ponytail-template}` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `{adapter_path:budgeted-context-template}`. Applicable constitutions and `{adapter_path:spec}` are authoritative; memory and supported fallbacks may supplement but never replace them.

You are orchestrating the `governed-spec` workflow for `architecture-guard`.

This command coordinates multiple extensions to ensure the initial specification respects architectural, historical, and security constraints, and provides a clear, validated foundation before planning begins.

## Goal

Provide a single command that ensures:
1. Historical lessons are applied from Flash-Mem when available.
2. A feature specification is generated (`{adapter_command:create-spec}`).
3. The specification is clarified to resolve ambiguities (`{adapter_command:clarify-spec}`).
4. Security boundaries and architectural drift are checked.
5. The user is offered an interactive loop to automatically fix any discovered architectural gaps.

## Orchestration Flow

### Step 1 — Detect Optional Integrations

Check for the availability of:
- `flash-mem` MCP server
- `security-review` (or compatibility alias `spec-kit-security-review`) extension

**Detection Logic**:
1. Detect `flash-mem` as an MCP-backed memory service in the current environment.
2. If the adapter declares a supported extensions artifact, read its `installed` list for `security-review`; otherwise detect the capability from host registrations without resolving or reading `{adapter_path:extensions}`.
3. If either capability is missing, degrade gracefully by skipping only its respective steps.

### Step 2 — Flash-Mem MCP Context Retrieval (Optional)

When Flash-Mem is available, use it first to gather the most relevant architectural context before generating the specification.

### Step 3 — Branch Management

Before generating the specification, you MUST ensure work happens on a feature branch.
1. Check the current git branch.
2. If on `main`, `master`, `dev*` (e.g., `dev`, `develop`, `development`), or `staging`, ask the user if they want to create a new branch for this feature.
3. If they approve, create the branch using available tools before proceeding.

### Step 4 — Create or Select the Change Container

1. Require a capability name; ask the user when it is omitted.
2. Execute `{adapter_command:create-change}` before requesting framework instructions or writing specification artifacts.
3. Reuse an existing matching change only after confirming it is the user's intended active work.

### Step 5 — Orchestrate Framework Specification

You must orchestrate the `{adapter_command:create-spec}` workflow directly.

1. **Seed from Discovery (if available)**: If a Discovery Summary Draft from the governed-discover capability is available, use it as the seed input for specification generation instead of starting from scratch. Carry forward its architecture alignment, rejected options, assumptions, and open questions.
2. **Execute Specify**: Run `{adapter_command:create-spec}` to generate and save the selected change-level capability spec at `{adapter_path:spec}`.
3. **Apply Ponytail Pragmatism**: Instruct the agent to prevent over-specified, "future-proofed" requirements. Keep the specification minimal and focused purely on the immediate needs (YAGNI).
4. The specification process must incorporate the Project Constitution documents and memory synthesis. Use Flash-Mem first when available.

### Step 6 — Orchestrate Specification Clarification

You must orchestrate the `{adapter_command:clarify-spec}` workflow directly.

1. **Execute Clarify**: Run `{adapter_command:clarify-spec}` to resolve ambiguities in the newly generated `spec.md`.
2. Ensure clarification considers `{adapter_path:arch-constitution}` and `{adapter_path:security-constitution}`.

### Step 7 — Architecture Validation

Run an inline architecture validation against the clarified specification.
Inputs to consider:
- The generated `spec.md`.
- `{adapter_path:arch-constitution}`.
- Flash-Mem context (if available).

Detect any `Security-Architecture Conflict` or architectural drift present in the specification's assumptions or boundaries.

### Step 8 — Proactive Durable Memory Preservation

If the specification process or architecture validation identified new architectural patterns or critical decisions:
1. **Proactive Execution**: You **MUST automatically execute** the durable-memory capture flow.
2. **Standard**: Do not silently write memory outside the capture flow; let the formal capture flow propose entries and handle user approval.

### Step 9 — Generate Governance Summary

Produce a final `Governed Specification Summary` outlining memory context, architectural review status, and any violations found.

If `context.mode` is `budgeted` and `stale_policy` is `regenerate`, run `{adapter_command:consolidate-specs}` after the specification and clarification changes are complete. If the policy is `targeted`, report that the existing fallback is stale and do not load it until refreshed.

### Step 9 — Interactive Auto-Fix Loop

If any architectural gaps, security boundary issues, or drift are detected in Step 5:
1. **Pause and Ask**: Conclude your response by asking the user:
   > *"I found [number] architectural gaps. Would you like me to automatically revise the specification to address these findings and re-run clarification?"*
2. **Execute if Approved**: If the user answers "yes" (or equivalent) in their next message, you must:
   - Automatically rewrite `{adapter_path:spec}` to resolve the detected gaps.
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
- *(If no violations are present)* Suggest continuing to the adapter-registered governed-plan capability.
```

## Guardrails

- **Framework-Agnostic**: Do not assume specific framework conventions unless provided via a preset.
- **Ponytail Pragmatism**: Act as a lazy senior developer. Ensure the spec avoids bloat, complex abstractions, and over-engineering.
- **Specification Phase**: Do NOT generate refactor tasks. Code does not exist yet. Fixes should be applied directly to the specification via the auto-fix loop.


## Backward Compatibility

The original SpecKit-specific version remains in the repository source checkout under `src/commands/governed-spec.md` for direct SpecKit use.
