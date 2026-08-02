## Why

Currently, OpenSpec lacks a comprehensive command/flow for governed delivery that orchestrates proposals, plans, and tasks seamlessly, similar to what might exist or be planned for SpecKit. By adding a "create spec/proposal in the governed-delivery command/flow", we can enable the orchestrator to propose changes via OpenSpec, deliver the required specs, plans, and tasks for SpecKit, and perform analysis. This brings parity and better integration between OpenSpec and SpecKit workflows.

## What Changes

- Add a new `governed-delivery` flow/command for OpenSpec.
- Integrate the orchestrator to automatically generate proposals and deliver specs, plans, and tasks.
- Enable analysis capabilities within this flow (tying into SpecKit's analysis features).
- Ensure this missing command in OpenSpec correctly bridges the workflow to SpecKit.

## Capabilities

### New Capabilities
- `governed-delivery`: The new command/flow to orchestrate proposals, specs, plans, tasks, and analysis between OpenSpec and SpecKit.

### Modified Capabilities

## Impact

- CLI commands will be updated to include the new flow.
- Orchestration logic will need to handle generating and routing proposals and specs.
- Potential updates to adapter logic to ensure SpecKit and OpenSpec act seamlessly within the new flow.
