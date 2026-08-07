## Why

The current Delivery workflow is optimized for solo developers, moving straight from Discovery to engineering artifacts. Larger teams require a collaboration layer (Product Owners, QA, UX) to review and approve business requirements (User Stories) before engineering execution begins. This change introduces a dedicated team workflow without disrupting the fast, minimal solo developer experience.

## What Changes

- Introduce an optional `delivery-team` workflow.
- After the Discovery phase completes, offer the choice between the existing Delivery workflow and the new Team Delivery workflow.
- The Team Delivery workflow will generate a business-oriented User Story (saved as Markdown initially) detailing objectives, acceptance criteria, assumptions, and risks.
- After User Story generation, the workflow will resume the standard engineering delivery pipeline (Specification, Design, Tasks).
- The existing solo Delivery workflow remains completely unchanged.
- If an approved User Story is modified later, the system will recommend re-running Discovery to reconcile changes before regenerating engineering artifacts.

## Capabilities

### New Capabilities
- `team-delivery`: Orchestrates the new team workflow, introducing User Story generation before standard delivery.

### Modified Capabilities
- `governed-discover`: Update the handoff recommendations to present both the `delivery` and `delivery-team` workflow options.

## Impact

- **New Orchestration**: Adds `ag-governed-delivery-team` logic.
- **Discovery Handoff**: Modifies the output of `ag-governed-discover` to suggest multiple workflow paths.
- **Existing Workflows**: The standard `ag-governed-delivery` pipeline is untouched.
- **Future Integration**: The User Story generation is designed to support future persistence to external systems (Jira, GitHub Issues, etc.).
