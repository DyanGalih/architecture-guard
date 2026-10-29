# Design

## Context

See proposal.md for motivation. The constraints that shape this design:

- `ag-workflow` (`orchestration/workflow.md`) runs one change with Gates 0-3 and states "never cross a human gate based on an earlier phase's approval".
- `ag-governed-archive` requires a separate explicit approval that names the repository, remote, and branch before any push, and another approval of title, description, and base before creating a pull request. There is no `pr-create` forge command today; archive creates pull requests itself.
- `story_scope` Planning Mode already classifies Jira tickets into **Bundle now**, **Do next**, **Conflicts**, and **Owned elsewhere**, and its accepted set goes into `## Stories`, which `ag-verify`, `ag-review-pr`, and `ag-pr-feedback` read.
- Skills are Markdown prompts under `orchestration/` (generic) and `commands/` (Spec Kit flavor), registered in `cli/install.ts` `COMMANDS` and `extension.yml`. Config validation lives in small zod-based CLI commands (`cli/validate-sync-config.ts`).

## Goals / Non-Goals

**Goals:**

- Turn N backlog items into ordered, independently reviewable pull requests while keeping the user to three decision points per run.
- Reuse existing phase capabilities unchanged; the queue only orchestrates.

**Non-Goals:**

- Merging pull requests, or watching CI after a pull request opens.
- Writing to Jira (status transitions, comments, links).
- Parallel implementation across groups in the first version.
- Replacing `ag-workflow` for single changes.

## Decisions

### D1. A new skill above `ag-workflow`, not a mode of it

`ag-governed-backlog` calls the phase capabilities directly per lane. Alternative: a `--queue` mode on `ag-workflow`. Rejected because `ag-workflow`'s gate rules and Output are per change, and adding batch semantics would weaken its "no implicit approval" guardrail for every user.

### D2. Three batched gates, ordered by phase across all groups

The run proceeds in phases across the whole queue rather than group by group:

1. Intake and plan → **Gate Q**
2. Discovery and specification for every full-lane group → **Gate S**
3. Plan, tasks, implement, and verify for every approved group, in queue order
4. **Gate P** for every group that reached `ready`
5. Report

Alternative: per-group Gates 0-3 (40 stops for 10 groups). Rejected as unusable. Alternative: fully unattended. Rejected because archive's push and pull request approvals must name exact targets. Gate P satisfies them by listing each group's repository, remote, branch, base, title, and description and taking a separate approval per group. That is the same explicit approval archive asks for, collected in one place, so `ag-governed-archive` does not change. Gate 1 (plan and tasks) and Gate 2 (implementation) are not presented; their review convergence loops still run and any non-convergence parks the group.

Delegated capabilities still ask questions of their own (clarifications, write previews, capability names). Between gates the queue answers those inside the Gate Q scope conservatively and records them per group (`assumptions`), and records anything outside it as an open decision; Gate S (or Gate P after it) presents both. Without this, a run would stop mid-way for each group and the gates would not be batched. A dry run found this. `ag-governed-discover` gains a caller-passed accepted story set so a Jira group is not classified and approved a second time.

### D3. Lanes as composition recipes

| Lane | Capabilities, in order |
|---|---|
| full | `ag-governed-discover` → `ag-governed-spec` → (Gate S) → `ag-governed-delivery` → `ag-governed-implement` |
| fix | create change → reproduce and add failing test → `ag-governed-tasks` → `ag-governed-implement` |
| light | create change → `ag-governed-tasks` → `ag-governed-implement` |
| research | `ag-governed-discover` |

`ag-governed-implement` already runs `ag-verify` in its Mandatory Verification Gate, so no lane calls verify separately. A fix lane whose root cause changes observable behavior writes a specification delta and moves to Gate S. Mixed-type groups take the heaviest lane (full > fix > light > research). Default type mapping: Story, Feature, Epic child → full; Bug, Defect → fix; Task, Sub-task, Chore, Tech debt, Improvement → light; Spike → research. `sync.yml` `backlog.lanes` overrides it.

### D4. Local backlog schema

```yaml
# .architecture-guard/backlog.yml
items:
  - id: BUG-3              # unique, [A-Za-z0-9._-]
    type: bug              # story | feature | bug | task | chore | spike (or a mapped custom type)
    priority: high         # highest | high | medium | low | lowest
    title: Login fails on expired session
    description: ...
    acceptance:            # optional list of strings
      - Expired sessions redirect to sign-in
    group: auth-session    # optional; same value → same change and pull request
    depends_on: [STORY-1]  # optional item or group ids
    size: s                # optional xs | s | m | l | xl, used as tie-breaker
```

Validated by `architecture-guard validate-backlog [path]` with zod in strict mode: unknown keys, duplicate ids, unknown `depends_on` targets, and cycles are errors. Jira items normalize to the same shape: priority from the Jira priority field, size from story points when present.

### D4b. Intake sources and their roles

| Source | Read | Write | Chosen when |
|---|---|---|---|
| Jira | Jira MCP server, `sync.yml` `backlog.jql` | never | `provider: jira` |
| Beads | `bd list --json` / `bd show --json` / `bd dep list --json` | opt-in: `bd update --status in_progress`, `bd note`, `bd close` after merge | `bd` on PATH and `.beads/` present |
| Local | `backlog.yml` | never (the user edits it) | fallback |
| Flash-Mem | durable context per group | durable lessons only (root causes, park reasons that reflect a constraint) | never a backlog source |

