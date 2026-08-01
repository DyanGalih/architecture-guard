---
description: Apply Laravel-specific architecture conventions during initialization and architecture review.
---

# Architecture Guard — Laravel Adapter

## Init Interview

Ask these questions sequentially after the Laravel preset is selected. Skip questions that are irrelevant to the application style or already answered by existing constitution context.

### Application Style

Ask:

```text
What application style are you using?

- REST API
- Inertia
- Livewire
- API + SPA
```

### Business Logic Placement

Ask:

```text
Where should business logic live?

- Services
- Actions
- Domain layer
- Models
- Hybrid
```

### Validation Strategy

Ask:

```text
How should validation be handled?

- Form Requests
- DTO validation
- Inline validation
```

### Use-Case Invocation Style

Ask:

```text
How should single-purpose application operations be implemented?

- Invokable Action classes (`__invoke`)
- Named methods on Action classes
- Multi-method Service classes
- No enforced convention
```

Treat this as the use-case invocation style. Do not infer that every controller must be a single-action controller.

### DTO Strategy

Ask:

```text
How should DTOs be implemented?

- spatie/laravel-data
- Custom immutable PHP DTOs
- Form Requests and API Resources only
- No enforced DTO convention
```

Record the selected implementation, but do not install a package during init.

### Authorization Strategy

Ask:

```text
How should roles and permissions be implemented?

- spatie/laravel-permission, with Gates or Policies for resource-level authorization where needed
- Native Laravel Gates and Policies
- Custom authorization implementation
- Authentication only / authorization not currently required
```

Do not treat role and permission assignment as a replacement for resource-level authorization.

### Inertia Contract Strategy

If the application style is Inertia, ask:

```text
How should PHP → frontend contracts be protected?

- DTOs
- API Resources
- TypeScript interfaces
- Explicit field mapping
```

### Application Architecture

Ask:

```text
How should the Laravel application be organized?

- Standard Laravel MVC with thin controllers
- MVC with Actions or Services for use cases
- Domain-oriented or modular architecture
- Hybrid based on feature complexity
- No enforced convention
```

### Dependency Resolution

Ask:

```text
How should application dependencies be resolved?

- Constructor injection through Laravel's service container
- Contracts bound to implementations in service providers
- Facades for framework infrastructure and injection for application services
- Existing project convention
- No enforced convention
```

Do not require interfaces for every class. Bind contracts where substitution, boundary ownership, or testing requires them.

### Persistence and Transactions

Ask:

```text
How should persistence and transaction boundaries be handled?

- Direct Eloquent in Actions or Services
- Repository contracts
- Query objects or scoped Eloquent queries
- Hybrid based on query complexity

Where should multi-write transactions be coordinated?
```

### Async Infrastructure

Ask:

```text
Which work must use Jobs, events, listeners, or scheduled commands instead of blocking an HTTP request?
```

## Senior Engineering Lens

Apply the framework mapping with senior judgment:

- Treat directory names, layer counts, file length, and pattern names as signals, not proof. Confirm a concrete correctness, security, ownership, change-coupling, or operability cost before reporting a violation.
- Start from the Constitution and patterns already working in the repository. Do not introduce a layer, library, DTO, store, repository, or service solely because this preset lists it.
- Distinguish correctness requirements from maintainability advice. Security, trust-boundary validation, data integrity, and contract breaches may block; preference-level structure remains advisory.
- For each finding, teach the reasoning: show evidence, name the violated boundary or principle, explain the likely failure mode, propose the smallest correction, and state how to verify it.
- Evaluate tradeoffs that matter for the change, such as transaction scope, retries and idempotency, latency, state ownership, failure isolation, concurrency, and migration risk. Do not manufacture irrelevant categories.
- Apply the shared Ponytail Core decision ladder and safety floor. Prefer native framework features and installed dependencies before proposing custom infrastructure.

Use the core architecture review rules first. This adapter refines generic architecture concepts with Laravel-specific conventions.

Do not report a Laravel convention as a violation unless it conflicts with the Constitution or core architecture principles.

## Boundary Mapping

When reviewing a Laravel project, map generic architecture boundaries to Laravel primitives:

### Entry Boundary

