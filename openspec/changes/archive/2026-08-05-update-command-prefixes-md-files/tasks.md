## 1. Discovery and Search

- [x] 1.1 Find all markdown files (`.md`) containing SpecKit extension command references (e.g. `/speckit.ag-*` or `/speckit.ag-*`).
- [x] 1.2 Find all markdown files (`.md`) containing standalone command references (where they should be prefixed with `/ag-`).

## 2. Updates

- [x] 2.1 For SpecKit extension references, replace the old prefixes with `/speckit.ag-*`.
- [x] 2.2 For standalone/general command references, replace the old references with the `/ag-*` prefix. Ensure we don't accidentally replace the repository name or general textual references to the project itself.

## 3. Verification

- [x] 3.1 Review the git diff to ensure no non-command text or URLs were inadvertently altered.
- [x] 3.2 Verify that markdown files still render correctly and command blocks are intact.
