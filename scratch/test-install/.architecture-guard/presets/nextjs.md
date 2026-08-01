---
description: Apply Next.js-specific architecture conventions during initialization and architecture review.
---

# Architecture Guard — Next.js Architecture Adapter

## Init Interview

Ask these questions sequentially after the Next.js preset is selected. Skip questions already resolved by existing constitution context.

### Component Boundaries

Ask:

```text
How should Server and Client Component boundaries be enforced?
```

### Server Action Delegation

Ask:

```text
Should Server Actions delegate to domain or service layers?
```

### Server Action Validation

Ask:

```text
How should Server Action inputs be validated?
```

### Application Organization

Ask:

```text
How should application and domain logic be organized outside pages, layouts, Route Handlers, and Server Actions?

- Feature-oriented modules
- Services or use-case functions
- Domain modules
- Colocated logic for simple features
- Hybrid based on complexity
```

### Data Access Boundary

Ask:

```text
Where may database and external API access occur?

- Server Components and server-only modules
- Server Actions or Route Handlers delegating to services
- Dedicated repositories or data-access modules
- Hybrid with an explicit server-only boundary
```

### Dependency Wiring

Ask:

```text
How should server-side dependencies be wired?

- Explicit function parameters
- Module factories
- A project-adopted DI container
- Direct imports for stateless infrastructure
- No enforced convention
```

Do not introduce a DI container solely because other backend frameworks use one.

### Background Infrastructure

Ask:

```text
Which operations require a queue, workflow service, scheduled job, or external worker instead of a request-bound Server Action or Route Handler?
```

## Senior Engineering Lens

Apply the framework mapping with senior judgment:

- Treat directory names, layer counts, file length, and pattern names as signals, not proof. Confirm a concrete correctness, security, ownership, change-coupling, or operability cost before reporting a violation.
- Start from the Constitution and patterns already working in the repository. Do not introduce a layer, library, DTO, store, repository, or service solely because this preset lists it.
- Distinguish correctness requirements from maintainability advice. Security, trust-boundary validation, data integrity, and contract breaches may block; preference-level structure remains advisory.
- For each finding, teach the reasoning: show evidence, name the violated boundary or principle, explain the likely failure mode, propose the smallest correction, and state how to verify it.
- Evaluate tradeoffs that matter for the change, such as transaction scope, retries and idempotency, latency, state ownership, failure isolation, concurrency, and migration risk. Do not manufacture irrelevant categories.
- Apply the shared Ponytail Core decision ladder and safety floor. Prefer native framework features and installed dependencies before proposing custom infrastructure.

Use the core architecture review rules first. This adapter refines generic architecture concepts with **Next.js (App Router)** conventions. It specifically focuses on the React Server Component (RSC) boundary, Server Action orchestration, and data fetching isolation.

---

## Boundary Mapping

When reviewing a Next.js project, map generic architecture boundaries to Next.js primitives:

### Entry Boundary

| Generic Concept | Next.js Equivalent |
| --- | --- |
| Entry point for HTTP requests | Pages (`page.tsx`) |
| Entry point for API / Webhooks | Route Handlers (`route.ts`) |
| Entry point for user actions | Server Actions (`'use server'`) |
| Entry point for layout/nesting | Layouts (`layout.tsx`) |
| Global request filtering | Middleware (`middleware.ts`) |
| Client-side entry points | Client Components (`'use client'`) |

### Validation Boundary

| Generic Concept | Next.js Equivalent |
| --- | --- |
| Input validation | Zod / Yup / Valibot schemas |
| Server Action validation | Schema parsing inside the Action or `zsa` / `next-safe-action` |
| Route Handler validation | Schema parsing of `request.json()` or `searchParams` |

### Contract Boundary

| Generic Concept | Next.js Equivalent |
| --- | --- |
| Stable request shapes | Zod Schemas or TypeScript Interfaces |
| Stable response shapes | Route Handler return types or Server Action return types |
| Component contracts | Component Props (TypeScript interfaces) |

### Application Boundary

