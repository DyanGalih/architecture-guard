# Workflows

This document covers the governed discovery, specification, planning, task, implementation, and pull-request flows used by Architecture Guard.

## Suggested Governed Delivery Workflow

Use `governed-delivery` once you already have a clear spec or a discovery draft that has been converted into a spec-ready direction:

```text
/ag-governed-delivery
```

If the work is still just an idea, request, or rough problem statement, start with `governed-discover` first and then `governed-spec` before delivery. That keeps the discovery and specification phases ahead of planning and task generation.

The command retrieves Flash-Mem context when available, generates or reuses the plan, applies security and architecture plan gates, generates or reconciles tasks, and runs task security review, architecture refactor generation, and `/speckit.analyze`. It resumes from the first invalid phase and never generates tasks from a plan with unresolved P0 architecture or Critical security findings. It also loads the shared Ponytail Core contract so every resumed phase uses the same decision ladder, safety floor, root-cause rules, and verification expectations.

The separate `governed-plan` and `governed-tasks` commands remain available for targeted recovery. If a plan changes materially, rerun both phases; if only tasks are defective, rerun `governed-tasks`.

## Governed Discovery Workflow

Use `governed-discover` when the work starts as an idea, request, or rough problem statement and you need to turn it into a spec-ready direction. It is the right entry point before specification when you still need to explore options, test assumptions, or check the idea against the current architecture.

Architecture Guard can orchestrate a brainstorming phase *before* a formal specification is written, helping new feature ideas align with existing architecture constraints from the very beginning.

The orchestrated workflow is:

