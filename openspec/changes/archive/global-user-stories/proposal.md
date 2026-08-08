# Proposal: Global User Stories

## The Problem
Currently, business requirements (`user-story.md`) are generated inside specific OpenSpec change directories (e.g., `openspec/changes/<change-name>/user-story.md`). This creates a strict 1:1 mapping between a business Epic and a technical PR. If a business feature requires multiple technical changes, the user story must be duplicated, violating DRY. Furthermore, storing business artifacts inside the `openspec/` folder locks the project's product management data into a specific SDD tool.

Additionally, the `ag-governed-delivery-team` workflow currently skips the standard SDD specification lifecycle (e.g., bypassing `openspec propose` and `specs/*.md` generation) by jumping straight to the Plan Gate.

## The Solution
We will decouple the business requirements from the technical implementation artifacts and fix the SDD lifecycle bypass:
- We will store all User Stories in a dedicated, top-level `<root>/user-stories/` directory.
- We will modify the `/ag-init` workflow to scaffold this directory for team-based projects.
- We will modify the `/ag-governed-delivery-team` workflow to read/write `user-story.md` from the global folder and establish a linkage metadata field (e.g., `Story: ...`) inside the technical `design.md` files.
- We will introduce a new "Phase 4.5 — Specification Gate" to `ag-governed-delivery-team` that mandates the generation of SDD-specific artifacts (like `proposal.md` and `specs/`) before the technical Plan Gate can open.

## Non-goals
- We are not building two-way synchronization with Jira or GitHub Issues yet (that will be a fast-follow).
- We are not migrating existing, legacy user stories from old OpenSpec changes into the global directory automatically.

## Success Criteria
- Running the `delivery-team` command inside a new change successfully prompts the user to select or create a global user story.
- The `design.md` generated for the change includes YAML frontmatter linking back to `<root>/user-stories/<feature>.md`.
- No business logic is duplicated across multiple changes.
