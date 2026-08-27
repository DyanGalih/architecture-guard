# Rule: Generated Artifacts

**Identifier**: `generated-artifacts`
**Description**: Detect generated outputs accidentally committed, including compiled outputs, temporary reports, generated test artifacts, coverage outputs, and local caches.
**Default Severity**: Warning
**Recommendation**: Remove generated artifacts and add them to `.gitignore`. Configuration should define allowed generated files if necessary.

## Detection Logic

Scan for files or directories commonly associated with build outputs or generated content (e.g., `dist/`, `build/`, `out/`, `coverage/`, `.cache/`, `*.min.js`, `*.map`). Project configuration should allow exceptions for intentionally tracked generated files.
