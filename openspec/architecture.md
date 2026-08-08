# Architecture Constitution

## 1. Architecture Style & Repository Structure
- Dual-repo layout (NOT a git submodule):
  - Parent repo (here): SDD spec / documentation store. Holds `openspec/` changes, specs, and config.yaml.
  - Nested `src/` repo (remote git@github.com:DyanGalih/architecture-guard.git): the deliverable that ships to npm as `architecture-guard`. Contains install.js, adapters/, orchestration/, commands/, templates/, presets/, hygiene-rules/, sonar-rules/, scripts/, package.json, .npmignore.
  - Application code lives strictly under `src/`.

## 2. Technology Stack
- Markdown command docs, YAML manifest files, Bash and PowerShell scripts, Node.js/CLI tooling, Flash-Mem MCP storage.
- SDD frameworks supported: SpecKit (`.specify/`), OpenSpec (`openspec/config.yaml` + `openspec/changes/`), framework-agnostic (generic).

## 3. Layer Boundaries & Integration
- Architecture Guard orchestrates on top of any SDD framework via `adapters/*.md`.
- Detection preamble lives at `adapters/detect.md`.
- Verify changes against `src/` before publishing.

## 4. Business Logic Placement & DRY Principle
- DRY is a formal engineering principle: core business rules, approvals, validation, DTO mapping, transformations, and orchestration live in a single source of truth.
- Duplicated logic is flagged as drift and can be enforced as P0.

## 5. Refactor & Drift Handling
- Non-blocking architecture drift by default.
- Approved refactors stay small and targeted.
- Markdown constitutions and command files are the review source of truth.
