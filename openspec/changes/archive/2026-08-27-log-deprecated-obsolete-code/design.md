# Technical Design: Deprecated & Obsolete Code Governance

## Overview
This design introduces a formal **Deprecated & Dangerous Code** hygiene rule (`src/hygiene-rules/deprecated-and-dangerous-code.md`), copies it into runtime resources (`.architecture-guard/hygiene-rules/deprecated-and-dangerous-code.md`), and updates orchestration flows (`governed-implement`, `governed-plan`, `governed-tasks`, `verify`) to inspect and enforce these constraints as a preflight reference before writing code.

## Architectural Changes

### 1. Hygiene Rule Definition (`src/hygiene-rules/deprecated-and-dangerous-code.md`)
- **Identifier**: `deprecated-and-dangerous-code`
- **Default Severity**: `Critical` (Blocking)
- **Structure**:
  - **Rule Overview & Recommendation**: Always replace obsolete/dangerous constructs with standard, supported language or framework capabilities.
  - **Catalog of Patterns by Ecosystem**:
    - **PHP (PHP 8.2+)**: Deprecated dynamic properties, `utf8_encode`/`utf8_decode`, dangerous `eval()`, `unserialize()` with untrusted data, deprecated `create_function()`, `each()`, `mysql_*` functions.
    - **JavaScript / TypeScript / Node.js**: Deprecated `new Buffer()`, `fs.exists()`, `substr()`, synchronous blocking I/O in server loops, loose `eval()`, prototype pollution constructs.
    - **Angular (Angular 16+)**: Unmanaged RxJS subscriptions in components, legacy `NgModule` declarations where standalone is required, mutating `@Input()` / `input()`, direct DOM manipulation breaking SSR.
    - **React (React 18+)**: Legacy lifecycles (`componentWillMount`, `componentWillReceiveProps`), `defaultProps` on function components, direct state mutation.
    - **General Web / Security**: Plain MD5/SHA1 for passwords, hardcoded credentials, Math.random() for security tokens.
  - **Extensibility**: Guidance for projects to add custom deprecation entries in their local constitution or hygiene rule overrides.

### 2. Orchestration Updates
- **`orchestration/governed-implement.md` & `commands/governed-implement.md`**:
  - Add explicit instruction: *Before generating or modifying code for a task, check the target language and framework against `{adapter_path:hygiene-rules}/deprecated-and-dangerous-code.md` (or local hygiene rules) and ensure no obsolete, deprecated, or dangerous patterns are introduced.*
- **`orchestration/governed-plan.md` & `orchestration/governed-tasks.md`**:
  - Incorporate deprecation avoidance into plan design quality gates and task criteria.
- **`docs/repository-hygiene.md`**:
  - Add `deprecated-and-dangerous-code` to the default rules list and configuration table.

## Verification Strategy
- Run `npm test` to ensure installer and command tests pass.
- Verify that the new hygiene rule is discoverable by direct directory inspection (`Direct Discovery Guard`).
- Ensure no regressions in existing 11 hygiene rules.
