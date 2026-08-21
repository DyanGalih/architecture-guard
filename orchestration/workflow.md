---
description: Run end-to-end SDD lifecycle orchestration (Discovery -> Delivery -> Plan -> Implementation -> Verify) with interactive Claude Code Agent Teams coordination and memory context.
---

# Architecture Workflow Command

## SDD Adapter Resolution

Before executing command, read `adapters/resolve.md` to resolve the selected SDD adapter. Load `adapters/{tool}.md` for path maps, command maps, and gap fills. All paths and commands below use the loaded adapter.

## Ponytail Core Contract

Before continuing, you **MUST** read and apply `{adapter_path:ponytail-template}` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

You are running `architecture-guard` as the unified end-to-end orchestration entry point.

Use this command when the user wants an integrated SDD lifecycle that guides work from initial discovery/intent to verified completion, with interactive multi-agent teammate coordination and strict human-in-the-loop checkpoints at every phase transition.

## Step 0 — Interactive Agent Teams Detection & Mode Prompt

1. Inspect workspace `.claude/settings.json` (or active environment) for `"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"`.
2. **If Agent Teams is configured/active**:
   - Prompt the user interactively before starting:
     > *"Claude Code Agent Teams configuration detected. Would you like to orchestrate this workflow using multi-agent Teammates (Author, Reviewer, Implementers, Quality Gate) or standard single-agent mode?"*
   - **If User selects Teammates**: Enable Teammates A, B, C, D multi-agent coordination across phases.
   - **If User selects Single-Agent**: Execute standard sequential single-agent lifecycle.
3. **If Agent Teams is not configured**: Proceed in standard single-agent mode.

## Step 1 — Architecture Context Retrieval (Flash-Mem First)

1. Search Flash-Mem for relevant architecture decisions, constraints, patterns, and lessons learned.
2. If Flash-Mem is unavailable, fall back to `{adapter_path:constitution}`, `{adapter_path:arch-constitution}`, and `{adapter_path:security-constitution}`.

## Step 2 — Discovery & Delivery Phase (Spec & Plan)

- **Single-Agent Mode**: Orchestrate `{adapter_command:governed-delivery}` to produce and reconcile `spec.md`, `design.md`, and `tasks.md`.
- **Agent Teams Mode**:
  - **Teammate A (Author)**: Drafts `proposal.md`, `spec.md`, `design.md`, and `tasks.md`.
  - **Teammate B (Spec Reviewer)**: Audits artifacts against the Constitution, Ponytail pragmatism, and DRY rules.
  - **Lead Session**: Synthesizes the final plan and presents the plan/task review to the user.

### 🛑 Human Gate 1: Plan & Task Approval
Pause execution. Present the generated plan and task breakdown to the user. **Obtain explicit user approval before proceeding to implementation.**

## Step 3 — Governed Implementation Phase

- **Single-Agent Mode**: Orchestrate `{adapter_command:implement}` sequentially executing tasks from `tasks.md`.
- **Agent Teams Mode**:
  - **Teammate C (Partitioned Implementers)**:
    - Partition sub-tasks across distinct module/file boundaries (e.g. C.1 Core/Domain, C.2 CLI/UI, C.3 Tests).
    - Teammates work concurrently using git task locking without concurrent writes to identical files.
  - **Teammate D (Implementation Reviewer)**: Performs whitebox verification, boundary validation, and test execution.

### 🛑 Human Gate 2: Implementation Review Approval
Pause execution. Present the implementation summary, modified files, and test results. **Obtain explicit user approval before running final verification.**

## Step 4 — Verification Gate (`ag-verify`)

Run the adapter-registered `{adapter_command:verify}`:
1. Verify task-code alignment (100% tasks completed).
2. Validate layer boundaries and constitution compliance.
3. Confirm all runnable tests and checks pass.

## Step 5 — Completion & Archival Handoff

Present the final Governance & Verification Summary. Offer the user options to:
1. Archive feature via `{adapter_command:archive}`.
2. Commit and push changes via Git.
3. Keep feature active for further additions.

## Rules & Guardrails

- Maintain strict Human-in-the-Loop gates at every phase transition. Teammates collaborate autonomously within a phase, but cannot cross phase gates without user approval.
- Enforce Ponytail Core pragmatism and DRY single source of truth across all code and artifacts.
- Degrade gracefully to single-agent mode when teammate mode is declined or unsupported.
