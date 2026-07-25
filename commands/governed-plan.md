---
description: Orchestrate a governed planning workflow that coordinates flash-mem, Security Review, and Architecture Guard validation.
---

# Governed Plan Command

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `.specify/extensions/architecture-guard/templates/budgeted_context.md` (or `templates/budgeted_context.md` in the extension source checkout). The active feature's `spec.md` and all applicable constitutions are mandatory and authoritative. Flash-Mem and `system_context.md` may supplement but never replace them.

You are orchestrating the `governed-plan` workflow for `architecture-guard`.

This command coordinates multiple extensions to ensure the technical plan respects architectural, historical, and security constraints before implementation begins.

## Goal

Provide a single command that ensures:
1. Historical lessons are applied from Flash-Mem when available.
2. A technical plan is generated (`/speckit.plan`).
3. Security boundaries are respected (Security Review).
4. Architectural drift is detected (Architecture Guard).

## Orchestration Flow

### Step 1 — Detect Optional Integrations

Check for the availability of:
- `flash-mem` MCP server
- Memory MD local CLI
- `security-review` (or compatibility alias `spec-kit-security-review`) extension

**Detection Logic**:
1. Treat `flash-mem` as available only when its MCP tools are already exposed in the current environment. Do not treat it as a Spec Kit extension, look for it in `.specify/extensions.yml`, or repeatedly probe for hidden MCP/global-promotion capabilities.
2. Check for the Memory MD runtime directly with `test -f .specify/extensions/memory-md/dist/bin/speckit-memory.js`. If present, invoke supported local operations with `node .specify/extensions/memory-md/dist/bin/speckit-memory.js <command>`. Do not use default `rg --files` to decide that this runtime is missing: `dist/` and `node_modules/` may be gitignored. If additional discovery is necessary, use `find` or `rg --files -uu`.
3. Read `.specify/extensions.yml` and check the `installed` list for `security-review` (or compatibility alias `spec-kit-security-review`). Fall back to checking for the extension directory in `.specify/extensions/` only if the YAML is missing or the list is empty.
4. If an optional capability is missing, degrade gracefully by skipping only its respective steps. A missing Flash-Mem MCP service does not make an available Memory MD CLI unavailable.

### Step 2 — Flash-Mem MCP Context Retrieval (Optional)

When Flash-Mem is available, use it first to gather the most relevant architectural context before plan generation. Prefer summary-first context and only expand into repository files when needed.

If Flash-Mem is unavailable or the context is insufficient, continue with the repository artifacts and constitution files available in the workspace.

When Flash-Mem MCP is unavailable but the Memory MD CLI detected in Step 1 is present, use that CLI for supported local context preparation, search, or synthesis before falling back to repository artifacts. Inspect its help once when command syntax is needed; do not search for an MCP wrapper or a global/shared publication tool.

**[OPTIONAL SUB-AGENT DELEGATION]**
* **Capability Gate:** First confirm that `/speckit.subagent.synthesize` is registered and callable. If it is unavailable, execute inline regardless of size and report the degraded path.
* **Trigger Condition:** When the capability is available, you **MUST** delegate memory retrieval and synthesis if:
  - The Flash-Mem index contains $\ge 20$ memory documents.
  - OR the project repository contains $\ge 15$ active ADRs/docs.
  - Otherwise, you **MUST** execute inline.
* **Execution Syntax:** Call the memory synthesis sub-agent via:
  `/speckit.subagent.synthesize --context=architecture-boundaries`
* **Strict Handoff Template:** Format the sub-agent prompt exactly like this:
  ```yaml
  Task: Retrieve and synthesize relevant architecture constraints and ADRs.
  Focus: Architecture boundaries and project standards.
  Expected Output: Synthesized markdown summary of key constraints to apply to the technical plan.
  ```


---

### Step 3 — Orchestrate Spec Kit Plan

You must orchestrate the `/speckit.plan` workflow directly.

**CRITICAL INSTRUCTION**: You must NOT just advise the user or stop here. You must actually generate the plan:
1. **Apply Ponytail Pragmatism**: Instruct the agent to act as a "lazy senior developer." The generated plan must prefer standard libraries and native platform features over proposing complex new abstractions. Strictly enforce YAGNI.
   - Also prefer one shared plan path for repeated behavior instead of separate duplicated steps or parallel implementations.
