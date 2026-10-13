# SDD Adapter Resolution

This preamble loads before every orchestration command. Its job is to resolve the adapter selected by CLI initialization, load its mappings, and provide a marker fallback for uninitialized projects.

All adapters live in `.architecture-guard/adapters/`. Built-in adapters (`spec-kit`, `openspec`, `generic`) are refreshed by `architecture-guard init`; custom adapters are user-authored files in the same directory and are never overwritten.

The `--adapter` syntax in this resolver describes an optional argument to an installed governance command when its host supports command arguments; it is not an `architecture-guard init` flag. CLI initialization persists the selection through `--framework`.

## Resolution Chain

1. Apply an explicit adapter override (`--adapter <name>`, where `<name>` is any adapter in `.architecture-guard/adapters/`, built-in or custom) before persisted selection.
2. Read `.architecture-guard/selected-adapter` directly when present. This installed-project marker is authoritative and selects the adapter named in the file, built-in or custom.
3. If the selected-adapter marker is absent, read `.architecture-guard/config.yml` and use its `adapter` value when present.
4. If no persisted selection exists, check for both the `.specify/` directory and either `openspec/config.yaml` or the `openspec/` directory before making either single-marker choice. This mirrors CLI init; if both markers exist, ask the user which adapter to initialize.
5. If only `.specify/` exists in project root → **SpecKit**
   - Also verify `.specify/memory/` or `.specify/extensions.yml` presence for confidence.
6. If only `openspec/config.yaml` or the `openspec/` directory exists in project root → **OpenSpec**
   - Prefer `openspec/config.yaml`; also verify `openspec/changes/` or `openspec/specs/` for confidence.
7. Fallback: No adapter is persisted → ask user:
   ```
   No adapter is persisted. Which one are you using?
   1. SpecKit (`.specify/`)
   2. OpenSpec (`openspec/`)
   3. None (load `.architecture-guard/adapters/generic.md` and ask for artifact paths as needed)
   4. <each custom adapter found in .architecture-guard/adapters/>

   Rerun `architecture-guard init --framework <tool>` to persist a selection,
   or pass `--adapter <tool>` for this command only.
   ```

## Load Adapter

Once the SDD tool is identified:

```
Read `.architecture-guard/adapters/{tool}.md` → this file contains:
  - Path map (canonical names to concrete paths)
  - Command map (governance action → SDD tool invocation)
  - Gap fill actions (what this SDD tool lacks)
  - Hook events (when to run governance checks)
```

All subsequent path references in the orchestration command use adapter-mapped paths.

## Adapter Selection Guard

- Adapter selection is file-based. Do not use the Architecture Guard resource resolver to select or list adapters; `resolve` is only for engine resources such as templates, presets, hygiene rules, Sonar rules, and config.
- Supported persisted values are `openspec`, `spec-kit`, `generic` (with `none` normalized to `generic`), and any custom adapter name that has a file in `.architecture-guard/adapters/`. Filesystem markers only detect built-in adapters; custom adapters are always selected explicitly.
- If the persisted value has no adapter file, report `Unavailable: unsupported adapter "<value>"` and stop before running an SDD command.
- If `.architecture-guard/adapters/resolve.md` or `.architecture-guard/adapters/{tool}.md` cannot be read, report the exact missing path as `Unavailable` and stop. Do not silently switch adapters or infer a generic workflow.

## Selection Persistence

The CLI-selected adapter is reused for every command until the user changes it.
- Filesystem markers do not override `.architecture-guard/selected-adapter`.
- If the user switches SDD tools, rerun `architecture-guard init` with the new `--framework` value.
- An explicit `--adapter` override applies only to the current command and does not change the persisted selection.

## Generic Workflow Mode

When no SDD tool is detected and the user declines to pick one:

```
Generic workflow mode:
- Architecture review, violation detection, refactor generation, and hygiene checks
  work without SDD-tool-specific paths.
- Init, spec, plan, tasks, and implement steps require user to specify paths manually.
- Ponytail contract and governance rules apply regardless.
```

## Graceful Degradation

| Condition | Behavior |
|---|---|
| Adapter file missing | Report "Unavailable: Adapter file not found at .architecture-guard/adapters/{tool}.md — rerun `architecture-guard init`" |
| Tool directory exists but empty | Resolve that SDD tool as a marker fallback, then load its adapter |
| Flash-Mem unavailable | Skip MCP steps, proceed with file-based context |
| No git repo | Skip branch-related gap fills, continue with remaining steps |

## Mandatory Placeholder Preflight

Before executing any command body, load the selected adapter and resolve every adapter path token (`{adapter_path:<key>}`) and adapter command token (`{adapter_command:<key>}`) in that command. Stop with `AdapterMissingKey: <kind>:<key>` if the selected adapter does not define a key, or `AdapterUnresolvedToken: <token>` if any adapter token remains after resolution. Explicit unsupported behavior with an inline fallback is resolved behavior, not a missing key.
