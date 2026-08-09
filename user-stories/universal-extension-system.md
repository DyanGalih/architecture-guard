---
status: approved
---

# User Story: Universal Extension/Plugin System

## Business Objective
Transform Architecture Guard into an extensible lifecycle orchestrator. By allowing third-party functional skills (like Security, UI Rules, Accessibility checks) to be dynamically loaded from GitHub, we decouple domain-specific logic from core governance. This enables teams to adopt tailored governance rules without bloating the core orchestrator.

## User Stories
- **As an engineering lead**, I want to install a security scanner extension from GitHub into my Architecture Guard workflow, so that security checks are automatically enforced during `review-implementation` without changing the core orchestrator.
- **As a team member**, I want all functional extensions to be stored in a dedicated directory (e.g., `extensions/`) separate from `adapters/`, so that there is a clear boundary between state/SDD tool adapters and functional governance skills.

## Acceptance Criteria
1. **Directory Segregation**: Functional extensions must be stored in `.architecture-guard/extensions/` (or similar) to prevent conflating them with SDD adapters.
2. **Configuration Manifest**: The system must support registering external skills via a configuration manifest (e.g., `config.yaml` or `extensions.yml`).
3. **Lifecycle Integration**: The orchestrator must be able to delegate execution to these registered extensions during the review phases (e.g., `pre-review`, `post-implement`).
4. **Standardized Contract**: Extensions must consume and output data matching a standard interface (e.g., receiving changed files and returning a structured list of violations).

## Business Rules
- Core orchestration logic MUST remain framework and tool agnostic (Modular Monolith principle).
- External tools MUST NOT be hardcoded into the orchestrator.

## Out of Scope Items
- Developing the specific third-party extensions (e.g., we are not building the UI linter in this story, only the system to load it).

## Assumptions
- Extensions will be available via standard Git cloning or NPM package registries.

## Risks
- Version drift or breaking changes in remote extensions could cause local governance pipelines to fail if not pinned correctly.

## Open Questions
- What is the exact payload structure passed to extensions?
- How is extension versioning handled?
