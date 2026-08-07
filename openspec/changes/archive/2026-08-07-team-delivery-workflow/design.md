## Context
See proposal.md for motivation. Architecture Guard needs a new orchestration workflow tailored for teams, without complicating the existing solo developer workflow.

## Goals / Non-Goals

**Goals:**
- Add `ag-governed-delivery-team` orchestration.
- Generate a User Story markdown artifact during this workflow before kicking off standard engineering artifact generation.
- Modify the `ag-governed-discover` handoff to support dual-workflow suggestions.

**Non-Goals:**
- Automatically pushing the User Story to Jira, Linear, or GitHub Issues.
- Automatic bidirectional synchronization.
- Replacing the existing `ag-governed-delivery` orchestration.

## Decisions

**Decision 1: Separate Orchestration Command**
- **Rationale**: To preserve the fast, minimal solo developer experience, the team delivery workflow will be a separate orchestration command (`ag-governed-delivery-team.md`), rather than adding complex conditional logic to the existing `ag-governed-delivery.md`.
- **Alternatives Considered**: Adding flags or prompts inside `ag-governed-delivery`. This was rejected because it violates the goal of preserving the unchanged solo developer experience.

**Decision 2: User Story as Markdown**
- **Rationale**: Initial persistence will be simple markdown files inside the change directory (e.g., `user-story.md`), which fits the SDD paradigm.
- **Alternatives Considered**: Immediate integration with Jira. Rejected as a non-goal for this phase.

## Risks / Trade-offs

- **Risk: Orchestration Duplication** → **Mitigation**: The new `ag-governed-delivery-team` script should call the underlying modular phases (plan, tasks, etc.) exactly like `ag-governed-delivery` does, minimizing duplicated logic.
