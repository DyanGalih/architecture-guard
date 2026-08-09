# Architecture Constitution

## 1. Architecture Style & Repository Structure
- Modular Monolith CLI / Development Tool.
- Technology Stack: TypeScript / Node.js (CLI and tooling).
- Subfolder conventions: `commands/` and `src/` (flat structure).

## 2. Layer Boundaries & Integration
- Boundary Isolation: Strict isolation. CLI UI/args must not leak into core domain logic.
- Communication flow: CLI commands -> Services -> Data/Adapters.
- Business Logic Placement: In dedicated service/action classes or functions (isolated from CLI commands).
- Data Access: Abstracted behind Repository/Adapter interfaces (for config files, local state, external API calls).

## 3. Contracts & Validation
- Validation Strategy: Zod (or similar schema validation) at the command entry point.
- Standard Response Structure: Plain text for humans, with a `--json` flag for machine-readable output.
- Contract Conventions: POSIX compliant (stderr for errors, stdout for data, standard exit codes).

## 4. Async & Integration Rules
- Async processing is required for all I/O operations (network, file system).
- Network requests and large file reads must never block the main event loop.

## 5. Blocking Architecture Violations (P0)
- DRY violations (duplicated business rules, validation, DTO mapping).
- Boundary violations (e.g., Commands accessing Data directly).
- Bypassing Zod validation.
- Synchronous I/O operations.

## 6. Architecture Evolution Policy
- Proposal-based evolution (via OpenSpec changes).
- No intentional architectural deviations are permitted without following the evolution policy.

## 7. Refactor & Drift Handling
- Refactors must follow the Ponytail Core Contract: prefer the smallest root-cause correction over a new abstraction hierarchy.
- DRIFT is a P0 violation for the specific cases listed above (e.g., DRY violations).