2. **Execute Plan**: Run `/speckit.plan` to generate and save `specs/<feature>/plan.md`.

   **If `/speckit.plan` is not available as a registered command** (i.e., the AI agent does not recognize it as a slash command), fall back to inline planning:
   - Read the active spec at `specs/<feature>/spec.md` (or the path provided by the user).
   - Read all applicable constitution files (`.specify/memory/constitution.md`, `.specify/memory/architecture_constitution.md`, `.specify/memory/security_constitution.md`).
   - Use Flash-Mem context if available.
   - Generate `specs/<feature>/plan.md` directly, incorporating all context above and enforcing Ponytail minimalism.
   - Note in the Governance Summary that `/speckit.plan` was unavailable and planning was performed inline.

3. The planning process must incorporate the Project Constitution documents and memory synthesis. Use Flash-Mem first when available. If retrieval is unavailable or insufficient, read constitution files directly with file-reading tools. Do not rely solely on workspace search or semantic indexes because these files are often in `.gitignore`.
4. Prefer the cached synthesis and selected index entries over reopening the full durable memory set.

### Step 4 — Security Review (Optional)

IF `security-review` (or compatibility alias `spec-kit-security-review`) is available:
1. **Execute Review**: Run `/speckit.security-review.plan` to review the plan and save `specs/<feature>/security-constraints.md`.
2. Focus on:
    - Trust boundaries and authorization assumptions.
    - Data isolation and validation risks.
    - Async security context.

### Step 5 — Architecture Validation

Run:
```text
/speckit.architecture-guard.violation-detection
```

Inputs to consider:
- The generated `plan.md`.
- `.specify/memory/architecture_constitution.md`.
- Flash-Mem context (if available).
- `security-constraints.md` (if available).

Detect any `Security-Architecture Conflict` or architectural drift.

### Step 6 — Proactive Durable Memory Preservation

If the planning process or architecture validation identified new architectural patterns, critical decisions, or repeatable lessons:
1. **Capability Gate**: Use a Flash-Mem write tool only when that tool is already exposed in the current environment. Otherwise, if the Memory MD CLI detected in Step 1 supports the required local capture operation, use `node .specify/extensions/memory-md/dist/bin/speckit-memory.js <command>`.
2. **Proactive Execution**: When either explicit capture path is available, you **MUST automatically execute** that durable-memory capture flow as the final action of this turn. Do not just recommend it; run the command.
3. **Bounded Degradation**: Do not probe for Flash-Mem, `speckit_memory_share_lesson`, another MCP wrapper, or global/shared promotion when such a capability is not already exposed. Complete any available local capture or synthesis, report global promotion as unavailable, and finish the governed workflow.
4. **Standard**: Do not silently write memory outside an available formal capture flow; let that flow propose entries and handle user approval when its interface requires approval.

### Step 7 — Generate Governance Summary

Produce a final `Governed Planning Summary` for the user.

## Graceful Degradation

**Without Flash-Mem MCP**:
- Use the detected Memory MD CLI for supported local preparation, search, or synthesis; otherwise skip Step 2
- Continue to `/speckit.plan` directly
- If neither memory path is available, assume no historical architecture constraints beyond Constitution
- Plan-level review proceeds with Constitution + Architecture Guard only

**Without Security Review**:
- Skip Step 4 (Security Review)
- Continue to violation-detection directly
- Flag missing security validation in governance summary
- Plan-level review proceeds with architecture constraints only

**Minimal Viable Workflow** (only Architecture Guard + Spec Kit):
- Detect optional integrations
- Generate plan via core Spec Kit
- Validate against Constitution + architecture boundaries
- Produce summary

The workflow must remain functional with only `architecture-guard` and core Spec Kit.

## Output Structure

The command MUST return:

```markdown
# Governed Planning Summary

## Memory Context
- **Status**: [Synthesized / Skipped / Missing]
- **Key Constraints**: [Bullet points of architectural context used]

## Security Review
- **Status**: [Reviewed / Skipped]
- **Constraints Found**: [Key security-architecture boundaries]
- **Warnings**: [Any high-risk authorization or isolation issues]

## Architecture Review
- **Violations**: [Drift findings or Security-Architecture Conflicts]
- **Consistency Risks**: [How the plan aligns with the Constitution]

## Recommended Actions
- [e.g., Run /speckit.architecture-guard.refactor-generator]
- [e.g., Refine plan to address Security Conflict]
- [e.g., Continue to /speckit.tasks phase]
- **Durable Memory Preservation**: (Proactively triggered) Review the proposed memory entries below.
```

## Guardrails

- **Framework-Agnostic**: Do not assume specific framework conventions unless provided via a preset.
- **Non-Blocking**: Findings should be advisory by default unless they violate a P0 rule in the Constitution.
- **Incremental**: Prefer suggestions for incremental migration over full rewrites.
- **Decoupled**: Do not tightly couple the logic to the internals of other extensions; rely on documented context and repository artifacts.
