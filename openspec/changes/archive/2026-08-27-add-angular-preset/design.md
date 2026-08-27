# Technical Design: Angular Architecture Preset & Deep Flow Interview

## Overview
This design introduces the Angular architecture preset (`src/presets/angular.md` and `.architecture-guard/presets/angular.md`) following the pattern of React (`react.md`) and Vue (`vue.md`) presets, enhanced with modern Angular idioms and deep interactive interview inquiries.

## Preset Architecture

### 1. Init Interview Structure
The preset interview is structured into sequential sections:
- **Application Architecture & Component Paradigm**: Standalone components vs NgModules, feature-sliced / domain-driven layout, container/presentational split.
- **Reactivity & State Ownership**: Signals (`signal`, `computed`, `effect`, Signal inputs/outputs/model), RxJS (`BehaviorSubject`, `Observable`), NgRx / NgRx SignalStore, component-level vs global state.
- **Dependency Injection**: Functional `inject()` vs constructor injection, providedIn `'root'` vs feature environment providers (`provideHttpClient`, `provideRouter`).
- **Change Detection & Performance**: `ChangeDetectionStrategy.OnPush` discipline, `@defer` deferrable views, SSR/Hydration boundaries.
- **API & Data Access Infrastructure**: Dedicated injectable API services, typed DTOs/contracts, HttpInterceptors, error handling, caching.
- **Deep Angular Flow Inquiries**: Interactive prompt resolving complex architectural decisions (e.g. RxJS-to-Signal interop patterns, hydration & SSR strategy, micro-frontends / Module Federation, and strict linting rules like `@angular-eslint`).
- **Code Style & Tooling**: `@angular-eslint` rules, template inline vs external files, naming conventions.

### 2. Senior Engineering Lens & Guardrails
- Signals & Standalone components are the modern default; legacy NgModules and RxJS are supported when justified by existing repo context.
- Avoid forcing heavy state management libraries (NgRx) if lightweight Signal services or ComponentStore suffice.
- Prevent unmanaged RxJS subscriptions using `takeUntilDestroyed()`, `AsyncPipe`, or `toSignal()`.
- Do not flag simple presentational transformations in components as violations.

### 3. Boundary Mapping
- **Entry Boundary**: Routed Components (`src/app/pages/` or `src/app/routes/`), Functional Route Guards (`canActivate: [authGuard]`), Layout components.
- **Validation Boundary**: Reactive Forms (`FormGroup`, `FormControl`, `Validators`), custom validator functions, Zod schemas with custom form adapters.
- **Contract Boundary**: TypeScript DTO interfaces, API request/response models, Component Inputs (`input()`, `@Input()`) & Outputs (`output()`, `@Output()`).
- **Application Boundary**: Injectable Feature Services (`@Injectable({ providedIn: 'root' })`), Signal Stores, Use-case facades.
- **Domain Boundary**: Pure TypeScript Domain Models, domain validation rules, pure utility functions.
- **Data Boundary**: Injectable HTTP Clients / Repositories (`src/app/core/services/` or `src/app/features/*/services/`), `HttpClient`, HttpInterceptors (`provideHttpClient(withInterceptors([...]))`).
- **Presentation Boundary**: Pure / Dumb Standalone Components (`src/app/shared/components/` or `src/app/ui/`), Directives, Custom Pipes.

### 4. Detection Rules & Anti-Patterns
- **Fat Component (Logic Leakage)**: Direct `HttpClient` calls in component classes, complex RxJS orchestration in `ngOnInit`, business logic in template expressions.
- **Unmanaged Subscriptions (Memory Leak)**: Subscribing to observables in components without `takeUntilDestroyed()`, `takeUntil()`, or `AsyncPipe`.
- **DI Bypass**: Instantiating services with `new ServiceName()` instead of `inject(ServiceName)` or constructor injection.
- **Mutable Inputs / Two-Way Binding Abuse**: Mutating input properties directly instead of emitting outputs or using `model()`.

## File Modifications
- Create `src/presets/angular.md`
- Copy to `.architecture-guard/presets/angular.md`
- Update `src/docs/presets.md` (add Angular entry to table and description)
- Update `src/templates/architecture_constitution.md` (add Angular to preset list)
- Update `src/commands/init.md` (add Angular to built-in presets list)
- Update `src/orchestration/init.md` (add Angular to built-in presets list)
