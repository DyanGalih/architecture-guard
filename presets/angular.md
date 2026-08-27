---
description: Apply Angular-specific architecture conventions during initialization and architecture review.
---

# Architecture Guard — Angular Architecture Adapter

## Init Interview

Ask these questions sequentially after the Angular preset is selected. Skip questions already resolved by existing constitution context.

### Application Architecture

Ask:

```text
How should the Angular application be organized?

- Standalone components with feature-oriented / domain modules (Recommended for Angular 17+)
- Standalone components with layered structure (Pages, Components, Services)
- Module-based architecture (NgModules - legacy/enterprise)
- Container (Smart) and Presentational (Dumb) components
- Hybrid based on complexity
```

### Reactivity & State Ownership

Ask:

```text
How should reactive state and data flow be managed?

- Angular Signals (signal, computed, effect, Signal Inputs/Outputs)
- RxJS BehaviorSubject / ReplaySubject state services
- NgRx SignalStore
- NgRx Global Store / ComponentStore
- Hybrid: Signals for UI/local state + RxJS for async/events
- No enforced convention
```

### Dependency Injection & Service Boundaries

Ask:

```text
How should services and dependencies be provided and injected?

- Functional `inject()` in injection context (Angular 14+)
- Constructor injection
- Feature-scoped environment providers (`provideX()`)
- Root-level singletons (`@Injectable({ providedIn: 'root' })`)
- Existing project convention
```

### Change Detection & Rendering Discipline

Ask:

```text
What change detection and rendering strategy applies to this project?

- Enforce `ChangeDetectionStrategy.OnPush` across all custom components
- Default change detection with selective OnPush for performance-critical views
- Zoneless Angular with Signals (Angular 18+)
- SSR / Hydration with `@defer` block optimization
```

### API and Contract Infrastructure

Ask:

```text
How should HTTP communication, API contracts, caching, retries, and error handling be structured?

- Injectable API Services with typed request/response DTO interfaces
- Functional HttpInterceptors (`provideHttpClient(withInterceptors([...]))`)
- Angular TanStack Query / Resource API (Angular 19+)
- Custom API client wrappers
```

### Deep Angular Flow Inquiries

Ask:

```text
Do you have any deep architectural concerns or specific requirements regarding Angular flows and rules?

Examples:
- Signals-to-RxJS interop rules (e.g. `toSignal()`, `toObservable()`, avoiding manual `.subscribe()`)
- Hydration & SSR constraints (avoiding direct DOM / `window` access without `isPlatformBrowser()`, utilizing `@defer` blocks)
- Micro-frontend / Module Federation boundaries
- Strict `@angular-eslint` rules (e.g. template complexity limits, banana-in-a-box syntax, no unmanaged subscriptions)
```

### Code Style & Tooling

Ask:

```text
Which framework-specific lint/style conventions apply to this project, if any?

Examples:
- `@angular-eslint` strictness, Prettier formatting
- Component inline vs separate template/style files
- Prefix conventions for components and directives (e.g., `app-`)
```

---

## Senior Engineering Lens

Apply the framework mapping with senior judgment:

- Treat directory names, layer counts, file length, and pattern names as signals, not proof. Confirm a concrete correctness, security, ownership, change-coupling, or operability cost before reporting a violation.
- Start from the Constitution and patterns already working in the repository. Do not introduce a layer, library, DTO, store, repository, or service solely because this preset lists it.
- Distinguish correctness requirements from maintainability advice. Security, trust-boundary validation, data integrity, and contract breaches may block; preference-level structure remains advisory.
- For each finding, teach the reasoning: show evidence, name the violated boundary or principle, explain the likely failure mode, propose the smallest correction, and state how to verify it.
- Evaluate tradeoffs that matter for the change, such as memory leak risk from unmanaged subscriptions, change detection overhead, bundle size, and migration risk. Do not manufacture irrelevant categories.
- Apply the shared Ponytail Core decision ladder and safety floor. Prefer native framework features (Signals, Standalone components, `inject()`) and installed dependencies before proposing custom infrastructure.

Use the core architecture review rules first. This adapter refines generic architecture concepts with **Angular** conventions. It specifically focuses on the separation of UI (Components) and Business Logic (Services/Stores), preventing the "Fat Component" anti-pattern and enforcing clean reactive state management.

---

## Boundary Mapping

When reviewing an Angular project, map generic architecture boundaries to Angular primitives:

### Entry Boundary

| Generic Concept | Angular Equivalent |
| --- | --- |
| Entry point for HTTP routing | Routed Components (`src/app/pages/` or `src/app/routes/`) |
| Route resolution & configuration | Routes array (`routes: Routes`) in `app.routes.ts` |
| Route request filtering | Functional Route Guards (`canActivate: [authGuard]`, `canMatch`) |
| Entry point for User Events | Event bindings (`(click)`, `(submit)`) in component templates |
| Global Layout / Frame | Root Component (`app.component.ts`) or Layout Components |

### Validation Boundary

| Generic Concept | Angular Equivalent |
| --- | --- |
| Form validation | Reactive Forms (`FormGroup`, `FormControl`, `Validators`) |
| Custom validation | ValidatorFn functions or AsyncValidatorFn |
| Schema validation | Zod / Valibot schemas integrated into form controls or DTOs |
| Input transformation | Signal `computed()` transformations or Component input transforms (`transform: ...`) |

### Contract Boundary

