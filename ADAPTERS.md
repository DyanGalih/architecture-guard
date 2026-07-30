# Architecture Guard Adapters

Adapters are the bridge between Architecture Guard's framework-agnostic governance commands and the specific SDD framework you use.

## How It Works

```
Orchestration command (e.g., init.md)
         │
         ▼
  adapters/detect.md  ─── detects active SDD framework
         │
         ▼
  adapters/{framework}.md  ─── provides path map + command map + gaps
         │
         ▼
  Framework-specific output (constitution, config.yaml, etc.)
```

## Built-in Adapters

| Framework | Adapter File | Detection Marker |
|---|---|---|
| SpecKit | `adapters/spec-kit.md` | `.specify/` directory |
| OpenSpec | `adapters/openspec.md` | `openspec/config.yaml` |
| Generic | `adapters/generic.md` | Installer selection or no detected framework |

## Adapter Contract

Each adapter file must define these sections and every canonical key referenced by orchestration. Both built-in adapters expose the same keys; unsupported operations state concrete inline or skip behavior rather than omitting a key.

### Path Map
A table mapping canonical names to concrete file paths:

```markdown
## Path Map

| Canonical Name | Path |
|---|---|
| constitution | `path/to/constitution.md` |
| spec | `path/to/specs/{name}/spec.md` |
| plan | `path/to/plan.md` |
| ponytail-template | `.architecture-guard/templates/ponytail_core.md` |
```

### Command Map
A table mapping governance actions to framework-native invocations:

```markdown
## Command Map

| Canonical Key | Framework Invocation or Fallback |
|---|---|
| create-spec | `commandspec`, or explicit inline creation when unsupported |
| analyze | `validate --strict`, plus inline coverage analysis when needed |
```

### Gap Fill Actions
List features the framework lacks and how to fill them:

```markdown
## Gap Fill Actions

1. **Missing feature** — Framework does not provide X.
   - Fill: Do Y inline.
```

### Hook Events
When governance checks should run in relation to the framework's lifecycle.

## Creating a New Adapter

1. Copy `adapters/generic.md` as a starting template.
2. Replace the Path Map with your framework's path conventions.
3. Replace the Command Map with your framework's CLI commands or API endpoints.
4. Declare any gaps your framework has.
5. Place the file at `adapters/{framework-name}.md`.
6. Update `adapters/detect.md` detection chain to recognize your framework's marker.

Adapter files are self-contained markdown. No code changes needed.

Installed shared resources always resolve under `.architecture-guard/{templates,presets,hygiene-rules,sonar-rules,scripts}`. Framework directories hold framework artifacts only. Before a command body runs, detection resolves every adapter token; missing keys stop with `AdapterMissingKey: <kind>:<key>` and unresolved substitutions stop with `AdapterUnresolvedToken: <token>`.
