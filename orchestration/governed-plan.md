---
description: Generate and validate a technical plan with optional Flash-Mem context, Security Review, and Architecture Guard checks.
---

# Governed Plan Command

## SDD Adapter Resolution

Before executing command, read `adapters/resolve.md` to resolve the selected SDD adapter. Load `adapters/{tool}.md` for path maps, command maps, and gap fills. All paths and commands below use the loaded adapter.

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `{adapter_path:ponytail-template}` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Budgeted Context Contract

Read and apply `{adapter_path:budgeted-context-template}`. `{adapter_path:spec}` and applicable constitutions are authoritative; memory and supported fallbacks may supplement but never replace them.

You are orchestrating the `ag-governed-plan` workflow for `architecture-guard`.

This command coordinates multiple extensions to ensure the technical plan respects architectural, historical, and security constraints before implementation begins.

## Goal

Provide a single command that ensures:
1. Historical lessons are applied from Flash-Mem when available.
2. A technical plan is generated (`{adapter_command:create-plan}`).
3. Security boundaries are respected (Security Review).
4. Architectural drift is detected (Architecture Guard).

## Orchestration Flow

### Write Approval Gate

Before the first mutation, resolve and preview the exact target plan and constraint artifacts together with all planned generation, correction, and constraint-write operations. Obtain explicit user approval, then allow routine writes already previewed within this planning phase without per-file prompts. Newly discovered material scope or any new target path requires a new preview and renewed approval.

### Required Active Inputs

Require an active `{adapter_path:spec}` and applicable `{adapter_path:constitution}`, `{adapter_path:arch-constitution}`, and `{adapter_path:security-constitution}` inputs. For optional split layouts, embedded rules in `{adapter_path:constitution}` satisfy the split input. Ask for Generic paths when unresolved. If the active specification, governance rules, or architecture rules are missing, stop and direct the user to governed-spec or init as appropriate; if security rules are missing, report the gap and obtain explicit confirmation before continuing with baseline security validation.

### Step 1 — Detect Optional Integrations

Check for the availability of:
- `flash-mem` MCP server
- Memory MD local CLI
- `security-review` host capability

**Detection Logic**:
1. Treat `flash-mem` as available only when its MCP tools are exposed by the host.
2. Treat any local memory CLI as available only when exposed by the host; do not probe framework-specific extension internals.
3. Treat Security Review as available only when its capability is exposed by the host.
4. If an optional capability is missing, degrade gracefully by skipping only its respective steps. A missing Flash-Mem MCP service does not make an available Memory MD CLI unavailable.

### Step 2 — Flash-Mem MCP Context Retrieval (Optional)

When Flash-Mem is available, use it first to gather the most relevant architectural context before plan generation. Prefer summary-first context and only expand into repository files when needed.

If Flash-Mem is unavailable or the context is insufficient, continue with the repository artifacts and constitution files available in the workspace.

When Flash-Mem MCP is unavailable but the Memory MD CLI detected in Step 1 is present, use that CLI for supported local context preparation, search, or synthesis before falling back to repository artifacts. Inspect its help once when command syntax is needed; do not search for an MCP wrapper or a global/shared publication tool.

**[OPTIONAL SUB-AGENT DELEGATION]**
* **Capability Gate:** Detect a host synthesis/delegation capability independently of the adapter command map. If unavailable, execute inline regardless of size and report the degraded path.
* **Trigger Condition:** When the capability is available, you **MUST** delegate memory retrieval and synthesis if:
  - The Flash-Mem index contains $\ge 20$ memory documents.
  - OR the project repository contains $\ge 15$ active ADRs/docs.
  - Otherwise, you **MUST** execute inline.
* **Execution:** Invoke the host capability directly with the handoff below and architecture-boundary context. Do not append flags to `{adapter_command:subagent-synthesize}` or execute adapter fallback prose.
* **Strict Handoff Template:** Format the sub-agent prompt exactly like this:
  ```yaml
  Task: Retrieve and synthesize relevant architecture constraints and ADRs.
  Focus: Architecture boundaries and project standards.
  Expected Output: Synthesized markdown summary of key constraints to apply to the technical plan.
  ```


---

### Step 3 — Orchestrate SDD Tool Plan

You must orchestrate the `{adapter_command:create-plan}` workflow directly.

**CRITICAL INSTRUCTION**: You must NOT just advise the user or stop here. You must actually generate the plan:
1. **Apply Ponytail Pragmatism**: Instruct the agent to act as a "lazy senior developer." The generated plan must prefer standard libraries and native platform features over proposing complex new abstractions. Strictly enforce YAGNI.
   - Also prefer one shared plan path for repeated behavior instead of separate duplicated steps or parallel implementations.
