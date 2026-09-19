---
description: Detect technology-agnostic architecture violations in plans, tasks, and implementation summaries.
---

# Violation Detection Command

## SDD Adapter Resolution

Before executing command, read `adapters/resolve.md` to resolve the selected SDD adapter. Load `adapters/{tool}.md` for path maps, command maps, and gap fills. All paths and commands below use the loaded adapter.

## Standalone Resource Resolution

Architecture Guard engine resources are standalone package resources. Never search an SDD-tool directory, an extension directory, or a source checkout for them. An adapter path under `.architecture-guard` is an editable local override location, not proof that the resource was copied.

- Directly inspect the matching `.architecture-guard/<category>/` directory first for workspace overrides.
- If the named local resource exists, read it. Otherwise run `architecture-guard resolve <category> <name>` and use the returned content.
- For a resource collection, run `architecture-guard resolve <category> --list`, then resolve every returned name individually in deterministic order so local overrides replace bundled files without hiding bundled defaults.
- If the CLI is unavailable and a mandatory resource is not vendored locally, stop and report the missing runtime dependency. For optional resources, report `Unavailable` and continue only when this command explicitly permits degradation.

## Ponytail Core Contract

Before continuing, you **MUST** resolve and apply the `ponytail_core` template with `architecture-guard resolve template ponytail_core` as the authoritative shared contract. Phase instructions may narrow but not weaken its safety or verification floor.

## Capability Composition

Resolve and apply the `capability_composition` template with `architecture-guard resolve template capability_composition` before delegating to another Architecture Guard capability. Resolve and read the installed sibling skill or command file directly; do not treat a capability name or Markdown path as an invocation.

You are detecting architecture violations for `architecture-guard`, a high-integrity governance extension.

Your role is to identify architectural drift in specifications, plans, and implementations using technology-agnostic principles.

## Flash-Mem-First Architecture Context Retrieval

When Flash-Mem is available, call `get_project_summary`, then `search_memory`; prefer summaries and metadata and load full entries only as needed. Reuse approved decisions and flag conflicts. After analysis, propose validated durable knowledge and write it only after explicit user approval. If retrieval is unavailable or insufficient, resolve the selected adapter project configuration first (`openspec/config.yaml` for OpenSpec), inspect its `context` block for every referenced governance and constitution Markdown file, then explicitly read every declared or present constitution, architecture, security, and layout Markdown file before using repository artifacts. For OpenSpec, check `openspec/constitution.md`, `openspec/architecture.md`, `openspec/security.md`, and `openspec/layout.md`; for other adapters, read every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file.

## Input & Context Loading

Before analyzing violations or generating refactor tasks, read these inputs explicitly with file-reading tools:

1. **Manifest & Configuration**: Read `openspec/config.yaml` first when the OpenSpec adapter is active (otherwise read the selected adapter project configuration), then inspect its `context` block for every referenced governance and constitution Markdown file. Never rely on a hardcoded partial list.
2. **Authoritative Constitutions (read all that exist)**: Read every declared or present governance, constitution, architecture, security, and layout Markdown file. For OpenSpec, explicitly check `openspec/constitution.md`, `openspec/architecture.md`, `openspec/security.md`, and `openspec/layout.md`. For SpecKit, use the adapter-resolved `.specify/memory/constitution.md`, `.specify/memory/architecture_constitution.md`, `.specify/memory/security_constitution.md`, and any adapter-defined layout constitution. Never silently omit an existing file.
3. **Analysis Inputs**: Read the active review, specification, plan, task, and implementation-summary artifacts required by this skill.

## Operating Constraints

- **REPOSITORY READ-ONLY**: This analytical command does not modify repository files. Flash-Mem writes require explicit user approval.
- **Progressive Disclosure**: Load context incrementally. Start with design artifacts before deep-diving into code.
- **Evidence-Based**: Every violation must cite specific "Implementation Evidence" (file paths, line numbers, or code patterns) or its absence.

## Command Normalization

Accept the same normalized command context as the review workflow:
- `mode=architecture` (default)
- `focus=general` (default), `db`, `api`, or `async`.

If `mode=performance`, do not emit violations here. Let `ag-review-implementation` own the advisory performance output.

### Scope Filtering by Focus

**When focus=general** (default):
- Review all violation categories (A through E)
- Detect intent divergence, boundary erosion, contracts, coupling, Constitution breach

**When focus=db** (data/persistence):
- Review only data access violations
- Scope to repositories, query services, ORM usage
- Detect: missing repository pattern, isolation breach, tight coupling with persistence

**When focus=api** (API contracts):
- Review only API contract and response violations
- Scope to endpoints, DTOs, response shapes, request validation
- Detect: contract mismatch, inconsistent responses, missing validation boundaries

**When focus=async** (async boundaries):
- Review only async execution and event violations
- Scope to queues, event handlers, background jobs, async boundaries
- Detect: blocking in async, missing event contracts, isolation breaches

---

## Semantic Modeling

Before analysis, build internal representations (do not output these):
1. **Boundary Model**: Map expected vs. actual boundaries (Entry, App, Domain, Data, External).
2. **Contract Inventory**: Identify shared shapes and interface signatures.
3. **Dependency Graph**: Map module-to-module dependencies to detect coupling/layering issues.

## Detection Scope

### A. Intent & Alignment
- **Intent Divergence**: Implementation deviates fundamentally from `spec.md` or the technical design artifact intent.
- **Hallucinated Abstractions**: Plan mentions an abstraction (e.g., Repository) that is missing in code.
- **Spec-Code Mismatch**: Functional requirements from spec are implemented in the wrong architectural layer.
- **Ponytail Violation (Bloat)**: Plan, tasks, or code duplicate existing capability, add avoidable files or dependencies, include unnecessary boilerplate or future-proofing, or bypass a correct standard-library or native-platform feature.
- **Ponytail Violation (Unsafe Simplification)**: Minimalism removes required validation, authorization, data-loss prevention, accessibility, external-system safeguards, or a runnable check for non-trivial logic.
- **Root-Cause Miss**: A caller-specific patch leaves the same shared defect active in sibling paths.

