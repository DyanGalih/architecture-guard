---
description: Generate and validate a technical plan with optional Flash-Mem context, Security Review, and Architecture Guard checks.
---

# Governed Plan Command

## SDD Adapter Resolution

Before executing this command, read `.architecture-guard/adapters/resolve.md` and resolve the adapter with its chain (explicit `--adapter` override, `.architecture-guard/selected-adapter`, `.architecture-guard/config.yml`, then filesystem markers), then load `.architecture-guard/adapters/{tool}.md` for path maps, command maps, and gap fills. Stop with `Unavailable` and the exact path if the adapter file is missing. Do not use the Architecture Guard resource resolver for adapter selection: adapter files are not a `resolve` resource category. Resolve every adapter path and command token before continuing; all paths and commands below use the loaded adapter.

## Change Scope

Before any SDD artifact lookup or command, establish the active change scope with {adapter_command:change-scope}. If no unambiguous scope can be resolved, stop and ask the user rather than continuing without one.

## Standalone Resource Resolution

Architecture Guard engine resources are standalone package resources. Never search an SDD-tool directory, an extension directory, or a source checkout for them. An adapter path under `.architecture-guard` is an editable local override location, not proof that the resource was copied.

- Directly inspect the matching `.architecture-guard/<category>/` directory first for workspace overrides.
- If the named local resource exists, read it. Otherwise run `architecture-guard resolve <category> <name>` and use the returned content.
- For a resource collection, run `architecture-guard resolve <category> --list`, then resolve every returned name individually in deterministic order so local overrides replace bundled files without hiding bundled defaults.
- If the CLI is unavailable and a mandatory resource is not vendored locally, stop and report the missing runtime dependency. For optional resources, report `Unavailable` and continue only when this command explicitly permits degradation.

## Ponytail Core Contract

Before continuing, you **MUST** resolve and apply the `ponytail_core` template with `architecture-guard resolve template ponytail_core` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Capability Composition

Resolve and apply the `capability_composition` template with `architecture-guard resolve template capability_composition` before delegating to another Architecture Guard capability. Resolve and read the installed sibling skill or command file directly; do not treat a capability name or Markdown path as an invocation.

## Repository Context

Resolve and apply the `repository_context` template with `architecture-guard resolve template repository_context`. When `.architecture-guard/config.yml` lists `repositories`, every git, branch, test, hygiene, commit, push, and code-host step in this skill runs in the repository that owns the files it concerns, as that template defines, and paths are workspace-relative; rules, constitutions, and configuration still come from the workspace. Without `repositories`, the workspace is the only repository and nothing changes.

## Budgeted Context Contract

Resolve and apply the `budgeted_context_sdd` template with `architecture-guard resolve template budgeted_context_sdd`. `{adapter_path:spec}` and applicable constitutions are authoritative; memory and supported fallbacks may supplement but never replace them.

You are orchestrating the `ag-governed-plan` workflow for `architecture-guard`.

This command coordinates multiple extensions to ensure the technical plan respects architectural, historical, and security constraints before implementation begins.

## Goal

Provide a single command that ensures:
1. Historical lessons are applied from Flash-Mem when available.
2. A technical plan is generated ({adapter_command:create-plan}).
3. Security boundaries are respected (Security Review).
4. Architectural drift is detected (Architecture Guard).

## Orchestration Flow

### Write Approval Gate

Before the first mutation, resolve and preview the exact target plan and constraint artifacts together with all planned generation, correction, and constraint-write operations. Obtain explicit user approval, then allow routine writes already previewed within this planning phase without per-file prompts. Newly discovered material scope or any new target path requires a new preview and renewed approval.

### Constitution Inputs