| Generic Concept | Laravel Equivalent |
| --- | --- |
| Entry point for HTTP requests | Controllers (`app/Http/Controllers/`) |
| Entry point for CLI commands | Artisan Commands (`app/Console/Commands/`) |
| Entry point for queued work | Jobs (`app/Jobs/`) |
| Entry point for event-driven work | Listeners (`app/Listeners/`) |
| Entry point for scheduling | **Modern (11.x+):** `routes/console.php` / **Legacy:** `app/Console/Kernel.php` |
| Entry point for broadcasting | Broadcast Channels (`routes/channels.php`) |
| Global Config / Middleware | **Modern (11.x+):** `bootstrap/app.php` / **Legacy:** `app/Http/Kernel.php` |
| Route-based pages (optional) | Folio Pages (`resources/views/pages/`) |

### Validation Boundary

| Generic Concept | Laravel Equivalent |
| --- | --- |
| Input validation and normalization | Form Requests (`app/Http/Requests/`) |
| Inline validation | `Validator` facade or `$request->validate()` |
| Custom validation rules | Rule Objects (`app/Rules/`) |
| API input validation | Form Requests or inline validation in API controllers |

### Contract Boundary

| Generic Concept | Laravel Equivalent |
| --- | --- |
| Stable request shapes | Form Requests (`app/Http/Requests/`) |
| Stable response shapes | API Resources (`app/Http/Resources/`) |
| Shared interfaces | Contracts / Interfaces (`app/Contracts/` or inline) |
| Data transfer objects | DTOs or Data classes (`spatie/laravel-data`, custom `app/Data/`, or `app/DTOs/`, when adopted) |
| Event contracts | Event classes (`app/Events/`) |
| Notification contracts | Notification classes (`app/Notifications/`) |
| Mail contracts | Mailable classes (`app/Mail/`) |

### Application Boundary

| Generic Concept | Laravel Equivalent |
| --- | --- |
| Use case coordination | Actions (`app/Actions/`) or Services (`app/Services/`) |
| Single-purpose invocation | Invokable Actions (`__invoke`) or named Action methods, when adopted |
| Multi-step workflows | Jobs, Pipelines, or Action chains |
| Transaction coordination | Service or Action classes with `DB::transaction()` |

### Domain Boundary

| Generic Concept | Laravel Equivalent |
| --- | --- |
| Business rules and decisions | Domain classes, Value Objects, or Model methods |
| Domain models | Eloquent Models (`app/Models/`) |
| Domain policies | Policy classes (`app/Policies/`) |
| Domain enums | PHP Enums (`app/Enums/`) |
| Scoped queries | Eloquent Scopes (local or global) |
| Attribute casting | Model Casts (`$casts` property or custom Cast classes) |

### Data Boundary

| Generic Concept | Laravel Equivalent |
| --- | --- |
| Persistence abstraction | Eloquent ORM or Repository classes (`app/Repositories/`) |
| Query building | Eloquent Query Builder or raw Query Builder |
| Schema management | Migrations (`database/migrations/`) |
| Seed data | Seeders and Factories (`database/seeders/`, `database/factories/`) |
| Cache access | Cache facade or cache driver |
| **AI Boundary (v13+)** | |
| AI / LLM Provider Logic | Laravel AI SDK (`app/Services/` or `app/AI/`) |
| Vector Search / Embeddings | Vector-supported DB drivers or AI SDK integrations |
| Prompt Templates | Custom Prompt classes or Blade-based templates |

### Integration Boundary

| Generic Concept | Laravel Equivalent |
| --- | --- |
| External HTTP calls | HTTP Client (`Http::`) |
| External service wrappers | Service classes or SDK wrappers (`app/Services/`) |
| Queue-based async | Jobs dispatched to queues |
| Event broadcasting | Broadcasting system (`app/Events/`, channels) |
| File storage | Storage facade (`Storage::`) |
| **AI Integration** | **Laravel AI SDK** (Text, Image, Chat, Embeddings) |

### Presentation Boundary

