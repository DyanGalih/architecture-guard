---
description: Generate and validate a technical plan with optional Flash-Mem context, Security Review, and Architecture Guard checks.
---

# Governed Plan Command

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `.specify/extensions/architecture-guard/templates/budgeted_context.md` (or `templates/budgeted_context.md` in the extension source checkout). The active feature's `spec.md` and all applicable constitutions are mandatory and authoritative. Flash-Mem and `system_context.md` may supplement but never replace them.

You are orchestrating the `ag-governed-plan` workflow for `architecture-guard`.

This command coordinates multiple extensions to ensure the technical plan respects architectural, historical, and security constraints before implementation begins.

## Goal

Provide a single command that ensures:
1. Historical lessons are applied from Flash-Mem when available.
2. A technical plan is generated (`/speckit.plan`).
3. Security boundaries are respected (Security Review).
4. Architectural drift is detected (Architecture Guard).

## Orchestration Flow

### Write Approval Gate

Before the first mutation, resolve and preview the exact target plan and constraint artifacts together with all planned generation, correction, and constraint-write operations. Obtain explicit user approval, then allow routine writes already previewed within this planning phase without per-file prompts. Newly discovered material scope or any new target path requires a new preview and renewed approval.

### Required Active Inputs

Require the active feature `spec.md` plus `.specify/memory/constitution.md`, `.specify/memory/architecture_constitution.md`, and `.specify/memory/security_constitution.md`. If the active specification, governance rules, or architecture rules are missing, stop and direct the user to `/ag-governed-spec` or `/ag-init`; if security rules are missing, report the gap and obtain explicit confirmation before baseline security validation.

### Step 1 — Detect Optional Integrations

Check for the availability of:
- `flash-mem` MCP server
- Memory MD local CLI
- Security Review integration

**Detection Logic**:
1. Treat `flash-mem` as available only when its MCP tools are already exposed in the current environment. Do not treat it as a Spec Kit extension, look for it in `.specify/extensions.yml`, or repeatedly probe for hidden MCP/global-promotion capabilities.
2. Check for the Memory MD runtime directly with `test -f .specify/extensions/memory-md/dist/bin/speckit-memory.js`. If present, invoke supported local operations with `node .specify/extensions/memory-md/dist/bin/speckit-memory.js <command>`. Do not use default `rg --files` to decide that this runtime is missing: `dist/` and `node_modules/` may be gitignored. If additional discovery is necessary, use `find` or `rg --files -uu`.
3. Inspect the installed list in `.specify/extensions.yml` for the canonical `security-review` extension or compatibility alias `spec-kit-security-review`.
4. Manifest presence is not availability. If either extension name is installed, verify that `/speckit.security-review.plan` is registered and callable before selecting the SpecKit integration.
5. If that command is absent, detect an independently registered Architecture Guard-compatible Security Review host capability with a plan operation and select it instead.
6. If neither path is callable, mark Security Review `Unavailable` and degrade without claiming a pass.
7. If an optional capability is missing, degrade gracefully by skipping only its respective steps. A missing Flash-Mem MCP service does not make an available Memory MD CLI unavailable.

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
1. **Apply Ponytail Pragmatism & Shift-Left Quality**: Instruct the agent to act as a "lazy senior developer." The generated plan must prefer standard libraries and native platform features over proposing complex new abstractions. Strictly enforce YAGNI.
   - Proactively specify bounded collection reads and server-side pagination for all list/query endpoints.
   - Proactively design explicit request/response DTO serialization envelopes and OpenAPI contracts.
   - Proactively define input parameter validation (e.g. UUID pipes, sanitization) at controller/API boundaries.
   - Proactively establish transaction failure-safety and error-recovery ownership boundaries.
   - Proactively plan repository hygiene: explicitly declare target paths and forbid temporary/comparison artifacts or unverified schema clones.
   - Also prefer one shared plan path for repeated behavior instead of separate duplicated steps or parallel implementations.