Resolve the selected adapter's project configuration first (`{adapter_path:project-config}`), inspect it for references to further governance and constitution Markdown files (for example a `context` block), then explicitly read every declared or present governance, constitution, architecture, security, and layout Markdown file with file-reading tools. Check {adapter_path:constitution-set} when present, plus every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file, and do not rely solely on workspace search or semantic indexes because these files are often in `.gitignore`. Read them anyway, but report any governance file that is gitignored or outside the repository as a hygiene WARNING: reviewers and teammates cannot open a rule that code or specs cite. For optional split layouts, embedded rules in `{adapter_path:constitution}` satisfy the corresponding input. Later steps refer to this set as the **Constitution Inputs**; load it once and reuse it.

### Required Active Inputs

Require an active `{adapter_path:spec}` and the complete Constitution Inputs. Ask for Generic paths when unresolved. If the active specification, governance rules, or architecture rules are missing, stop and direct the user to governed-spec or init as appropriate; if security rules are missing, report the gap and obtain explicit confirmation before continuing with baseline security validation.

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

If Flash-Mem is unavailable or the context is insufficient, rely on the Constitution Inputs loaded above before continuing with repository artifacts.

When Flash-Mem MCP is unavailable but the Memory MD CLI detected in Step 1 is present, use that CLI for supported local context preparation, search, or synthesis before falling back to repository artifacts. Inspect its help once when command syntax is needed; do not search for an MCP wrapper or a global/shared publication tool.

**[OPTIONAL SUB-AGENT DELEGATION]**
* **Capability Gate:** Detect a host synthesis/delegation capability independently of the adapter command map. If unavailable, execute inline regardless of size and report the degraded path.
* **Trigger Condition:** When the capability is available, you **MUST** delegate memory retrieval and synthesis if:
  - The Flash-Mem index contains $\ge 20$ memory documents.
  - OR the project repository contains $\ge 15$ active ADRs/docs.
  - Otherwise, you **MUST** execute inline.
* **Execution:** Invoke the host capability directly with the handoff below and architecture-boundary context. Do not append flags to {adapter_command:subagent-synthesize} or execute adapter fallback prose.
* **Strict Handoff Template:** Format the sub-agent prompt exactly like this:
  ```yaml
  Task: Retrieve and synthesize relevant architecture constraints and ADRs.
  Focus: Architecture boundaries and project standards.
  Expected Output: Synthesized markdown summary of key constraints to apply to the technical plan.
  ```


---

### Step 3 — Orchestrate SDD Tool Plan

You must orchestrate {adapter_command:create-plan} workflow directly.

**CRITICAL INSTRUCTION**: You must NOT just advise the user or stop here. You must actually generate the plan:
1. **Apply Ponytail Pragmatism & Shift-Left Quality**: Instruct the agent to act as a "lazy senior developer." The generated plan must prefer standard libraries and native platform features over proposing complex new abstractions. Strictly enforce YAGNI.
   - Proactively specify bounded collection reads and server-side pagination for all list/query endpoints.
   - Proactively design explicit request/response DTO serialization envelopes and OpenAPI contracts.
   - Proactively define input parameter validation (e.g. UUID pipes, sanitization) at controller/API boundaries.
   - Proactively establish transaction failure-safety and error-recovery ownership boundaries.
   - When the constitution declares `Performance Constraints`, state for each one that applies to the change how the plan meets it (for example the page size, the index, or the work moved off the request path). Do not add performance work the constitution does not ask for.
   - Proactively plan repository hygiene: explicitly declare target paths and forbid temporary/comparison artifacts or unverified schema clones.
   - Also prefer one shared plan path for repeated behavior instead of separate duplicated steps or parallel implementations.
2. **Execute Plan**: Run {adapter_command:create-plan} to generate and save `{adapter_path:plan}`.

   Follow the adapter-defined action; if it names a command that is not available, use the adapter's own inline fallback. When planning inline:
   - Read the active spec at `{adapter_path:spec}` (or the path provided by the user) and the Constitution Inputs.
   - Use Flash-Mem context if available.
   - Generate `{adapter_path:plan}` directly, incorporating all context above and enforcing Ponytail minimalism.
   - Note in the Governance Summary that planning was performed inline.
