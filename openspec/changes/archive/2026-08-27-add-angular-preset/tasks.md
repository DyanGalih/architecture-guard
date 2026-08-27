# Tasks: Add Angular Architecture Preset & Deep Flow Interview

## Phase 1: Create Angular Architecture Preset
- [x] 1.1 Create `src/presets/angular.md` with:
  - Init interview questions (Architecture, Reactivity & State, DI, HTTP, Code Style)
  - Deep interactive interview inquiry section for complex Angular flows (Signals vs RxJS, SSR/@defer, Micro-frontends, Linting)
  - Senior engineering lens and guardrails
  - Comprehensive Boundary Mapping table
  - Angular-specific detection rules and anti-patterns with code examples
  - Architecture review output format
- [x] 1.2 Copy `src/presets/angular.md` to `.architecture-guard/presets/angular.md`

## Phase 2: Update Documentation and Initialization Commands
- [x] 2.1 Update `src/docs/presets.md` to include Angular in the preset table, mappings, and documentation
- [x] 2.2 Update `src/templates/architecture_constitution.md` to include Angular in the presets guidance line
- [x] 2.3 Update `src/commands/init.md` and `src/orchestration/init.md` to include Angular in the built-in preset options
- [x] 2.4 Update `.architecture-guard/templates/architecture_constitution.md` if present

## Phase 3: Validation and Verification
- [x] 3.1 Run tests (`npm test` / `src/install.test.ts`) to ensure all assertions pass and presets bundle remains consistent
- [x] 3.2 Verify hygiene and format across all modified files