2. **Execute Plan**: Run `/speckit.plan` to generate and save the technical design document (e.g., `specs/<feature>/plan.md` or `openspec/.../design.md`).

   **If `/speckit.plan` is not available as a registered command** (i.e., the AI agent does not recognize it as a slash command), fall back to inline planning:
   - Read the active spec at `specs/<feature>/spec.md` (or the path provided by the user).
   - Read all applicable constitution files (`.specify/memory/constitution.md`, `.specify/memory/architecture_constitution.md`, `.specify/memory/security_constitution.md`).
   - Use Flash-Mem context if available.
   - Generate the technical design document (e.g., `specs/<feature>/plan.md` or `openspec/.../design.md`) directly, incorporating all context above and enforcing Ponytail minimalism.
   - Note in the Governance Summary that `/speckit.plan` was unavailable and planning was performed inline.

3. The planning process must incorporate the Project Constitution documents and memory synthesis. Use Flash-Mem first when available. If retrieval is unavailable or insufficient, read constitution files directly with file-reading tools. Do not rely solely on workspace search or semantic indexes because these files are often in `.gitignore`.
4. Prefer the cached synthesis and selected index entries over reopening the full durable memory set.

### Step 4 — Security Review (Optional)

IF Security Review is available:
1. **Execute Review**: Invoke `/speckit.security-review.plan` when selected; otherwise dispatch the selected host capability's plan operation. Preview the exact `specs/<feature>/security-constraints.md` changes and require explicit user approval before writing them.
2. Focus on:
    - Trust boundaries and authorization assumptions.
    - Data isolation and validation risks.
    - Async security context.

### Step 5 — Architecture Validation

Run:
```text
/ag-violation-detection
```

Inputs to consider:
- The generated technical design document (the exact filename depends on the active SDD tool).
- `.specify/memory/architecture_constitution.md`.
- Flash-Mem context (if available).
- `security-constraints.md` (if available).

Detect any `Security-Architecture Conflict` or architectural drift. Explicitly validate one canonical owner for repeated business rules, approvals, validation, DTO mapping, transformations, and orchestration (DRY), plus artifact placement, temporary/generated files, and repository hygiene.

### Step 6 — Proactive Durable Memory Preservation

If the planning process or architecture validation identified new architectural patterns, critical decisions, or repeatable lessons:
1. **Capability Gate**: Use a Flash-Mem write tool only when that tool is already exposed in the current environment. Otherwise, if the Memory MD CLI detected in Step 1 supports the required local capture operation, use `node .specify/extensions/memory-md/dist/bin/speckit-memory.js <command>`.
2. **Approval Required**: When either explicit capture path is available, propose the durable-memory entries and write them only after explicit user approval.
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
- Report Security Review as `Unavailable` and flag missing security validation in the governance summary; do not claim a pass
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
- **Status**: [Reviewed / Advisory / Blocked / Unavailable]
- **Constraints Found**: [Key security-architecture boundaries]
- **Warnings**: [Any high-risk authorization or isolation issues]

## Architecture Review
- **Violations**: [Drift findings or Security-Architecture Conflicts]
- **Consistency Risks**: [How the plan aligns with the Constitution]

## Recommended Actions
- [e.g., Run /ag-refactor-generator]
- [e.g., Refine plan to address Security Conflict]
- [e.g., Continue to /speckit.tasks phase]
- **Durable Memory Preservation**: (Proactively triggered) Review the proposed memory entries below.
```

## Guardrails

- **SDD-Tool-Agnostic**: Do not assume specific SDD tool conventions unless provided via a preset.
- **Non-Blocking**: Findings should be advisory by default unless they violate a P0 rule in the Constitution.
- **Independent Security Policy**: Preserve Security Review severity and blocking decisions independently from architecture severity and P0 handling.
- **Incremental**: Prefer suggestions for incremental migration over full rewrites.
- **Decoupled**: Do not tightly couple the logic to the internals of other extensions; rely on documented context and repository artifacts.
