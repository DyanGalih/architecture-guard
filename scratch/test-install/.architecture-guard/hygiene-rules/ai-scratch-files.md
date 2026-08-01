# Rule: AI Scratch Files

**Identifier**: `ai-scratch-files`
**Description**: Detect common AI-generated working files such as draft implementations, prototype files, copied implementations, backup source files (e.g., `feature-copy.ts`, `component-final.ts`, `test2.js`, `old-service.py`, `prototype.go`).
**Default Severity**: Warning
**Recommendation**: Remove scratch and draft files or rename them to clearly identify their purpose if intended to be kept.

## Detection Logic

Scan for file names containing keywords like `-copy`, `-final`, `old-`, `test2`, `draft`, or `prototype` in source directories. Ignore intentionally configured exceptions.
