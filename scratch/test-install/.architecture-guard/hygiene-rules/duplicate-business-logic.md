# Rule: Duplicate Business Logic

**Identifier**: `duplicate-business-logic`
**Description**: Detect repeated business rules, validation, mapping, or orchestration that should live in one shared source of truth instead of being copied across modules or layers.
**Default Severity**: Critical
**Recommendation**: Extract the repeated behavior into the shared module, service, helper, contract, or boundary that already owns the rule. Keep callers thin and reuse the shared implementation.

## Detection Logic

Look for the same rule or workflow appearing in multiple source files, especially when the code is structurally similar, performs the same validation or transformation, or evolves in lockstep. Prefer one canonical implementation and treat parallel copies as architectural drift unless a justified exception is documented.
