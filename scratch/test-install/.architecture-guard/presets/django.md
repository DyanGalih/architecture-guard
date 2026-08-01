---
description: Apply Django-specific architecture conventions during initialization and architecture review.
---

# Architecture Guard — Django Architecture Adapter

## Init Interview

Ask these questions sequentially after the Django preset is selected. Skip questions already resolved by existing constitution context.

### Application Architecture

Ask:

```text
How should Django applications be organized?

- Conventional MVT with thin views
- MVT with Services and Selectors
- Domain-oriented apps
- Modular project with explicit app boundaries
- Hybrid based on complexity
```

### View Style and Contracts

Ask:

```text
Which entry and contract patterns are used?

- Function-based views with Forms
- Class-based views with Forms or ModelForms
- Django REST Framework with Serializers
- Django Ninja or typed schemas
- Mixed, with documented boundaries
```

### Dependency Wiring

Ask:

```text
How should services and external integrations receive dependencies?

- Explicit function or constructor parameters
- Settings-backed factories
- Direct imports for stable framework infrastructure
- A project-adopted DI library
- Existing project convention
```

Django does not require a DI container. Do not add one without a demonstrated lifecycle, substitution, or testing need.

### Persistence and Transactions

Ask:

```text
Should query logic live in custom QuerySets or Managers, Selectors, Services, or repositories?

Where should multi-model transaction boundaries be coordinated?
```

### Async Infrastructure

Ask:

```text
Which work must use Celery, Django Q, RQ, scheduled jobs, or another worker instead of blocking a request?
```

## Senior Engineering Lens

Apply the framework mapping with senior judgment:

- Treat directory names, layer counts, file length, and pattern names as signals, not proof. Confirm a concrete correctness, security, ownership, change-coupling, or operability cost before reporting a violation.
- Start from the Constitution and patterns already working in the repository. Do not introduce a layer, library, DTO, store, repository, or service solely because this preset lists it.
- Distinguish correctness requirements from maintainability advice. Security, trust-boundary validation, data integrity, and contract breaches may block; preference-level structure remains advisory.
- For each finding, teach the reasoning: show evidence, name the violated boundary or principle, explain the likely failure mode, propose the smallest correction, and state how to verify it.
- Evaluate tradeoffs that matter for the change, such as transaction scope, retries and idempotency, latency, state ownership, failure isolation, concurrency, and migration risk. Do not manufacture irrelevant categories.
- Apply the shared Ponytail Core decision ladder and safety floor. Prefer native framework features and installed dependencies before proposing custom infrastructure.

Use the core architecture review rules first. This adapter refines generic architecture concepts with **Django (MVT)** conventions. It specifically focuses on resolving the "Fat Model" vs. "Service Layer" debate and ensuring proper boundary isolation in Python-based systems.

---

## Boundary Mapping

When reviewing a Django project, map generic architecture boundaries to Django primitives:

### Entry Boundary

| Generic Concept | Django Equivalent |
| --- | --- |
| Entry point for HTTP requests | Views (`views.py` - Function-based or Class-based) |
| URL routing and dispatch | URLs (`urls.py`) |
| Entry point for CLI commands | Management Commands (`management/commands/`) |
| Entry point for background work | Celery Tasks / RQ Jobs (`tasks.py`) |
| Global request/response hooks | Middleware (`middleware.py`) |
| Entry point for internal events | Signal Receivers (`signals.py`) |
| Entry point for scheduled work | Celery Beat / Cron jobs |

### Validation Boundary

| Generic Concept | Django Equivalent |
| --- | --- |
| Input validation and normalization | Forms (`forms.py`) or ModelForms |
| API input validation | DRF Serializers (`serializers.py`) or Pydantic models |
| Query parameter validation | FilterSets (django-filter) or manual form validation |
| Custom validation logic | `clean()` methods or custom Validator functions |

### Contract Boundary

| Generic Concept | Django Equivalent |
| --- | --- |
| Stable request shapes | Forms, Serializers, or TypedDicts |
| Stable response shapes | Serializers, Template Context dictionaries |
| Shared interfaces | Abstract Base Classes (ABC) or Protocols |
| Data transfer objects | Dataclasses, Pydantic Models, or NamedTuples |
| Event contracts | Signal definitions or Message schemas |

### Application Boundary

| Generic Concept | Django Equivalent |
| --- | --- |
| Use case coordination | Service Layer (`services.py`) or "Selectors" (`selectors.py`) |
| Multi-step workflows | Service functions coordinating multiple models/tasks |
| Transaction coordination | `@transaction.atomic` decorated services |

### Domain Boundary

| Generic Concept | Django Equivalent |
| --- | --- |
| Business rules and decisions | Domain classes, Utility functions, or Model methods |
| Domain models | Django Models (`models.py`) |
| Access control logic | Model methods or custom Permission classes |
| Domain enums | `models.TextChoices` or `models.IntegerChoices` |
| Scoped queries | Custom QuerySets (`as_manager()`) or Managers |