| Generic Concept | Laravel Equivalent |
| --- | --- |
| Server-rendered views | Blade Templates (`resources/views/`) |
| Client-side SPA (React) | Inertia.js + React 19 pages (`resources/js/pages/`) with shadcn/ui |
| Client-side SPA (Vue) | Inertia.js + Vue 3 Composition API pages (`resources/js/pages/`) with shadcn-vue |
| Client-side SPA (Svelte) | Inertia.js + Svelte 5 pages (`resources/js/pages/`) with shadcn-svelte |
| Reactive server-rendered UI | Livewire components (`app/Livewire/` or `resources/views/livewire/`) with Flux UI |
| API output formatting | API Resources (`app/Http/Resources/`) |
| View composition | View Composers or Blade Components (`app/View/Components/`) |
| Frontend type contracts | TypeScript types/interfaces (`resources/js/types/`) |
| Frontend layouts | Layout components (`resources/js/layouts/`) |

---

## Starter Kit Frontend Patterns

Laravel 13 starter kits ship **four frontend stacks**, all of which change how the Presentation Boundary works. The adapter must understand which stack is in use to review correctly.

### Detecting the Active Stack

| If you see | The stack is |
| --- | --- |
| `Inertia::render()` in controllers + `resources/js/pages/*.tsx` | **React** (Inertia) |
| `Inertia::render()` in controllers + `resources/js/pages/*.vue` | **Vue** (Inertia) |
| `Inertia::render()` in controllers + `resources/js/pages/*.svelte` | **Svelte** (Inertia) |
| `Livewire\Component` classes + `resources/views/livewire/*.blade.php` | **Livewire** |
| `return view(...)` without Inertia or Livewire | **Blade-only** (traditional) |
| `return response()->json(...)` or API Resources without Inertia | **REST API** |

### Inertia.js Stack (React / Vue / Svelte) [Focus: general]

When the project uses Inertia, controllers return `Inertia::render()` instead of `view()` or `json()`. The response data becomes **the contract between backend and frontend**.

**Controller response rules for Inertia:**

- Controllers should return `Inertia::render('PageName', [...data])` — this is the entry point
- The data array passed to `Inertia::render()` is the contract — changes break the frontend
- Use TypeScript interfaces (`resources/js/types/`) to define the expected data shape
- Do not mix `Inertia::render()` and `return view()` in the same controller without documented reason
- Do not pass raw Eloquent models to Inertia — use API Resources or explicit arrays

**Detect when:**

- Controllers pass `$model->toArray()` directly to `Inertia::render()` (leaks internal fields to the frontend)
- Different controllers pass the same model with different field names to Inertia pages
- TypeScript types in `resources/js/types/` don't match the data shape from the controller
- Controllers mix `Inertia::render()` with `return view()` without documented reason
- Business logic lives in the Inertia page component instead of the backend

**Inertia shared data discipline:**

- Use `HandleInertiaRequests` middleware to share global data (auth user, flash messages, app config)
- Do not share large datasets globally — only what every page needs
- Do not share sensitive data (tokens, secrets, internal IDs) via shared data

**Frontend component boundaries (React/Vue/Svelte):**

- Pages (`resources/js/pages/`) own layout selection and data consumption from Inertia props
- Components (`resources/js/components/`) are reusable UI elements — they should not call backend APIs directly
- Layouts (`resources/js/layouts/`) own page structure — they should not contain business logic
- Hooks/composables (`resources/js/hooks/` or `resources/js/composables/`) own shared frontend logic
- Types (`resources/js/types/`) define the contract between backend and frontend

**Do not flag:**
- Using `router.visit()` or `router.post()` from Inertia — this is the standard way to submit data
- Using `usePage()` to access shared data — this is the standard Inertia pattern
- Simple prop destructuring in page components

### Livewire Stack [Focus: general]

When the project uses Livewire, components are full-stack: a PHP class + a Blade view. The PHP class handles state, actions, and rendering.

**Livewire component rules:**

- Components (`app/Livewire/`) should own UI state and user interactions
- Business logic should still delegate to Actions, Services, or Jobs
- Components should not mix unrelated UI state, business workflows, data access, and rendering responsibilities, regardless of line count
- Each component should represent a single UI concern (form, table, modal, widget)

**Detect when:**

- Livewire components contain database queries beyond simple CRUD
- Livewire components call external services directly
- Livewire components contain multi-step business workflows
- Livewire components duplicate validation that should be in Form Requests
- Components use `wire:model` on fields with no validation

**Acceptable in Livewire components:**
- UI state management (`$search`, `$sortBy`, `$isModalOpen`)
- Pagination and filtering
- Simple `$this->validate()` for component-specific fields
- Dispatching events to parent/sibling components
- Calling Actions or Services for business logic

