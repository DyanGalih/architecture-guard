# Rule: Duplicate Experimental Files

**Identifier**: `duplicate-experimental-files`
**Description**: Detect multiple files that appear to implement the same responsibility (e.g., `service.ts`, `service_new.ts`, `service_v2.ts`, `service_backup.ts`).
**Default Severity**: Warning
**Recommendation**: Remove or merge duplicate/experimental implementations before committing. 

## Detection Logic

Use heuristic analysis (not just filename matching) to identify files with very similar names, identical structures, or significant code overlap indicating experimental duplication. Focus on suffixes like `_new`, `_v2`, `_backup`, `_alt` within the same directory.
