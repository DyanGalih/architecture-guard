---
status: approved
---

# User Story: Global, Tool-Agnostic User Stories

## Business Objective
Decouple business requirements (`user-story.md`) from technical implementation artifacts (`openspec/changes/`) by storing them in a dedicated top-level directory (`<root>/user-stories/`). This allows one business story to span multiple technical pull requests without duplicating the artifact, and protects business data from being locked into a specific SDD tool's folder structure (e.g., migrating from OpenSpec to SpecKit).

## User Stories
- **As a product manager**, I want my user stories to live at the repository root, so that they are easily discoverable and completely independent of the engineering team's choice of SDD framework.
- **As a developer**, I want to be able to link multiple OpenSpec changes (or technical PRs) back to a single global user story, so that I don't have to rewrite or duplicate the acceptance criteria for every small technical chunk.

## Acceptance Criteria
1. **Generation Location**: The `ag-governed-delivery-team` command must create new user stories in `<root>/user-stories/<feature-name>.md` rather than `<root>/openspec/changes/<change-name>/user-story.md`.
2. **Linkage Mechanism**: When running `ag-governed-delivery-team` for a technical change, the AI must ask the user to select an existing global user story to link to, or create a new one if it doesn't exist.
3. **Metadata Reference**: The generated technical `plan.md` (or `design.md` in OpenSpec) must contain a metadata reference linking it back to the global user story (e.g., `Story: ../../../user-stories/global-user-stories.md`).
4. **Init Workflow**: The `/ag-init` command must automatically scaffold the `<root>/user-stories/` directory if the user selects "Team Development" during the interview.

## Business Rules
- User stories must remain completely framework-agnostic. They should contain no OpenSpec or SpecKit-specific metadata.

## Out of Scope Items
- We are not automatically migrating existing `user-story.md` files from old changes into the global folder. Teams can do this manually if they choose.

## Assumptions
- Developers will remember to link their changes, or the `delivery-team` workflow will reliably prompt them if the linkage is missing.

## Risks
- If a team deletes an OpenSpec change, they must be careful not to accidentally delete the global user story if it's still needed by other changes.

## Open Questions
- *Resolved:* We will update `/ag-init` to scaffold `user-stories/` only for team workflows.