| Generic Concept | Next.js Equivalent |
| --- | --- |
| Use case coordination | Service Layer (`lib/services/`) or Server Actions |
| Data loading coordination | Server Components (calling data access layers) |
| Revalidation logic | `revalidatePath`, `revalidateTag` |

### Domain Boundary

| Generic Concept | Next.js Equivalent |
| --- | --- |
| Business rules and decisions | Pure Domain Functions (agnostic of Next.js) |
| Domain models | TypeScript Entities or Database Models |

### Data Boundary

| Generic Concept | Next.js Equivalent |
| --- | --- |
| Persistence abstraction | Data Access Layer (DAL - `lib/data/`) |
| Query building | Prisma, Drizzle, or Kysely clients |
| Cache management | `unstable_cache`, `fetch` cache options |

### Presentation Boundary

| Generic Concept | Next.js Equivalent |
| --- | --- |
| Server-rendered UI | React Server Components (RSC) |
| Client-side interactivity | Client Components (`'use client'`) |
| Global state | Context Providers or Zustand/Jotai stores |
| Meta information | `metadata` exports or `generateMetadata()` |

---

## Next.js-Specific Detection Rules

### The RSC vs. Client Boundary

Detect when:
- A Client Component (`'use client'`) contains heavy business logic or performs direct database queries (impossible by design, but check for "leaky" abstractions).
- Sensitive data is passed from an RSC to a Client Component without filtering (e.g., passing a full `user` object with a hashed password).
- An RSC is marked as `'use client'` unnecessarily, increasing bundle size.

### Server Action Responsibility

Detect when:
- Server Actions own reused business decisions, transactions, or multi-step workflows that deserve an existing application or domain boundary; do not create a Service solely to shorten an otherwise cohesive action.
- Server Actions are used for "data fetching" instead of RSCs (Server Actions are for mutations).
- Server Actions lack proper error handling, leaking raw server errors to the client.

### Data Fetching Isolation [Focus: db]

Detect when:
- Client Components import database clients, or repeated/security-sensitive RSC queries lack a clear ownership boundary. A simple colocated server-only read is acceptable when it is not duplicated and does not leak data.
- Database queries are duplicated across multiple `page.tsx` files instead of being in a shared `lib/data/` file.
- `unstable_cache` is used without clear tags, making revalidation difficult.

### Missing Validation Boundary [Focus: api]

Detect when:
- Server Actions use `formData.get()` directly without parsing via a schema (e.g., Zod).
- Route Handlers process `request.json()` without validation.
- `searchParams` are used in Pages without type-safe parsing.

---

## Common Next.js Anti-Patterns to Flag

### 1. Database Leak in Component

```tsx
// ❌ RSC handles raw DB query
export default async function Page() {
  const users = await prisma.user.findMany({ ... }); // Direct DB access
  return <UserList users={users} />;
}
```

```tsx
// ✅ RSC calls DAL
import { getUsers } from "@/lib/data/users";

export default async function Page() {
  const users = await getUsers();
  return <UserList users={users} />;
}
```

### 2. Massive Server Action

```tsx
// ❌ Action owns the entire workflow
'use server'
export async function updateProfile(data: any) {
  const validated = schema.parse(data);
  const user = await db.user.update({ ... });
  await sendEmail(user.email);
  await logAction(user.id);
  revalidatePath('/profile');
}
```

---

## Output Format

When this adapter is active, the architecture review should include a **Next.js Conventions** section:

```text
Next.js Conventions:
- RSC Boundary: [Clean / Mixed / Leaky] — [prop check]
- Data Fetching: [DAL-based / Component-based / Mixed]
- Server Actions: [Coordinators / Logic-Heavy / Missing Validation]
- Bundle Optimization: [Optimized / Heavy Client-side]
```

---

## Guardrails

- Do not flag Next.js-specific optimizations (cache, prefetch) as violations.
- Do not require a separate Service layer if the project is a simple blog or marketing site.
- The Constitution is the final authority. This adapter provides Next.js context, not overrides.
