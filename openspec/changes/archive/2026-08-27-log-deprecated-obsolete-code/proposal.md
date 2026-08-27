# Proposal: Deprecated & Obsolete Code Governance

## Problem
During AI-assisted implementation, coding agents and developers frequently suggest deprecated library methods, obsolete framework patterns, or unsafe language constructs that have been superseded or removed (e.g. PHP deprecated syntax/functions, obsolete Angular NgModules/RxJS subscription patterns, deprecated Node.js API methods, insecure functions). These lead to runtime exceptions, deprecation warnings, security flaws, and endless remediation loops during post-implementation reviews. Currently, Architecture Guard lacks an authoritative, blocking hygiene rule that logs and checks against these obsolete patterns prior to and during task implementation.

## Proposed Solution
1. **Create Deprecated & Dangerous Code Hygiene Rule (`src/hygiene-rules/deprecated-and-dangerous-code.md`)**:
   - Establish a structured rule with **Critical (Blocking)** default severity.
   - Catalog deprecated, obsolete, and dangerous code patterns organized by Framework and Programming Language (e.g., PHP, JavaScript/TypeScript, Angular, React, Node.js).
   - Each entry defines the prohibited pattern, failure mode/security risk, and approved modern replacement.
2. **Pre-Implementation & Task Preflight Integration**:
   - Update `orchestration/governed-implement.md`, `commands/governed-implement.md`, `orchestration/governed-plan.md`, and `orchestration/governed-tasks.md` to explicitly require checking the active language/framework against the deprecated code catalog before writing code.
3. **Hygiene & Verification Synchronization**:
   - Copy the rule to `.architecture-guard/hygiene-rules/deprecated-and-dangerous-code.md`.
   - Update `docs/repository-hygiene.md` to document the new rule and its blocking severity.
4. **Constitution and Template Updates**:
   - Ensure `templates/ponytail_core.md` and architecture constitution templates cite deprecation avoidance as a non-negotiable safety floor.

## Non-Goals
- Building an external binary AST linter; this uses prompt-governed rules and heuristics aligned with Ponytail Core.
- Forcing breaking migrations on unaffected legacy code that is not part of the active change.
