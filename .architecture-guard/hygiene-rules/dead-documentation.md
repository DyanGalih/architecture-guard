# Rule: Dead Documentation

**Identifier**: `dead-documentation`
**Description**: Report obsolete documents such as outdated implementation notes, temporary migration plans, completed AI planning files, or abandoned scratch documentation.
**Default Severity**: Info
**Recommendation**: Remove or archive dead documentation to prevent confusion. Project configuration should allow exclusions.

## Detection Logic

Scan for markdown or text files that appear to contain outdated plans, scratch notes, or temporary technical discussions that are no longer relevant to the current state of the repository. Allow exclusions based on project configuration (e.g., `docs/archive/**`).