3. The planning process must incorporate the Constitution Inputs and memory synthesis. Use Flash-Mem first when available.
4. Prefer the cached synthesis and selected index entries over reopening the full durable memory set.

#### Claude Code Agent Teams Coordination (When Active)

Activate this protocol only when the Claude Code host exposes named teammate spawning and messaging, `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is enabled, and the user opted into Agent Teams for the current run. Otherwise execute the same work in single-agent mode:
- **Analyst Creator** drafts the technical design artifact at `{adapter_path:plan}` and decomposes requirements.
- **Analyst Reviewer** audits the artifacts against the constitutions, Ponytail pragmatism, DRY boundaries, and security constraints through host messaging.
- **Lead Session** resolves review findings, synthesizes the final plan, and pauses for explicit human approval before task generation.


### Step 4 — Security Review (Optional)

IF `security-review` is available as a host capability:
1. **Execute Review**: Invoke the host Security Review capability directly with `{adapter_path:plan}`, the active spec, and applicable constitutions; save its actionable output to `{adapter_path:security-constraints}` only when that write is approved.
2. Focus on:
    - Trust boundaries and authorization assumptions.
    - Data isolation and validation risks.
    - Async security context.

### Step 5 — Architecture Validation

Resolve {adapter_command:violation-detection}. If it identifies a registered capability, invoke it; otherwise perform the adapter's documented inline validation. Never execute descriptive fallback prose as a shell or slash command.

Inputs to consider:
- The generated technical design artifact.
- Every declared or present governance, architecture, security, and layout Markdown file resolved from the selected configuration.
- Flash-Mem context (if available).
- `{adapter_path:security-constraints}` (if available).

Detect any `Security-Architecture Conflict` or architectural drift. Explicitly validate one canonical owner for repeated business rules, approvals, validation, DTO mapping, transformations, and orchestration (DRY), plus artifact locations, temporary/generated files, and repository cleanliness against the complete hygiene-rule set resolved through `architecture-guard`.

### Step 6 — Proactive Durable Memory Preservation

If the planning process or architecture validation identified new architectural patterns, critical decisions, or repeatable lessons:
1. **Capability Gate**: Use a Flash-Mem write tool only when it is exposed by the host.
2. **Approval Required**: Propose validated entries and write them only after explicit user approval.
3. **Bounded Degradation**: Do not probe for Flash-Mem, SDD-tool memory wrappers, another MCP wrapper, or global/shared promotion when such a capability is not already exposed. Complete any available local capture or synthesis, report global promotion as unavailable, and finish the governed workflow.
4. **Standard**: Never write memory silently. When a formal capture flow is available, use it to propose entries, but write only after the explicit user approval in item 2, even if the flow's own interface would not ask.

### Step 7 — Generate Governance Summary

Produce a final `Governed Planning Summary` for the user.

## Graceful Degradation

**Without Flash-Mem MCP**:
- Use the detected Memory MD CLI for supported local preparation, search, or synthesis; otherwise skip Step 2
- Continue to {adapter_command:create-plan} directly
- If neither memory path is available, assume no historical architecture constraints beyond Constitution
- Plan-level review proceeds with Constitution + Architecture Guard only

**Without Security Review**:
- Skip Step 4 (Security Review)
- Continue to violation-detection directly
- Flag missing security validation in governance summary
- Plan-level review proceeds with architecture constraints only

**Minimal Viable Workflow** (Architecture Guard plus the selected SDD tool):
- Detect optional integrations
- Generate the plan via {adapter_command:create-plan} or its inline fallback
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
- **Status**: [Reviewed / Advisory / Blocked / Unavailable] — `Unavailable` means no independent Security Review ran; never report it as a pass.
- **Constraints Found**: [Key security-architecture boundaries]
- **Warnings**: [Any high-risk authorization or isolation issues]

## Architecture Review
- **Violations**: [Drift findings or Security-Architecture Conflicts]
- **Consistency Risks**: [How the plan aligns with the Constitution]

## Recommended Actions
- [e.g., Run {adapter_command:refactor-generator}]
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
