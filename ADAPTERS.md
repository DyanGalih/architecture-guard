# Architecture Guard Adapters

Adapters are the bridge between Architecture Guard's tool-agnostic governance commands and the specific SDD tool or workflow you use.

## How It Works

```
Orchestration command (e.g., init.md)
         │
         ▼
  adapters/resolve.md  ─── reads the selected SDD adapter (file-based)
         │
         ▼
  adapters/{tool}.md  ─── provides path map + command map + gaps
         │
         ▼
Tool-specific output (constitution, config.yaml, etc.)
```

## Built-in Adapters

| SDD Tool or Workflow | Adapter File | Detection Marker |
|---|---|---|
| SpecKit | `spec-kit.md` | `.specify/` directory |
| OpenSpec | `openspec.md` | `openspec/config.yaml` or `openspec/` |
| Generic workflow | `generic.md` | Installer selection or no detected SDD tool |

`architecture-guard init` installs every adapter into `.architecture-guard/adapters/` and records the selection in `.architecture-guard/selected-adapter`. Built-in adapters are refreshed on every init, so do not edit them in place — copy one to a new name instead.

## Adapter Contract

Each adapter file must define a `## Path Map` and a `## Command Map` table whose first column holds the canonical keys below. Unsupported operations state concrete inline or skip behavior rather than omitting a key. Adapters may define extra keys. The installer resolves these tokens into the installed prompts, so a missing key fails installation.

### Required Keys

- Path Map: `arch-constitution`, `constitution`, `constitution-set`, `draft`, `fallback-spec-index`, `governance-config`, `plan`, `project-config`, `security-constitution`, `security-constraints`, `spec`, `tasks`
- Command Map: `analyze`, `architecture-apply`, `architecture-review`, `archive`, `change-scope`, `clarify-spec`, `consolidate-specs`, `create-change`, `create-plan`, `create-spec`, `create-tasks`, `hygiene`, `implement`, `list-specs`, `refactor-generator`, `security-review-implementation`, `spec-template`, `subagent-synthesize`, `validate-spec`, `verify`, `violation-detection`

What the newer keys mean:

- `project-config` — the SDD tool's project manifest that may name further governance files (for example OpenSpec's `openspec/config.yaml`). Tools without one point at their main constitution.
- `constitution-set` — the standard constitution files to check when present, as a readable list.
- `change-scope` — how to establish and reuse the active change or feature for a run (OpenSpec `CHANGE_ID`, Spec Kit feature directory, generic change folder).
- `validate-spec` — how to validate a newly written spec (a native validator, or an inline structural check).
- `spec-template` — which spec template to apply when writing a spec.

This list is exactly the set of adapter tokens used by `orchestration/`, `templates/`, and `flow/`; the test suite fails if they drift apart. Adding a token is a contract change: define it in every built-in adapter, add it here, and call it out in the release notes because custom adapters must add it too.

### Path Map
A table mapping canonical names to concrete file paths, with an optional third `Notes` column:

```markdown
## Path Map

| Canonical Name | Path | Notes |
|---|---|---|
| constitution | `path/to/constitution.md` | Or a user-provided governance path |
| spec | `path/to/specs/{name}/spec.md` | |
| plan | `path/to/plan.md` | |
| ponytail-template | `.architecture-guard/templates/ponytail_core.md` | |
```

Only the second column is inlined into installed prompts (with backticks removed), so keep it to the plain path or an explicit unsupported statement. Put annotations such as "optional" or "or a user-provided path" in the `Notes` column; they would otherwise end up inside the materialized path.

### Command Map
A table mapping governance actions to SDD-tool-native invocations:

```markdown
## Command Map

| Canonical Key | SDD Tool Invocation or Fallback |
|---|---|
| create-spec | `commandspec`, or explicit inline creation when unsupported |
| analyze | `validate --strict`, plus inline coverage analysis when needed |
```

### Gap Fill Actions
List features the SDD tool lacks and how to fill them:

```markdown
## Gap Fill Actions

1. **Missing feature** — The SDD tool does not provide X.
   - Fill: Do Y inline.
```

### Hook Events
When governance checks should run in relation to the SDD tool's lifecycle.

## Custom Adapters

Any SDD tool — including an in-house one — is supported by writing an adapter; no code changes are needed.

1. Copy a built-in adapter as a starting point — `generic.md` for a minimal tool, or the built-in closest to your tool:
   ```bash
   cp .architecture-guard/adapters/generic.md .architecture-guard/adapters/my-sdd.md
   ```
2. Replace the Path Map with your tool's artifact conventions.
3. Replace the Command Map with your tool's CLI or agent commands. When the tool lacks an operation, keep the key and state the inline fallback or skip behavior.
4. Describe gaps, constitution layout, and hook events for your tool. Any git, file, or memory write in a gap fill must require explicit user approval.
5. Select it:
   ```bash
   npx architecture-guard init . --framework my-sdd
   ```

The adapter name must use lowercase letters, digits, and hyphens, and must not collide with a built-in name. The installer validates the adapter against the Required Keys before writing anything and lists every missing key. Custom adapters are never overwritten by later installs, and the interactive installer offers every custom adapter it finds. Filesystem markers only detect built-in adapters, so custom adapters are always selected explicitly.

Installed prompts resolve shared resources through the `architecture-guard` CLI in lean mode. With `--vendor`, the installer copies templates, presets, hygiene rules, and Sonar rules under `.architecture-guard/`; SDD tool directories hold SDD artifacts only. Before a command body runs, the resolution preamble resolves every adapter token; missing keys stop with `AdapterMissingKey: <kind>:<key>` and unresolved substitutions stop with `AdapterUnresolvedToken: <token>`.
