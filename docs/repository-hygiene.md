# Repository Hygiene Guard

Architecture Guard includes a **Repository Hygiene Guard** capability. This feature ensures that AI-assisted development produces a clean, maintainable repository before code is committed or merged.

It focuses on detecting implementation artifacts and repository hygiene issues commonly left behind by rapid development workflows, such as temporary files, AI scratch files, and debug logging.

## Core Philosophy

* **Framework Agnostic**: Works across all programming languages and frameworks.
* **Non-destructive**: Never deletes files automatically. It provides actionable recommendations.
* **Advisory by Default**: In `ag-review-artifacts`, it provides a report. In `ag-verify`, it can fail the build based on your `fail_on` configuration.
* **Extensible**: Add custom rules under `.architecture-guard/hygiene-rules/`; same-named local files override bundled rules.


## Command Runner

Run the deterministic scanner from the project root:

```bash
architecture-guard hygiene --json --target .
```

The JSON report lists every bundled rule and same-named local override, including its source, execution mode, findings, and blocking status. Built-in rules are executed by the runner. Markdown-only rules without a registered detector are reported as manual and make the overall result degraded; they are never reported as passed. Use --rules id1,id2 to run a focused subset. The runner is read-only and applies the configured repository_hygiene.ignore exclusions before scanning.

## Configuration

You can configure Repository Hygiene in your project by creating a `.specify/config/repository_hygiene.yml` file, or by embedding a `repository_hygiene:` block in your `.specify/memory/architecture_constitution.md` file.

Example configuration:

```yaml
repository_hygiene:
  enabled: true

  # Elevates findings to CRITICAL severity (fails verify)
  fail_on:
    - critical

  # Sets findings to Warning severity
  warn_on:
    - warning

  ignore:
    paths:
      - docs/archive/**
      - playground/**
      - coverage/**
      - tmp/**

    files:
      - README.draft.md

    patterns:
      - "*.generated.*"
```

## Built-in Checks

The following hygiene categories are checked by default:

- **Temporary Files**: `*.tmp`, `*.bak`, `*.old`, `tmp/`
- **AI Scratch Files**: `*-copy.*`, `old-service.*`, draft implementations.
- **Debug Artifacts**: `console.log`, `print`, `var_dump`, `debug.log`.
- **Empty Files**: Files with no meaningful implementation.
- **Duplicate Experimental Files**: `service_new.ts`, `service_v2.ts`.
- **Duplicate Business Logic**: Repeated rules, validations, mappings, or orchestration that should be centralized in one shared source of truth. This rule is a good candidate for `Critical` severity if you want DRY violations to fail `ag-verify`.
- **Orphaned Files**: Files with no references from entry points or exports.
- **Dead Documentation**: Outdated implementation notes and scratch documents.
- **TODO / FIXME**: Unresolved markers (configurable severity).
- **Commented-Out Code**: Large blocks of disabled source code.
- **Generated Artifacts**: Compiled outputs accidentally committed.
- **Deprecated & Dangerous Code**: Deprecated, obsolete, or unsafe language and framework APIs (e.g. PHP deprecated syntax/functions, unmanaged Angular subscriptions, dangerous `eval`/`unserialize`, insecure hashing) that cause runtime failures or security risks. Defaults to **Critical** (blocking).

## Custom Rules

Add custom rules by placing Markdown files into `.architecture-guard/hygiene-rules/` (or `ag/hygiene-rules/`). The runner loads them as local overrides; rules without a built-in detector are reported as manual.

Each rule should follow this format:

```markdown
# Rule: [Rule Name]
**Identifier**: `rule-identifier`
**Description**: What this rule detects.
**Default Severity**: Warning | Critical | Info
**Recommendation**: How to fix it.

## Detection Logic
Instructions for the agent on how to scan for this issue.
```
