# SpecKit Adapter

Use this adapter when `.architecture-guard/selected-adapter` is `spec-kit`. The `.specify/` marker is only a fallback for uninitialized projects.

## Path Map

| Canonical Name | SpecKit Path |
|---|---|
| project-root | `.` |
| sdd-tool-dir | `.specify/` |
| constitution | `.specify/memory/constitution.md` |
| arch-constitution | `.specify/memory/architecture_constitution.md` |
| security-constitution | `.specify/memory/security_constitution.md` |
| governance-config | `.specify/config/architecture_guard.yml` |
| config | `.specify/config/architecture_guard.yml` (compatibility alias of `governance-config`) |
| extensions | `.specify/extensions.yml` |
| extensions-dir | `.specify/extensions/` |
| spec | `specs/{feature}/spec.md` |
| plan | `specs/{feature}/plan.md` |
| tasks | `specs/{feature}/tasks.md` |
| security-constraints | `specs/{feature}/security-constraints.md` |
| draft | `.specify/memory/constitution.draft.md` |
| ponytail-template | `.architecture-guard/templates/ponytail_core.md` |
| budgeted-context-template | `.architecture-guard/templates/budgeted_context_sdd.md` |
| hygiene-rules | `.architecture-guard/hygiene-rules/*.md` |
| presets | `.architecture-guard/presets/{preset}.md` |
| sonar-rules | `.architecture-guard/sonar-rules` |
| scripts | `.architecture-guard/scripts` |
| templates | `.architecture-guard/templates` (compatibility alias; prefer `ponytail-template`) |
| fallback-spec-index | `specs/system_context.md` |
| flash-mem-project-id | Read from `.specify/memory/` or Flash-Mem MCP |

## Command Map

| Canonical Key | SpecKit Invocation or Fallback |
|---|---|
| create-spec | `/speckit.specify`; if unavailable, create `{adapter_path:spec}` inline from user intent and governing context, enforcing SpecKit numbering rules (`NNN-<short-name>`) and updating `.specify/feature.json` |
| create-change | Require or create the feature workspace following `.specify/init-options.json` numbering conventions before specification creation, and maintain `.specify/feature.json` |
| archive | SpecKit has no native archive command; retain verified feature artifacts in place and incrementally update `{adapter_path:fallback-spec-index}` with explicit user approval |
| verify | Use the registered Architecture Guard verification capability, or run the verification workflow inline |
| clarify-spec | `/speckit.clarify`; if unavailable, ask and apply an inline ambiguity-resolution loop |
| create-plan | `/speckit.plan`; if unavailable, create `{adapter_path:plan}` inline from the active spec |
| create-tasks | `/speckit.tasks`; if unavailable, create `{adapter_path:tasks}` inline from the active plan |
| implement | `/speckit.implement`; if unavailable, execute unchecked tasks inline and update their status |
| analyze | `/speckit.analyze`; if unavailable, compare spec, plan, and tasks inline for coverage and contradictions |
| security-review | Unsupported in standalone SDD orchestration; report `Unavailable`. Current SpecKit extension integration exists only in the legacy `commands/` delivery channel |
| security-review-plan | Unsupported in standalone SDD orchestration; report `Unavailable`. Current SpecKit extension integration exists only in the legacy `commands/` delivery channel |
| security-review-tasks | Unsupported in standalone SDD orchestration; report `Unavailable`. Current SpecKit extension integration exists only in the legacy `commands/` delivery channel |
| security-review-branch | Unsupported in standalone SDD orchestration; report `Unavailable`. Current SpecKit extension integration exists only in the legacy `commands/` delivery channel |
| subagent-synthesize | `/speckit.subagent.synthesize` when registered; otherwise synthesize inline |
| list-specs | Enumerate files matching `{adapter_path:spec}` in normalized path order |
| consolidate-specs | Build `{adapter_path:fallback-spec-index}` inline from `list-specs` results |
| architecture-apply | Apply plan/tasks findings directly inline; after confirmation, use an explicit host update capability when available, otherwise run the AG-native inline artifact-fix against the resolved `spec.md` path; do not invoke `/speckit.specify` for updates |
| architecture-review | Use the registered architecture-review capability or review the resolved artifacts inline |
| refactor-generator | Use the registered refactor-generator capability or generate refactor tasks inline |
| violation-detection | Use the registered violation-detection capability or detect drift inline |

## Feature Directory & State Management

SpecKit enforces explicit directory naming and state persistence rules:
1. **Directory Numbering Resolution**:
   - Check `.specify/init-options.json` for `feature_numbering`.
   - If `"sequential"` or absent: directory name MUST be `specs/NNN-<short-name>` (where `NNN` is the next available 3-digit number after scanning `specs/`, e.g. `specs/001-safe-dashboard-users-invoices`).
   - If `"timestamp"`: directory name MUST be `specs/YYYYMMDD-HHMMSS-<short-name>`.
2. **State Tracking File (`.specify/feature.json`)**:
   - When a feature is selected or created, persist the resolved directory path:
     ```json
     {
       "feature_directory": "specs/001-feature-name"
     }
     ```
   - Downstream commands (`create-plan`, `create-tasks`, `implement`, `analyze`) read `.specify/feature.json` first to identify the active feature directory.

## Constitution Layout

SpecKit uses separate files for governance, architecture, and security rules.

### `.specify/memory/constitution.md`
```
1. Project Identity
2. Engineering Philosophy (Ponytail)
3. Security Expectations
4. Testing Expectations
5. Documentation Standards
6. Review Process
7. High-Level Architecture Intent
8. Governance and Evolution Policy
```

### `.specify/memory/architecture_constitution.md`
```
1. Architecture Style
2. Layer Boundaries
3. Business Logic Placement
4. Contracts & Validation
5. Data Access Rules
6. Async & Integration Rules
7. Module Boundaries
8. Application Framework-Specific Architecture Rules
9. Blocking Architecture Violations (P0)
10. Architecture Evolution Policy
11. Refactor & Drift Handling
```

### `.specify/memory/security_constitution.md`
```
1. Trust Boundaries
2. Authentication & Authorization Standards
3. Data Isolation & Privacy Rules
4. Secrets Management Policy
5. Secure-by-Design Patterns
6. API & Integration Security
7. Audit, Logging & Monitoring Requirements
8. Security Incident Response Triggers
9. Compliance & Regulatory Mapping
```

## Gap Fill Actions

1. **Architecture verify** — SpecKit has no built-in task-to-code evidence mapping.
   - Fill: Architecture Guard's `architecture-verify` command reads tasks.md checkboxes and validates against code.

2. **DRY duplication detection** — SpecKit has no native DRY drift checker.
   - Fill: Architecture Guard's `violation-detection` command scans for repeated business rules, validation, DTO mapping.

3. **Repository hygiene** — SpecKit has no cleanup guard.
   - Fill: Architecture Guard's hygiene rules detect orphaned files, debug artifacts, commented-out code.

## Hook Events

SpecKit hooks are a legacy extension-only integration. They fire only when installed through the SpecKit extension mechanism; this adapter is not a standalone installer and standalone orchestration does not assume hooks exist:
- `after_plan` → `violation-detection` (optional)
- `after_tasks` → `refactor-generator` (optional)
- `after_implement` → `architecture-review` (optional)

In standalone mode, hooks are not automatic — the orchestrator's preamble tells the AI agent to run governance checks after each phase.
