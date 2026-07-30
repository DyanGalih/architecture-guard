# SDD Framework Detection

This preamble loads before every orchestration command. Its job: detect which SDD framework the project uses, load the right adapter, and fail gracefully when detection is ambiguous.

## Detection Chain

1. Apply an explicit adapter override (`--adapter spec-kit`, `--adapter openspec`, or `--adapter generic`) before marker detection.
2. Check for `.specify/` directory in project root → **SpecKit**
   - Also verify `.specify/memory/` or `.specify/extensions.yml` presence for confidence.
3. Check for `openspec/config.yaml` in project root → **OpenSpec**
   - Also verify `openspec/changes/` or `openspec/specs/` for confidence.
4. If both markers exist, ask the user which adapter to use unless an explicit CLI override was supplied.
5. Fallback: No framework detected → ask user:
   ```
   No SDD framework detected. Which one are you using?
   1. SpecKit (`.specify/`)
   2. OpenSpec (`openspec/`)
    3. None (load `adapters/generic.md` and ask for artifact paths as needed)
   ```

## Load Adapter

Once framework is identified:

```
Read `adapters/{framework}.md` → this file contains:
  - Path map (canonical names to concrete paths)
  - Command map (governance action → framework invocation)
  - Gap fill actions (what this framework lacks)
  - Hook events (when to run governance checks)
```

All subsequent path references in the orchestration command use adapter-mapped paths.

## Session Persistence

The selected framework may be reused within the current AI session, but marker detection runs at the start of every command.
- A session selection never silently overrides changed filesystem markers. If the markers now identify a different framework, or both markers are present, ask again.
- A persisted selection file or installer-selected adapter is advisory only and never outranks current markers.
- If the user explicitly overrides mid-session (`--adapter openspec`), the new adapter is used for subsequent commands.

## Framework-Agnostic Mode

When no framework is detected and user declines to pick one:

```
Framework-agnostic mode:
- Architecture review, violation detection, refactor generation, and hygiene checks
  work without framework-specific paths.
- Init, spec, plan, tasks, and implement steps require user to specify paths manually.
- Ponytail contract and governance rules apply regardless.
```

## Graceful Degradation

| Condition | Behavior |
|---|---|
| Adapter file missing | Report error: "Adapter file not found at adapters/{framework}.md" |
| Framework dir exists but empty | Detect as that framework, adapter loads normally |
| Flash-Mem unavailable | Skip MCP steps, proceed with file-based context |
| No git repo | Skip branch-related gap fills, continue with remaining steps |

## Mandatory Placeholder Preflight

Before executing any command body, load the selected adapter and resolve every `{adapter_path:key}` and `{adapter_command:key}` token in that command. Stop with `AdapterMissingKey: <kind>:<key>` if the selected adapter does not define a key, or `AdapterUnresolvedToken: <token>` if any adapter token remains after resolution. Explicit unsupported behavior with an inline fallback is resolved behavior, not a missing key.
