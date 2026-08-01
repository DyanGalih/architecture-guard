---
description: Apply React Native-specific architecture conventions during initialization and architecture review.
---

# Architecture Guard — React Native Architecture Adapter

## Init Interview

Ask these questions sequentially after the React Native preset is selected. Skip questions already resolved by existing constitution context.

### Runtime and Delivery Model

Ask:

```text
How is the application built and delivered?

- Expo managed workflow
- Expo with development builds and native projects
- React Native Community CLI
- Brownfield integration into existing native applications
```

### Application Architecture

Ask:

```text
How should the React Native application be organized?

- Feature-oriented modules
- Screens, components, hooks, and services
- Container and presentational components
- Domain-oriented mobile modules
- Hybrid based on complexity
```

Do not describe React Native as MVC unless the project explicitly adopts an MVC-like convention. Its native composition model is components, hooks, navigation boundaries, and platform integrations.

### Navigation Boundary

Ask:

```text
Which navigation system is used, and where should route definitions, navigation parameters, deep links, and authentication flows be owned?
```

### Logic and Dependency Boundaries

Ask:

```text
How should screens and components access application logic and dependencies?

- Custom hooks and explicit imports
- Context providers
- Factory functions with explicit parameters
- A project-adopted DI library
- No enforced convention
```

React Native has no built-in DI container. Prefer composition, hooks, context, or explicit parameters unless the project already demonstrates a container need.

### State, Server Data, and Offline Behavior

Ask:

```text
Which state belongs in components, Context, a client store, server-state tooling, or durable device storage?

Must the application support offline reads, queued writes, conflict resolution, or synchronization retries?
```

### Native and Platform Boundaries

Ask:

```text
Which capabilities require platform-specific files, Expo modules, third-party native libraries, Turbo Native Modules, or Fabric Native Components?

How should typed contracts protect the JavaScript-to-native boundary?
```

### Mobile Infrastructure

Ask:

```text
How should secure storage, ordinary persistence, API clients, authentication refresh, push notifications, deep links, background work, analytics, and crash reporting be isolated?
```

## Senior Engineering Lens

Apply the framework mapping with senior judgment:

- Treat directory names, layer counts, file length, and pattern names as signals, not proof. Confirm a concrete correctness, security, ownership, change-coupling, performance, or operability cost before reporting a violation.
- Start from the Constitution and patterns already working in the repository. Do not introduce a library, global store, DI container, offline database, native module, or service layer solely because this preset lists it.
- Separate client-side route visibility from server-enforced authorization. A hidden screen or navigation guard is not an authorization boundary.
- Treat secrets, credentials, tokens, device identifiers, deep links, notifications, and JavaScript-to-native calls as trust-boundary concerns.
- Prefer cross-platform code until a real platform difference justifies a small platform adapter or platform-specific file.
- Apply the shared Ponytail Core decision ladder and safety floor. Prefer React Native or Expo capabilities and installed dependencies before proposing new infrastructure.

Use the core architecture review rules first. This adapter refines generic concepts with React Native conventions for mobile UI, navigation, device capabilities, native integrations, persistence, offline behavior, and platform boundaries.

## Boundary Mapping

| Generic Concept | React Native Equivalent |
| --- | --- |
| User-facing entry points | Screens and navigation routes |
| External entry points | Deep links, push-notification handlers, app links, and universal links |
| Presentation | Components and screen layouts |
| Application coordination | Custom hooks, feature services, use-case functions, or store actions |
| State ownership | Component state, Context, client stores, or server-state tooling |
| API boundary | Typed API clients and request/response schemas |
| Device persistence | Async storage or database adapters |
| Sensitive persistence | Platform-backed secure storage through an adopted wrapper |
| Platform abstraction | `Platform`, `.ios.*`, `.android.*`, and `.native.*` modules |
| Native integration | Expo modules, third-party native libraries, Turbo Native Modules, or Fabric Native Components |
| Async/background boundary | Adopted background-task, notification, or native scheduling infrastructure |
| Observability | Crash reporting, analytics, logging, and performance instrumentation adapters |

