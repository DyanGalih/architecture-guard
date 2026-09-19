# OpenSpec Adapter

Use this adapter when `.architecture-guard/config.yml` or `.architecture-guard/selected-adapter` is `openspec`. The `openspec/config.yaml` marker is only a fallback for uninitialized projects.

## Path Map

| Canonical Name | OpenSpec Path |
|---|---|
| project-root | `.` |
| sdd-tool-dir | `openspec/` |
| constitution | `openspec/config.yaml` (context section) |
| arch-constitution | `openspec/architecture.md` (optional — split from config) |
| security-constitution | `openspec/security.md` (optional — split from config) |
| governance-config | `.architecture-guard/config.yml` |
| config | `.architecture-guard/config.yml` (compatibility alias of `governance-config`) |
| extensions | Unsupported; detect optional integrations from host capabilities |
| extensions-dir | Unsupported; do not probe an SDD tool extension directory |
| spec | `openspec/changes/{change}/specs/{capability}/spec.md` |
| plan | `openspec/changes/{change}/design.md` |
| tasks | `openspec/changes/{change}/tasks.md` |
| proposal | `openspec/changes/{change}/proposal.md` |
| security-constraints | `openspec/changes/{change}/security-constraints.md` |
| draft | `.architecture-guard/constitution.draft.md` |
| ponytail-template | `.architecture-guard/templates/ponytail_core.md` |
| capability-composition-template | `.architecture-guard/templates/capability_composition.md` |
| budgeted-context-template | `.architecture-guard/templates/budgeted_context_sdd.md` |
| hygiene-rules | `.architecture-guard/hygiene-rules/*.md` |
| presets | `.architecture-guard/presets/{preset}.md` |
| sonar-rules | `.architecture-guard/sonar-rules` |
| scripts | `.architecture-guard/scripts` |
| templates | `.architecture-guard/templates` (compatibility alias; prefer `ponytail-template`) |
| change-root | `openspec/changes/{change}/` |
| fallback-spec-index | N/A — use `openspec list --specs --json` instead |
| flash-mem-project-id | None — Flash-Mem MCP still works if configured |

## Explicit Change Scope

When this adapter is selected, establish one `CHANGE_ID` before running any OpenSpec command that reads or validates change artifacts.

- Resolve `CHANGE_ID` from an explicit user-provided change name, a single active change discovered by `openspec list --specs --json`, or a new kebab-case name approved for creation.
- If multiple active changes are plausible, ask the user to choose. If no change exists, create it first with `openspec new change "$CHANGE_ID"`.
- Never run `openspec instructions`, `openspec status`, or `openspec validate` without the resolved change scope.
- Pass `--change "$CHANGE_ID"` to every `openspec instructions` and `openspec status` invocation.
- OpenSpec validation takes the change id as its item argument, so run `openspec validate "$CHANGE_ID" --strict` rather than an unscoped validation command.
- Reuse the same `CHANGE_ID` for specification, design, task, analysis, verification, and archive steps. A capability name is not a change id.

## Command Map