2. **Execute Plan**: Run `{adapter_command:create-plan}` to generate and save `{adapter_path:plan}`.

   **If `{adapter_command:create-plan}` is not available as a registered command** (i.e., the AI agent does not recognize it as a slash command), fall back to inline planning:
   - Read the active spec at `{adapter_path:spec}` (or the path provided by the user).
   - Read all applicable constitution files (`{adapter_path:constitution}`, `{adapter_path:arch-constitution}`, `{adapter_path:security-constitution}`).
   - Use Flash-Mem context if available.
   - Generate `{adapter_path:plan}` directly, incorporating all context above and enforcing Ponytail minimalism.
   - Note in the Governance Summary that `{adapter_command:create-plan}` was unavailable and planning was performed inline.

3. The planning process must incorporate the Project Constitution documents and memory synthesis. Use Flash-Mem first when available. If retrieval is unavailable or insufficient, read constitution files directly with file-reading tools. Do not rely solely on workspace search or semantic indexes because these files are often in `.gitignore`.
4. Prefer the cached synthesis and selected index entries over reopening the full durable memory set.

### Step 4 — Security Review (Optional)

IF `security-review` is available as a host capability:
1. **Execute Review**: Invoke the host Security Review capability directly with `{adapter_path:plan}`, the active spec, and applicable constitutions; save its actionable output to `{adapter_path:security-constraints}` only when that write is approved.
2. Focus on:
    - Trust boundaries and authorization assumptions.
    - Data isolation and validation risks.
    - Async security context.

### Step 5 — Architecture Validation

Run:
```text
`{adapter_command:violation-detection}`
```

Inputs to consider:
- The generated the technical design artifact.
- `{adapter_path:arch-constitution}`.
- Flash-Mem context (if available).
- `security-constraints.md` (if available).

Detect any `Security-Architecture Conflict` or architectural drift. Explicitly validate one canonical owner for repeated business rules, approvals, validation, DTO mapping, transformations, and orchestration (DRY), plus artifact locations, temporary/generated files, and repository cleanliness against `{adapter_path:hygiene-rules}`.

### Step 6 — Proactive Durable Memory Preservation

If the planning process or architecture validation identified new architectural patterns, critical decisions, or repeatable lessons:
1. **Capability Gate**: Use a Flash-Mem write tool only when it is exposed by the host.
2. **Approval Required**: Propose validated entries and write them only after explicit user approval.
3. **Bounded Degradation**: Do not probe for Flash-Mem, `speckit_memory_share_lesson`, another MCP wrapper, or global/shared promotion when such a capability is not already exposed. Complete any available local capture or synthesis, report global promotion as unavailable, and finish the governed workflow.
4. **Standard**: Do not silently write memory outside an available formal capture flow; let that flow propose entries and handle user approval when its interface requires approval.

### Step 7 — Generate Governance Summary

Produce a final `Governed Planning Summary` for the user.

## Graceful Degradation

**Without Flash-Mem MCP**:
- Use the detected Memory MD CLI for supported local preparation, search, or synthesis; otherwise skip Step 2
- Continue to `{adapter_command:create-plan}` directly
- If neither memory path is available, assume no historical architecture constraints beyond Constitution
- Plan-level review proceeds with Constitution + Architecture Guard only

**Without Security Review**:
- Skip Step 4 (Security Review)
- Continue to violation-detection directly
- Flag missing security validation in governance summary
- Plan-level review proceeds with architecture constraints only

**Minimal Viable Workflow** (Architecture Guard plus the selected SDD tool):
- Detect optional integrations
- Generate the plan via `{adapter_command:create-plan}` or its inline fallback
- Validate against Constitution + architecture boundaries
- Produce summary

The workflow must remain functional with Architecture Guard and the selected adapter's inline fallbacks.

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
- [e.g., Run `{adapter_command:refactor-generator}`]
- [e.g., Refine plan to address Security Conflict]
- [e.g., Continue to {adapter_command:create-tasks} phase]
- **Durable Memory Preservation**: (Proactively triggered) Review the proposed memory entries below.
```

## Guardrails

- **Framework-Agnostic**: Do not assume specific framework conventions unless provided via a preset.
- **Non-Blocking**: Findings should be advisory by default unless they violate a P0 rule in the Constitution.
- **Independent Security Policy**: Preserve Security Review severity and blocking decisions independently from architecture severity and P0 handling; architecture defaults must not downgrade or unblock Security Review findings.
- **Incremental**: Prefer suggestions for incremental migration over full rewrites.
- **Decoupled**: Do not tightly couple the logic to the internals of other extensions; rely on documented context and repository artifacts.


## Backward Compatibility

The original SpecKit-specific version remains in the repository source checkout under `commands/governed-plan.md` for direct SpecKit use.