1. Memory synthesis: scoped retrieval of historical decisions before broader file reads
2. Related stories (with [story scope](#story-scope-check-jira) configured): reads the main Jira story, its related tickets, and open tickets touching the same areas, and sorts them into **Bundle now** (small, same files and boundaries, unassigned or yours), **Do next**, **Conflicts**, and **Owned elsewhere**. You accept, trim, or extend the proposed story set; nothing is bundled without your choice.
3. Implementation context: check the codebase for similar patterns (if requested)
4. Interactive discussion: an architecture-aware chat to refine the idea, warning when it goes beyond the story set's acceptance criteria
5. Governance suggestions: when the discussion or memory shows a rule that keeps getting in the way (for example the same exception accepted in several changes), drafts a Constitution Update Proposal or workflow suggestion with its evidence. Discovery never edits rules; you decide.
6. Draft generation: output a clean feature draft, including the story set, to hand off to the specification phase. `ag-governed-spec` records the set in the change's `## Stories` section, so later scope checks treat the bundled stories as in scope.

### Example Orchestration

```text
/ag-governed-discover "I want a new feature..."
```

## Governed Specification Workflow

Architecture Guard can orchestrate specification workflows across `flash-mem`, Security Review, and Architecture Guard validation when companion extensions are installed.

The orchestrated workflow is:

1. Memory synthesis: scoped retrieval of historical decisions before broader file reads
2. Specification generation: Spec Kit spec generation using that synthesis, enforcing Ponytail minimalism
3. Clarification: resolve ambiguities with architecture context in mind
4. Architecture validation: detect drift, bloat, and security-architecture conflicts
5. Governance summary: final overview of architecture and security risks
6. Interactive Auto-Fix Loop: option to automatically revise the specification if architectural gaps are found

### Example Orchestration

```text
/ag-governed-spec
```

## Governed Planning Workflow

Architecture Guard can orchestrate planning workflows across `flash-mem`, Security Review, and Architecture Guard validation when companion extensions are installed.

The orchestrated workflow is:

1. Memory synthesis: scoped retrieval of historical decisions before broader file reads
2. Plan generation: Spec Kit technical planning using that synthesis, enforcing Ponytail minimalism
3. Security validation: review the plan against trust boundaries
4. Architecture validation: detect drift, bloat, and security-architecture conflicts
5. Governance summary: final overview of architecture and security risks

### Example Orchestration

```text
/ag-governed-plan
```

## Governed Task Workflow

Architecture Guard can orchestrate governance checks throughout task generation when companion extensions are installed.

Flow:

memory synthesis -> tasks (with Ponytail minimalism) -> security task review -> architecture refactor generation -> analysis -> automatic analyst loop -> task governance summary

```text
/ag-governed-tasks
```

## Governed Implementation Workflow

Architecture Guard can orchestrate governance checks during implementation when companion extensions are installed.

Flow:

memory synthesis -> implement (with Ponytail pragmatism) -> security review -> architecture review (with Ponytail Audit) -> refactor or fix recommendations

```text
/ag-governed-implement
```

> Companion extensions are optional. Architecture Guard degrades gracefully and does not require `flash-mem` or Security Review to function. It orchestrates workflows only when companion artifacts or extensions are available.

## End-to-End Delivery Lifecycles

Choose the path that matches how much manual control you want over the delivery process. Both paths ensure your work is reviewed and validated before implementation begins.

### Path 1: The Granular Workflow

Best for complex features where you want manual review after every single stage.

1. **Initialization:** Run `/ag-init` (Greenfield) or `/ag-init-brownfield` (Brownfield) to set up constitutions.
2. **Discovery (Optional):** Run `/ag-governed-discover` to brainstorm a rough idea into a spec-ready direction.
3. **Specification:** Run `/ag-governed-spec` to formally generate the Spec.
4. **Spec Review:** Run `ag-review-artifacts` to check the spec against architecture rules. Apply any fixes.
5. **Planning:** Run `/ag-governed-plan` to generate the technical plan.
6. **Plan Review:** Run `ag-review-artifacts` to ensure the plan doesn't violate boundaries. Apply any fixes via `ag-apply`.
7. **Task Generation:** Run `/ag-governed-tasks` to map the plan into actionable tasks.
8. **Implementation:** Run `/ag-governed-implement` to execute the tasks safely. It reruns the architecture review and, when the separate Security Review tool is installed, the security review, fixing findings until a pass is clean (at most 5 passes).
9. **Implementation Review (Optional):** Run `ag-review-implementation` for an extra standalone check of your code changes.
10. **Verification:** Run `/ag-verify` to ensure all tasks are delivered and no unapproved drift exists. **Ready to commit!**
11. **Before you push:** both reviews above run the same **change checks** as `ag-review-pr` (governance, intent, tests, secrets, security-sensitive files, and Security Review's branch operation when installed), so a branch that is clean locally arrives at the pull-request review with few findings. Give them the branch you will merge into (`/ag-verify base=main`), not `HEAD`.

### Path 2: The Streamlined Workflow (Recommended)

Best for most features. It automatically chains Spec, Plan, and Task generation together while pausing for your review.

1. **Initialization:** Run `/ag-init` (Greenfield) or `/ag-init-brownfield` (Brownfield).
2. **Discovery (Optional):** Run `/ag-governed-discover` to shape your idea.
3. **Delivery Orchestration:** Run `/ag-governed-delivery`. This "magic button" command will automatically generate the Spec, check it, generate the Plan, check it, and generate the Tasks. It then runs `ag-review-artifacts` (plus Security Review on the plan and tasks when that separate tool is installed) and applies fixes in a loop until a review pass is clean (at most 5 passes).
4. **Pre-Implementation Review:** Read the generated Spec, Plan, and Tasks, and the **Artifact Review** status in the delivery summary. Rerun `ag-review-artifacts` only if you changed the artifacts by hand.
5. **Implementation:** Run `/ag-governed-implement`. It loops `ag-review-implementation` and Security Review (when installed), fixing findings until a pass is clean, and reports the **Implementation Review** status.
6. **Verification:** Run `/ag-verify` as your final gate, with the branch you will merge into (`/ag-verify base=main`). It runs the same change checks as `ag-review-pr`, so what it reports is what the pull-request review would report after the push. **Ready to commit!**

### Path 3: Interactive End-to-End Workflow with Agent Teams (`/ag-workflow`)

When you want a single unified command that drives the complete lifecycle interactively:

```text
/ag-workflow "Feature description or goal"
```

**How it works:**
1. **Interactive Teammate Detection**: If `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS` is configured in `.claude/settings.json`, `/ag-workflow` prompts:
   > *"Claude Code Agent Teams configuration detected. Would you like to orchestrate this workflow using multi-agent Teammates (Author, Reviewer, Implementers, Quality Gate) or standard single-agent mode?"*
2. **Phase 1: Discovery and Specification**: runs `ag-governed-discover` when the request is exploratory, then `ag-governed-spec`.
   - **🛑 Human Gate 0**: approve the specification.
3. **Phase 2: Delivery**: runs `ag-governed-delivery`, which generates the plan and tasks, then runs `ag-review-artifacts` and Security Review (when installed) and applies fixes until a pass is clean (at most 5 passes).
   - **🛑 Human Gate 1**: approve the plan and tasks, with the Artifact Review status.
4. **Phase 3: Governed Implementation**: runs `ag-governed-implement`, which loops the implementation review and Security Review until a pass is clean (at most 5 passes). In Agent Teams mode, implementers own non-overlapping tasks and files.
   - **🛑 Human Gate 2**: sign off on the implementation evidence.
5. **Phase 4: Final Review**: confirms the verification run by `ag-governed-implement` covered the whole branch diff against the destination branch (pull-request change checks plus Security Review's branch operation), and reruns `ag-verify base=<destination branch>` only if that result is missing, stale, or used another base. Findings that need code changes return to Phase 3, at most twice.
   - **🛑 Human Gate 3**: approve the final review.
   - In the SpecKit extension channel (`/speckit.architecture-guard.ag-workflow`), the registered `ag-verify` does not take `base=` or apply the change checks, so the final review reports Change Checks as `Unavailable` and points to the standalone `ag-verify base=<branch>` or `ag-review-pr`.
6. **Archive**: only after Gate 3, the workflow suggests `ag-governed-archive`.

**Subagents:** the workflow runs sequentially by default on every host. When the host can dispatch a fresh subagent, read-only reviews (loop passes and the final review) may run in one, and the architecture and security halves of a pass may run side by side. Subagents never write artifacts or code, never satisfy a human gate, and are used only when the host really provides them.

If you are specifically cleaning up duplicated logic (Brownfield), follow the [DRY Cleanup Guide](dry-cleanup.md) after your initialization pass. This keeps architecture concerns visible throughout the delivery lifecycle instead of concentrating them at the end.

## Pull Request Review Workflow

Use `ag-review-pr` to review someone else's pull request:

```text
/ag-review-pr 123
/ag-review-pr https://github.com/acme/app/pull/123
```

1. Fetches the pull request, diff, existing review threads, and CI status through the selected forge (see [FORGES.md](../FORGES.md)).
2. Optionally reads the full files from a temporary git worktree (it asks first; your checkout is never changed). Without it, the review is labelled diff-only.
3. Reviews the change against your constitutions and any linked spec, plan, or tasks by running `ag-review-implementation` on the pull request's files, which applies the shared change checks (governance, intent versus description, story scope against Jira, tests, secrets, security-sensitive files, and CI failures), the same checks `ag-review-implementation` and `ag-verify` run on your own branch before a push. When the separate Security Review tool is installed, it also runs its branch operation (`sr-branch`) on the pull request.
4. Drafts a comment-only review — inline comments with severity and blocking labels, plus a summary — and asks you to choose:
   - **Post as is**
   - **Adjust first** (edit, remove, or add comments; it shows the revised draft and asks again)
   - **Don't post**
   - **Approve with comments** (offered only when no finding is blocking; see below)
5. Before posting, re-checks the head commit; if new commits arrived, it re-reviews instead of posting a stale review.

When no finding is blocking (and Security Review ran, or the change is not security-sensitive, meaning no configured `security_sensitive_paths` glob matches and, when none are configured, nothing touches authentication, authorization, sessions, credentials, or a trust boundary, CI is not failing, and you are not the author), it also offers **Approve with comments**: it posts the comments, approves, and asks the author to address the findings before merging. Otherwise it never approves. It never requests changes, merges, or closes a pull request. Text in the pull request that tries to instruct an AI reviewer is reported as a security finding.

## Pull Request Feedback Workflow

Use `ag-pr-feedback` on your own pull request after reviewers have commented:

```text
/ag-pr-feedback          (the pull request for the current branch)
/ag-pr-feedback 123
```

1. Collects all feedback: unresolved review threads, each reviewer's latest verdict and review summary (points with no thread become their own items, and a changes-requested verdict stays open until the reviewer reviews again), general conversation comments, and failing checks.
2. Triages each one — **Fix**, **Discuss**, **Disagree**, **Already addressed**, or **Out of scope** — checking every suggestion against your constitutions and, with [story scope](#story-scope-check-jira) configured, the Jira story's acceptance criteria and related tickets, so an out-of-scope reply can name the ticket that already covers the request. It asks you to approve or change the triage.
3. Applies only the approved fixes, runs your tests and a scoped architecture review of the changes.
4. Commits and pushes, each with its own approval (never a force-push).
5. Drafts one reply per thread and asks you to choose:
   - **Reply only** — leave every thread open for the reviewers
   - **Reply and resolve** — also resolve the eligible threads (only pushed fixes and already-addressed threads; discussions and disagreements stay open)
   - **Adjust first**
   - **Don't post**

## User Story Tracker Sync (Team Delivery)

The `ag-governed-delivery-team` workflow supports pushing approved User Stories to an external issue tracker (e.g., GitHub Issues or Jira) automatically. This is a one-way sync (push only) designed to minimize complexity while satisfying YAGNI.

### Configuration

Create a file at `.architecture-guard/sync.yml` in your workspace:

```yaml
# Supported providers: github, jira
provider: github
# Optional repository or project mapping
repo: my-org/my-repo
enabled: true
```

The configuration is strictly validated during the workflow using `architecture-guard validate-sync-config` to ensure security constraints on untrusted input are met.

### How it Works
1. Run `/ag-governed-delivery-team`.
2. A User Story is generated and proposed.
3. Upon your explicit approval, the agent reads `sync.yml`.
4. If enabled, the agent uses its MCP tools (e.g., `github-mcp-server`) to create the issue in your tracker.
5. The result is recorded locally in `.architecture-guard/sync_status.json` (e.g., `{ "status": "success", "issue_url": "..." }`).

If the push fails, the workflow gracefully degrades by logging a warning and writing `{ "status": "failed" }` to the status file without blocking local delivery.

## Story Scope Check (Jira)

`ag-review-implementation`, `ag-verify`, `ag-review-pr`, and `ag-pr-feedback` compare a change with the work agreed in Jira, so out-of-scope work is caught before review rather than after. It is part of the shared change checks and uses the same `.architecture-guard/sync.yml`:

```yaml
provider: jira
project: PROJ
scope_check:
  enabled: true            # default when provider is jira
  max_candidates: 20       # cap on related tickets and search results (1-50)
  # candidate_jql: project = PROJ AND sprint in openSprints() AND statusCategory != Done
```

1. Finds the story key in the branch name, the pull request title or description, or the commit subjects; when several keys appear, or none, it asks you.
2. Reads the story's acceptance criteria and its related tickets: subtasks, linked issues, and open siblings under the same epic.
3. With no story, runs one bounded search of open tickets (current sprint, yours, or recently updated, matched on the change's own terms; or your `candidate_jql`), shows the best matches, and asks you to pick the story or confirm there is none.
4. Reports out-of-scope changes, changes that belong to another ticket (noting when someone else is assigned), acceptance criteria with no matching change, and untracked changes.

Findings are advisory unless your Constitution marks out-of-scope or untracked work as P0. The check needs a Jira MCP server; without one it reports `Unavailable`, never clean. It only reads Jira, treats ticket text as untrusted data, and reads `sync.yml` from your checkout, never from the pull request. The top-level `enabled` flag controls only the delivery-team push sync.