| Canonical Key | OpenSpec Invocation or Fallback |
|---|---|
| create-spec | Read `openspec instructions specs --change "$CHANGE_ID" --json`, resolve `architecture-guard resolve template openspec_spec`, then create the requested change-level specs inline and validate with `openspec validate "$CHANGE_ID" --strict`|
| create-change | If the named change does not exist, run `openspec new change "$CHANGE_ID"`; otherwise reuse it|
| archive | After explicit user approval and collision preflight, run `openspec archive "$CHANGE_ID" --yes`.|
| verify | Run the installed `ag-verify` capability; if host dispatch is unavailable, run `openspec validate "$CHANGE_ID" --strict` and perform the inline task-to-code checks defined by `ag-verify`.|
| clarify-spec | Unsupported natively; ask and apply an inline ambiguity-resolution loop |
| create-plan | Read `openspec instructions design --change "$CHANGE_ID" --json`, then create `{adapter_path:plan}` inline|
| create-tasks | Read `openspec instructions tasks --change "$CHANGE_ID" --json`, then create `{adapter_path:tasks}` inline|
| implement | Use the registered OpenSpec apply-change capability; if unavailable, execute unchecked tasks inline and update their status |
| analyze | Run `openspec validate "$CHANGE_ID" --strict`; supplement it with an inline spec/plan/tasks coverage check|
| security-review-implementation | Host Security Review dispatch operation `sr-verify`; accept `sr-branch` only when host registration declares implementation scope; never `sr-changes` |
| hygiene | architecture-guard hygiene --json --target . |
| security-review | Not part of OpenSpec; detect the optional Security Review host capability or report the skipped review |
| security-review-plan | Not part of OpenSpec; detect the optional Security Review host capability or report the skipped review |
| security-review-tasks | Not part of OpenSpec; detect the optional Security Review host capability or report the skipped review |
| security-review-branch | Not part of OpenSpec; detect the optional Security Review host capability or report the skipped review |
| subagent-synthesize | Unsupported natively; synthesize inline unless the host exposes an equivalent capability |
| list-specs | Run `openspec list --specs --json`, group capability specs by their parent change, and return parent change artifact sets; never treat a capability name as a change identifier |
| consolidate-specs | Unsupported: use `list-specs` as the fallback index and do not write a consolidated artifact |
| architecture-apply | Apply plan/tasks findings directly inline; delegate upstream findings (`proposal.md`, `spec.md`) to `openspec-update-change` (or native update capability) with finding details as input context after user confirmation |
| architecture-review | Use the registered architecture-review capability or review the resolved artifacts inline |
| refactor-generator | Use the registered refactor-generator capability or generate refactor tasks inline |
| violation-detection | Use the registered violation-detection capability or detect drift inline |

## Constitution Layout

OpenSpec stores governance context in `openspec/config.yaml`. Architecture and security rules are optionally split.

### `openspec/config.yaml`
```yaml
schema: spec-driven
context: |
  ## Engineering Philosophy
  - Ponytail principles: YAGNI, stdlib-first, lazy senior mindset
  - Minimal abstractions, prefer deletion over addition

  ## Architecture Style
  - [User-defined: Monolith / Modular Monolith / Microservices]
  - [Layer boundaries, dependency direction]

  ## Security Expectations
  - [Trust boundary rules, auth/authz standards]

  ## Testing Standards
  - [Per project]

# Per-artifact rules (MUST only use schema artifact IDs: proposal, specs, design, tasks)
# Verification requirements and quality standards belong in context: (e.g. ## Testing Standards), not under rules.
rules:
  proposal:
    - Keep proposals under 500 words
  specs:
    - Include measurable acceptance criteria
  design:
    - Document data structures and boundary contracts
  tasks:
    - Break tasks into chunks of max 2 hours
```

### `openspec/architecture.md` (optional split)
```
Same structure as architecture_constitution.md but stored in OpenSpec conventions.
Layer boundaries, business logic placement, contracts, module ownership, P0 violations.
```

### `openspec/security.md` (optional split)
```
Trust boundaries, auth standards, data isolation, secrets management.
```

## Gap Fill Actions

1. **Branch creation** — OpenSpec `new change` does not create a git branch.
   - Fill: Before creating a change, check `git branch --show-current`. If on `main`/`master`/`dev`/`staging`, MUST run `git checkout -b "feature/{change-name}"`; stop if branch creation fails.

2. **Specification clarification** — OpenSpec has no `/speckit.clarify` equivalent.
   - Fill: After creating specs, run an interactive inline clarifications loop with the user.

3. **Architecture verify (task-to-code)** — OpenSpec validate checks structure, not implementation evidence.
   - Fill: The installed `ag-verify` capability reads tasks.md checkboxes and validates them against code.

4. **Security review** — OpenSpec has no built-in security review hook.
   - Fill: Architecture Guard's review commands flag security-architecture conflicts during review and verify phases.

## Hook Events

OpenSpec has no hook system. The orchestrator's preamble tells the AI agent to run governance steps:
- After `openspec propose` → run architecture validation on proposal
- After creating specs → run spec boundary check
- After `openspec instructions design --change "$CHANGE_ID"` → run plan drift detection
- During apply → check each task for DRY violations
- After archive → run final architecture verify
