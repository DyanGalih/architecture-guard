## Context

Currently, OpenSpec lacks a seamless way to propose changes and deliver them as specifications, plans, and tasks into the SpecKit ecosystem directly from the CLI. This requires manual bridging between the two frameworks. Adding a `governed-delivery` command orchestrates this flow, taking advantage of the Architecture Guard's dual-repo structure to manage proposals and deliver the required artifacts for SpecKit analysis and execution.

## Goals / Non-Goals

**Goals:**
- Provide a CLI command (`governed-delivery` or similar) to initialize and orchestrate an OpenSpec proposal.
- Generate and deliver the necessary artifacts (specs, plans, tasks) for SpecKit.
- Enable SpecKit to analyze the delivered artifacts.
- Keep the workflow memory-first and consistent with current architecture constraints.

**Non-Goals:**
- Replace existing SpecKit analysis commands entirely.
- Change the underlying structure of SpecKit or OpenSpec, merely bridging them.

## Decisions

- **Command Structure**: Implement the flow within `src/commands/` (or equivalent location for OpenSpec CLI) as `governed-delivery`.
- **Orchestration**: The command will call OpenSpec API/CLI to create the proposal and then generate the required SpecKit artifacts, utilizing the existing adapter logic (`adapters/*.md`) for framework-agnostic interaction if possible.
- **Analysis Integration**: After generation, the command will invoke SpecKit's analysis hooks to ensure immediate feedback on the proposed delivery.

## Risks / Trade-offs

- **Risk**: Tight coupling between OpenSpec and SpecKit workflows.
  - **Mitigation**: Use the existing adapter pattern in Architecture Guard to keep the integration modular and framework-agnostic where possible.
- **Risk**: Increased complexity in the CLI tool.
  - **Mitigation**: Keep the command focused on orchestration, delegating actual artifact creation and analysis to the respective framework tools.
