## 1. Create New Review Commands

- [x] 1.1 Copy `src/commands/review.md` to `src/commands/review-artifacts.md`
- [x] 1.2 Copy `src/commands/review.md` to `src/commands/review-implementation.md`
- [x] 1.3 Remove `src/commands/review.md`

## 2. Update Artifacts Review Command

- [x] 2.1 In `src/commands/review-artifacts.md`, strip out SonarLint code quality scan logic entirely
- [x] 2.2 In `src/commands/review-artifacts.md`, strip out `changed_files` execution script
- [x] 2.3 In `src/commands/review-artifacts.md`, enforce rule that this command never reads implementation code

## 3. Update Implementation Review Command

- [x] 3.1 In `src/commands/review-implementation.md`, remove the conditional `--artifacts-only` logic
- [x] 3.2 In `src/commands/review-implementation.md`, adjust instructions to reflect that this is always reviewing implementation code

## 4. Update Orchestrator and Documentation

- [x] 4.1 Update `src/commands/governed-delivery.md` to orchestrate `ag-review-artifacts` and `ag-review-implementation` at the correct phases
- [x] 4.2 Update `src/docs/workflows.md`, `src/docs/beginner-guide.md`, and `src/docs/reference-manual.md` to replace `ag-review` with the two new commands
- [x] 4.3 Update `src/extension.yml` to register the new commands and remove the old one

## 5. Update Unified CLI

- [x] 5.1 Modify `src/bin/cli.ts` (or relevant CLI files) to export and register the new commands instead of the legacy `review` command
- [x] 5.2 Build the typescript source to test compilation
