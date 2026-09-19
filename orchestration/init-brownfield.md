---
description: Perform brownfield-first project initialization and discovery for existing codebases.
---

# init-brownfield

## SDD Adapter Resolution

Before executing command, read `adapters/resolve.md` to resolve the selected SDD adapter. Load `adapters/{tool}.md` for path maps, command maps, and gap fills. All paths and commands below use the loaded adapter.

## Standalone Resource Resolution

Architecture Guard engine resources are standalone package resources. Never search an SDD-tool directory, an extension directory, or a source checkout for them. An adapter path under `.architecture-guard` is an editable local override location, not proof that the resource was copied.

- Directly inspect the matching `.architecture-guard/<category>/` directory first for workspace overrides.
- If the named local resource exists, read it. Otherwise run `architecture-guard resolve <category> <name>` and use the returned content.
- For a resource collection, run `architecture-guard resolve <category> --list`, then resolve every returned name individually in deterministic order so local overrides replace bundled files without hiding bundled defaults.
- If the CLI is unavailable and a mandatory resource is not vendored locally, stop and report the missing runtime dependency. For optional resources, report `Unavailable` and continue only when this command explicitly permits degradation.

## Ponytail Core Contract

Before continuing, you **MUST** resolve and apply the `ponytail_core` template with `architecture-guard resolve template ponytail_core` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Capability Composition

Resolve and apply the `capability_composition` template with `architecture-guard resolve template capability_composition` before delegating to another Architecture Guard capability. Resolve and read the installed sibling skill or command file directly; do not treat a capability name or Markdown path as an invocation.

## Input & Context Loading

Before mapping the current system, read these inputs explicitly with file-reading tools:

1. **Manifest & Configuration**: Read `openspec/config.yaml` first when the OpenSpec adapter is active (otherwise read the selected adapter project configuration), then inspect its `context` block for every referenced governance and constitution Markdown file. Never rely on a hardcoded partial list.
2. **Authoritative Constitutions (read all that exist)**: Read every declared or present governance, constitution, architecture, security, and layout Markdown file. For OpenSpec, explicitly check `openspec/constitution.md`, `openspec/architecture.md`, `openspec/security.md`, and `openspec/layout.md`. For SpecKit, use the adapter-resolved `.specify/memory/constitution.md`, `.specify/memory/architecture_constitution.md`, `.specify/memory/security_constitution.md`, and any adapter-defined layout constitution. Never silently omit an existing file.
3. **Current-State Artifacts**: Read the repository and active planning artifacts required for the brownfield baseline.

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
6. Produce a recommendation outline for bringing the project under governance, not the canonical `{adapter_path:plan}`.
7. Use {adapter_command:list-specs} to count and estimate active `{adapter_path:spec}` artifacts, excluding generated or explicitly archived artifacts.
8. Offer Budgeted Architecture Context Retrieval when repeated historical-spec loading is likely to be material.

## Good outputs

- Current-state summary
- System boundaries and dependency map
- Existing conventions and exceptions
- Migration or refactor candidates
- First-pass plan for bringing the project under governance

## Guidance

- Before recommendations, run a read-only baseline gate covering architecture boundaries and dependency direction, security-sensitive entrypoints and trust boundaries, duplicated business rules/validation/mapping/orchestration (DRY), and repository hygiene. Report evidence, severity, and unknowns; do not mutate artifacts or code.
- Prefer observation over assumption.
- Treat existing code as the source of truth.
- Keep the first pass lightweight and non-destructive.
- Ask for confirmation before suggesting broad refactors.
- Recommend targeted mode for small spec sets. For larger histories, explain that budgeted mode queries Flash-Mem first, uses `{adapter_path:fallback-spec-index}` only when supported, and never replaces active artifacts.
- If the user wants budgeted mode, record the recommendation in the brownfield output and hand it to the adapter-registered init capability. Do not create configuration or generate `system_context.md` during this non-destructive mapping pass.
- Do not promise token savings before representative measurement and do not write operational settings into constitution files.
- Label the result `Brownfield Recommendation Outline`. The canonical technical plan is created later by the adapter-registered governed-plan capability after active constitutions and a specification exist.

## When to use

- The repo already has production or prototype code.
- You need to onboard an existing project into SDD governance.
- You want brownfield discovery before any greenfield-style scaffolding.
