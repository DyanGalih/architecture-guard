# Rule: Orphaned Files

**Identifier**: `orphaned-files`
**Description**: Identify files that appear to have no references from project entry points, routing, exports, configuration, or build systems.
**Default Severity**: Info
**Recommendation**: Review orphaned files. Remove them if they are no longer needed, or document why they exist without direct references. Do not delete automatically. Report only.

## Detection Logic

Scan for source files that are not imported, required, or referenced in any other file, configuration, or documentation within the project. Focus on identifying dead code at the file level.
