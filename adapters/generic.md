# Generic Workflow Adapter

Use this adapter when `.architecture-guard/config.yml` or `.architecture-guard/selected-adapter` is `generic`. It maps governance concepts to the current directory with user-prompt fallbacks for missing artifact paths; never guess.

## Path Map

| Canonical Name | Generic Path |
|---|---|
| project-root | `.` |
| sdd-tool-dir | Unsupported |
| constitution | User-provided governance artifact path |
| arch-constitution | User-provided architecture artifact path |
| security-constitution | User-provided security artifact path, if any |
| governance-config | User-provided configuration path, if any |
| extensions | Unsupported; detect host capabilities directly |
| extensions-dir | Unsupported; do not probe an extension directory |
| spec | User-provided active specification path |
| plan | User-provided active planning artifact path |
| tasks | User-provided active task artifact path |
| security-constraints | User-provided security constraints path, if any |
| draft | `.architecture-guard/constitution.draft.md` |
| ponytail-template | `.architecture-guard/templates/ponytail_core.md` |
| budgeted-context-template | `.architecture-guard/templates/budgeted_context_sdd.md` |
| hygiene-rules | `.architecture-guard/hygiene-rules/*.md` |
| presets | `.architecture-guard/presets/{preset}.md` |
| sonar-rules | `.architecture-guard/sonar-rules` |
| fallback-spec-index | Unsupported; inspect only user-named historical specs |

## Command Map

| Canonical Key | Generic Invocation or Fallback |
|---|---|
| create-spec | Create the user-selected specification artifact inline |
| create-change | No container step; use the user-selected artifact paths |
| archive | Unsupported natively; preserve artifacts and report that archival must be performed manually after user confirmation |
| verify | Run the Architecture Guard verification workflow against the user-selected artifacts |
| clarify-spec | Ask and apply an inline ambiguity-resolution loop |
| create-plan | Create the user-selected planning artifact inline |
| create-tasks | Create the user-selected task artifact inline |
| implement | Execute unchecked tasks inline and update their status |
| analyze | Compare active spec, plan, and tasks inline for coverage and contradictions |
| security-review | Use an optional host Security Review capability or report the skipped review |
| security-review-plan | Use an optional host Security Review capability or report the skipped review |
| security-review-tasks | Use an optional host Security Review capability or report the skipped review |
| security-review-branch | Use an optional host Security Review capability or report the skipped review |
| subagent-synthesize | Use host delegation when available; otherwise synthesize inline |
| list-specs | Ask the user which historical specifications are relevant |
| consolidate-specs | Unsupported; do not write a fallback index |
| architecture-apply | Apply plan/tasks findings directly inline; run inline AG-native artifact-fix for upstream findings after user confirmation |
| architecture-review | Use the registered architecture-review capability or review selected artifacts inline |
| refactor-generator | Use the registered refactor-generator capability or generate refactor tasks inline |
| violation-detection | Use the registered violation-detection capability or detect drift inline |

## Constitution Layout

Preserve the user's existing artifact format. If no governance artifacts exist, ask where to create markdown files before writing them.

## Gap Fill Actions

1. **No SDD tool lifecycle** — All creation, validation, and implementation steps run inline with explicit user-selected paths.
2. **No automatic artifact discovery** — Ask when active paths are ambiguous.

## Hook Events

No native hooks. Run requested governance checks explicitly after each completed phase.