| Generic Concept | Angular Equivalent |
| --- | --- |
| Component inputs & outputs | Signal Inputs (`input()`), Signal Outputs (`output()`), Two-way (`model()`) or `@Input()` / `@Output()` |
| API contracts | TypeScript DTO Interfaces for Request/Response |
| Shared state shapes | Interface/Type definitions for Signals or State Stores |

### Application Boundary

| Generic Concept | Angular Equivalent |
| --- | --- |
| Shared logic coordination | Injectable Services (`@Injectable({ providedIn: 'root' })`) |
| Feature state orchestration | SignalStore or Feature Facades |
| Async event coordination | RxJS Subjects or Angular Event Bus services |

### Domain Boundary

| Generic Concept | Angular Equivalent |
| --- | --- |
| Business rules and decisions | Pure TypeScript Functions in `domain/` or `utils/` |
| Domain entities | TypeScript Types or Classes |

### Data Boundary

| Generic Concept | Angular Equivalent |
| --- | --- |
| Persistence abstraction | Data Access Services (`src/app/core/services/` or `src/app/features/*/api/`) |
| HTTP Communication | `HttpClient` |
| Request/Response Interception | HttpInterceptors (`HttpInterceptorFn` via `withInterceptors`) |
| Local persistence | Storage Services wrapping LocalStorage / IndexedDB |

### Presentation Boundary

| Generic Concept | Angular Equivalent |
| --- | --- |
| Pure UI Components | Standalone Presentational Components (`ChangeDetectionStrategy.OnPush`) |
| Composed UI | Container Components or Page Components |
| Template formatting | Custom Pipes (`@Pipe({ standalone: true, pure: true })`) |
| DOM abstraction | Directives (`@Directive({ standalone: true })`) |

---

## Angular-Specific Detection Rules

### Fat Component (Logic Leakage)

Detect when a component:
- Owns complex business decisions, multi-step workflows, or heavy calculation logic that should live in a **Service**, **SignalStore**, or **Domain function**.
- Directly uses `HttpClient` inside component methods instead of delegating to a dedicated API service.
- Manages raw server state directly without caching or service abstraction.

**Acceptable in components:**
- UI-only state (e.g. `isDrawerOpen = signal(false)`).
- Calling a single service method or dispatching a store action.
- Deriving presentation values using `computed()` based on component inputs or service signals.

### Unmanaged RxJS Subscriptions (Memory Leak Anti-Pattern)

Detect when:
- A component calls `.subscribe()` on an Observable without lifecycle teardown via `takeUntilDestroyed()`, `takeUntil(this.destroy$)`, or `firstValueFrom()`.
- **Recommendation**: Prefer using the **AsyncPipe** (`observable$ | async`), converting observables to signals with **`toSignal()`**, or using **`takeUntilDestroyed()`** inside injection context.

### Direct DOM Manipulation

Detect when:
- Components directly access global `document`, `window`, or manipulate DOM elements using `element.innerHTML` or `document.getElementById()`.
- **Recommendation**: Use Angular template syntax, `Renderer2`, `ElementRef`, or Signal-driven view logic, and wrap platform-specific APIs in `isPlatformBrowser()` checks for SSR compatibility.

### Mutable Inputs / State Mutation

Detect when:
- A component attempts to mutate an `@Input()` or `input()` property directly.
- **Recommendation**: Treat inputs as readonly. Emit events via `output()` or utilize two-way `model()` inputs.

### Missing Change Detection Strategy

Detect when:
- Complex or performance-sensitive standalone components omit `ChangeDetectionStrategy.OnPush`, leading to unnecessary change detection cycles across the component subtree.

---

## Common Angular Anti-Patterns to Flag

### 1. Fat Component & Direct HttpClient Usage

```typescript
// ❌ Component directly handles HttpClient and transforms data
@Component({
  selector: 'app-user-profile',
  standalone: true,
  template: `<div>{{ user?.name }}</div>`
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<User>(`/api/users/1`).subscribe(data => {
      // Complex business logic & calculations
      this.user = data;
    }); // ❌ Memory leak: unmanaged subscription
  }
}
```

```typescript
// ✅ Component delegates to Service and uses Signals
@Component({
  selector: 'app-user-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (user(); as u) {
      <div>{{ u.name }}</div>
    }
  `
})
export class UserProfileComponent {
  private userService = inject(UserService);
  readonly user = this.userService.currentUser; // Signal from service
}
```

### 2. Direct DOM Access Breaking SSR/Hydration

```typescript
// ❌ Direct window/document access
@Component({ ... })
export class HeaderComponent implements OnInit {
  ngOnInit() {
    const width = window.innerWidth; // ❌ Breaks SSR
  }
}
```

```typescript
// ✅ Safe platform-aware access
@Component({ ... })
export class HeaderComponent {
  private platformId = inject(PLATFORM_ID);

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
```

---

## Output Format

When this adapter is active, the architecture review should include an **Angular Conventions** section:

```text
Angular Conventions:
- Component Architecture: [Standalone / NgModule / Mixed]
- Reactivity & State: [Signals-driven / RxJS-Service / Store / Mixed]
- Subscription Safety: [Clean (AsyncPipe/Signals/takeUntilDestroyed) / Leaky Subscriptions]
- DI Pattern: [Functional inject() / Constructor-based / Mixed]
- Change Detection: [OnPush / Default / Mixed]
- API Layer: [Abstracted Services / Direct HttpClient]
```

---

## Guardrails

- Do not flag small (1–3 lines) presentational calculations in templates or `computed()` properties as violations.
- Do not require NgRx or external state stores for small-to-medium applications where Signal services suffice.
- The Constitution is the final authority. This adapter provides Angular context, not overrides.
