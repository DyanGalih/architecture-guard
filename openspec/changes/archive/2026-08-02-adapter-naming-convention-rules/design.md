## Context

The architecture guard initializes projects via `src/commands/init.md`, which sets up rules in the project's constitution. Currently, naming and namespacing conventions are not explicitly handled during this phase. To support diverse frameworks (e.g., CodeIgniter vs NestJS), we need the `init` command to be aware of framework-specific naming standards and configure them appropriately.

## Goals / Non-Goals

**Goals:**
- Add a new "Naming & Namespacing Conventions" phase to the `init` command.
- Allow framework presets to define default naming rules (e.g., CodeIgniter models use `Class_Model`).
- Save the resolved rules into the active constitution (SpecKit or OpenSpec).

**Non-Goals:**
- Enforcing the rules via code analysis in this specific change (this change only covers establishing the rules during `init`).
- Refactoring existing user codebases.

## Decisions

- **Initialization Phase**: Add a "Phase 5 - Naming & Namespacing Conventions" to `init.md`. It will ask questions like "What naming convention should be used for Classes and Properties?"
- **Preset Integration**: Allow preset files (e.g., `src/presets/codeigniter.md`) to define a `## Naming Standards` block that the `init` command can read to skip manual questions.
- **Constitution Output**: Append the rules to the `Architecture Enforcement Rules` section in the generated constitution.

## Risks / Trade-offs

- [Risk] Adds complexity to the `init` interview flow.
  → Mitigation: Use framework presets to auto-answer these questions whenever possible, keeping the manual interview short.
