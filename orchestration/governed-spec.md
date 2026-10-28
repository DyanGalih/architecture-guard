---
description: Orchestrate governed specification with memory, framework-native specification, Security Review, architecture validation, and an auto-fix loop.
---

# Governed Specification Command

## SDD Adapter Resolution

Before executing this command, read `.architecture-guard/adapters/resolve.md` and resolve the adapter with its chain (explicit `--adapter` override, `.architecture-guard/selected-adapter`, `.architecture-guard/config.yml`, then filesystem markers), then load `.architecture-guard/adapters/{tool}.md` for path maps, command maps, and gap fills. Stop with `Unavailable` and the exact path if the adapter file is missing. Do not use the Architecture Guard resource resolver for adapter selection: adapter files are not a `resolve` resource category. Resolve every adapter path and command token before continuing; all paths and commands below use the loaded adapter. Resolve an existing change scope with {adapter_command:change-scope} without creating anything; a new change is created only in Step 4, after the branch gate and with explicit approval.

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

Resolve and apply the `budgeted_context_sdd` template with `architecture-guard resolve template budgeted_context_sdd`. Applicable constitutions and `{adapter_path:spec}` are authoritative; memory and supported fallbacks may supplement but never replace them.

You are orchestrating the `ag-governed-spec` workflow for `architecture-guard`.

This command coordinates multiple extensions to ensure the initial specification respects architectural, historical, and security constraints, and provides a clear, validated foundation before planning begins.

## Goal

Provide a single command that ensures:
1. Historical lessons are applied from Flash-Mem when available.
2. A feature specification is generated ({adapter_command:create-spec}).
3. The specification is clarified to resolve ambiguities ({adapter_command:clarify-spec}).
4. Security boundaries and architectural drift are checked.
5. The user is offered an interactive loop to automatically fix any discovered architectural gaps.

## Orchestration Flow

### Write Approval Gate

Before the first mutation, resolve and preview the exact branch, derived change name, and target artifacts for change creation, specification generation, clarification updates, and any fallback-index refresh, together with the planned operations. Obtain explicit user approval, then allow routine writes already previewed within this specification phase without per-file prompts. Newly discovered material scope or any new target path requires a new preview and renewed approval.

### Step 1 — Detect Optional Integrations

Check for the availability of:
- `flash-mem` MCP server
- `security-review` host capability

**Detection Logic**:
1. Detect `flash-mem` as an MCP-backed memory service in the current environment.
2. Detect Security Review as an independent host capability, never from an SDD extension manifest.
3. If either capability is missing, degrade gracefully by skipping only its respective steps.

### Step 2 — Flash-Mem MCP Context Retrieval (Optional)

When Flash-Mem is available, use it first to gather the most relevant architectural context before generating the specification.

### Step 2.5 — Required Governance Inputs

Resolve the selected adapter's project configuration first (`{adapter_path:project-config}`), inspect it for references to further governance and constitution Markdown files (for example a `context` block), then explicitly read every declared or present constitution, architecture, security, and layout Markdown file. Check {adapter_path:constitution-set} when present, plus every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file. For Generic mode, ask the user for every unresolved required path and the destination specification path before continuing; resolve that destination as `{adapter_path:spec}` and never guess or write until it is supplied. For adapters with optional split files, rules embedded in `{adapter_path:constitution}` satisfy the corresponding input. If governance or architecture rules are missing entirely, stop and direct the user to the adapter-registered init capability. If security rules are missing, report the gap and require explicit user confirmation before continuing with baseline security checks and optional host Security Review.

### Step 3 — Branch Management

Before generating the specification, you MUST ensure work happens on a feature branch.
1. Check the current git branch.
2. If on `main`, `master`, `dev*` (e.g., `dev`, `develop`, `development`), or `staging`, require creation or selection of a feature branch before any specification write.
3. Ask approval before branch creation, create it using available tools, and stop if creation or checkout fails or approval is declined. If the adapter requires stricter branch handling, enforce it.

### Step 4 — Create or Select the Change Container

1. Ask separately for the change (feature) name and, when the adapter organizes specifications by capability, the capability name; never derive one from the other or treat a capability name as a change name.
2. Reuse an existing matching change only after confirming it is the user's intended active work.
3. When a new change is needed, show the derived change name and container path in the Write Approval Gate preview and execute {adapter_command:create-change} only after explicit approval, before requesting framework instructions or writing specification artifacts. If approval is declined, stop.

### Step 5 — Orchestrate SDD Tool Specification

You must orchestrate {adapter_command:create-spec} workflow directly.