### B. Boundaries & Layering
- **Boundary Erosion**: Business logic leaking into Entry boundaries (Controllers/Handlers) or UI.
- **Isolation Breach**: Data access or external API calls bypassing expected abstractions.
- **Separation of Concerns**: Infrastructure or transport concerns polluting domain logic.

### C. Contracts & Consistency
- **Missing/Inconsistent Contracts**: Shared boundaries lacking DTOs, schemas, or stable interfaces.
- **Contract Mismatch**: Shapes differing between UI, API, service, or event boundaries.
- **Response Drift**: Incompatible success/error shapes across comparable endpoints or modules.

### D. Coupling & Dependencies
- **Tight Coupling**: Circular dependencies or one module reaching into another's internals.
- **Hidden Coordination**: Shared utilities acting as implicit coordination layers for business rules.

### E. Constitution & Security
- **Constitution Breach**: Conflict with a "MUST" principle in the Constitution.
- **Security-Architecture Conflict**: Decisions contradicting `security-constraints.md` or trust boundaries.

## Security-Architecture Conflict (Detailed)

A Security-Architecture Conflict occurs when security requirements and architecture boundaries create opposing design constraints. Route it to both workflows, but derive severity and blocking status from governing policy rather than its security category.

### Examples

**Example 1: Sensitive Data Placement**
- **Security Constraint**: "Pricing logic must remain server-side; never expose to client"
- **Architecture Finding**: "Pricing displayed in client component fetching pricing from API endpoint"
- **Conflict**: Client architecture violates server-side security boundary
- **Resolution**: Move pricing calculation to server boundary, client receives only final price

**Example 2: Secret Management**
- **Security Constraint**: "API keys stored in `.env`, never passed to build or frontend"
- **Architecture Finding**: "Environment variables passed to frontend build process"
- **Conflict**: Build architecture leaks secrets to frontend bundle
- **Resolution**: Store secrets only in backend runtime, never in build environment

**Example 3: Authorization Boundary**
- **Security Constraint**: "User can only access their own data"
- **Architecture Finding**: "Data access layer queries all users without ownership check"
- **Conflict**: Persistence layer bypasses authorization boundary
- **Resolution**: Add ownership filter to repository, move check to before data access

---

## Review Procedure

1. **Resolve Bounded Scope**: Use an explicit user-provided file list first. Otherwise, use `architecture-guard detect-changed-files --json` only after confirming that capability is available. If unavailable, derive the set with the host's Git capability, including committed changes from the merge-base to `HEAD`, staged changes, unstaged changes, and untracked files. If Git is unavailable, ask the user for a file list and do not scan an unbounded repository scope.
2. **Model Context**: Load artifacts and build the Semantic Models for the resolved scope.

    #### Flash-Mem Context Retrieval
    When Flash-Mem is available, use it first to gather the most relevant architecture context before judging violations. Prefer summary-first context and only expand into repository files when needed.

    If Flash-Mem is unavailable or the context is insufficient, resolve the selected adapter project configuration first (`openspec/config.yaml` for OpenSpec), inspect its `context` block for every referenced governance and constitution Markdown file, then explicitly read every declared or present constitution, architecture, security, and layout Markdown file before continuing with repository artifacts. For OpenSpec, check `openspec/constitution.md`, `openspec/architecture.md`, `openspec/security.md`, and `openspec/layout.md`; for other adapters, read every corresponding path resolved by the adapter path map, including any layout or UI constitution path. Never silently omit an existing file.
3. **Verify Evidence**: Check if task-referenced files exist and contain expected implementation logic.
4. **Analyze Alignment**: Compare `spec.md` intent vs. the technical design artifact architecture vs. actual behavior.
5. **Scan Principles**: Apply detection scope across boundaries and contracts.
6. **Security & Governance Cross-Check**: Ensure architecture decisions do not violate `{adapter_path:security-constitution}` or `{adapter_path:security-constraints}`. Classify severity and blocking status from the applicable policy, regardless of whether the finding is categorized as security, architecture, or governance.
7. **Assign Severity, Blocking, and Priority**:
   - `Critical`: A governing rule explicitly assigns Critical/P0, or zero evidence exists for a required boundary. Security category alone does not set severity.
   - `High`: Significant boundary erosion, contract inconsistency, or intent divergence.
   - `Medium`: Local drift or debt.
   - `Low`: Minor shape or naming drift.
   - `Blocking`: `Yes` only when the applicable policy explicitly marks the violation blocking; otherwise `No`. Severity does not imply blocking.
   - `Priority`: `P0` only when `Blocking: Yes`; otherwise assign the applicable non-P0 priority from policy or severity.

## Output Format

Return only:

```text
Violations:
- Type:
  Severity:
  Blocking:
  Priority:
  Location:
  Description:
  Evidence:
  Principle:
  Consequence:
  Smallest Fix:
  Verification:
  Trade-off:
```

If there are no violations:

```text
Violations:
- None detected
```

## Next Step

Feed detected violations to {adapter_command:refactor-generator} so they can be converted into actionable refactor tasks.

## Framework Preset Guidance

If framework preset guidance exists, use it to map the Generic Architecture Model to framework primitives and detect stack-specific anti-patterns.

Preset guidance: resolve only the selected preset with `architecture-guard resolve preset <preset>` when one is configured.
