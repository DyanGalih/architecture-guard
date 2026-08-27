# Framework Presets

Architecture Guard is technology-agnostic at its core. Presets add application-framework vocabulary, initialization questions, boundary mappings, detection guidance, and review output without replacing the project Constitution.

A preset does not automatically require every pattern or dependency it mentions. During initialization, the user selects the conventions that apply. During review, the Constitution remains the final authority.

## Supported Built-in Presets

| Preset | File | Init interview focus | Review focus |
| --- | --- | --- | --- |
| Angular | [`angular.md`](../presets/angular.md) | Component style, Signals and state ownership, DI pattern, OnPush change detection, HTTP/DTO contracts, deep Angular flow concerns | Standalone components, Signals discipline, subscription safety, DI injection, presentation isolation |
| CodeIgniter | [`codeigniter.md`](../presets/codeigniter.md) | Application style (MVC vs REST vs Hybrid), CI3 vs CI4 PSR-4 naming, API conventions, tooling rules | MVC structure, controller thinness, model boundaries, PSR-4 naming consistency |
| Django | [`django.md`](../presets/django.md) | MVT organization, view and contract style, dependency wiring, ORM ownership, transactions, async workers | Thin views, model boundaries, Forms and Serializers, QuerySets, signals |
| Express.js | [`expressjs.md`](../presets/expressjs.md) | Route and service structure, dependency wiring, schema validation, persistence, workers | Route handlers, middleware, validation, errors, service boundaries |
| Laravel | [`laravel.md`](../presets/laravel.md) | Application style, MVC and use-case structure, Actions, DTOs, authorization, container usage, Eloquent, queues | Controllers, Form Requests, Resources, Actions and Services, models, policies, Spatie packages when adopted |
| NestJS | [`nestjs.md`](../presets/nestjs.md) | Modules, communication, validation scope, application pattern, providers, DI tokens, persistence, async transports | Module encapsulation, controllers, providers, DI, DTOs, Guards and filters |
| Next.js | [`nextjs.md`](../presets/nextjs.md) | Server and Client boundaries, Server Actions, application modules, data access, dependency wiring, background work | App Router boundaries, server-only code, actions, Route Handlers, data and cache ownership |
| Node.js CLI | [`nodejs-cli.md`](../presets/nodejs-cli.md) | Command structure, service boundaries, dependency wiring, persistence and file system boundaries | Thin command handlers, process.exit isolation, UI/terminal rendering separation, data boundaries |
| Nuxt | [`nuxtjs.md`](../presets/nuxtjs.md) | Composables, API access, plugins and injection, state ownership, Nitro server infrastructure | Pages and components, composables, Pinia, plugins, server routes, client/server isolation |
| React | [`react.md`](../presets/react.md) | Feature organization, hooks and Context, dependency access, state ownership, API infrastructure, routing | Component responsibility, hooks, state, data fetching, UI purity |
| React Native | [`react-native.md`](../presets/react-native.md) | Expo or Community CLI, navigation, state and offline behavior, platform code, native modules, mobile infrastructure | Screens, navigation, device storage, deep links, notifications, platform isolation, typed native boundaries |
| Spring Boot | [`springboot.md`](../presets/springboot.md) | Layered, feature, hexagonal, modular, or CQRS structure; constructor DI; DTO mapping; transactions; security and async work | Controllers, services, repositories, beans, DTOs, transaction boundaries, Spring Security |
| Vue | [`vue.md`](../presets/vue.md) | Components and composables, dependency provisioning, Pinia and server-state ownership, API infrastructure | Component boundaries, composables, stores, API clients, presentation isolation |

## How Presets Work

### During Initialization

The `init` command:

1. identifies the primary technology stack
2. offers a matching built-in preset
3. reads that preset's `## Init Interview` section
4. merges relevant preset questions into the generic interview phases
5. records accepted answers as framework-neutral decisions with framework-specific implementations

Questions already answered by the existing Constitution or an earlier interview phase should not be asked again.

Selecting a package or infrastructure option records an architecture convention. It does not authorize Architecture Guard to install a dependency.

### During Review

Architecture review begins with framework-neutral boundaries such as Entry, Application, Domain, Data, Integration, and Presentation. The selected preset then maps those boundaries to framework-native concepts.

For example:

| Framework-neutral concern | Laravel | NestJS | React Native |
| --- | --- | --- | --- |
| Entry boundary | Controller, Command, Job, Listener | Controller, Resolver, Gateway, message handler | Screen, deep link, notification handler |
| Application coordination | Action or Service | Provider, Service, command or query handler | Hook, feature service, use-case function, store action |
| Dependency wiring | Laravel service container | NestJS provider container | Composition, hooks, Context, factories, or an adopted DI library |
| External contract | Form Request, Resource, DTO | DTO, Pipe, interceptor | Typed API client, navigation parameters, native module specification |
| Async infrastructure | Job, event, listener, scheduler | Queue, event, scheduler, microservice transport | Background task, notification handler, native scheduler |

Preset findings are valid only when they identify a concrete conflict with the Constitution, a core architecture principle, or a correctness, security, ownership, operability, or maintainability risk.

## Pattern and Dependency Guardrails

Presets follow these rules:

- Do not require MVC in frameworks that do not use it as their natural application model.
- Do not require a dependency-injection container in React, React Native, Vue, Next.js, Nuxt, Express, or Django solely because backend frameworks use one.
- Do not require Repositories, CQRS, DTO packages, global stores, offline-first persistence, native modules, or other optional layers unless the Constitution adopts them.
- Prefer framework-native capabilities and dependencies already installed by the project.
- Treat directory names and pattern names as signals, not proof of a violation.
- Keep preference-level structure advisory unless the Constitution explicitly makes it enforceable.
- Route concrete trust-boundary and public-entrypoint risks to Security Review.

## Choosing a Preset

Choose the preset for the framework that owns the main runtime and application boundaries being governed.

Examples:

- Laravel with Inertia React: select Laravel as the backend preset and record the Inertia presentation contract during its interview.
- Standalone React SPA: select React.
- React Native mobile application: select React Native rather than standalone React.
- Nuxt application: select Nuxt rather than combining standalone Vue and a generic server preset.
- Mixed or multi-service repository: document each governed application root and apply the relevant preset to each scope.

If no built-in preset matches, continue with the technology-agnostic interview. Do not force the closest preset.

## Built-in and Custom Presets

Built-in presets ship under `presets/` and follow a shared structure:

```markdown
---
description: Apply Framework-specific architecture conventions during initialization and architecture review.
---

# Architecture Guard — Framework Adapter

## Init Interview

Framework-specific questions...

## Senior Engineering Lens

Review interpretation and guardrails...

## Boundary Mapping

Framework-native boundary equivalents...

## Framework-Specific Detection Rules

Conditional review guidance...

## Output Format

Framework-specific review summary...

## Guardrails

Patterns that must not be required automatically...
```

A custom preset should preserve the same contract where applicable. In particular:

- use `## Init Interview` for framework-specific initialization questions
- keep generic decisions separate from their framework implementation
- state when optional packages or patterns apply
- include explicit non-enforcement guardrails
- never weaken the Constitution, security rules, or core architecture review

See the [Reference Manual](reference-manual.md#global-preset-usage) for global preset usage.
