# Rule: Merge Conflict Markers

**Identifier**: `merge-conflict-markers`
**Description**: Detect unresolved Git merge conflict markers left in tracked or changed files before review, commit, or push.
**Default Severity**: Critical
**Recommendation**: Resolve all Git merge conflicts cleanly and verify affected files parse or compile before continuing.

## Purpose

Unresolved Git merge conflict markers frequently escape targeted unit or feature test runs when the broken file or route is not executed by the test suite. Detecting them deterministically at the hygiene boundary catches guaranteed syntax and parse failures early without executing reviewed code.

## Detection Criteria

Flag any readable file containing a column-0 Git conflict marker line:
- Opening conflict marker (seven `<` characters at column 0 followed by whitespace or end-of-line)
- Diff3 base marker (seven `|` characters at column 0 followed by whitespace or end-of-line)
- Conflict separator (exactly seven `=` characters at column 0 on its own line)
- Closing conflict marker (seven `>` characters at column 0 followed by whitespace or end-of-line)

Normal comparison operators (such as `===`), indented prose, and Markdown horizontal rules or headings are excluded.