## React Native-Specific Detection Rules

### Screen and Component Boundaries

Detect when:

- Screens mix rendering, navigation decisions, API orchestration, durable storage, and native integrations without a documented simple-feature justification.
- Reusable UI components import navigation, API, storage, analytics, or global application state directly.
- Business rules are duplicated across screens instead of living in the adopted hook, service, domain, or store boundary.

Accept local UI state, simple event handlers, prop mapping, and small platform presentation differences in components.

### Navigation and External Entry Points

Detect when:

- Route names or navigation parameter shapes are duplicated without the adopted typed contract.
- Deep links or notification payloads reach privileged screens or mutations without validation and server-side authorization.
- Authentication redirects, onboarding flows, or nested navigator ownership are duplicated inconsistently.
- Navigation state is treated as the source of truth for business or authorization state.

### State and Server Data Ownership

Detect when:

- The same remote data is independently copied into multiple stores without a synchronization rule.
- Server-state caching, client workflow state, and persistent device state have unclear or conflicting ownership.
- Durable writes omit the adopted retry, idempotency, conflict, or migration strategy where offline behavior is required.
- Sensitive tokens or credentials are stored in ordinary unencrypted persistence contrary to the security constitution.

### Platform-Specific Code

Detect when:

- Large iOS and Android implementations are duplicated even though a small shared abstraction would isolate the difference.
- `Platform.OS` branches are scattered through domain or application logic.
- A platform-specific file changes public behavior without a shared contract or equivalent tests.
- Web-only globals or browser storage APIs leak into native runtime code without an adapter.

Use `Platform` for small differences and platform-specific file extensions when the implementation meaningfully diverges.

### Native Integration Boundary

Detect when:

- Screens or domain code call native modules directly instead of the adopted typed adapter.
- JavaScript-to-native inputs, outputs, errors, threading assumptions, or lifecycle behavior are undocumented or unvalidated.
- New native modules use legacy APIs despite the project requiring New Architecture compatibility.
- Native event listeners, subscriptions, or resources are not cleaned up according to their lifecycle.
- A native dependency is introduced where an installed compatible capability already meets the requirement.

### Mobile Infrastructure and Background Work

Detect when:

- Push, deep-link, analytics, crash-reporting, storage, or authentication SDK calls are scattered across screens.
- Background work assumes unlimited execution time or silently depends on the app remaining active.
- Network retries can duplicate non-idempotent mutations.
- App startup performs heavy synchronous work that delays first interaction without evidence or measurement.
- Environment-specific endpoints, platform configuration, or secrets are embedded in UI code.

## Output Format

When this adapter is active, include:

```text
React Native Conventions:
- Runtime: [Expo Managed|Expo Native|Community CLI|Brownfield]
- UI Boundaries: [Screens and Hooks|Component-heavy|Mixed]
- Navigation: [Centralized and Typed|Scattered|Mixed]
- State Ownership: [Explicit|Duplicated|Unclear]
- Offline Strategy: [Not Required|Cache-only|Offline-first|Unclear]
- Platform Isolation: [Shared-first|Adapter-based|Scattered Branches]
- Native Boundary: [Typed and Isolated|Direct Calls|Legacy|Not Used]
- Mobile Infrastructure: [Centralized|Scattered|Incomplete]
```

## Guardrails

- Do not require MVC, a DI container, a global store, offline-first persistence, or custom native code unless the Constitution adopts it.
- Do not flag ordinary React Native components, hooks, Context, or platform files as violations by themselves.
- Do not require Turbo Native Modules or Fabric Native Components when the project does not own custom native integration.
- Do not treat client navigation guards as server-side authorization.
- The Constitution is the final authority. This adapter provides React Native context, not overrides.
