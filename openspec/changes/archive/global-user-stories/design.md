---
Story: ../../../user-stories/global-user-stories.md
status: accepted
---

# Technical Design: Global User Stories

## Overview
Implement global, tool-agnostic user stories by modifying the `init` and `governed-delivery-team` orchestration workflows.

## Changes Required

### 1. `src/commands/init.md` & `src/orchestration/init.md`
- **Goal:** Ask the user if they are working in a "Team" or "Solo". If Team, scaffold the `user-stories/` directory at the project root.
- **Details:** Add a new interview question during the `ag-init` workflow. If the user selects "Team", write `Mode: Team` into `openspec/config.yaml` (Governance rules) and execute a step to ensure the `user-stories/` directory exists.

### 2. `src/orchestration/governed-delivery-team.md` & `src/commands/governed-delivery-team.md`
- **Goal:** Shift the `user-story.md` generation from the active change directory to the root `user-stories/` directory.
- **Details:**
  - Update Phase 3 ("Generate User Story") to check `<root>/user-stories/` instead of the active feature directory.
  - If multiple stories exist, use an interactive prompt to ask the user which User Story they are fulfilling, or if they want to create a new one.
  - Insert a new **Phase 4.5 — Specification Gate** that mandates running `ag-governed-spec` to generate native SDD artifacts (like OpenSpec's `proposal.md` and `specs/`) before entering the Plan Gate.
  - When generating `plan.md` (or `design.md`), inject the YAML frontmatter `Story: ../../../user-stories/<name>.md` to establish the explicit link between the technical change and the business epic.

## Architecture Alignment
- **Ponytail Pragmatism:** We are leveraging the existing workflow orchestration. No new external dependencies or major architectural boundaries are added. We are simply changing path resolutions from `{adapter_path:change-root}` to `<root>/user-stories/`.
- **Backward Compatibility:** Existing `user-story.md` files inside old change directories will be ignored by the new flow, preventing conflicts.

## Security Considerations
- **Not Applicable:** This change affects workflow file paths only. No new runtime execution risks or data exposure.

## Open Questions / Risks
- None. The approach is safe and isolated to workflow orchestration Markdown files.