### Data Boundary

| Generic Concept | Django Equivalent |
| --- | --- |
| Persistence abstraction | Django ORM (`models.py`, `managers.py`) |
| Query building | Managers and QuerySets |
| Schema management | Migrations (`migrations/`) |
| Seed data | Fixtures or Factory Boy / Mixer factories |

### Integration Boundary

| Generic Concept | Django Equivalent |
| --- | --- |
| External HTTP calls | `requests` or `httpx` wrappers in `integrations/` |
| External service wrappers | Specialized client classes |
| File storage | Django Storage backend (`DEFAULT_FILE_STORAGE`) |
| External Auth | Authentication Backends |

### Presentation Boundary

| Generic Concept | Django Equivalent |
| --- | --- |
| Server-rendered views | Django Templates (`.html`) |
| Context preparation | `get_context_data()` in CBVs or context processors |
| API output formatting | DRF Serializers or JSON responses |
| Template logic isolation | Template Tags and Filters (`templatetags/`) |

---

## Django-Specific Detection Rules

### Views Should Be Thin

Detect when a view:
- Contains complex ORM queries (more than a simple `.get()` or `.filter()`).
- Directly coordinates multi-step business workflows.
- Performs external API calls or sends emails (these should be delegated).
- Manually handles complex error mapping instead of using Forms/Serializers.

**Acceptable in views:**
- Extracting parameters from `request`.
- Calling a Form/Serializer for validation.
- Calling a single Service or Selector function.
- Handling `HttpResponseRedirect` or rendering a template.

### The "Fat Model" Boundary

Detect when a model:
- Directly calls external services (HTTP, email, etc.).
- Coordinates changes across *other* unrelated models (orchestration).
- Contains logic that depends on the `request` object (this is an entry layer leak).
- Accumulates unrelated reasons to change or mixes persistence, orchestration, and external integration concerns; split only along an evidenced ownership boundary.

**Acceptable in models:**
- Field definitions and Meta options.
- Custom `save()` for internal data integrity.
- Property methods for simple derived data.
- Domain-specific logic that only affects the current instance.

### Signal Discipline (Anti-Pattern: Hidden Side Effects)

Detect when signals:
- Are used for business logic that could be in a Service.
- Perform heavy database writes or external calls synchronously.
- Create circular dependencies between apps.

**Recommendation**: Use signals only for cross-cutting concerns (e.g., creating a Profile when a User is created) or integrating with third-party apps that don't know about your services.

### Forms and Serializers as Gatekeepers [Focus: api]

Detect when:
- Views directly use `request.POST` or `request.data` without a Form/Serializer.
- Business logic is duplicated between a Form and a Service.
- Serializers leak internal database fields (like `id` when using UUIDs, or `password_hash`).

### QuerySet Isolation [Focus: db]

Detect when:
- Complex query logic (e.g., `.annotate(total=...)`) is written in a View instead of a custom **Manager** or **QuerySet**.
- Views or Services perform N+1 queries by missing `select_related()` or `prefetch_related()`.

---

## Common Django Anti-Patterns to Flag

### 1. Fat View (Orchestration in Entry Layer)

```python
# ❌ View handles everything
def create_order(request):
    data = request.POST
    user = request.user
    if user.balance < data['amount']:
        return error(...)
    order = Order.objects.create(user=user, amount=data['amount'])
    send_mail(...)
    logger.info(...)
    return render(...)
```

```python
# ✅ View delegates to Service
def create_order(request):
    form = OrderForm(request.POST)
    if form.is_valid():
        order_service.create_order(user=request.user, **form.cleaned_data)
        return redirect(...)
```

### 2. Leaky Templates

```html
<!-- ❌ Complex logic in template -->
{% if user.is_authenticated and user.profile.member_type == 'gold' and order.total > 100 %}
  <p>Free Shipping!</p>
{% endif %}
```

```python
# ✅ Logic in Model property or Service
@property
def qualifies_for_free_shipping(self):
    return self.user.is_gold and self.total > 100
```

---

## Output Format

When this adapter is active, the architecture review should include a **Django Conventions** section:

```text
Django Conventions:
- Views: [Thin / Mixed / Fat] — [details]
- Logic Placement: [Service Layer / Fat Models / Mixed]
- Validation: [Forms|Serializers / Manual]
- DB Discipline: [Custom Managers / Inline Queries]
- Signal Usage: [Clean / Excessive Side-Effects]
```

---

## Guardrails

- Do not flag standard Django features (Signals, Middlewares) unless they violate the Constitution.
- Do not force a Service layer if the project is a simple CRUD app.
- The Constitution is the final authority. This adapter provides Django context, not overrides.
