---
description: Facilitate an architecture-aware discussion to flesh out ideas before generating a formal specification.
---

# Governed Discovery Command

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `.specify/extensions/architecture-guard/templates/ponytail_core.md` (or `templates/ponytail_core.md` in the extension source checkout) as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

You are orchestrating the `governed-discover` workflow for `architecture-guard`.

This command coordinates an architecture-aware brainstorming and discovery phase before a formal specification is written. It helps ideas align with existing historical and architectural constraints, reducing drift early in the lifecycle while still leaving final validation to `governed-spec`.

## Flash-Mem-First Architecture Context Retrieval

When Flash-Mem is available, call `get_project_summary`, then `search_memory`; prefer summaries and metadata and load full entries only as needed. Reuse approved decisions and flag conflicts. If retrieval is unavailable or insufficient, fall back to repository artifacts and constitution files.

## Goal

Provide a single command that ensures:
1. Historical lessons and architecture rules are loaded from Flash-Mem (when available) before ideation.
2. The user can discuss, refine, and brainstorm their feature idea interactively.
3. The AI actively warns the user if a proposed idea conflicts with established architecture.
4. Non-blocking architecture concerns are recorded as risks and alternatives; only explicitly blocking or P0 rules should stop the discovery path.
5. The final, agreed-upon idea is drafted into a clean format ready to be passed to `/speckit.architecture-guard.governed-spec`.

## Orchestration Flow

### Step 1 — Detect Optional Integrations

Check for the availability of:
- `flash-mem` MCP server
- `security-review` (or compatibility alias `spec-kit-security-review`) extension

**Detection Logic**:
1. Detect `flash-mem` as an MCP-backed memory service in the current environment.
2. Read `.specify/extensions.yml` and check the `installed` list for `security-review` (or compatibility alias `spec-kit-security-review`). If present, note it for downstream security flagging.
3. If either capability is missing, degrade gracefully. Without `flash-mem`, rely on the local `.specify/memory/architecture_constitution.md` and `.specify/memory/security_constitution.md` files.

### Step 2 — Architecture Context Retrieval

Retrieve the most relevant architectural context for the user's idea before starting the discussion. Use `flash-mem` first.

### Step 3 — Current Implementation Review (Optional)

If the user's prompt suggests modifying an existing feature, analyze the current codebase for that feature to ensure the proposed ideas fit seamlessly with the existing patterns.

### Step 4 — Interactive Discussion Loop

Enter an interactive Q&A discussion with the user.

1. **Acknowledge and Advise**: Briefly state your understanding of the user's idea and any immediate architectural considerations.
2. **Warn on Violations**: If the user suggests an idea that conflicts with an architectural constraint (e.g., adding a new database when the constitution mandates a single shared database), you MUST warn them, identify whether the rule is blocking/P0 or non-blocking, and suggest an architecture-compliant alternative.
3. **Refine**: Ask clarifying questions to flesh out edge cases, UX flows, and technical boundaries.

*Do not generate a full specification markdown file during this phase. Keep the interaction conversational and focused on alignment.*

If required questions remain unresolved, ask only the next necessary questions and do not produce the final handoff draft yet.

If the user proposes a feature that touches authentication, authorization, PII, or data exposure, and `security-review` (or compatibility alias `spec-kit-security-review`) was detected in Step 1, flag the idea for downstream security review.

### Step 4.5 — Proactive Durable Memory Preservation

If the discussion surfaced new architectural decisions, rejected alternatives, or clarified constraints:
1. **Proactive Execution**: You **MUST automatically execute** the durable-memory capture flow.
2. **Standard**: Do not silently write memory outside the capture flow; let the formal capture flow propose entries and handle user approval.

### Step 5 — Handoff Draft Generation

Once you and the user are aligned on the feature details and any blocking/P0 conflicts are resolved:
1. Conclude the discussion.
2. Generate a structured **Discovery Summary Draft**.
3. Advise the user to pass this draft to the specification phase.

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

## Recommended Next Step
You can now run the following command to generate the formal specification:

`/speckit.architecture-guard.governed-spec "Based on the Discovery Summary Draft..."`
```

## Guardrails

- **Conversational**: The goal is discussion and alignment, not outputting massive markdown files immediately.
- **Non-Blocking Governance**: Treat the architecture constitution as authoritative context. Clearly warn on drift, recommend compliant alternatives, and only stop the path when a rule is explicitly blocking or P0.
- **Ponytail Pragmatism**: Advocate for the simplest, lowest-effort solution that satisfies the user's goal without over-engineering.

## Graceful Degradation

**Without Flash-Mem MCP**:
- Skip Step 2 (Architecture Context Retrieval from Flash-Mem)
- Fall back to reading `.specify/memory/architecture_constitution.md` and `.specify/memory/security_constitution.md` directly

**Without Security Review**:
- Skip security-relevant flagging in Step 4
- Note missing security context in the Discovery Summary Draft

**Minimal Viable Workflow** (only Architecture Guard):
- Read constitution files directly
- Enter interactive discussion
- Generate handoff draft
