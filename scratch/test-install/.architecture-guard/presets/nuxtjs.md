---
description: Apply Nuxt-specific architecture conventions during initialization and architecture review.
---

# Architecture Guard — Nuxt.js Architecture Adapter

## Init Interview

Ask these questions sequentially after the Nuxt preset is selected. Skip questions already resolved by existing constitution context.

### Composable Boundaries

Ask:

```text
How should composables be organized and scoped?
```

### API Access

Ask:

```text
How should API access be abstracted?
```

### Application Organization

Ask:

```text
How should Nuxt application logic be divided among pages, components, composables, stores, and server modules?
```

### Dependency Provisioning

Ask:

```text
How should shared clients and infrastructure dependencies be provided?

- Nuxt plugins and injection
- Explicit imports from server or client modules
- Composable factories
- Existing project convention
```

### State and Data Ownership

Ask:

```text
Which state belongs in component state, composables, Pinia, useState, or server-side persistence?
```

### Server Infrastructure

Ask:

```text
Where should database access, secrets, server integrations, caching, and background work live?
```

## Senior Engineering Lens

Apply the framework mapping with senior judgment:

- Treat directory names, layer counts, file length, and pattern names as signals, not proof. Confirm a concrete correctness, security, ownership, change-coupling, or operability cost before reporting a violation.
- Start from the Constitution and patterns already working in the repository. Do not introduce a layer, library, DTO, store, repository, or service solely because this preset lists it.
- Distinguish correctness requirements from maintainability advice. Security, trust-boundary validation, data integrity, and contract breaches may block; preference-level structure remains advisory.
- For each finding, teach the reasoning: show evidence, name the violated boundary or principle, explain the likely failure mode, propose the smallest correction, and state how to verify it.
- Evaluate tradeoffs that matter for the change, such as transaction scope, retries and idempotency, latency, state ownership, failure isolation, concurrency, and migration risk. Do not manufacture irrelevant categories.
- Apply the shared Ponytail Core decision ladder and safety floor. Prefer native framework features and installed dependencies before proposing custom infrastructure.

Use the core architecture review rules first. This adapter refines generic architecture concepts with **Nuxt 3/4** conventions. It focuses on Nitro server boundaries, Composable discipline, and the unique directory-based auto-import system.

---

## Boundary Mapping

When reviewing a Nuxt project, map generic architecture boundaries to Nuxt primitives:

### Entry Boundary

| Generic Concept | Nuxt Equivalent |
| --- | --- |
| Entry point for HTTP requests | Pages (`pages/`) |
| Entry point for API / Server Routes | Server Routes (`server/api/`, `server/routes/`) |
| Entry point for Server Hooks | Nitro Tasks / Server Plugins |
| Route request filtering | Middleware (`middleware/` or `server/middleware/`) |
| Layout/Container entry | Layouts (`layouts/`) |

### Validation Boundary

| Generic Concept | Nuxt Equivalent |
| --- | --- |
| Server input validation | `readBody` validation in Nitro or `h3` utilities |
| Frontend validation | Zod/VeeValidate in components or composables |
| Server query validation | `getQuery` validation in Nitro |

### Contract Boundary

| Generic Concept | Nuxt Equivalent |
| --- | --- |
| Stable request/response shapes | TypeScript Interfaces (often shared via `types/` or `server/utils`) |
| Auto-generated types | Nitro `internal` types (ensure they aren't leaked improperly) |

### Application Boundary

| Generic Concept | Nuxt Equivalent |
| --- | --- |
| Shared logic coordination | Composables (`composables/`) or Plugins |
| Server-side coordination | Server Utils (`server/utils/`) |
| Use case orchestration | Server Routes (delegating to server utils) |

### Domain Boundary

| Generic Concept | Nuxt Equivalent |
| --- | --- |
| Business rules and decisions | Utilities (`utils/`) or specialized domain folders |
| Domain models | TypeScript Entities |

### Data Boundary

| Generic Concept | Nuxt Equivalent |
| --- | --- |
| Persistence abstraction | Server-side Data Access (calling DB from `server/utils`) |
| Server storage | Nitro Storage layer |
| Fetching client | `$fetch` or `useFetch` with interceptors |

---

## Nuxt-Specific Detection Rules

### Nitro Server Discipline (The Server/Client Boundary)

Detect when:
- A frontend component or Composable attempts to import from `server/` (this is impossible at runtime but check for shared type leakage).
- Sensitive logic (secret keys, complex permissions) is placed in `composables/` or `utils/` (which are bundled to the client) instead of `server/utils/`.
- Large business workflows are implemented directly inside an `eventHandler` in `server/api/`.

### Composable Discipline

Detect when:
- A Composable is "Fat" (e.g., handles Auth, Data Fetching, and UI state all in one `useAuth()` hook).
- Composables are used to store global state instead of using **Pinia** (if Pinia is adopted in the Constitution).
- Composables have side effects that aren't properly cleaned up (e.g., event listeners without `onUnmounted`).

### Auto-Import Clarity

Detect when:
- Multiple functions with the same name exist in different directories (e.g., `utils/format.ts` and `composables/format.ts`), causing auto-import confusion.
- Third-party libraries are used without proper Nuxt plugin integration when the Constitution requires it.

### Missing Validation Boundary [Focus: api]

Detect when:
- Nitro routes consume untrusted body data without immediate runtime validation. Reuse the project's existing validator or native validated-body pattern; do not add a schema library solely for this finding.
- Server routes return raw Database objects instead of transformed Response shapes.

---

## Common Nuxt Anti-Patterns to Flag

### 1. Fat Server Route (Logic Leakage)

```typescript
// ❌ Server route handles DB and logic
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const user = await db.user.create({ data: body })
  await sendEmail(user.email)
  return user
})
```

```typescript
// ✅ Server route delegates to server util
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, userSchema.parse)
  return userService.register(body)
})
```

### 2. Leaky Utils

```typescript
// ❌ Sensitive logic in utils/ (bundled to client)
export const calculateTaxSecretly = (amount: number) => {
  const secretKey = '12345' // LEAKED
  return amount * 0.2
}
```

---

## Output Format

When this adapter is active, the architecture review should include a **Nuxt Conventions** section:

```text
Nuxt Conventions:
- Nitro Separation: [Clear / Leaky / Fat Routes]
- Composable Logic: [Focused / God-Composables / State-Heavy]
- Directory Discipline: [Standard / Non-standard / Tangled]
- Server-side Validation: [Strict / Weak / Missing]
```

---

## Guardrails

- Do not flag auto-imports as "missing imports" (this is the Nuxt way).
- Do not require a separate Service layer for simple Nitro endpoints.
- The Constitution is the final authority. This adapter provides Nuxt context, not overrides.
