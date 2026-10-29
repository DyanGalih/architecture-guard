# Proposal

## Why

`ag-workflow` delivers one change at a time and stops at four human gates, so a team with ten prioritized stories, bugs, and tasks has to start, babysit, and close ten separate runs and pick the order by hand. Architecture Guard already knows how to group related tickets (`story_scope` Planning Mode) and how to deliver one change safely; it lacks the layer that turns a prioritized backlog into an ordered queue of governed changes without multiplying the approvals.

## What Changes

- Add `ag-governed-backlog`, a new top-level capability that reads a backlog, ranks it, groups it into changes, and runs each group through a lane matched to its work type, one branch and one pull request per group.
- Support two intake sources: a Jira JQL query through a registered Jira MCP server, and a local `.architecture-guard/backlog.yml` file for teams without Jira. Both normalize to the same item shape.
- Group items with `story_scope` Planning Mode for Jira, and with declared `group` and `depends_on` fields (plus a file-overlap hint) for the local file. Every group becomes one change with its own `## Stories` set, so existing scope checks apply per pull request unchanged.
- Route each group to a lane by type: **full** (stories and features), **fix** (bugs), **light** (tasks and chores), and **research** (spikes). The mapping is configurable; security-sensitive or boundary-crossing groups escalate to **full**.
- Replace per-change gates with three batched human gates per run: **Gate Q** (approve the queue), **Gate S** (approve every full-lane specification), and **Gate P** (approve each group's archive, commit, push, and pull request). Implementation and review loops between gates run without stopping.
- Park a group, instead of stopping the run, on a non-converging review loop, a blocking security finding, a decision only the user can make, or a dependency whose pull request is not merged.
- Record run state in `.architecture-guard/queue.yml` so a stopped or partially blocked run resumes where it left off.
- Add `architecture-guard validate-backlog` to validate `backlog.yml`, and extend `sync.yml` validation with an optional `backlog` block (intake JQL and lane mapping).
- The queue never merges, closes, or approves a pull request, never force-pushes, and never writes to Jira.

## Capabilities

### New Capabilities

- `governed-backlog`: queued, priority-ordered delivery of a backlog of work items through governed lanes, with batched human gates, one pull request per story-scope group, and resumable run state.

### Modified Capabilities

None. The repository has no existing OpenSpec capability specs. Existing skills (`ag-workflow`, `ag-governed-archive`, `story_scope`) keep their behavior; the queue composes them.

## Impact

- New files: `orchestration/governed-backlog.md`, `commands/governed-backlog.md`, `templates/backlog_item.md` (normalized item and lane contract), `cli/validate-backlog.ts`, an example `examples/backlog.yml`.
- Changed: `cli/install.ts` (`COMMANDS`), `bin/cli.ts` (new subcommand), `cli/validate-sync-config.ts` (optional `backlog` block), `extension.yml` (Spec Kit command), `docs/workflows.md`, `docs/reference-manual.md`, `README.md`, `docs/release-notes.md`, and `install.test.ts`.
- No new runtime dependencies (`yaml` and `zod` are already used).
- Users: opt-in. Nothing changes for teams that do not run `ag-governed-backlog`.
