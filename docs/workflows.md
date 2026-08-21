# Workflows

This document covers the governed discovery, specification, planning, task, and implementation flows used by Architecture Guard.

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
2. Implementation context: check the codebase for similar patterns (if requested)
3. Interactive discussion: an architecture-aware chat to refine the idea
4. Draft generation: output a clean feature draft to hand off to the specification phase

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
8. **Implementation:** Run `/ag-governed-implement` to execute the tasks safely.
9. **Implementation Review:** Run `ag-review-implementation` to review your actual code changes against the architecture rules. Apply fixes if needed.
10. **Verification:** Run `/ag-verify` to ensure all tasks are delivered and no unapproved drift exists. **Ready to commit!**

### Path 2: The Streamlined Workflow (Recommended)

Best for most features. It automatically chains Spec, Plan, and Task generation together while pausing for your review.

1. **Initialization:** Run `/ag-init` (Greenfield) or `/ag-init-brownfield` (Brownfield).
2. **Discovery (Optional):** Run `/ag-governed-discover` to shape your idea.
3. **Delivery Orchestration:** Run `/ag-governed-delivery`. This "magic button" command will automatically generate the Spec, check it, generate the Plan, check it, and generate the Tasks. 
4. **Pre-Implementation Review:** Review the generated Spec, Plan, and Tasks. If you want a formal check, run `ag-review-artifacts` and then `ag-apply` for any refactor suggestions.
5. **Implementation:** Run `/ag-governed-implement`.
6. **Implementation Review:** Run `ag-review-implementation` to check your coded solution for drift or anti-patterns before finalizing.
7. **Verification:** Run `/ag-verify` as your final gate. **Ready to commit!**

### Path 3: Claude Code Agent Teams Workflow (Beta / Experimental)

When running inside Claude Code with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`:

1. **Discovery:** Run `/ag-governed-discover` to shape the feature.
2. **Delivery (Plan & Spec):** Run `/ag-governed-delivery`.
   - **Teammate A (Author)**: Drafts `proposal.md`, `spec.md`, `design.md`, and `tasks.md`.
   - **Teammate B (Spec Reviewer)**: Audits artifacts against the Constitution, Ponytail pragmatism, and DRY rules.
   - **Human Checkpoint**: Lead synthesizes the plan and pauses for your approval.
3. **Artifact Review & Apply:** Run `ag-review-artifacts` (and `/ag-apply` if needed).
4. **Governed Implementation:** Run `/ag-governed-implement`.
   - **Teammate C (Partitioned Implementers)**: Subdivided into C.1 (Core/Domain), C.2 (CLI/UI), C.3 (Tests/Verification) executing concurrently via git task locking.
   - **Teammate D (Implementation Reviewer)**: Performs cross-boundary code review and test verification.
   - **Human Checkpoint**: Lead presents the completed checklist for your confirmation.
5. **Verification & Archiving:** Run `/ag-verify` as the final verification gate before `/ag-governed-archive`.

If you are specifically cleaning up duplicated logic (Brownfield), follow the [DRY Cleanup Guide](dry-cleanup.md) after your initialization pass. This keeps architecture concerns visible throughout the delivery lifecycle instead of concentrating them at the end.

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

The configuration is strictly validated during the workflow using the `validate-sync-config.ts` CLI tool to ensure security constraints on untrusted input are met.

### How it Works
1. Run `/ag-governed-delivery-team`.
2. A User Story is generated and proposed.
3. Upon your explicit approval, the agent reads `sync.yml`.
4. If enabled, the agent uses its MCP tools (e.g., `github-mcp-server`) to create the issue in your tracker.
5. The result is recorded locally in `.architecture-guard/sync_status.json` (e.g., `{ "status": "success", "issue_url": "..." }`).

If the push fails, the workflow gracefully degrades by logging a warning and writing `{ "status": "failed" }` to the status file without blocking local delivery.
