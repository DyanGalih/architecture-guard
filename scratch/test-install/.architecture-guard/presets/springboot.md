---
description: Apply Spring Boot-specific architecture conventions during initialization and architecture review.
---

# Architecture Guard — Spring Boot Architecture Adapter

## Init Interview

Ask these questions sequentially after the Spring Boot preset is selected. Skip questions already resolved by existing constitution context.

### Application Architecture

Ask:

```text
Which architecture should the Spring Boot application follow?

- Conventional Controller → Service → Repository
- Package-by-feature layered architecture
- Hexagonal or Ports and Adapters
- Domain-driven modular monolith
- CQRS or event-driven modules
- Hybrid based on complexity
```

### Dependency Injection

Ask:

```text
How should dependencies be injected and configured?

- Constructor injection with concrete beans
- Constructor injection through interfaces or ports
- Configuration classes with explicit @Bean methods
- Existing project convention
```

### DTO and Mapping Strategy

Ask:

```text
How should API DTOs, domain objects, and persistence entities be separated and mapped?

- Manual mapping
- Dedicated mapper classes
- MapStruct
- Records with explicit factories
- No separation for approved simple internal CRUD
```

### Persistence and Transactions

Ask:

```text
Which persistence abstraction is used, and which application or service methods own transaction boundaries?
```

### Security and Async Infrastructure

Ask:

```text
How should Spring Security authorization be expressed, and which work belongs in events, messaging, @Async, or scheduled jobs?
```

## Senior Engineering Lens

Apply the framework mapping with senior judgment:

- Treat directory names, layer counts, file length, and pattern names as signals, not proof. Confirm a concrete correctness, security, ownership, change-coupling, or operability cost before reporting a violation.
- Start from the Constitution and patterns already working in the repository. Do not introduce a layer, library, DTO, store, repository, or service solely because this preset lists it.
- Distinguish correctness requirements from maintainability advice. Security, trust-boundary validation, data integrity, and contract breaches may block; preference-level structure remains advisory.
- For each finding, teach the reasoning: show evidence, name the violated boundary or principle, explain the likely failure mode, propose the smallest correction, and state how to verify it.
- Evaluate tradeoffs that matter for the change, such as transaction scope, retries and idempotency, latency, state ownership, failure isolation, concurrency, and migration risk. Do not manufacture irrelevant categories.
- Apply the shared Ponytail Core decision ladder and safety floor. Prefer native framework features and installed dependencies before proposing custom infrastructure.

Use the core architecture review rules first. This adapter refines generic architecture concepts with **Spring Boot** conventions. It specifically focuses on Layered Architecture (Controller-Service-Repository), Dependency Injection (DI) discipline, and DTO isolation.

---

## Boundary Mapping

When reviewing a Spring Boot project, map generic architecture boundaries to Spring primitives:

### Entry Boundary

| Generic Concept | Spring Equivalent |
| --- | --- |
| Entry point for HTTP requests | Controllers (`@RestController` or `@Controller`) |
| Entry point for Async Messages | Listeners (`@KafkaListener`, `@RabbitListener`, `@JmsListener`) |
| Entry point for CLI / Tasks | `CommandLineRunner` or `@Scheduled` tasks |
| Request/Response filtering | Filters (`implements Filter`) or Interceptors (`implements HandlerInterceptor`) |
| Authentication / Authorization | Spring Security Filters and `@PreAuthorize` |

### Validation Boundary

| Generic Concept | Spring Equivalent |
| --- | --- |
| Input validation | Bean Validation (`@Valid`, `@Validated`) with JSR-303/JSR-380 |
| Custom validation | `ConstraintValidator` implementations |

### Contract Boundary

| Generic Concept | Spring Equivalent |
| --- | --- |
| Stable request shapes | DTOs (Data Transfer Objects - `class` or `record`) |
| Stable response shapes | DTOs or Records |
| API Specification | OpenAPI / Swagger (`springdoc-openapi`) |

