## Context

Currently, the `architecture-guard` package generates and manages commands (skills) using the prefix `ag-architecture-*` (e.g., `ag-architecture-review`). This convention comes from the internal structure in `src/install.js` and the file layouts in `src/commands` or templates. Since `ag` stands for Architecture Guard, the infix `architecture-` is redundant.

## Goals / Non-Goals

**Goals:**
- Strip the `architecture-` infix from all skill identifiers and generated output (e.g., `ag-architecture-review` -> `ag-review`).
- Ensure `src/install.js` correctly scaffolds skills using the new, shorter names.
- Update internal references (e.g., `AGENTS.md`, tests) to reflect the new naming convention.

**Non-Goals:**
- Completely rewriting the skill generation engine.
- Providing a complex alias system to support both old and new names simultaneously (a hard rename is preferred for maintainability).

## Decisions

- **Hard Rename in Codebase:** We will search and replace occurrences of `ag-architecture-` with `ag-` (or `architecture-` if used as a sub-identifier) in `src/install.js`, `src/install.test.js`, and any README/AGENTS.md files.
- **Directory and Command Updates:** The `src/commands/` directory contains subdirectories or script names that represent the skills. These will be renamed to drop the `architecture-` portion.
- **`src/install.js` adjustments:** The installation logic constructs string identifiers based on command keys. We will ensure the keys in the mapping or the string concatenation logic use the shorter names.

## Risks / Trade-offs

- **Risk:** Backward compatibility breakage. Existing automation scripts or user prompts hardcoding `ag-architecture-review` will fail.
- **Mitigation:** Document the breaking change in the release notes. The usability improvement (shorter command names) heavily outweighs the one-time migration cost for users.
