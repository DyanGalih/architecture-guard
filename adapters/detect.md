# SDD Tool Detection

This preamble loads before every orchestration command. Its job: detect which SDD tool or workflow the project uses, load the right adapter, and fail gracefully when detection is ambiguous.

## Detection Chain

1. Apply an explicit adapter override (`--adapter spec-kit`, `--adapter openspec`, or `--adapter generic`) before marker detection.
2. Check for `.specify/` directory in project root → **SpecKit**
   - Also verify `.specify/memory/` or `.specify/extensions.yml` presence for confidence.
3. Check for `openspec/config.yaml` in project root → **OpenSpec**
   - Also verify `openspec/changes/` or `openspec/specs/` for confidence.
4. If both markers exist, ask the user which adapter to use unless an explicit CLI override was supplied.
5. Fallback: No SDD tool detected → ask user:
   ```
   No SDD tool detected. Which one are you using?
   1. SpecKit (`.specify/`)
   2. OpenSpec (`openspec/`)
    3. None (load `adapters/generic.md` and ask for artifact paths as needed)
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

## Session Persistence

The selected SDD tool may be reused within the current AI session, but marker detection runs at the start of every command.
- A session selection never silently overrides changed filesystem markers. If the markers now identify a different SDD tool, or both markers are present, ask again.
- A persisted selection file or installer-selected adapter is advisory only and never outranks current markers.
- If the user explicitly overrides mid-session (`--adapter openspec`), the new adapter is used for subsequent commands.

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
| Tool directory exists but empty | Detect as that SDD tool, adapter loads normally |
| Flash-Mem unavailable | Skip MCP steps, proceed with file-based context |
| No git repo | Skip branch-related gap fills, continue with remaining steps |

## Mandatory Placeholder Preflight

Before executing any command body, load the selected adapter and resolve every `{adapter_path:key}` and `{adapter_command:key}` token in that command. Stop with `AdapterMissingKey: <kind>:<key>` if the selected adapter does not define a key, or `AdapterUnresolvedToken: <token>` if any adapter token remains after resolution. Explicit unsupported behavior with an inline fallback is resolved behavior, not a missing key.
