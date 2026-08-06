## Context

The repository documentation (`.md` files) currently mixes `speckit` and `architecture-guard` command prefixes. See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- For SpecKit extension command references, update prefixes from `/speckit.ag-*` (or `/speckit.ag-*`) to `/speckit.ag-*`.
- For standalone/general command references, update prefixes to use `/ag-*` (e.g. `/ag-governed-spec`).

**Non-Goals:**
- Do not modify actual source code (`.js`, `.sh`, `.ps1`), only documentation (`.md`).
- Do not change the binary name itself, just the documentation references.

## Decisions

- We will run a targeted search-and-replace across all `.md` files to update the command prefixes based on their context (SpecKit extension vs standalone).
- We will manually review the replacements to ensure that URLs, directory paths, or general textual references to the project itself are not unintentionally broken.

## Risks / Trade-offs

- **Risk**: Accidental replacement in URLs (e.g., `github.com/spec-kit/...`).
  **Mitigation**: The search criteria will be targeted at command strings (e.g., code blocks or inline code like `speckit ...` or `architecture-guard ...`) to prevent accidental replacement in normal text or links.
