# Beginner Guide

This guide explains Architecture Guard in simple terms.

## The short version

Architecture Guard helps an AI assistant follow the architecture rules you already decided on.

Instead of waiting until code review to notice problems, it checks specs, plans, tasks, and implementation work earlier in the flow.

## Why that helps

- architecture mistakes are easier to catch early
- repeated drift becomes visible
- refactor work is easier to track
- your standards stay in Git instead of in people's heads

## The basic pieces

- `.specify/memory/constitution.md` stores higher-level governance rules
- `.specify/memory/architecture_constitution.md` stores architecture boundaries and standards
- `.specify/memory/security_constitution.md` stores security rules
- `ag-workflow` reviews the project against those rules
- `ag-apply` turns approved violations into concrete refactor work

## End-to-End Delivery Lifecycles

You can choose between a **Granular** step-by-step approach or a **Streamlined** magic-button approach. Both paths ensure your work is reviewed and validated before implementation begins.

### Path 1: The Granular Workflow
Best for complex features where you want manual review after every single stage.

1. **Initialization:** Run `/ag-init` (Greenfield) or `/ag-init-brownfield` (Brownfield) to set up constitutions.
2. **Discovery (Optional):** Run `/ag-governed-discover` to brainstorm a rough idea into a spec-ready direction.
3. **Specification:** Run `/ag-governed-spec` to formally generate the Spec.
4. **Spec Review:** Run `ag-review` to check the spec against architecture rules. Apply any fixes.
5. **Planning:** Run `/ag-governed-plan` to generate the technical plan.
6. **Plan Review:** Run `ag-review` to ensure the plan doesn't violate boundaries. Apply any fixes via `ag-apply`.
7. **Task Generation:** Run `/ag-governed-tasks` to map the plan into actionable tasks.
8. **Implementation:** Run `/ag-governed-implement` to execute the tasks safely.
9. **Implementation Review:** Run `ag-review` again. This time it will review your actual code changes against the architecture rules. Apply fixes if needed.
10. **Verification:** Run `/ag-verify` to ensure all tasks are delivered and no unapproved drift exists. **Ready to commit!**

### Path 2: The Streamlined Workflow (Recommended)
Best for most features. It automatically chains Spec, Plan, and Task generation together while pausing for your review.

1. **Initialization:** Run `/ag-init` (Greenfield) or `/ag-init-brownfield` (Brownfield).
2. **Discovery (Optional):** Run `/ag-governed-discover` to shape your idea.
3. **Delivery Orchestration:** Run `/ag-governed-delivery`. This "magic button" command will automatically generate the Spec, check it, generate the Plan, check it, and generate the Tasks. 
4. **Pre-Implementation Review:** Review the generated Spec, Plan, and Tasks. If you want a formal check, run `ag-review` and then `ag-apply` for any refactor suggestions.
5. **Implementation:** Run `/ag-governed-implement`.
6. **Implementation Review:** Run `ag-review` to check your coded solution for drift or anti-patterns before finalizing.
7. **Verification:** Run `/ag-verify` as your final gate. **Ready to commit!**


## What to remember

- It is a governance layer, not a compiler
- It is non-blocking by default
- It works best when your architecture rules are clear
- It can be used with companion tools, but it does not require them

## If you want more detail

- [Architecture Guard README](../README.md)
- [Architecture Overview](architecture-overview.md)
- [Governance Model](governance-model.md)
- [Workflows](workflows.md)
- [Reference Manual](reference-manual.md)
- [Release Notes](release-notes.md)