### REST API (Headless) [Focus: api]

When Laravel is used as a REST API only (no Inertia, no Livewire, no Blade):

- Controllers must return an explicit, stable response contract. Use existing API Resources when adopted; a small deliberate array is acceptable when it does not leak internal fields or duplicate mapping.
- Keep API routes in the repository's established API routing boundary and apply the project's existing authentication mechanism where the endpoint requires authentication
- No `view()` calls should exist in API controllers
- Response shapes must be consistent and versioned

---

## Laravel-Specific Detection Rules

### Controllers Should Be Thin

Detect when a controller:

- Contains business logic beyond validation, mapping, and delegation
- Queries the database directly with complex `where()` chains or raw SQL
- Contains multi-step workflows (more than validate → delegate → respond)
- Manually builds response arrays instead of using API Resources
- Catches exceptions for business flow control

**Acceptable in controllers:**
- Calling `$request->validate()` or type-hinting a Form Request
- Delegating to an Action, Service, or Job
- Returning an API Resource, `Inertia::render()`, or `view()` response
- Authorization checks via `$this->authorize()` or middleware
- Simple CRUD operations using Eloquent (for small projects, unless the Constitution says otherwise)
- Preparing typed data arrays for Inertia responses

### Form Requests Over Inline Validation [Focus: api]

Detect when:

- Inline validation is reused, contains authorization or domain decisions, or has become difficult to understand and test in the controller
- The same validation rules are duplicated across controllers
- Validation logic contains business rules (e.g., checking uniqueness across related tables with complex conditions)
- API and web controllers validate the same entity differently without documented reason

**Do not flag:**
- Simple 1–3 rule inline validation in low-complexity endpoints
- Inline validation in Artisan Commands (Form Requests are HTTP-only)

### API Resources Over Raw Arrays [Focus: api]

Detect when:

- Controllers return `response()->json($model->toArray())` or raw arrays
- Different endpoints return the same model with different field names or shapes
- Nested relationships are serialized inconsistently
- Sensitive fields (passwords, tokens, internal IDs) leak through `toArray()`

**Acceptable alternatives:**
- Using `->only()` or `->makeHidden()` for simple cases with few fields
- Returning raw arrays in internal/admin-only endpoints if the Constitution allows it

### Eloquent Model Discipline [Focus: db]

Detect when:

- Models contain complex business logic beyond accessors, mutators, scopes, and relationships
- Models directly call external services (HTTP, queue, mail) inside lifecycle hooks
- Models use `boot()` or observers for business workflows that should be in Actions/Services
- Queryable business logic lives outside scopes (e.g., complex `where` chains repeated in controllers)
- Models accumulate unrelated reasons to change; decompose only along an evidenced domain, query, casting, or lifecycle boundary

**Acceptable in models:**
- Relationships (`hasMany`, `belongsTo`, etc.)
- Accessors and mutators
- Local and global scopes
- Casts and custom cast classes
- Simple computed attributes

### Repository Pattern [Focus: db] (When Adopted)

If the Constitution adopts a Repository pattern:

- Detect controllers or Actions querying Eloquent directly
- Detect repositories that contain business logic (they should only handle data access)
- Detect repositories that return raw arrays instead of Models or Collections

If the Constitution does NOT adopt a Repository pattern:

- Do not flag direct Eloquent usage in Services or Actions
- This is normal for many Laravel projects

### Action Pattern (When Adopted)

If the Constitution uses Actions (single-purpose classes):

- Detect controllers with more than validate → delegate → respond
- Detect Actions that call other Actions without a clear orchestration layer
- Detect Actions that directly return HTTP responses (they should return data, not responses)
- Detect duplicate logic between Actions and Jobs

If the Constitution does NOT use Actions:

- Do not flag Service classes that contain multi-method workflows

### Action Invocation Style (When Adopted)

If the Constitution selects invokable Actions:

- Detect single-purpose Actions that expose unrelated public operation methods instead of the selected `__invoke()` entry point
- Detect controllers that bypass the selected Action and duplicate its use-case orchestration
- Do not require controllers themselves to be invokable unless the Constitution separately requires single-action controllers

If the Constitution selects named Action methods, Services, or no enforced convention:

- Do not flag an Action solely because it does not implement `__invoke()`

### DTO Strategy (When Adopted)

If the Constitution selects `spatie/laravel-data`:

- Recognize Data classes as the selected DTO implementation for request, response, and boundary mapping
- Detect equivalent boundary shapes that bypass the selected Data classes and create inconsistent or duplicated mapping
- Reuse the package's validation and transformation capabilities when the Constitution assigns those responsibilities to Data classes

If the Constitution selects custom immutable DTOs:

- Recognize the documented custom DTO location and construction pattern
- Detect mutable or ad hoc array contracts only when they conflict with that documented strategy

If the Constitution selects Form Requests and API Resources only, or no enforced DTO convention:

- Do not require `spatie/laravel-data` or custom DTO classes
- Do not report the absence of a dedicated DTO package as a violation

### Authorization Strategy (When Adopted) [Focus: security]

If the Constitution selects `spatie/laravel-permission`:

- Recognize package roles and permissions as the selected assignment and coarse-grained access-control mechanism
- Use Gates or Policies for resource-level decisions when ownership, tenant boundaries, record state, or other contextual rules require them
- Detect duplicated string-based role or permission checks that bypass the selected centralized mechanism
- Do not assume a role or permission check alone proves authorization for a specific resource

If the Constitution selects native Gates and Policies:

- Detect authorization decisions duplicated in controllers, Actions, middleware, or views instead of the selected Gate or Policy
- Do not require `spatie/laravel-permission`

If the Constitution selects a custom implementation, review against its documented boundary and source of truth. If authorization is not currently required, do not invent permission requirements; still report concrete public-entrypoint or trust-boundary security risks through Security Review.

### Middleware Should Not Contain Business Logic

Detect when:

- Middleware performs database writes
- Middleware contains conditional business routing
- Middleware catches exceptions for business flow
- Middleware modifies request data beyond authentication context

**Acceptable in middleware:**
- Authentication and authorization checks
- Rate limiting
- CORS handling
- Request logging
- Locale/timezone setting
- Header manipulation

### Job and Event Discipline [Focus: async]

Detect when:

- Jobs contain HTTP response logic (Jobs are background, not request-scoped)
- Listeners contain multi-step workflows that should be separate Jobs
- Events carry behavior instead of just data
- Queued Jobs don't implement `ShouldQueue` when they should be async
- Synchronous dispatching is used for heavy work without documented reason

### Service Provider Boundaries

Detect when:

- Service Providers contain business logic
- Service Providers register framework bindings that leak across module boundaries
- Boot methods do heavy work that should be deferred

**Acceptable in providers:**
- Binding interfaces to implementations
- Registering macros, policies, observers
- Publishing package assets
- Deferred registration for optional services

---

## Laravel Directory Structure Reference

Standard Laravel 13.x project structure for context:

