---
description: Apply NestJS-specific architecture conventions during initialization and architecture review.
---

# Architecture Guard — NestJS Architecture Adapter

## Init Interview

Ask these questions sequentially after the NestJS preset is selected. Skip questions already resolved by existing constitution context.

### Module Boundaries

Ask:

```text
How strict should module boundaries be?
```

### Inter-Module Communication

Ask:

```text
Should services communicate directly or through contracts/events?
```

### Validation Scope

Ask:

```text
Should validation be global or scoped per controller/module?
```

### Application Pattern

Ask:

```text
Which application pattern should NestJS modules follow?

- Conventional Controller → Service → Repository
- Use-case providers grouped by feature
- CQRS commands, queries, and events
- Hybrid based on module complexity
- No enforced convention
```

### Dependency Injection

Ask:

```text
How should provider dependencies and external integrations be represented?

- Concrete providers with constructor injection
- Interface-style injection tokens
- Abstract classes as tokens
- Dynamic modules for configurable infrastructure
- Existing project convention
```

### Persistence Boundary

Ask:

```text
How should database clients and repositories be owned by modules?

- ORM client directly in feature services
- Feature-owned repository providers
- Shared infrastructure module with explicit exports
- CQRS persistence adapters
```

### Async Infrastructure

Ask:

```text
Which workflows should use queues, events, schedulers, or NestJS microservice transports?
```

## Senior Engineering Lens

Apply the framework mapping with senior judgment:

- Treat directory names, layer counts, file length, and pattern names as signals, not proof. Confirm a concrete correctness, security, ownership, change-coupling, or operability cost before reporting a violation.
- Start from the Constitution and patterns already working in the repository. Do not introduce a layer, library, DTO, store, repository, or service solely because this preset lists it.
- Distinguish correctness requirements from maintainability advice. Security, trust-boundary validation, data integrity, and contract breaches may block; preference-level structure remains advisory.
- For each finding, teach the reasoning: show evidence, name the violated boundary or principle, explain the likely failure mode, propose the smallest correction, and state how to verify it.
- Evaluate tradeoffs that matter for the change, such as transaction scope, retries and idempotency, latency, state ownership, failure isolation, concurrency, and migration risk. Do not manufacture irrelevant categories.
- Apply the shared Ponytail Core decision ladder and safety floor. Prefer native framework features and installed dependencies before proposing custom infrastructure.

Use the core architecture review rules first. This adapter refines generic architecture concepts with **NestJS** conventions. It specifically focuses on Module-based encapsulation, Dependency Injection (DI) discipline, and the clear separation of Controllers, Providers, and Middlewares.

---

## Boundary Mapping

When reviewing a NestJS project, map generic architecture boundaries to NestJS primitives:

### Entry Boundary

| Generic Concept | NestJS Equivalent |
| --- | --- |
| Entry point for HTTP requests | Controllers (`@Controller()`) |
| Entry point for GraphQL | Resolvers (`@Resolver()`) |
| Entry point for WebSockets | Gateways (`@WebSocketGateway()`) |
| Entry point for Microservices | Message Handlers (`@MessagePattern()`, `@EventPattern()`) |
| Request/Response transformation | Interceptors (`@Injectable() implements NestInterceptor`) |
| Global/Route request filtering | Middlewares (`implements NestMiddleware`) |
| Authentication / Authorization | Guards (`@Injectable() implements CanActivate`) |

### Validation Boundary

| Generic Concept | NestJS Equivalent |
| --- | --- |
| Input validation and transformation | Pipes (`@Injectable() implements PipeTransform`) |
| Standard Validation | `ValidationPipe` (using `class-validator`) |
| Schema-based validation | Joi or Zod Pipes |

### Contract Boundary

| Generic Concept | NestJS Equivalent |
| --- | --- |
| Stable request shapes | DTOs (Data Transfer Objects - `class` based) |
| Stable response shapes | DTOs or GraphQL Object Types |
| Shared interfaces | TypeScript Interfaces or Abstract Classes |
| Microservice message shapes | DTOs or Protobuf definitions |

### Application Boundary

