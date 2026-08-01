# Rule: Commented-Out Code

**Identifier**: `commented-out-code`
**Description**: Detect large blocks of disabled source code that should either be restored or removed.
**Default Severity**: Warning
**Recommendation**: Remove commented-out code blocks before committing. Use version control (git) to retrieve old code if needed.

## Detection Logic

Scan for multi-line comments or consecutive single-line comments that contain recognizable syntax structures (e.g., function definitions, loops, classes) rather than natural language text. Ignore legitimate documentation comments (e.g., JSDoc, Docstrings).
