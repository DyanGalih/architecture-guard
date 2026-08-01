---
description: Apply Express-specific architecture conventions during initialization and architecture review.
---

# Architecture Guard — Express.js Architecture Adapter

## Init Interview

Ask these questions sequentially after the Express preset is selected. Skip questions already resolved by existing constitution context.

### Application Architecture

Ask:

```text
How should the Express application be organized?

- Routes → Controllers → Services
- Routes → Controllers → Services → Repositories
- Feature-oriented modules
- Minimal route handlers for simple endpoints
- Hybrid based on complexity
```

### Dependency Wiring

Ask:

```text
How should dependencies be wired?

- Explicit factory functions
- Constructor injection
- Request or application locals
- A project-adopted DI container
- Direct imports for stateless infrastructure
```

Express has no built-in DI container. Do not introduce one without a demonstrated lifecycle, substitution, or testing need.

### Contracts and Validation

Ask:

```text
Which schema system should validate requests and define API contracts?

- Zod
- Joi
- express-validator
- JSON Schema or OpenAPI
- Existing project convention
```

### Persistence and Transactions

Ask:

```text
Which ORM or database client is used, who owns queries, and where are transaction boundaries coordinated?
```

### Async Infrastructure

Ask:

```text
Which work requires queues, workers, schedulers, or event processing outside the HTTP request?
```

## Senior Engineering Lens

Apply the framework mapping with senior judgment:

- Treat directory names, layer counts, file length, and pattern names as signals, not proof. Confirm a concrete correctness, security, ownership, change-coupling, or operability cost before reporting a violation.
- Start from the Constitution and patterns already working in the repository. Do not introduce a layer, library, DTO, store, repository, or service solely because this preset lists it.
- Distinguish correctness requirements from maintainability advice. Security, trust-boundary validation, data integrity, and contract breaches may block; preference-level structure remains advisory.
- For each finding, teach the reasoning: show evidence, name the violated boundary or principle, explain the likely failure mode, propose the smallest correction, and state how to verify it.
- Evaluate tradeoffs that matter for the change, such as transaction scope, retries and idempotency, latency, state ownership, failure isolation, concurrency, and migration risk. Do not manufacture irrelevant categories.
- Apply the shared Ponytail Core decision ladder and safety floor. Prefer native framework features and installed dependencies before proposing custom infrastructure.

Use the core architecture review rules first. This adapter refines generic architecture concepts with **Express.js** conventions. Because Express is unopinionated, this adapter recognizes Controller, Service, and Repository boundaries when the repository or feature complexity justifies them; it does not require all three layers for simple routes.

---

## Boundary Mapping

When reviewing an Express project, map generic architecture boundaries to Express primitives:

### Entry Boundary

| Generic Concept | Express Equivalent |
| --- | --- |
| Entry point for HTTP requests | Routes (`router.get`, `router.post`) |
| Request processing | Controllers (`export const getX = (req, res) => { ... }`) |
| Request/Response hooks | Middleware (`app.use`, `router.use`) |
| Global error handling | Error Middleware (`(err, req, res, next) => { ... }`) |

### Validation Boundary

| Generic Concept | Express Equivalent |
| --- | --- |
| Input validation | `express-validator`, `zod`, or `joi` middlewares |
| Schema enforcement | Validation middleware applied at the route level |

### Contract Boundary

| Generic Concept | Express Equivalent |
| --- | --- |
| API contracts | TypeScript Interfaces or JSON Schemas |
| Shared response shapes | Custom response wrappers or classes |

### Application Boundary

| Generic Concept | Express Equivalent |
| --- | --- |
| Shared logic coordination | Services (`src/services/`) |
| Use case orchestration | Service classes or functions |

### Domain Boundary

| Generic Concept | Express Equivalent |
| --- | --- |
| Business rules and decisions | Pure JS/TS Functions in `src/domain/` or `src/models/` |
| Domain entities | TypeScript Interfaces or Classes |

### Data Boundary

| Generic Concept | Express Equivalent |
| --- | --- |
| Persistence abstraction | Repositories (`src/repositories/`) |
| Persistence models | Mongoose Schemas, TypeORM Entities, Sequelize Models |
| Database Migration | Knex Migrations, TypeORM Migrations, etc. |

---

## Express-Specific Detection Rules

### Fat Route Handlers (Anti-Pattern: Spaghetti Routes)

Detect when a route handler (the function passed to `router.get` or `app.post`):
- Directly performs database queries (e.g., `await User.find()`).
- Contains business logic calculations or multi-step domain workflows.
- Directly handles low-level error formatting.

**Acceptable in route handlers (Controllers):**
- Extracting `req.params`, `req.query`, and `req.body`.
- Calling a Service function/method.
- Sending the response with `res.status().json()`.

### Missing Validation Middleware [Focus: api]

Detect when:
- A Controller uses `req.body` directly without a preceding validation middleware.
- Validation logic is written inside the Controller body instead of a separate middleware.

### Global Error Handling Boundary

Detect when:
- Controllers use `try/catch` to manually send `res.status(500)` instead of calling `next(err)`.
- **Recommendation**: Prefer centralized error middleware when error translation is repeated or must stay contract-consistent. A small local handler is acceptable when it is the existing project convention and preserves the same contract.

### Middleware Responsibility

Detect when:
- Middleware performs database writes or complex business logic (Middleware should be for cross-cutting concerns: Auth, Logging, Parsing).
- Middleware modifies `req` in a way that is not documented in the shared context.

---

## Common Express Anti-Patterns to Flag

### 1. Spaghetti Route (Mixed Concerns)

```javascript
// ❌ Route handles everything
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send('Missing data');
  const user = await User.findOne({ email });
  if (user) return res.status(400).send('Exists');
  const newUser = await User.create({ email, password });
  await sendEmail(email);
  res.status(201).json(newUser);
});
```

```javascript
// ✅ Route delegates to Controller, which delegates to Service
router.post('/register', validateRegister, userController.register);

// controller.js
export const register = async (req, res, next) => {
  try {
    const user = await userService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};
```

---

## Output Format

When this adapter is active, the architecture review should include an **Express Conventions** section:

```text
Express Conventions:
- Route Logic: [Clean-Controllers / Spaghetti / Mixed]
- Error Handling: [Centralized / Scattered / Manual]
- Logic Isolation: [Service-based / Controller-heavy]
- Validation Pattern: [Middleware-based / Inline / Missing]
```

---

## Guardrails

- Do not flag standard Express practices (using Middlewares, simple routers).
- Do not require a full Class-based architecture unless the Constitution requires it.
- The Constitution is the final authority. This adapter provides Express context, not overrides.
