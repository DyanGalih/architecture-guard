---
description: Facilitate an architecture-aware discussion to flesh out ideas before generating a formal specification.
---

# Governed Discovery Command

## SDD Adapter Resolution

Before executing command, read `adapters/resolve.md` to resolve the selected SDD adapter. Load `adapters/{tool}.md` for path maps, command maps, and gap fills. All paths and commands below use the loaded adapter.

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

You are orchestrating the `ag-governed-discover` workflow for `architecture-guard`.

This command coordinates an architecture-aware brainstorming and discovery phase before a formal specification is written. It helps ideas align with existing historical and architectural constraints, reducing drift early in the lifecycle while still leaving final validation to `ag-governed-spec`.

## Flash-Mem-First Architecture Context Retrieval

When Flash-Mem is available, call `get_project_summary`, then `search_memory`; prefer summaries and metadata and load full entries only as needed. Reuse approved decisions and flag conflicts. If retrieval is unavailable or insufficient, resolve the selected adapter project configuration first (`openspec/config.yaml` for OpenSpec), inspect its `context` block for every referenced governance and constitution Markdown file, then explicitly read every declared or present constitution, architecture, security, and layout Markdown file before using repository artifacts. For OpenSpec, check `openspec/constitution.md`, `openspec/architecture.md`, `openspec/security.md`, and `openspec/layout.md`; for other adapters, read every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file.

## Goal

Provide a single command that ensures:
1. Historical lessons and architecture rules are loaded from Flash-Mem (when available) before ideation.
2. The user can discuss, refine, and brainstorm their feature idea interactively.
3. The AI actively warns the user if a proposed idea conflicts with established architecture.
4. Non-blocking architecture concerns are recorded as risks and alternatives; only explicitly blocking or P0 rules should stop the discovery path.
5. The final, agreed-upon idea is drafted into a clean format ready for the adapter-registered governed-spec capability.

## Orchestration Flow

### Step 1 — Detect Optional Integrations

Check for the availability of:
- `flash-mem` MCP server
- `security-review` host capability

**Detection Logic**:
1. Detect `flash-mem` as an MCP-backed memory service in the current environment.
2. Detect Security Review as an independent host capability, never from an SDD extension manifest. If present, note it for downstream security flagging.
3. If either capability is missing, degrade gracefully. Without `flash-mem`, resolve the selected adapter project configuration first (`openspec/config.yaml` for OpenSpec), inspect its `context` block for every referenced governance and constitution Markdown file, then explicitly read every declared or present constitution, architecture, security, and layout Markdown file. For OpenSpec, check `openspec/constitution.md`, `openspec/architecture.md`, `openspec/security.md`, and `openspec/layout.md`; for other adapters, read every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file.

### Step 2 — Architecture Context Retrieval

Retrieve the most relevant architectural context for the user's idea before starting the discussion. Use `flash-mem` first.

If the user supplied no feature idea or only a title, ask for the minimum input needed to proceed: the user/problem, desired outcome, and known scope. Ask one necessary question at a time and remain read-only.

### Step 3 — Current Implementation Review (Optional)

If the user's prompt suggests modifying an existing feature, analyze the current codebase for that feature to ensure the proposed ideas fit seamlessly with the existing patterns.

Keep this review read-only and scan for boundary drift, duplicated business rules or orchestration (DRY risk), misplaced/generated artifacts, temporary files, and repository hygiene risks. Carry findings into the handoff as risks; do not modify the repository.

### Step 4 — Interactive Discussion Loop

Enter an interactive Q&A discussion with the user.

1. **Acknowledge and Advise**: Briefly state your understanding of the user's idea and any immediate architectural considerations.
2. **Warn on Violations**: If the user suggests an idea that conflicts with an architectural constraint (e.g., adding a new database when the constitution mandates a single shared database), you MUST warn them, identify whether the rule is blocking/P0 or non-blocking, and suggest an architecture-compliant alternative.
3. **Refine**: Ask clarifying questions to flesh out edge cases, UX flows, and technical boundaries.

*Do not generate a full specification markdown file during this phase. Keep the interaction conversational and focused on alignment.*

If required questions remain unresolved, ask only the next necessary questions and do not produce the final handoff draft yet.

