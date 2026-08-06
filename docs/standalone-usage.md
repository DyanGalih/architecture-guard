# Standalone Usage Guide

Architecture Guard is an SDD-agnostic governance command installer. Install it once, then install the agent-native commands you want into a project using Spec Kit, OpenSpec, or a generic workflow.

## 1. Install

```bash
npx architecture-guard
```

Or install globally:

```bash
npm install -g architecture-guard
architecture-guard
```

The installer runs interactively and asks three questions. The installer uses `@inquirer/prompts`; the installed governance commands are Markdown and have no runtime dependency.

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
Architecture Guard writes `ag-*` governance commands in each agent's native format:

| Agent | Format | Directory |
| :--- | :--- | :--- |
| OpenCode, Junie, Amp, CodeBuddy, Forge, Cursor, etc. | `.md` | `.opencode/commands/`, `.cursor/skills/`, ... |
| Claude Code, Devin, Rovodev, etc. | `SKILL.md` | `.claude/skills/architecture-guard-{cmd}/SKILL.md` |
| Gemini CLI, Tabnine | `.toml` | `.gemini/commands/`, `.tabnine/agent/commands/` |
| Goose | `.yaml` | `.goose/recipes/` |

## 3. Choose Your SDD Tool

```
Select SDD tool or workflow:
  1. spec-kit
  2. openspec
  3. none (generic Markdown workflow)
```

Architecture Guard detects your SDD tool at runtime from filesystem markers:

| SDD Tool or Workflow | Detection Marker | Works When |
| :--- | :--- | :--- |
| **SpecKit** | `.specify/` directory exists | Legacy SpecKit projects, `extension.yml` installs |
| **OpenSpec** | `openspec/config.yaml` exists | OpenSpec projects |
| **Generic** | No known markers, or user declines | Any project |

Detection runs at the start of every orchestration command. It never overwrites your filesystem markers. If both `.specify/` and `openspec/` exist, it asks which adapter to use.

Override detection with `--adapter` in the command itself, or select the SDD tool explicitly via the CLI installer.

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
| `review` | Review — boundary drift, DRY violations, hygiene |
| `verify` | Final validation — tasks vs code evidence |
| `apply` | Apply approved refactors into plans/tasks |
| `workflow` | End-to-end review across all workflow phases |
| `violation-detection` | Detect architecture drift invariants |
| `refactor-generator` | Turn violations into structured refactor tasks |
| `consolidate-specs` | Budgeted/offline spec index (optional) |

You can select one, several, or `all`. The installer writes only the commands you pick.

## 5. What Gets Installed

After you select agents, an SDD tool or workflow, and commands, `install.js` writes:

- **Command files** in your agent's directory (markdown, skill, TOML, or YAML)
- **Adapters** — `adapters/detect.md` plus your SDD tool's adapter (e.g., `adapters/openspec.md`, `adapters/spec-kit.md`)
- **Runtime resources** — `templates/`, `presets/`, `hygiene-rules/`, `sonar-rules/` under `.architecture-guard/`
- **`AGENTS.md` governance rules** (optional — the installer offers on completion)

## 6. Using the Installed Commands

After installation, invoke the agent-native command:

```
ag-review-artifacts
```

Or use the slash command registered by your agent:

```
ag-review-artifacts
```

The agent command detects the SDD tool from your project, loads the adapter, and runs the governance workflow in your project context. `architecture-guard` itself is the installer; it does not execute governance commands.

## 7. Non-Interactive / CI Usage

For CI pipelines, `init` runs without prompts through `--yes`:

```bash
architecture-guard init . --yes --agent opencode --framework openspec --commands init,review
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
| `--commands` | `init,review` | Comma-separated command names or indices |
| `--overwrite` | `replace` (default) / `skip` / `keep-both` | Existing file policy with `--yes` |

Positional target:

```bash
architecture-guard init /path/to/project --yes --agent claude --framework openspec --commands init
```

The target argument specifies which directory to install into (default: current directory).

## 8. SDD Tool Detection in Practice

When an orchestration command runs, it:

1. Reads `adapters/detect.md` and scans project root for SDD tool markers
2. Loads `adapters/{tool}.md` — the adapter for that SDD tool
3. Resolves every `{adapter_path:key}` and `{adapter_command:key}` from the adapter
4. Executes the command body using adapter-resolved paths and commands

The same orchestration command `governed-spec` creates:

- SpecKit project: `specs/<feature>/spec.md` via `/speckit.specify`
   - OpenSpec project: `openspec/changes/{change}/specs/{capability}/spec.md` via `openspec new change` + inline spec writes

You choose the SDD tool once; Architecture Guard adapts the rest.

## 9. Cross-Tool Upgrade

SpecKit user switching to OpenSpec:

1. Rerun `architecture-guard init` in the project — choose `openspec`
2. Architecture Guard writes the OpenSpec adapter and command files
3. The OpenSpec adapter reads SpecKit constitutions and proposes OpenSpec config.yaml equivalents during `init`
4. Original `commands/*.md` remain untouched; original SpecKit format path stays workable in parallel

## 10. Next Steps

- Full adapter contract reference: [ADAPTERS.md](../ADAPTERS.md)
- OpenSpec integration guide: [OPENSPEC-INTEGRATION.md](../OPENSPEC-INTEGRATION.md)
- Spec Kit integration guide: [SPECKIT-INTEGRATION.md](../SPECKIT-INTEGRATION.md)
- Governance workflows: [workflows.md](workflows.md)
- Beginner guide: [beginner-guide.md](beginner-guide.md)