1. **Seed from Discovery (if available)**: If a Discovery Summary Draft from the governed-discover capability is available, use it as the seed input for specification generation instead of starting from scratch. Carry forward its architecture alignment, rejected options, assumptions, and open questions. When it has an accepted **Story Set**, record it in a `## Stories` section of the change's proposal when the adapter defines one, otherwise of `{adapter_path:spec}`: one line per key, marked `main` or `bundled`, with its summary. The specification's requirements must cover the acceptance criteria of every story in the set and nothing beyond them. Later scope checks (the `story_scope` template) read this section as the approved scope. Carry its **Governance Suggestions** forward as open items; do not apply them here.
2. **Execute Specify**: Run {adapter_command:create-spec} to generate and save the selected change-level capability spec at `{adapter_path:spec}`. First apply {adapter_command:spec-template}.
3. **Validate Immediately**: Run {adapter_command:validate-spec} immediately after writing the spec. If it fails, repair the spec against the resolved template and validate again, at most 2 repair attempts; if it still fails, stop the phase and report the remaining validation errors before clarification or planning.
4. **Apply Ponytail Pragmatism**: Instruct the agent to prevent over-specified, "future-proofed" requirements. Keep the specification minimal and focused purely on the immediate needs (YAGNI).
5. The specification process must incorporate the Project Constitution documents and memory synthesis. Use Flash-Mem first when available.

### Step 6 — Orchestrate Specification Clarification

You must orchestrate {adapter_command:clarify-spec} workflow directly.

1. **Execute Clarify**: Run {adapter_command:clarify-spec} to resolve ambiguities in the newly generated `{adapter_path:spec}`.
2. Ensure clarification reads the complete constitution set resolved from the selected configuration, including every declared or present governance, architecture, security, and layout Markdown file.

### Step 7 — Architecture Validation

Run an inline architecture validation against the clarified specification.
Inputs to consider:
- The generated `{adapter_path:spec}`.
- Every declared or present governance, architecture, security, and layout Markdown file resolved from the selected configuration.
- Flash-Mem context (if available).

Detect any `Security-Architecture Conflict` or architectural drift present in the specification's assumptions or boundaries. Explicitly validate that repeated business rules, approvals, validation, DTO mapping, transformations, and orchestration have one intended owner (DRY), and that proposed paths, generated artifacts, temporary files, and repository placement comply with the complete hygiene-rule set resolved through `architecture-guard`.

If the host exposes Security Review and the specification is security-sensitive or security rules are missing, invoke that host capability directly with `{adapter_path:spec}` and applicable constitutions. Do not execute adapter fallback prose as a command. Record its findings separately and feed architecture-boundary conflicts into this validation.

### Step 8 — Proactive Durable Memory Preservation

If the specification process or architecture validation identified new architectural patterns or critical decisions:
1. **Proactive Proposal**: When Flash-Mem is available, draft proposed entries for `capture_artifact_memory` (for the written specification) or `add_memory` (for a new durable decision) in proposal-only mode.
2. **Approval Required**: Show the proposed entries and obtain explicit user approval before invoking any memory write tool.
3. **Standard**: Never write memory without that approval. If Flash-Mem is unavailable, report the proposals as `Unavailable` and skip the write.

### Step 9 — Generate Governance Summary

Produce a final `Governed Specification Summary` outlining memory context, architectural review status, and any violations found.

If `context.mode` is `budgeted` and `stale_policy` is `regenerate`, recommend running `ag-consolidate-specs` (which previews and asks before writing) after the specification and clarification changes are complete; do not write the fallback index from this command. If the policy is `targeted`, report that the existing fallback is stale and do not load it until refreshed.

### Step 10 — Interactive Auto-Fix Loop

If any architectural gaps, security boundary issues, or drift are detected in Step 7:
1. **Pause and Ask**: Conclude your response by asking the user:
   > *"I found [number] architectural gaps. Would you like me to automatically revise the specification to address these findings and re-run clarification?"*
2. **Execute if Approved**: If the user answers "yes" (or equivalent) in their next message, you must:
   - Rewrite `{adapter_path:spec}` to resolve the detected gaps.
   - Re-run {adapter_command:validate-spec} after each rewrite, sharing the Step 5 cap of at most 2 repair attempts; if validation still fails, stop and report the remaining errors.
   - Run the clarification process again to ensure no new ambiguities were introduced.
   - Re-run the Step 7 architecture validation and re-evaluate any blocking findings (Constitution P0 or policy-designated security blockers) before presenting the result; if a blocker remains, report `Blocked` and stop.
   - Present the clean result.
   - When budgeted mode uses the `regenerate` policy, recommend `ag-consolidate-specs` to refresh the fallback index.

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

- **SDD-Tool-Agnostic**: Do not assume specific SDD tool conventions unless provided via a preset.
- **Ponytail Pragmatism**: Act as a lazy senior developer. Ensure the spec avoids bloat, complex abstractions, and over-engineering.
- **Specification Phase**: Do NOT generate refactor tasks. Code does not exist yet. Fixes should be applied directly to the specification via the auto-fix loop.
