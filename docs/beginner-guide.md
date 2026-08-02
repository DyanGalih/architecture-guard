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

## A simple first workflow

Choose the path that matches your repository.

### Brownfield

1. Install Architecture Guard.
2. Run `/speckit.architecture-guard.init-brownfield` for Brownfield Discovery + Verification on the existing codebase.
3. Review the current-state findings.
4. Run `ag-review` or `ag-workflow` from your AI agent.
5. Review the findings and approve any useful refactors.
6. Run `ag-apply` if you want the plan and tasks updated.
7. If you are specifically cleaning up duplicated logic, follow the [DRY Cleanup Guide](dry-cleanup.md) after the brownfield mapping pass.

### Greenfield

1. Install Architecture Guard.
2. Run `/speckit.architecture-guard.init` to set up constitutions.
3. Run `/speckit.architecture-guard.governed-discover` when you have only an idea or rough feature request and want help shaping it into a spec-ready direction. Skip this step if the spec already exists and you are ready for planning.
4. Write or update your spec (or pass the discovery draft to `/speckit.architecture-guard.governed-spec`).
5. Run `ag-review` or `ag-workflow` from your AI agent.
6. Review the findings and approve any useful refactors.
7. Run `ag-apply` if you want the plan and tasks updated.


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
