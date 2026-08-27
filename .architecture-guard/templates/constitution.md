# Project Constitution

> This is the governance document that Architecture Guard reads alongside the architecture constitution.
> Fill in each section with project-level engineering standards.
> If a section does not apply, mark it as "Not applicable" rather than deleting it.

## Project Identity

- **Name**: [Your project name]
- **Type**: [Monolith / Modular Monolith / Microservices / Full-stack / Library / Other]
- **Primary Stack**: [e.g., Laravel + Vue, NestJS + React, Django + HTMX]

## Engineering Philosophy

> List the non-negotiable principles that shape engineering decisions.

1. Understand the affected flow before changing it; small unexplained changes are not safe changes.
2. Apply YAGNI, then reuse existing code, the standard library, native platform features, and installed dependencies before adding new code.
3. DRY (Don't Repeat Yourself): Core business logic, validation rules, and durable transformations must reside in a single source of truth.
4. Prefer deletion, boring solutions, fewer files, and small reviewable changes over abstraction or rewrites.
5. Preserve trust-boundary validation, security, data-loss prevention, accessibility, and required external-system safeguards.
6. Non-trivial logic must leave at least one runnable check behind.
7. Decisions with long-term impact and deliberate simplification ceilings must be documented.
8. User-facing behavior must remain traceable to the feature specification.

## Security Expectations

- [e.g., Public entry points must validate and authorize access before processing.]
- [e.g., Secrets must never be committed or exposed to client-side code.]
- [e.g., Security-sensitive changes require explicit review.]

## Testing Expectations

- [e.g., New behavior must include automated tests at the right level.]
- [e.g., Regression fixes must include a failing test when practical.]
- [e.g., Architecture refactors should preserve existing behavior.]

## Documentation Standards

- [e.g., Architectural decisions are documented before they become standards.]
- [e.g., Public APIs and cross-team contracts must be documented.]
- [e.g., Known deviations must include rationale and review date.]

## Review Process

- [e.g., P0 findings block release until resolved or explicitly waived.]
- [e.g., Non-blocking architecture drift becomes tracked refactor work.]
- [e.g., Changes to governance standards require team review.]

## High-Level Architecture Intent

Detailed architecture enforcement rules live in `.specify/memory/architecture_constitution.md`.

- **Architecture style**: [Monolith / Modular Monolith / Microservices / Full-stack / Library / Other]
- **Consistency goal**: [e.g., Keep feature modules independently understandable.]
- **Evolution policy**: [e.g., Use Constitution Update Proposals for new architecture standards.]

## Accepted Deviations

> List intentional governance-level exceptions. Architecture-specific deviations belong in `.specify/memory/architecture_constitution.md`.

- [e.g., The reporting module is exempt from the current documentation standard until Q3 migration.]

## Governance and Evolution Policy

- [e.g., Governance changes require explicit approval.]
- [e.g., Architecture enforcement changes should target `.specify/memory/architecture_constitution.md`.]
- [e.g., Repeated drift should trigger an Architecture Constitution Update Proposal.]

## Blocking vs Non-Blocking Rules

> By default, architecture violations are non-blocking and generate refactor tasks.
> List governance-level rules that MUST block release:

- [e.g., P0: Security-sensitive changes cannot merge without review.]
- [e.g., P0: Public API behavior must be tested before release.]

## Notes

- This Constitution is versioned alongside the codebase.
- Update it through a Constitution Update Proposal when patterns evolve.
- Architecture Guard uses this document for governance and `.specify/memory/architecture_constitution.md` for architecture enforcement.
