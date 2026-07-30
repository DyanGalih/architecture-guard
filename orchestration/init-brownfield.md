# init-brownfield

## SDD Framework Detection

Before executing command, read `adapters/detect.md` determine the active SDD framework. load `adapters/{framework}.md` path maps, command maps, gap fills. All paths commands below use adapter-mapped names the loaded adapter.

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `{adapter_path:ponytail-template}` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

Brownfield-first project initialization for existing codebases.

Use this command when the repository already contains application code and you want to understand the current system before proposing structure, governance, or refactor work. After the current state is mapped, move to the adapter-registered init capability if you need to define or refine constitutions before continuing into planning or implementation.

## Goal

Create a reliable current-state baseline before any architectural or delivery guidance is drafted.

## What it should do

1. Identify the actual application root and primary entrypoints.
2. Map the existing architecture, boundaries, and integration points.
3. Note any current conventions, constraints, and risky areas.
4. Capture known gaps between the current codebase and the desired governance model.
5. Identify existing pragmatic patterns (Ponytail principles: YAGNI, standard library preference, minimal abstractions) to preserve in the constitution.
6. Produce an initial brownfield plan instead of assuming a greenfield setup.
7. Use `{adapter_command:list-specs}` to count and estimate active `{adapter_path:spec}` artifacts, excluding generated or explicitly archived artifacts.
8. Offer Budgeted Architecture Context Retrieval when repeated historical-spec loading is likely to be material.

## Good outputs

- Current-state summary
- System boundaries and dependency map
- Existing conventions and exceptions
- Migration or refactor candidates
- First-pass plan for bringing the project under governance

## Guidance

- Prefer observation over assumption.
- Treat existing code as the source of truth.
- Keep the first pass lightweight and non-destructive.
- Ask for confirmation before suggesting broad refactors.
- Recommend targeted mode for small spec sets. For larger histories, explain that budgeted mode queries Flash-Mem first, uses `{adapter_path:fallback-spec-index}` only when supported, and never replaces active artifacts.
- If the user wants budgeted mode, record the recommendation in the brownfield output and hand it to the adapter-registered init capability. Do not create configuration or generate `system_context.md` during this non-destructive mapping pass.
- Do not promise token savings before representative measurement and do not write operational settings into constitution files.

## When to use

- The repo already has production or prototype code.
- You need to onboard an existing project into SDD governance.
- You want brownfield discovery before any greenfield-style scaffolding.

## Backward Compatibility

The original SpecKit-specific version remains in the repository source checkout under `src/commands/init-brownfield.md` for direct SpecKit use.
