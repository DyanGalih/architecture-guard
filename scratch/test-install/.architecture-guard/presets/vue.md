---
description: Apply Vue-specific architecture conventions during initialization and architecture review.
---

# Architecture Guard — Vue (Standalone) Architecture Adapter

## Init Interview

Ask these questions sequentially after the Vue preset is selected. Skip questions already resolved by existing constitution context.

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

### Component Architecture

Ask:

```text
How should presentation, feature orchestration, and reusable business logic be separated?

- Components plus composables
- Feature modules
- Container and presentational components
- Hybrid based on complexity
```

### Dependency Provisioning

Ask:

```text
How should shared dependencies be provided?

- Explicit imports
- provide/inject
- Composable factories
- A project-adopted DI library
- No enforced convention
```

Do not introduce a DI container solely to imitate a backend framework.

### State and Data Ownership

Ask:

```text
Which state belongs locally, in composables, in Pinia, or in server-state tooling?
```

### API Infrastructure

Ask:

```text
How should API clients, caching, retries, authentication refresh, and error translation be centralized?
```

## Senior Engineering Lens

Apply the framework mapping with senior judgment:

- Treat directory names, layer counts, file length, and pattern names as signals, not proof. Confirm a concrete correctness, security, ownership, change-coupling, or operability cost before reporting a violation.
- Start from the Constitution and patterns already working in the repository. Do not introduce a layer, library, DTO, store, repository, or service solely because this preset lists it.
- Distinguish correctness requirements from maintainability advice. Security, trust-boundary validation, data integrity, and contract breaches may block; preference-level structure remains advisory.
- For each finding, teach the reasoning: show evidence, name the violated boundary or principle, explain the likely failure mode, propose the smallest correction, and state how to verify it.
- Evaluate tradeoffs that matter for the change, such as transaction scope, retries and idempotency, latency, state ownership, failure isolation, concurrency, and migration risk. Do not manufacture irrelevant categories.
- Apply the shared Ponytail Core decision ladder and safety floor. Prefer native framework features and installed dependencies before proposing custom infrastructure.

Use the core architecture review rules first. This adapter refines generic architecture concepts with **Vue 3 (Composition API)** conventions. It specifically focuses on `<script setup>` discipline, Composable boundaries, and Pinia store usage.

---

## Boundary Mapping

When reviewing a Vue project, map generic architecture boundaries to Vue primitives:

### Entry Boundary

| Generic Concept | Vue Equivalent |
| --- | --- |
| Entry point for HTTP routing | Page Components (`src/pages/` or `src/views/`) |
| Entry point for User Events | Event Handlers (`@click`, etc.) in components |
| Route request filtering | Router Guards (`router.beforeEach`) |
| Layout/Container entry | Layout Components (`src/layouts/`) |

### Validation Boundary

| Generic Concept | Vue Equivalent |
| --- | --- |
| Form validation | VeeValidate, Vuelidate, or Zod schemas |
| Input transformation | Computed setters or manual state mapping |

### Contract Boundary

| Generic Concept | Vue Equivalent |
| --- | --- |
| Component contracts | `defineProps` (TypeScript Interfaces) |
| Event contracts | `defineEmits` |
| API contracts | DTO Interfaces for Request/Response |
| Shared state shapes | Pinia Store Interfaces |

### Application Boundary

| Generic Concept | Vue Equivalent |
| --- | --- |
| Shared logic coordination | Composables (`src/composables/`) |
| Use case orchestration | Logic-heavy Composables or Service classes |
| Global state coordination | Pinia Actions |

### Domain Boundary

| Generic Concept | Vue Equivalent |
| --- | --- |
| Business rules and decisions | Pure JS/TS Functions in `src/domain/` or `src/utils/` |
| Domain entities | TypeScript Types or Classes |

### Data Boundary

| Generic Concept | Vue Equivalent |
| --- | --- |
| Persistence abstraction | API Clients (`src/api/` or `src/services/`) |
| Data fetching layer | Vue Query (TanStack Query) or custom fetch composables |

### Presentation Boundary

| Generic Concept | Vue Equivalent |
| --- | --- |
| Pure UI Components | Base Components (`src/components/base/`) |
| Composed UI | Page Components or Feature Components |
| Global UI State | Provide/Inject for theme/UI context |

---

## Vue-Specific Detection Rules

### Fat `<script setup>` (Logic Leakage)

Detect when a component script:
- Owns business decisions, complex transformations, or multi-step workflows that change for reasons unrelated to rendering.
- Directly uses `fetch` or `axios` (this should be in a Service or Composable).
- Manually handles multi-step domain workflows.

**Acceptable in components:**
- Reactive state (`ref`, `reactive`).
- Simple computed properties for UI state.
- Calling a single Composable or Store action.

### Mutable Props (Boundary Violation)

Detect when:
- A component attempts to mutate a prop directly (Vue will warn, but check for indirect mutation attempts like assigning a prop to a `ref` and mutating the `ref` without a watcher/event).
- **Recommendation**: Use the **Props Down, Events Up** (One-way data flow) pattern.

### Business Logic in Templates

Detect when:
- Templates contain complex ternary logic or function calls with side effects.
- **Recommendation**: Move the logic to a **Computed Property**.

### Direct Store Mutation [Focus: db]

Detect when:
- Components directly mutate a Pinia store's state instead of calling an **Action** (if the Constitution requires explicit actions).
- **Recommendation**: Keep store state private/readonly to components and expose modification via Actions.

---

## Common Vue Anti-Patterns to Flag

### 1. Fat script setup (Mixed Concerns)

```vue
<script setup>
// ❌ Component handles UI and API logic
const users = ref([])

onMounted(async () => {
  const res = await fetch('/api/users')
  const data = await res.json()
  // complex filtering logic...
  users.value = data.filter(u => u.active)
})
</script>
```

```vue
<script setup>
// ✅ Component delegates to Composable
import { useUsers } from "@/composables/useUsers"
const { users, isLoading } = useUsers() // Logic is here
</script>
```

### 2. Logic in Template

```html
<!-- ❌ Complex logic in template -->
<div v-if="user.isMember && (order.total > 100 || user.hasCoupon)">
  Free Shipping!
</div>
```

```javascript
// ✅ Logic in Computed
const qualifiesForFreeShipping = computed(() => {
  return user.value.isMember && (order.value.total > 100 || user.value.hasCoupon)
})
```

---

## Output Format

When this adapter is active, the architecture review should include a **Vue Conventions** section:

```text
Vue Conventions:
- Script Setup Discipline: [Focused / Fat / Mixed]
- State Flow: [Props-Down-Events-Up / Mutable-Props / Leaky]
- Template Logic: [Declarative / Imperative / Heavy]
- Logic Isolation: [Composable-driven / Component-heavy]
```

---

## Guardrails

- Do not flag Vue-specific reactivity helpers (`watch`, `watchEffect`) as violations.
- Do not require Pinia for simple component-only state.
- The Constitution is the final authority. This adapter provides Vue context, not overrides.
