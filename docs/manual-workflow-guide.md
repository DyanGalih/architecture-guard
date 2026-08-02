# Manual Step-by-Step Workflow Guide

While `governed-delivery` acts as an automated "magic button" orchestrator to fill in missing gaps (like specs, proposals, and plans), you may sometimes want granular, phase-by-phase control. 

This guide outlines how to manually walk an AI agent through the entire architecture-governed workflow from a raw idea to verified implementation.

## 1. Discovery Phase
**Command:** `governed-discover`

Before writing a formal specification, use discovery to brainstorm and shape a rough request. The AI will check `flash-mem` for architectural constraints and help you explore options, risks, and rejected alternatives.
- *Output:* A rough discovery draft or notes.

## 2. Specification Phase
**Command:** `governed-spec` (for SpecKit) or `openspec new change` (for OpenSpec)

Convert your discovery draft into a formal specification.
- **SpecKit Users:** Run `governed-spec` to generate a structured `spec.md` that adheres to your architecture and memory context.
- **OpenSpec Users:** The native OpenSpec command handles proposal and spec generation.

## 3. Planning & Proposal Phase
**Command:** `governed-plan` (for SpecKit) or OpenSpec's artifact flow

Create the technical design and plan.
- **SpecKit Users:** Run `governed-plan`. The AI will review or repair `plan.md` until no P0 architecture or Critical security findings remain.
- **OpenSpec Users:** If you are using OpenSpec natively, this corresponds to generating the `proposal.md` and `design.md` artifacts.

## 4. Task Generation Phase
**Command:** `governed-tasks`

Generate actionable tasks only *after* the plan is accepted.
- Run `governed-tasks` to break the plan down into trackable checklist items in `tasks.md`.
- This phase also runs security reviews, converts architectural findings into refactor tasks, and runs analysis checks (`/speckit.analyze`).

## 5. Implementation Phase
**Command:** `governed-implement`

Execute the work. The AI agent will follow the generated `tasks.md` strictly, ensuring it doesn't deviate from the validated plan or violate architecture boundaries while writing code.

## 6. Review & Verification Phase
**Command:** `architecture-verify`

Once the implementation is complete, run the final verification step. The agent will check whether the final code matches the approved tasks, ensuring no unapproved drift occurred during implementation.

---

### Targeted Recovery
If you encounter an issue during the automated `governed-delivery` flow, you can drop into these manual commands to debug:
- **Plan problem:** Run `governed-plan`, then `governed-tasks` (since the previous tasks may be stale).
- **Task-only problem:** Run `governed-tasks`.
- **Unknown/Cross-phase problem:** Run `governed-delivery` again to let it auto-resume from the first invalid phase.
