# Rule: TODO / FIXME Comments

**Identifier**: `todo-comments`
**Description**: Report unresolved markers such as `TODO`, `FIXME`, `HACK`, `TEMP`, `XXX`.
**Default Severity**: Info
**Recommendation**: Review and resolve outstanding TODO/FIXME markers. For long-term debt, consider tracking them in an issue tracker instead of the codebase.

## Detection Logic

Scan source code for common unresolved markers (e.g., `TODO`, `FIXME`, `HACK`, `TEMP`, `XXX`). Allow severity configuration (e.g., failing on `FIXME` but only warning on `TODO`).
