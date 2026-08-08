# Rule: Debug Artifacts

**Identifier**: `debug-artifacts`
**Description**: Detect common debug leftovers including console logging, print statements, debug output files, temporary log files (e.g., `console.log(...)`, `print(...)`, `println(...)`, `dump(...)`, `dd(...)`, `var_dump(...)`, `debug.log`).
**Default Severity**: Critical
**Recommendation**: Remove debug statements and artifacts from production code before committing.

## Detection Logic

Scan source code for common debugging statements based on language (e.g., `console.log` for JS/TS, `print` for Python, `dd`/`var_dump` for PHP). Also scan for files named `debug.log` or similar. Exclude paths configured in `repository_hygiene.ignore.paths`.
