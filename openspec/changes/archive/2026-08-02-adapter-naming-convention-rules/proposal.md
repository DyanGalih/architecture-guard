## Why

Different frameworks and programming languages have distinct naming standards (e.g., PascalCase for models in Laravel, `Class_Model` for CodeIgniter). Instead of hardcoding generic rules, the `init` command should intelligently detect or ask for these conventions to ensure the architecture guard enforces the correct, project-specific naming standards.

## What Changes

- Modify `src/commands/init.md` to include a new interview phase for Naming & Namespacing rules.
- Update framework presets to optionally supply native naming standards (e.g., CodeIgniter, Laravel, NestJS).
- Dynamically record the selected naming conventions into the project's constitution (`architecture_constitution.md` for SpecKit or `config.yaml` for OpenSpec).

## Capabilities

### New Capabilities
- `adapter-naming-conventions`: Dynamic detection and configuration of naming standards via the `init` command and framework presets.

### Modified Capabilities

## Impact

- The initialization workflow will ask new questions or auto-detect settings based on the chosen framework preset.
- Generated constitutions will now include a dedicated section for Naming & Namespacing rules.
- Does not automatically break existing projects unless they re-run `init` and agree to enforce new rules.