If the user proposes a feature that touches authentication, authorization, PII, secrets, trust boundaries, or data exposure, always flag it as security-sensitive in the handoff. If the `security-review` host capability was detected in Step 1, additionally request its downstream review; otherwise retain the flag and note that external Security Review is unavailable.

### Step 4.5 — Durable Memory Proposal

If the discussion surfaced new architectural decisions, rejected alternatives, or clarified constraints:
1. **Proposal Only**: Include proposed durable-memory entries in the Discovery Summary Draft; do not write memory during discovery.
2. **Handoff**: The next mutating workflow may execute the formal capture flow after the user approves the proposal.

### Step 5 — Handoff Draft Generation

Once you and the user are aligned on the feature details and any blocking/P0 conflicts are resolved:
1. Conclude the discussion.
2. Generate a structured **Discovery Summary Draft**.
3. Hand the draft to the adapter-registered governed-spec capability as its seed input.

## Output Structure

When the discussion is concluded and aligned, the command MUST return:

```markdown
# Discovery Summary Draft

## Feature Overview
[Summary of the agreed-upon feature]

## Architecture Alignment
- **Constraints Respected**: [How the feature aligns with the constitution]
- **Key Decisions**: [Any important architectural choices made during brainstorming]

## Implementation Context
- **Existing Patterns Reviewed**: [Relevant codebase patterns, if reviewed]
- **Assumptions**: [Assumptions that governed-spec should verify]

## Rejected Options
- [Options avoided because they conflict with architecture, add drift, or over-engineer the solution]

## Open Questions
- [Non-blocking questions that can be resolved during governed-spec]

## Security-Sensitive Areas
- [Auth, PII, secrets, trust boundaries, or data-exposure concerns; state "None identified" only after checking]

## DRY & Repository Hygiene Risks
- [Duplicate ownership, repeated logic, misplaced/generated artifacts, temporary files, or "None identified"]

## Durable Memory Proposals
- [Proposed decision/constraint/lesson, rationale, and intended Flash-Mem type; or "None"]

## Recommended Next Step
To proceed to implementation and avoid a "Feature: Not selected" error, you must initialize the feature using the active SDD tool's workflow (e.g., creating a new OpenSpec change) before running a delivery phase.

You can now run:
1. The adapter-registered command to create a new change/feature (Suggested name: `<suggested-feature-name>`).
2. Then choose a delivery workflow with this Discovery Summary Draft as input:
   - For solo developers: run the adapter-registered `governed-delivery` capability.
   - For teams: run the adapter-registered `governed-delivery-team` capability to generate a User Story for business review first.
```

## Guardrails

- **Conversational**: The goal is discussion and alignment, not outputting massive markdown files immediately.
- **Non-Blocking Governance**: Treat the architecture constitution as authoritative context. Clearly warn on drift, recommend compliant alternatives, and only stop the path when a rule is explicitly blocking or P0.
- **Ponytail Pragmatism**: Advocate for the simplest, lowest-effort solution that satisfies the user's goal without over-engineering.
- **Strictly Read-Only**: Discovery is strictly read-only. Do not create, modify, delete, install, upgrade, or format source files, dependency manifests, lockfiles, tests, specs, plans, tasks, or configuration. Only inspect files and discuss options. Implementation requires an explicit transition to governed-spec, governed-plan, or governed-implement.
- **Override Handling**: If the user attempts to skip, override, or prematurely exit the discovery stage, you MUST pause and ask them to choose one of three paths: 1) Create the Discovery Summary Draft based on the discussion so far, 2) Exit discovery immediately (warning them that current discovery context will be lost), or 3) Continue the discovery discussion.

## Graceful Degradation

**Without Flash-Mem MCP**:
- Skip Step 2 (Architecture Context Retrieval from Flash-Mem)
- Fall back to resolving the selected configuration first (`openspec/config.yaml` for OpenSpec), then reading every declared or present governance, architecture, security, and layout Markdown file directly. Do not silently omit an existing file.

**Without Security Review**:
- Continue identifying and flagging all security-sensitive ideas
- Note that external Security Review is unavailable in the Discovery Summary Draft

**Minimal Viable Workflow** (only Architecture Guard):
- Read the selected adapter's project configuration first (`openspec/config.yaml` for OpenSpec), then every declared or present governance, architecture, security, and layout Markdown file directly. Do not silently omit an existing file.
- Enter interactive discussion
- Generate handoff draft
