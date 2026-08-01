# Architecture Constitution

> This is the architecture enforcement document that Architecture Guard reviews against.
> Keep project-level governance in `.specify/memory/constitution.md`.
> If a section does not apply, mark it as "Not applicable" rather than deleting it.

## Architecture Style

- **Style**: [Monolith / Modular Monolith / Microservices / Event-driven / Hybrid / Other]
- **Primary stack**: [e.g., Laravel + Vue, NestJS + React, Django + HTMX]
- **Preset guidance**: [None / Laravel / NestJS / Next.js / Nuxt / Django / Spring Boot / React / React Native / Vue / Express]

## Layer Boundaries

| Layer | Owns | May Depend On | Must Not Depend On |
| --- | --- | --- | --- |
| Entry | [HTTP, UI, CLI, queue entrypoints] | [Application, Contracts] | [Domain internals, Persistence drivers] |
| Application | [Use cases, orchestration] | [Domain, Contracts, Data abstractions] | [Entry points, UI framework] |
| Domain | [Business rules, policies, invariants] | [Domain types only] | [HTTP, database, queues, framework runtime] |
| Data | [Persistence and query abstractions] | [Domain contracts, persistence drivers] | [Entry points, UI, application decisions] |
| External | [Third-party integrations] | [Integration contracts] | [Domain internals] |

## Business Logic Placement

- [e.g., Entry points must validate, map, and delegate only.]
- [e.g., Business decisions live in application services, actions, use cases, or domain policies.]
- [e.g., UI components must not own durable business rules.]
- Core business rules, validations, and durable transformations must live in one shared source of truth, not duplicated across modules or layers.

## Contracts and Validation

- **Request contracts**: [e.g., DTOs / Form Requests / Zod schemas / interfaces]
- **Response contracts**: [e.g., Resource classes / response DTOs / typed interfaces]
- **Event contracts**: [e.g., Event classes / message schemas]
- **Validation boundary**: [e.g., External input is validated before application or domain logic.]

## Data Access Rules

- [e.g., Data access must go through repositories, query services, gateways, or an approved equivalent.]
- [e.g., Domain logic must not depend on ORM models or database drivers.]
- [e.g., Cross-module data access must use public module contracts.]

## Async and Integration Rules

- [e.g., Background jobs must delegate business decisions to application/domain logic.]
- [e.g., Events must use explicit contracts and stable payloads.]
- [e.g., External service calls must be isolated behind gateways or clients.]

## Module Boundaries

| Module | Owns | Public Contracts | Must Not |
| --- | --- | --- | --- |
| [Module] | [Responsibilities] | [APIs/events/services exposed] | [Forbidden dependencies or data access] |

## Framework-Specific Architecture Rules

- [e.g., Laravel controllers must delegate to Actions or Services.]
- [e.g., NestJS modules must expose dependencies through explicit exports.]
- [e.g., Next.js Server Actions must delegate business rules to services.]

## Blocking Architecture Violations (P0)

> By default, violations are non-blocking. List only rules that must stop release.

- [e.g., P0: Core business logic or validation rules must not be duplicated across modules or layers (DRY violation).]
- [e.g., P0: Duplicate business logic is not allowed when a shared source of truth already exists and is reasonably reusable.]
- [e.g., P0: No public endpoint may process unvalidated external input.]
- [e.g., P0: No module may directly access another module's private database tables.]

## Accepted Architecture Deviations

- [e.g., The reports module uses direct SQL for approved aggregate queries because the ORM cannot express them safely.]

## Architecture Evolution Policy

- [e.g., Repeated drift should produce a Constitution Update Proposal.]
- [e.g., Accepted new patterns require explicit approval before becoming standards.]
- [e.g., Migration plans should be incremental and module-scoped.]

## Refactor and Drift Handling

- [e.g., P1 drift should become near-term refactor tasks.]
- [e.g., P2 drift may be tracked as scheduled technical debt.]
- [e.g., P3 cleanup is opportunistic and should not block feature delivery.]