```
app/
├── Console/Commands/        ← Artisan CLI commands (Entry Boundary)
├── Contracts/               ← Interfaces and contracts (Contract Boundary)
├── Data/ or DTOs/           ← Data transfer objects (Contract Boundary)
├── Enums/                   ← PHP enums (Domain Boundary)
├── Events/                  ← Event classes (Contract / Integration Boundary)
├── Exceptions/              ← Custom exception classes
├── Http/
│   ├── Controllers/         ← HTTP controllers (Entry Boundary)
│   ├── Middleware/           ← HTTP middleware
│   ├── Requests/            ← Form Requests (Validation Boundary)
│   └── Resources/           ← API Resources (Presentation / Contract Boundary)
├── Jobs/                    ← Queued jobs (Entry / Integration Boundary)
├── Listeners/               ← Event listeners (Entry Boundary)
├── Mail/                    ← Mailable classes (Integration Boundary)
├── Models/                  ← Eloquent models (Domain / Data Boundary)
├── Notifications/           ← Notification classes (Integration Boundary)
├── Policies/                ← Authorization policies (Domain Boundary)
├── Providers/               ← Service providers (**Modern:** AppServiceProvider only)
├── Rules/                   ← Custom validation rules (Validation Boundary)
├── Services/                ← Service / Action classes (Application Boundary)
└── View/Components/         ← Blade components (Presentation Boundary)
bootstrap/
└── app.php                  ← **Modern (11.x+):** Middleware, Exceptions, and Routing config
config/                      ← Application configuration (Many now optional in 11.x+)
database/
├── factories/               ← Model factories (Testing)
├── migrations/              ← Database migrations (Data Boundary)
└── seeders/                 ← Database seeders (Testing)
resources/
├── views/                   ← Blade templates (Presentation Boundary)
│   ├── components/          ← Blade components
│   ├── layouts/             ← Layout templates
│   ├── livewire/            ← Livewire component views (if using Livewire)
│   └── pages/               ← Folio pages (if using Folio)
├── css/                     ← Stylesheets
└── js/                      ← Inertia frontend (if using starter kit)
    ├── components/          ← Reusable UI components (shadcn/ui, shadcn-vue, etc.)
    │   └── ui/              ← shadcn component library
    ├── hooks/ or composables/ ← React hooks / Vue composables
    ├── layouts/             ← App and auth layout components
    │   ├── app/             ← App layouts (sidebar, header)
    │   └── auth/            ← Auth layouts (simple, card, split)
    ├── lib/                 ← Utility functions and configuration
    ├── pages/               ← Page components (mounted by Inertia)
    └── types/               ← TypeScript interfaces (frontend contracts)
routes/
├── web.php                  ← Web routes
├── api.php                  ← API routes (if installed)
├── console.php              ← Console commands and scheduling
└── channels.php             ← Broadcasting channels (if installed)
tests/
├── Feature/                 ← Feature / integration tests
└── Unit/                    ← Unit tests
```

---

## Common Laravel Anti-Patterns to Flag

### 1. God Controller

```php
// ❌ Controller owns validation, business logic, queries, and response formatting
public function store(Request $request)
{
    $validated = $request->validate([...]);
    $user = User::where('email', $validated['email'])->first();
    if ($user && $user->subscription->isActive()) {
        // 20 lines of business logic...
    }
    $order = new Order();
    $order->fill([...]);
    $order->save();
    // Price calculation, notification, logging...
    return response()->json($order->toArray());
}
```

```php
// ✅ Controller delegates
public function store(StoreOrderRequest $request, CreateOrderAction $action)
{
    $order = $action->execute($request->validated());
    return new OrderResource($order);
}
```

### 2. Fat Model

```php
// ❌ Model owns business workflow
class Order extends Model
{
    public function processPayment()
    {
        $gateway = new StripeGateway();
        $result = $gateway->charge($this->total);
        $this->update(['status' => 'paid']);
        Mail::send(new OrderConfirmation($this));
        event(new OrderPaid($this));
    }
}
```

```php
// ✅ Model owns data, Service owns workflow
class Order extends Model
{
    public function scopeUnpaid($query) { return $query->where('status', 'pending'); }
    public function markAsPaid() { $this->update(['status' => 'paid']); }
}

class ProcessPaymentAction
{
    public function execute(Order $order): void
    {
        $this->gateway->charge($order->total);
        $order->markAsPaid();
        event(new OrderPaid($order));
    }
}
```

### 3. Missing API Resource

```php
// ❌ Raw array with leaked fields
return response()->json($user->toArray());
// Exposes: password hash, remember_token, internal flags

// ✅ Controlled output shape
return new UserResource($user);
```

### 4. Scattered Validation

```php
// ❌ Same rules in 3 controllers
// UserController, AdminController, ApiUserController all have:
$request->validate(['email' => 'required|email|unique:users']);

// ✅ Single Form Request
class StoreUserRequest extends FormRequest
{
    public function rules(): array
    {
        return ['email' => 'required|email|unique:users'];
    }
}
```

### 5. Direct DB in Controller

```php
// ❌ Complex query in controller
$users = DB::table('users')
    ->join('orders', 'users.id', '=', 'orders.user_id')
    ->where('orders.total', '>', 100)
    ->whereNull('users.deleted_at')
    ->select('users.*', DB::raw('SUM(orders.total) as total_spent'))
    ->groupBy('users.id')
    ->having('total_spent', '>', 500)
    ->get();

// ✅ Scoped query or Repository
$users = User::highValueCustomers()->get();
```

### 6. Leaking Model Data to Inertia