### Application Boundary

| Generic Concept | Spring Equivalent |
| --- | --- |
| Use case coordination | Services (`@Service`) |
| Shared logic coordination | Components (`@Component`) |
| Transaction orchestration | `@Transactional` (usually on Service layer) |

### Domain Boundary

| Generic Concept | Spring Equivalent |
| --- | --- |
| Business rules and decisions | Pure Domain Entities or Domain Services |
| Domain models | JPA Entities (`@Entity`) or POJOs |

### Data Boundary

| Generic Concept | Spring Equivalent |
| --- | --- |
| Persistence abstraction | Repositories (`@Repository` / `extends JpaRepository`) |
| Query building | QueryDSL, Specification API, or JPQL/Native queries |
| Database Migration | Flyway or Liquibase |

---

## Spring Boot-Specific Detection Rules

### Field Injection vs. Constructor Injection

Detect when:
- A class uses `@Autowired` on private fields (Field Injection).
- **Recommendation**: Use **Constructor Injection** (or `@RequiredArgsConstructor` with Lombok) to improve testability and ensure immutability.

### Entity Leakage (Boundary Violation) [Focus: api]

Detect when:
- A Controller method returns a class marked with `@Entity` directly.
- A Controller method accepts an `@Entity` as a `@RequestBody`.
- **Recommendation**: Reuse the project's existing DTO or record mapping style. Prefer a small manual mapping when sufficient; do not add MapStruct solely for this correction.

### Fat Controllers

Detect when a controller:
- Directly calls a Repository (e.g., `userRepository.save(user)`).
- Contains business logic calculations or complex conditional routing.
- Directly handles `EntityNotFoundException` instead of using an `@ExceptionHandler`.

**Acceptable in controllers:**
- Calling a single Service method.
- Mapping DTOs to internal objects (though mapping logic is better in a Mapper).
- Returning `ResponseEntity`.

### Transaction Boundary Discipline [Focus: db]

Detect when:
- `@Transactional` is used on a Repository (it should be on the Service/Application layer).
- A Service method calls another method in the same class marked with `@Transactional` (Self-invocation bypasses the proxy).
- Heavy external calls (HTTP/Third-party) are performed inside a `@Transactional` block.

### Bean Scoping and Global State

Detect when:
- A `@Service` or `@Component` maintains mutable instance variables (Beans are singletons by default and must be stateless).
- Static utilities hide stateful dependencies or mutable coordination. Pure stateless domain functions are acceptable and should not be converted to Beans without a lifecycle or dependency reason.

---

## Common Spring Boot Anti-Patterns to Flag

### 1. Field Injection (Hard to Test)

```java
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository; // ❌ Field injection
}
```

```java
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository; // ✅ Constructor injection
}
```

### 2. Leaking Entity to REST

```java
@GetMapping("/{id}")
public User getUser(@PathVariable Long id) {
    return userRepository.findById(id).get(); // ❌ Returns @Entity directly
}
```

```java
@GetMapping("/{id}")
public UserResponseDTO getUser(@PathVariable Long id) {
    User user = userService.findById(id);
    return userMapper.toResponse(user); // ✅ Returns DTO
}
```

---

## Output Format

When this adapter is active, the architecture review should include a **Spring Boot Conventions** section:

```text
Spring Boot Conventions:
- Injection Pattern: [Constructor / Field / Mixed]
- REST Boundary: [DTO-based / Entity-Leaky / Mixed]
- Transactional Discipline: [Service-layer / Misplaced / Missing]
- Bean State: [Stateless / Mutable-Beans / Mixed]
- Controller Thickness: [Thin / Fat / Repository-Direct]
```

---

## Guardrails

- Do not flag standard Spring features (Spring Security, Spring Data) as violations.
- Do not require a global ExceptionHandler for tiny projects.
- The Constitution is the final authority. This adapter provides Spring Boot context, not overrides.
