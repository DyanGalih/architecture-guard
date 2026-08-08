# Rule: Empty Files

**Identifier**: `empty-files`
**Description**: Report source files that contain no meaningful implementation.
**Default Severity**: Info
**Recommendation**: Remove empty files unless they serve a structural or placeholder purpose.

## Detection Logic

Scan for files that are either completely empty (0 bytes) or only contain whitespace/empty blocks. Ignore files specifically designated as placeholders or those allowed by configuration.
