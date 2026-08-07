# Using Architecture Guard as a SpecKit Extension

While **Architecture Guard v2** is a standalone orchestrator (`npx architecture-guard`), we remain fully backward-compatible with the SpecKit extension ecosystem for existing users (v1.15.1 and earlier).

If your team prefers to continue using the `extension.yml` approach and the native `/speckit.*` commands, you absolutely can.

## Installation via SpecKit Extension

To install Architecture Guard as an extension inside an existing SpecKit project:

1. Add the following to your project's `.specify/extensions.yml`:
   ```yaml
   extensions:
     - id: architecture-guard
       source: github
       repo: DyanGalih/architecture-guard
       version: 2.0.0
   ```

2. Run the SpecKit install command:
   ```bash
   speckit install
   ```

This will automatically pull down the `/speckit.ag-*` commands into your project without modifying your global environment.

## Supported Commands

Even as an extension, all orchestrated commands are available:

- `/speckit.ag-init-brownfield`
- `/speckit.ag-init`
- `/speckit.ag-consolidate-specs`
- `/speckit.ag-governed-discover`
- `/speckit.ag-governed-spec`
- `/speckit.ag-governed-delivery`
- `/speckit.ag-governed-implement`
- `/speckit.ag-architecture-workflow`
- `/speckit.ag-architecture-review`
- `/speckit.ag-refactor-generator`
- `/speckit.ag-architecture-apply`
- `/speckit.ag-architecture-verify`

## Manual Phase-by-Phase Workflow

If you prefer a manual, phase-by-phase approach instead of the automated `governed-delivery` flow, you can still use the traditional commands individually:

```text
/speckit.ag-governed-spec
# Generate spec.md

/speckit.ag-governed-plan
# Review or repair plan.md until no P0 architecture or Critical security findings remain.

/speckit.ag-governed-tasks
# Generate tasks only after the plan is accepted, then run security, refactor, and analysis checks.
```

Use the manual flow according to the source of the problem:
- **Plan problem**: run `governed-plan`, then `governed-tasks` because the previous tasks may be stale.
- **Task-only problem**: run `governed-tasks`.
- **Unknown or cross-phase problem**: run `governed-delivery` and let it resume from the first invalid phase.
