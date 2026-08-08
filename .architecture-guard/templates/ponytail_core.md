# Ponytail Core Contract

Use this contract during discovery, specification, planning, task generation, implementation, refactoring, and review.

Lazy means efficient, not careless. The best code is the code that does not need to be written.

## Understand Before Simplifying

Read the relevant artifacts and code before choosing a solution. Trace the real execution flow, affected boundaries, and existing behavior. A small change that is not understood is not a safe change.

## Decision Ladder

After understanding the problem, stop at the first rung that fully satisfies the requirement:

1. Does this need to be built at all? Remove speculative scope and apply YAGNI.
2. Does the capability already exist in the codebase? Reuse or fix it rather than creating a parallel implementation.
3. Does the language standard library solve it correctly? Use it.
4. Does a native framework or platform feature solve it? Use it.
5. Does an already-installed dependency solve it without violating project constraints? Reuse it; do not add another dependency.
6. Can the correct and readable solution be one line? Keep it one line.
7. Only then, write the minimum new code that works.

Do not skip directly to a later rung because it is more familiar.

## Root-Cause Fixes

For a bug or duplicated behavior:

1. Identify the shared source of the behavior.
2. Search for every caller and sibling path affected by the contract.
3. Fix the shared implementation once when that is the true ownership boundary.
4. Verify callers still satisfy the corrected contract.

Do not add one defensive patch per caller when a smaller shared root-cause correction is available.

## Construction Rules

- Add no abstraction that the requirement or an existing boundary does not justify.
- Add no avoidable dependency or boilerplate.
- Prefer deletion over addition, boring over clever, and fewer files over unnecessary fragmentation.
- Between equally small options, choose the one that remains correct on edge cases.
- Deliver the simplest valid solution while clearly challenging unnecessary complexity; do not stall safe progress merely because the request could be simpler.
- When accepting a deliberate limitation with a real ceiling, add a `ponytail:` note in the relevant code or artifact that names the ceiling and the upgrade path. Do not comment ordinary simplifications.

## Safety Floor

Never simplify away:

- understanding and tracing the affected flow;
- input validation at trust boundaries;
- authorization, data isolation, secret handling, or other security controls;
- error handling that prevents data loss or corrupt state;
- accessibility basics;
- calibration or defensive handling required by real hardware or external systems;
- behavior the user or constitution explicitly requires.

These are correctness requirements, not optional complexity.

## Verification Floor

Non-trivial logic must leave at least one runnable check behind. Prefer the project's existing test tooling. If none exists, use the smallest practical self-check or focused test without introducing a test framework solely for the change. Trivial declarative or one-line changes do not require a new test when existing validation already covers them.

## Phase Interpretation

- Discovery: challenge unnecessary scope while preserving the user's actual outcome.
- Specification: exclude speculative requirements and premature solution detail.
- Planning: choose the earliest viable ladder rung and record meaningful tradeoffs or deliberate ceilings.
- Tasks: create only tasks required for the accepted plan, including its safety and verification floor.
- Implementation: trace callers, fix the owning boundary, and write the minimum correct change.
- Review: flag both over-building and unsafe under-building.
- Refactoring: prefer the smallest root-cause correction over a new abstraction hierarchy.

Runtime mode switching, session persistence, and terse response formatting are host-agent concerns and are intentionally outside this repository contract.
