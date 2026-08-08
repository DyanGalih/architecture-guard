## Context
The previous `ag-review` command handled both artifact evaluation and code implementation linting. The conditional logic relying on an `--artifacts-only` flag created ambiguity for users. By splitting this into two explicit commands, we can simplify the orchestration flow (especially `ag-governed-delivery`) and make the command interfaces predictable.

## Goals / Non-Goals

**Goals:**
- Split `src/commands/review.md` into `src/commands/review-artifacts.md` and `src/commands/review-implementation.md`.
- Remove the deprecated `review.md`.
- Update `governed-delivery.md` to reference the new commands correctly.
- Ensure the `cli.ts` (if applicable) and `extension.yml` registries are updated with the new commands.

**Non-Goals:**
- We are not changing the core capabilities of the review engine (e.g., we are not adding new SonarLint rules or changing how the Constitution works).
- We are not modifying the behavior of `ag-verify`.

## Decisions

1. **Explicit Separation**: `review-artifacts.md` will strictly remove all references to SonarLint, checking implementation code, and `changed_files`. It will only focus on reading `.specify/memory/constitution.md`, `spec.md`, `plan.md`, etc.
2. **Implementation Focus**: `review-implementation.md` will strictly remove the conditional checks for `--artifacts-only` and assume that it is always reviewing code based on `changed_files`.
3. **Orchestration Migration**: `governed-delivery.md` will execute `ag-review-artifacts` in Phase 5 (Plan Gate), and `ag-review-implementation` in Phase 7 (Task Generation and Analysis).

## Risks / Trade-offs

- [Risk] Existing users might have automated scripts calling `/ag-review`.
  → Mitigation: We mark this as a breaking change in the release notes.
- [Risk] The CLI (`src/bin/cli.ts`) may not automatically pick up new Markdown commands if they aren't explicitly registered.
  → Mitigation: Verify the CLI's command registration logic to ensure the new commands are bundled and executable.
