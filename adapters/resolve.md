# SDD Adapter Resolution

This preamble loads before every orchestration command. Its job is to resolve the adapter selected by CLI initialization, load its mappings, and provide a marker fallback for uninitialized projects.

## Resolution Chain

1. Apply an explicit adapter override (`--adapter spec-kit`, `--adapter openspec`, or `--adapter generic`) before persisted selection.
2. Read `.architecture-guard/selected-adapter` when present. This is the installed project's source of truth and selects the adapter named in the file.
3. If no persisted selection exists, check for both the `.specify/` directory and `openspec/config.yaml` before making either single-marker choice. If both markers exist, ask the user which adapter to initialize.
4. If only `.specify/` exists in project root → **SpecKit**
   - Also verify `.specify/memory/` or `.specify/extensions.yml` presence for confidence.
5. If only `openspec/config.yaml` exists in project root → **OpenSpec**
   - Also verify `openspec/changes/` or `openspec/specs/` for confidence.
6. Fallback: No adapter is persisted → ask user:
   ```
   No adapter is persisted. Which one are you using?
   1. SpecKit (`.specify/`)
   2. OpenSpec (`openspec/`)
   3. None (load `adapters/generic.md` and ask for artifact paths as needed)

   Rerun `architecture-guard init --framework <tool>` to persist a selection,
   or pass `--adapter <tool>` for this command only.
   ```

## Load Adapter

Once the SDD tool is identified:

```
Read `adapters/{tool}.md` → this file contains:
  - Path map (canonical names to concrete paths)
  - Command map (governance action → SDD tool invocation)
  - Gap fill actions (what this SDD tool lacks)
  - Hook events (when to run governance checks)
```

All subsequent path references in the orchestration command use adapter-mapped paths.

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
| Adapter file missing | Report error: "Adapter file not found at adapters/{tool}.md" |
| Tool directory exists but empty | Resolve that SDD tool as a marker fallback, then load its adapter |
| Flash-Mem unavailable | Skip MCP steps, proceed with file-based context |
| No git repo | Skip branch-related gap fills, continue with remaining steps |

## Mandatory Placeholder Preflight

Before executing any command body, load the selected adapter and resolve every `{adapter_path:key}` and `{adapter_command:key}` token in that command. Stop with `AdapterMissingKey: <kind>:<key>` if the selected adapter does not define a key, or `AdapterUnresolvedToken: <token>` if any adapter token remains after resolution. Explicit unsupported behavior with an inline fallback is resolved behavior, not a missing key.
