# Proposal: Add Angular Architecture Preset & Deep Interactive Flow Interview

## Problem
Architecture Guard provides built-in architecture presets for popular frontend and backend frameworks (React, Vue, Next.js, Nuxt, NestJS, Laravel, Django, Spring Boot, etc.), but lacks a dedicated preset for **Angular**. Teams building Angular applications lack framework-native boundary mappings, reactive state guidelines (Signals, RxJS, NgRx), component architecture conventions (Standalone components, OnPush change detection), and structured detection rules for Angular-specific anti-patterns (such as unmanaged subscriptions, DI bypass, fat components, and template side effects).

Furthermore, during initialization, teams adopting Angular often encounter complex architectural choices (e.g. Signals vs RxJS state management, SSR/@defer hydration, standalone vs NgModules, inject() vs constructor DI) that require a deep interactive interview flow to address potential concerns.

## Proposed Solution
1. **Create Angular Preset (`presets/angular.md` & `src/presets/angular.md`)**:
   - Define Angular boundary mapping (Entry, Validation, Contract, Application, Domain, Data, Presentation).
   - Establish detection rules for modern Angular (Signals, Standalone components, `inject()` function, OnPush change detection, typed reactive forms, DTO contracts, functional route guards/interceptors).
   - Flag key Angular anti-patterns (Fat Components, unmanaged RxJS subscriptions, direct HttpClient calls in components, manual DOM manipulation bypassing Angular renderer/signals, mutating inputs).
   - Provide an init interview questionnaire covering Application Architecture, Reactivity & State Ownership, Dependency Injection, Data Fetching & HTTP, and Code Style & Tooling.
   - Include deep interactive interview questions addressing Angular-specific flows and concerns (SSR/Hydration/@defer, Signals vs RxJS interop, micro-frontend module federation, and strict `@angular-eslint` rules).

2. **Update Global Preset Manifests & Documentation**:
   - Update `src/docs/presets.md` to list Angular alongside existing presets.
   - Update `src/templates/architecture_constitution.md` to list Angular as an available preset.
   - Update `src/commands/init.md` and `src/orchestration/init.md` to reference Angular in preset detection and examples.
   - Ensure copies in `.architecture-guard/presets/` are synchronized.

## Non-Goals
- Enforcing legacy AngularJS (v1.x) patterns. The preset is targeted at modern Angular (v16–v19+), with graceful allowances for legacy NgModule/RxJS patterns when documented.
- Forcing external libraries (such as NgRx or Angular Material) when native Signals and standard reactive forms suffice.