```php
// ❌ Passing raw model to Inertia — leaks internal fields to frontend JS
public function show(User $user)
{
    return Inertia::render('Users/Show', [
        'user' => $user->toArray(),
        // Exposes: password, remember_token, two_factor_secret, etc.
    ]);
}
```

```php
// ✅ Using API Resource to control shape
public function show(User $user)
{
    return Inertia::render('Users/Show', [
        'user' => new UserResource($user),
    ]);
}

// ✅ Or explicit array with only safe fields
public function show(User $user)
{
    return Inertia::render('Users/Show', [
        'user' => $user->only(['id', 'name', 'email', 'avatar_url']),
    ]);
}
```

### 7. Fat Livewire Component

```php
// ❌ Livewire component owns business workflow
class OrderDashboard extends Component
{
    public function approveOrder($orderId)
    {
        $order = Order::findOrFail($orderId);
        $gateway = new StripeGateway();
        $result = $gateway->charge($order->total);
        $order->update(['status' => 'approved', 'paid_at' => now()]);
        Mail::send(new OrderApproved($order));
        Notification::send($order->customer, new OrderApprovedNotification($order));
        // ... 30 more lines
    }
}
```

```php
// ✅ Livewire delegates to Action
class OrderDashboard extends Component
{
    public function approveOrder($orderId, ApproveOrderAction $action)
    {
        $action->execute(Order::findOrFail($orderId));
        $this->dispatch('order-approved');
    }
}
```

### 8. Business Logic in Inertia Page Component

```tsx
// ❌ React page owns business logic that should be server-side
export default function OrdersPage({ orders }: { orders: Order[] }) {
    const filteredOrders = orders.filter(o => {
        // Complex permission checking duplicated from backend
        if (user.role === 'admin') return true;
        if (o.department_id === user.department_id) return true;
        if (o.created_by === user.id) return true;
        return false;
    });
    return <OrderTable orders={filteredOrders} />;
}
```

```tsx
// ✅ Server handles filtering, page only renders
export default function OrdersPage({ orders }: { orders: Order[] }) {
    // Orders already filtered by Policy/scope on the server
    return <OrderTable orders={orders} />;
}
```

### 9. Inconsistent Inertia Shared Data

```php
// ❌ Sharing sensitive data globally via HandleInertiaRequests
public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user(),  // Leaks all user fields to every page
            'api_token' => $request->user()?->api_token,  // Never share tokens
        ],
    ]);
}
```

```php
// ✅ Controlled shared data
public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user()
                ? $request->user()->only(['id', 'name', 'email', 'avatar_url'])
                : null,
        ],
        'flash' => [
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
        ],
    ]);
}
```

---

## Output Format

When this adapter is active, the architecture review should include a **Laravel Conventions** section:

```text
Laravel Conventions:
- Controllers: [Thin / Mixed / Fat] — [details]
- Validation: [Form Requests / Inline / Mixed] — [details]
- Response Shaping: [API Resources / Raw / Mixed] — [details]
- Model Discipline: [Clean / Mixed / Fat] — [details]
- Pattern Adoption: [Actions|Services|Repositories|Standard] — [per Constitution]
- Action Invocation: [Invokable|Named Methods|Services|Not Enforced] — [per Constitution]
- DTO Strategy: [Laravel Data|Custom DTOs|Requests and Resources|Not Enforced] — [details]
- Authorization: [Laravel Permission|Gates and Policies|Custom|Not Required] — [details]
- Boundary Compliance: [summary of boundary violations specific to Laravel]
```

This section supplements the core architecture review output. It does not replace the standard Architecture Review format.

---

## Guardrails

- Do not flag standard Laravel conventions (Facades, helper functions, Eloquent) as violations unless the Constitution explicitly restricts them.
- Do not require Repository pattern unless the Constitution adopts it.
- Do not require Action pattern unless the Constitution adopts it.
- Do not require invokable Actions unless the Constitution adopts that invocation style.
- Do not require `spatie/laravel-data` or `spatie/laravel-permission` unless the Constitution adopts the corresponding package.
- Treat package selection as an architecture convention, not authorization to install dependencies during init or review.
- Do not flag simple CRUD controllers in small projects unless the Constitution requires thin controllers.
- Do flag any pattern that conflicts with a documented Constitution rule, regardless of whether it's a Laravel convention.
- The Constitution is always the final authority. This adapter provides Laravel context, not overrides.
