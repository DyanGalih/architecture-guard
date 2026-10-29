# Tasks

## 1. Backlog file validation

- [x] 1.1 Add `cli/validate-backlog.ts` with a strict zod schema per design D4 (unique ids, known `depends_on` targets, cycle detection, enum checks) and verify with unit tests for a valid file, duplicate id, unknown dependency, cycle, and unknown key
- [x] 1.2 Register `validate-backlog [path]` in `bin/cli.ts` (default `.architecture-guard/backlog.yml`) and verify with an `install.test.ts` spawn test like the `validate-sync-config` one (exit 0 on valid, 1 with the error path on invalid)
- [x] 1.3 Add `examples/backlog.yml` covering every item type and verify it passes `validate-backlog`

## 2. Sync config backlog block

- [x] 2.1 Extend `cli/validate-sync-config.ts` with an optional strict `backlog` block (`jql`, `lanes` type-to-lane map, `max_groups` 1-50 default 10), rejecting `jql` when provider is not `jira`, and verify with unit tests for valid, wrong provider, and bad lane values
- [x] 2.2 Document the `backlog` block in `docs/workflows.md` next to the story scope config and verify the documented YAML passes `validate-sync-config`

## 3. Item and lane contract template

- [x] 3.1 Add `templates/backlog_item.md` defining the normalized item shape, Jira and Beads field mappings, source selection order, the Flash-Mem role, default type-to-lane mapping, heaviest-lane rule, escalation triggers, and untrusted-text rules, and verify `architecture-guard resolve template backlog_item` returns it

## 4. Queue skill

- [x] 4.1 Write `orchestration/governed-backlog.md` with the standard preambles (adapter resolution, standalone resources, ponytail core, capability composition, repository context), intake, grouping (design D5), ordering, and Gate Q, and verify that a prompt test asserts the preambles and the Gate Q contents
- [x] 4.2 Add the phased run (design D2), lane recipes (design D3), Gate S, worktree handling (design D6), parking rules, and stacking opt-in to the skill, and verify that prompt tests assert each lane's capability order and every park trigger
- [x] 4.3 Add Gate P with per-group approval naming repository, remote, branch, base, title, and description, delegating to `ag-governed-archive`, plus the never-merge, never-force-push, and never-write-Jira guardrails, and verify with prompt tests for each guardrail
- [x] 4.4 Add the opt-in Beads write-back (in_progress on start, PR note at Gate P, close only after merge with approval) and verify that prompt tests assert it is gated and that disabled write-back runs no writing `bd` command
- [x] 4.5 Add `queue.yml` state, resume, backlog diffing (design D8), and the run report, and verify that prompt tests assert every state name and the resume re-check of parked groups
- [x] 4.6 Not added: the legacy Spec Kit extension channel may lag the standalone skills (as `ag-review-pr`, `ag-pr-feedback`, and `ag-e2e-testing` do), and the installer already ships `ag-governed-backlog` to Spec Kit projects; the extension consistency test passes without it

## 5. Registration and docs

- [x] 5.1 Add `governed-backlog` to `COMMANDS` in `cli/install.ts` and verify the install count test and a fresh `install` into a temp dir produce the skill for one skills host and one commands host
- [x] 5.2 Add a "Backlog Queue" section to `docs/workflows.md`, an entry in `docs/reference-manual.md` and `README.md`, and an `## Unreleased` entry in `docs/release-notes.md`, and verify the links resolve

## 6. Integration check

- [x] 6.1 Run `pnpm test` and `pnpm lint` and verify both pass
- [ ] 6.2 Dry-run the installed skill against a sample repo with `examples/backlog.yml` (three groups, one dependency, one bug) through Gate Q and Gate S, and verify that the proposed order, lanes, and worktree names match the design
