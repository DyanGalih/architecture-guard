# Generic Workflow Adapter

Use this adapter when `.architecture-guard/config.yml` or `.architecture-guard/selected-adapter` is `generic`. It maps governance concepts to the current directory with flow-template-guided conventions; falls back to user prompt when paths are ambiguous.

## Path Map

| Canonical Name | Generic Path | Notes |
|---|---|---|
| project-root | `.` | |
| sdd-tool-dir | `.architecture-guard/flow/` | |
| constitution | `.architecture-guard/constitution.md` | Or user-provided governance artifact path |
| arch-constitution | `.architecture-guard/architecture.md` | Or user-provided architecture artifact path |
| security-constitution | `.architecture-guard/security.md` | Or user-provided security artifact path, if any |
| governance-config | `.architecture-guard/config.yml` | |
| config | `.architecture-guard/config.yml` | Compatibility alias of `governance-config` |
| extensions | Unsupported; detect host capabilities directly | |
| extensions-dir | Unsupported; do not probe an extension directory | |
| spec | `changes/{change}/spec.md` | Or user-provided active specification path |
| plan | `changes/{change}/plan.md` | Or user-provided active planning artifact path |
| tasks | `changes/{change}/tasks.md` | Or user-provided active task artifact path |
| proposal | `changes/{change}/proposal.md` | Or user-provided proposal path |
| security-constraints | `changes/{change}/security-constraints.md` | Or user-provided security constraints path, if any |
| project-config | `.architecture-guard/flow/default.md` | |
| constitution-set | `.architecture-guard/constitution.md`, `.architecture-guard/architecture.md`, `.architecture-guard/security.md`, plus any user-provided governance paths, plus every path declared under `governance` in `.architecture-guard/config.yml` | |
| change-root | `changes/{change}/` | |
| flow-template | `.architecture-guard/flow/default.md` | |
| draft | `.architecture-guard/constitution.draft.md` | |
| ponytail-template | `.architecture-guard/templates/ponytail_core.md` | |
| capability-composition-template | `.architecture-guard/templates/capability_composition.md` | |
| budgeted-context-template | `.architecture-guard/templates/budgeted_context_sdd.md` | |
| hygiene-rules | `.architecture-guard/hygiene-rules/*.md` | |
| presets | `.architecture-guard/presets/{preset}.md` | |
| sonar-rules | `.architecture-guard/sonar-rules` | |
| scripts | `.architecture-guard/scripts` | |
| templates | `.architecture-guard/templates` | Compatibility alias; prefer `ponytail-template` |
| fallback-spec-index | Unsupported; inspect only user-named historical specs | |

## Command Map

| Canonical Key | Generic Invocation or Fallback |
|---|---|
| create-spec | Resolve `architecture-guard resolve flow default` and `architecture-guard resolve template generic_spec`, then create `{adapter_path:spec}` inline following the flow-template guidance |
| change-scope | Use the user-selected active artifact set (default `changes/{change}/` from the flow template). If several are plausible, ask; never pick by recency. Reuse the same change for every phase. |
| validate-spec | No native spec validator; check `{adapter_path:spec}` inline against the resolved spec template for required sections, unique requirement IDs, and testable acceptance criteria |
| spec-template | Resolve `architecture-guard resolve template generic_spec` |
| create-change | Ensure `{adapter_path:change-root}` directory exists; use the flow-defined or user-selected artifact paths |
| archive | Preview the destination, then after explicit user approval run `architecture-guard archive <changeName> --framework generic`, or move `{adapter_path:change-root}` to `changes/archive/{YYYY-MM-DD}-{change}/`; never run either without that approval |
| verify | Run the Architecture Guard verification workflow against the active artifacts |
| clarify-spec | Ask and apply an inline ambiguity-resolution loop |
| create-plan | Resolve `architecture-guard resolve flow default` and `architecture-guard resolve template generic_plan`, then create `{adapter_path:plan}` inline following the flow-template guidance |
| create-tasks | Resolve `architecture-guard resolve flow default` and `architecture-guard resolve template generic_tasks`, then create `{adapter_path:tasks}` inline following the flow-template guidance |
| implement | Execute unchecked tasks inline and update their status |
| analyze | Compare active spec, plan, and tasks inline for coverage and contradictions |
| security-review-implementation | Host Security Review dispatch operation `sr-verify`; accept `sr-branch` only when host registration declares implementation scope; never `sr-changes` |
| hygiene | architecture-guard hygiene --json --target . |
| security-review | Use an optional host Security Review capability or report the skipped review |
| security-review-plan | Use an optional host Security Review capability or report the skipped review |
| security-review-tasks | Use an optional host Security Review capability or report the skipped review |
| security-review-branch | Use an optional host Security Review capability or report the skipped review |
| subagent-synthesize | Use host delegation when available; otherwise synthesize inline |
| list-specs | Inspect `changes/*/spec.md` or ask the user which historical specifications are relevant |
| consolidate-specs | Unsupported; do not write a fallback index |
| architecture-apply | Apply plan/tasks findings directly inline; run inline AG-native artifact-fix for upstream findings after user confirmation |
| architecture-review | Use the registered architecture-review capability or review selected artifacts inline |
| refactor-generator | Use the registered refactor-generator capability or generate refactor tasks inline |
| violation-detection | Use the registered violation-detection capability or detect drift inline |

## Constitution Layout

Preserve the user's existing artifact format. If `.architecture-guard/constitution.md` exists, treat it as authoritative. If no governance artifacts exist, ask where to create markdown files before writing them.

## Gap Fill Actions

1. **Flow template guidance** — When available, read `.architecture-guard/flow/default.md` (or resolve via `architecture-guard resolve flow default`) to determine artifact paths, layout (single-file vs multi-file), and lifecycle requirements.
2. **Dynamic artifact resolution** — If paths differ from the default `changes/{change}/` layout, honor the configuration declared in the active flow template.
3. **No automatic artifact discovery** — Ask when active paths are ambiguous.

## Hook Events

No native hooks. Run requested governance checks explicitly after each completed phase.
