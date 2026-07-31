# Standalone Usage Guide

Architecture Guard runs as a standalone SDD-agnostic governance orchestrator. Install it once, then run it against any project using any SDD framework.

## 1. Install

```bash
npx architecture-guard
```

Or install globally:

```bash
npm install -g architecture-guard
architecture-guard
```

The installer runs interactively and asks three questions. No setup needed — zero dependencies, Node.js stdlib only.

## 2. Choose Your AI Agent

You will see a list of 35+ supported AI agents. Pick one or more:

```
Select AI agent(s) to install commands for:
  1. agy
  2. amp
  ...
  24. opencode
  ...
  35. zed
```

Enter numbers separated by commas (e.g. `24` for OpenCode) or type `all`.
Architecture Guard writes governance commands in each agent's native format:

| Agent | Format | Directory |
| :--- | :--- | :--- |
| OpenCode, Junie, Amp, CodeBuddy, Forge, Cursor, etc. | `.md` | `.opencode/commands/`, `.cursor/skills/`, ... |
| Claude Code, Devin, Rovodev, etc. | `SKILL.md` | `.claude/skills/architecture-guard-{cmd}/SKILL.md` |
| Gemini CLI, Tabnine | `.toml` | `.gemini/commands/`, `.tabnine/agent/commands/` |
| Goose | `.yaml` | `.goose/recipes/` |

## 3. Choose Your SDD Framework

```
Select SDD framework:
  1. spec-kit
  2. openspec
  3. none (framework-agnostic)
```

Architecture Guard detects your framework at runtime from filesystem markers:

| Framework | Detection Marker | Works When |
| :--- | :--- | :--- |
| **SpecKit** | `.specify/` directory exists | Legacy SpecKit projects, `extension.yml` installs |
| **OpenSpec** | `openspec/config.yaml` exists | OpenSpec projects |
| **Generic** | No known markers, or user declines | Any project |

Detection runs at the start of every orchestration command. It never overwrites your filesystem markers. If both `.specify/` and `openspec/` exist, it asks which adapter to use.

Override detection with `--adapter` in the command itself, or set the framework explicitly via the CLI installer.

## 4. Choose Your Commands

Pick from 15 governance commands:

| Command | When |
| :--- | :--- |
| `init` | Greenfield project setup — creates constitutions |
| `init-brownfield` | Existing codebase — maps current state first |
| `governed-discover` | Idea-stage — shape raw requests into spec-ready direction |
| `governed-spec` | Specification — generate and clarify specs |
| `governed-plan` | Planning — technical plan against architecture rules |
| `governed-tasks` | Task — generate tasks, analyze gaps |
| `governed-delivery` | Delivery — full plan → tasks → analyse pipeline |
| `governed-implement` | Implement — apply tasks, then review |
| `architecture-review` | Review — boundary drift, DRY violations, hygiene |
| `architecture-verify` | Final validation — tasks vs code evidence |
| `architecture-apply` | Apply approved refactors into plans/tasks |
| `architecture-workflow` | End-to-end review across all workflow phases |
| `violation-detection` | Detect architecture drift invariants |
| `refactor-generator` | Turn violations into structured refactor tasks |
| `consolidate-specs` | Budgeted/offline spec index (optional) |

You can select one, several, or `all`. The installer writes only the commands you pick.

## 5. What Gets Installed

After you select agents, frameworks, and commands, `install.js` writes:

- **Command files** in your agent's directory (markdown, skill, TOML, or YAML)
- **Adapters** — `adapters/detect.md` plus your framework's adapter (e.g., `adapters/openspec.md`, `adapters/spec-kit.md`)
- **Runtime resources** — `templates/`, `presets/`, `hygiene-rules/`, `sonar-rules/` under `.architecture-guard/`
- **`AGENTS.md` governance rules** (optional — the installer offers on completion)

## 6. Using the Installed Commands

After installation, invoke a command directly:

```
architecture-guard architecture-review
```

Or use the slash command registered by your agent:

```
architecture-review
```

The command detects the framework from your project, loads the adapter, and runs the governance workflow in your project context. No extra configuration needed.

## 7. Non-Interactive / CI Usage

For CI pipelines, `init` runs without prompts through `--yes`:

```bash
architecture-guard init . --yes --agent opencode --framework openspec --commands init,architecture-review
```

With `--yes`:
- Existing files: **replaced** by default (idempotent CI runs). Set `--overwrite keep-both` to preserve.
- `AGENTS.md` rules: appended automatically.

Flags:

| Flag | Value | Description |
| :--- | :--- | :--- |
| `--yes` | (none) | Skip all prompts |
| `--agent` | `opencode,claude` | Comma-separated agent keys |
| `--framework` | `spec-kit | openspec | none` | Framework to target |
| `--commands` | `init,architecture-review` | Comma-separated command names or indices |
| `--overwrite` | `replace` (default) / `skip` / `keep-both` | Existing file policy with `--yes` |

Positional target:

```bash
architecture-guard init /path/to/project --yes --agent claude --framework openspec --commands init
```

The target argument specifies which directory to install into (default: current directory).

## 8. Framework Detection in Practice

When an orchestration command runs, it:

1. Reads `adapters/detect.md` and scans project root for framework markers
2. Loads `adapters/{framework}.md` — the adapter for that framework
3. Resolves every `{adapter_path:key}` and `{adapter_command:key}` from the adapter
4. Executes the command body using adapter-resolved paths and commands

The same orchestration command `governed-spec` creates:

- SpecKit project: `specs/<feature>/spec.md` via `/speckit.specify`
- OpenSpec project: `openspec/changes/{change/specs/{capability}/spec.md` via `openspec new change` + inline spec writes

You choose the framework once; Architecture Guard adapts the rest.

## 9. Cross-Framework Upgrade

SpecKit user switching to OpenSpec:

1. Rerun `architecture-guard init` in the project — choose "openspec"
2. Architecture Guard writes the OpenSpec adapter and command files
3. The OpenSpec adapter reads SpecKit constitutions and proposes OpenSpec config.yaml equivalents during `init`
4. Original `commands/*.md` remain untouched; original SpecKit format path stays workable in parallel

## 10. Next Steps

- Full adapter contract reference: [ADAPTERS.md](../ADAPTERS.md)
- OpenSpec-specific transition guide: [OPENSPEC-ORCHESTRATION.md](../OPENSPEC-ORCHESTRATION.md)
- Governance workflows: [workflows.md](workflows.md)
- Beginner guide: [beginner-guide.md](beginner-guide.md)