Flash-Mem is excluded as a source because its contract stores validated, durable knowledge, not transient status, and it has no priority, dependency, or readiness model. Beads mapping: `issue_type` story/feature/bug/task/chore/spike/epic → type (epics become groups, not items); `priority` 0-4 → highest..lowest; parent epic → `group`; `blocks` dependencies → `depends_on`. Beads text is untrusted like ticket text. Readiness comes from the queue's own ordering over the full open set, not from `bd ready`, because a group can contain items `bd ready` reports as blocked only by other items in the same group.

Beads write-back is opt-in at Gate Q because the database is shared through git with the team. Each write is a single named `bd` command shown in the Gate Q plan.

### D5. Grouping

Beads: one group per parent epic, one group per parentless bead. Jira: run `story_scope` Planning Mode once per candidate main story, highest priority first. A ticket claimed as **Bundle now** by a higher-priority story is not reconsidered. **Do next** becomes `depends_on` from the later group to the earlier one, and **Conflicts** becomes an ordering edge in priority order. **Owned elsewhere** tickets are excluded and listed at Gate Q. Local: the `group` field. In both cases a file-overlap hint (files named in descriptions plus paths matched from item terms) proposes merges at Gate Q. It never applies them.

### D6. Worktree per group, created beside the repository

Worktrees go in `../<repo>-queue-<group>` from the approved base, listed at Gate Q. They let groups keep uncommitted work isolated until Gate P without intermediate commits, and keep the user's checkout untouched. With `repositories` configured, the queue creates one worktree per owning repository per group. Worktrees are kept after publish so `ag-pr-feedback` can use them, and the report lists them for cleanup.

### D7. Sequential execution, wait-on-dependency by default

Group ids are lowercase kebab-case because they become change names, and OpenSpec rejects uppercase change names (`TASK-7` → `task-7`).

Groups run one at a time in queue order, because implementation writes and gates are sequential and parallel writers would need ownership coordination that Agent Teams already defines. Subagents may run the read-only review halves inside a group, as `ag-workflow` allows. A dependent group waits for its dependency's merged pull request (parked `waiting on`), including when the dependency is in the same run: otherwise it would branch from the base without its dependency's code and could merge first. Stacking is opt-in per group at Gate Q, because squash-merging the base pull request forces a rebase of the stacked branch.

### D8. State file

```yaml
# .architecture-guard/queue.yml (written by the queue; git-ignored by recommendation)
source: jira | beads | local
beads_writeback: false
base: main
groups:
  - id: auth-session
    items: [BUG-3, TASK-7]
    lane: fix
    state: parked          # planned | specifying | spec-pending | researched | specified | in-progress | ready | published | done | parked | skipped
    reason: waiting on STORY-1
    branch: fix/auth-session
    worktree: ../app-queue-auth-session
    pr: https://...
```

A second dry run showed that reusing `planned` after Gate S made a resumed run repeat specification, and that a waiting group had no state, so `specified`, `researched`, and waiting-as-`parked` were added, with discovery summaries saved under `.architecture-guard/queue/`. A third dry run showed that parked groups never returned to `planned`, that `queue.yml` held too little to diff the backlog on resume, and that a light-lane change failed OpenSpec validation without `skip_specs: true`. Each group now keeps an item snapshot, its lane reason, and its blockers; parked groups return to `planned` when their reason clears; and every resume re-runs planning and Gate Q over the whole queue. A fourth dry run showed that parking a blocked group by default deadlocked the queue (nothing in the run could clear the finding), so the default became widening the group to fix the finding, and declining parks it. Resumes keep the groups as approved at Gate Q, and the item snapshot includes title and acceptance criteria so stale specifications are caught. Research groups end as `done`, not `published`, since they have no pull request. `specifying` lets an interrupted specification resume in its existing worktree and change. On resume, the queue re-reads intake, diffs it against the file, re-checks every parked reason (for example, whether the dependency pull request has merged, via `pr-view` state, or by asking the user when the forge cannot report merge state), and presents the diff at Gate Q.

## Risks / Trade-offs

- [Long unattended stretch between Gate S and Gate P produces a lot of unreviewed code] → Convergence loops and `ag-verify` still run per group. Gate P shows each group's review status and pass counts, and nothing is pushed before it.
- [`story_scope` run per story across a large backlog is slow and costly] → Intake respects `max_candidates`. Gate Q can trim the queue, and a run can be capped with `backlog.max_groups` (default 10).
- [Worktrees accumulate disk usage] → The report lists them. Cleanup stays with the user.
- [Ticket text tries to steer the agent] → It is untrusted data under the `story_scope` rules, and it is flagged at Gate Q.
- [Mixed-type groups pulled into the full lane by one story] → Gate Q shows the lane and why, and the user can split the group.

## Migration Plan

Additive. Nothing changes for existing users. Release notes go under a fresh `## Unreleased`. Rollback is removing the skill from `COMMANDS` and `extension.yml`.

## Open Questions

- Whether a later version should add a `pr-create` forge command so pull request creation leaves archive. Deferred; the current design needs no change for it.