| Generic Concept | NestJS Equivalent |
| --- | --- |
| Use case coordination | Services / Providers (`@Injectable()`) |
| Business logic orchestration | CQRS Command/Query Handlers (`@CommandHandler()`) |
| Event coordination | Event Emitter (`@OnEvent()`) |

### Domain Boundary

| Generic Concept | NestJS Equivalent |
| --- | --- |
| Business rules and decisions | Pure Domain Classes (agnostic of NestJS) |
| Domain models | Entities (TypeORM, Prisma, or Sequelize) |
| Access control logic | Domain Services or Guard logic |

### Data Boundary

| Generic Concept | NestJS Equivalent |
| --- | --- |
| Persistence abstraction | Repositories (Standard or Custom `@EntityRepository()`) |
| Query building | Query Builders or Prisma Clients |
| Persistence orchestration | Modules wrapping Database Clients |

---

## NestJS-Specific Detection Rules

### Module Encapsulation (The "Exports" Rule)

Detect when:
- A service from `Module A` is injected into `Module B` without being listed in `Module A`'s `exports` array.
- Circular dependencies are handled via `forwardRef()` without a documented architectural reason (this often indicates poor boundary design).
- Global modules (`@Global()`) are used excessively to bypass explicit importing.

### Fat Controllers

Detect when a controller:
- Directly performs database operations (e.g., using `this.repo.save()`).
- Coordinates complex business logic across multiple services.
- Manually handles HTTP status codes and error messages based on business logic (this should be in Interceptors or Exceptions).

**Acceptable in controllers:**
- Using `@Body()`, `@Query()`, `@Param()` to extract data.
- Calling a single Service/Handler method.
- Using `@UseGuards()`, `@UseInterceptors()`, or `@UsePipes()`.

### Dependency Injection Discipline

Detect when:
- A service uses `new ServiceName()` to instantiate another service instead of using constructor injection.
- Providers are "leaked" via global variables or static methods.
- Services are injected with a broader scope than necessary (e.g., Request scope when Singleton is sufficient).

### DTO and Validation Discipline [Focus: api]

Detect when:
- `@Body()` is typed as `any`, `Record<string, any>`, or a raw interface (Interfaces are removed at runtime, making `ValidationPipe` ineffective).
- Runtime validation is missing at an external boundary. Use the project's configured ValidationPipe and validation library; do not add class-validator solely because this preset mentions it.
- The API exposes persistence-only or sensitive fields, or lacks a stable response contract. Reuse an existing response DTO or explicit mapping when needed.

### Exception Handling Boundary

Detect when:
- Business logic throws raw `Error` objects instead of specialized `HttpException` or `RpcException` classes.
- Controllers use `try/catch` for flow control instead of using global **Exception Filters**.

---

## Common NestJS Anti-Patterns to Flag

### 1. Fat Controller (Logic Leakage)

```typescript
// ❌ Controller handles business decisions
@Post()
async create(@Body() dto: CreateUserDto) {
  const existing = await this.userRepo.findOne({ email: dto.email });
  if (existing) throw new BadRequestException('User exists');
  // ... more logic
  return this.userRepo.save(dto);
}
```

```typescript
// ✅ Controller delegates
@Post()
async create(@Body() dto: CreateUserDto) {
  return this.userService.register(dto);
}
```

### 2. DI Bypass

```typescript
// ❌ Creating instances manually
@Injectable()
export class OrderService {
  private readonly logger = new MyLogger(); // Bypasses DI
}
```

---

## Output Format

When this adapter is active, the architecture review should include a **NestJS Conventions** section:

```text
NestJS Conventions:
- Encapsulation: [Strict / Leaky / Global] — [exports/imports check]
- Controller Responsibility: [Delegated / Fat / Mixed]
- DI Pattern: [Constructor-based / Bypassed / Static]
- DTO Discipline: [Strict / Weak / Missing]
- Module Boundaries: [Clear / Circular / Tangled]
```

---

## Guardrails

- Do not flag standard NestJS patterns (Guards, Interceptors) as violations unless they contradict the Constitution.
- Do not require CQRS unless the Constitution adopts it.
- The Constitution is the final authority. This adapter provides NestJS context, not overrides.
