# Rule: Temporary Files

**Identifier**: `temporary-files`
**Description**: Detect temporary files such as `*.tmp`, `*.bak`, `*.old`, `*.orig`, `*.rej`, `*.swp`, `*.temp`. Also detect temporary directories such as `tmp/`, `temp/`, `scratch/`, `playground/`, `sandbox/` unless intentionally configured in ignored paths.
**Default Severity**: Warning
**Recommendation**: Remove temporary files before committing. Add them to `.gitignore` if they are necessary for local workflow but should not be committed.

## Detection Logic

Scan the repository for files matching the patterns or residing in the directories listed in the description. Exclude paths listed in `repository_hygiene.ignore.paths` configuration.
