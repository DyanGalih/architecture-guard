#!/usr/bin/env bash
# test-install.sh — Smoke tests for the architecture-guard repo.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HUB_ROOT="$(dirname "$SCRIPT_DIR")"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

TESTS=0
FAILURES=0

assert_file_exists() {
  TESTS=$((TESTS + 1))
  if [ -f "$1" ]; then
    echo -e "  ${GREEN}✓${NC} $2"
  else
    echo -e "  ${RED}✗${NC} $2 — file not found: $1"
    FAILURES=$((FAILURES + 1))
  fi
}

assert_file_contains() {
  TESTS=$((TESTS + 1))
  if grep -q "$2" "$1"; then
    echo -e "  ${GREEN}✓${NC} $3"
  else
    echo -e "  ${RED}✗${NC} $3 — pattern not found in: $1"
    FAILURES=$((FAILURES + 1))
  fi
}

assert_yaml_parses() {
  TESTS=$((TESTS + 1))
  if python3 -c 'import sys, yaml; yaml.safe_load(open(sys.argv[1], encoding="utf-8"))' "$1" >/dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} $2"
  else
    echo -e "  ${RED}✗${NC} $2 — YAML parse failed or Python PyYAML is unavailable: $1"
    FAILURES=$((FAILURES + 1))
  fi
}

# --- Test: Hub has required files ---
echo ""
echo "Test: Hub repo structure is valid"

assert_file_exists "$HUB_ROOT/extension.yml" "extension.yml exists at root"
assert_file_exists "$HUB_ROOT/README.md" "README.md exists at root"
assert_file_exists "$HUB_ROOT/LICENSE" "LICENSE exists at root"
assert_file_exists "$HUB_ROOT/templates/constitution.md" "governance constitution template exists"
assert_file_exists "$HUB_ROOT/templates/architecture_constitution.md" "architecture constitution template exists"
assert_file_exists "$HUB_ROOT/templates/ponytail_core.md" "Ponytail Core contract exists"
assert_file_exists "$HUB_ROOT/templates/budgeted_context.md" "budgeted context contract exists"
assert_file_exists "$HUB_ROOT/templates/architecture_guard_config.yml" "Architecture Guard config template exists"
assert_file_exists "$HUB_ROOT/scripts/create-context-budget-fixtures.sh" "context-budget fixture generator exists"
assert_yaml_parses "$HUB_ROOT/extension.yml" "extension.yml parses"
assert_yaml_parses "$HUB_ROOT/templates/architecture_guard_config.yml" "Architecture Guard config parses"

EXPECTED_COMMANDS=(
  "governed-delivery.md"
  "architecture-workflow.md"
  "architecture-review.md"
  "violation-detection.md"
  "refactor-generator.md"
  "architecture-apply.md"
  "consolidate-specs.md"
)

for cmd in "${EXPECTED_COMMANDS[@]}"; do
  assert_file_exists "$HUB_ROOT/commands/$cmd" "command file: $cmd"
done

echo ""
echo "Test: Shared engineering contracts are wired"

for cmd in "$HUB_ROOT"/commands/*.md; do
  assert_file_contains "$cmd" "Ponytail Core Contract" "Ponytail Core: $(basename "$cmd")"
done

for preset in "$HUB_ROOT"/presets/*.md; do
  assert_file_contains "$preset" "Senior Engineering Lens" "senior lens: $(basename "$preset")"
done

echo ""
echo "Test: Budgeted context is wired to governed workflows"

BUDGETED_COMMANDS=(
  "governed-spec.md"
  "governed-plan.md"
  "governed-tasks.md"
  "governed-delivery.md"
  "governed-implement.md"
  "architecture-review.md"
  "architecture-verify.md"
)

for cmd in "${BUDGETED_COMMANDS[@]}"; do
  assert_file_contains "$HUB_ROOT/commands/$cmd" "budgeted_context.md" "budgeted context: $cmd"
done

assert_file_contains "$HUB_ROOT/templates/budgeted_context.md" "Do not load the local fallback merely because budgeted mode is enabled" "Flash-Mem-success path skips local fallback"
assert_file_contains "$HUB_ROOT/commands/consolidate-specs.md" "not a canonical specification" "fallback is non-authoritative"
assert_file_contains "$HUB_ROOT/templates/budgeted_context.md" "Context Expansion" "context expansion is auditable"
assert_file_contains "$HUB_ROOT/templates/architecture_guard_config.yml" "targeted skips it" "stale policy is unambiguous"
assert_file_contains "$HUB_ROOT/commands/governed-plan.md" "test -f .specify/extensions/memory-md/dist/bin/speckit-memory.js" "governed-plan detects gitignored Memory MD runtime directly"
assert_file_contains "$HUB_ROOT/commands/governed-plan.md" "rg --files -uu" "governed-plan uses ignore-aware Memory MD discovery"
assert_file_contains "$HUB_ROOT/commands/governed-plan.md" "Do not probe for Flash-Mem" "governed-plan bounds unavailable global memory discovery"

# --- Test: extension.yml references existing files ---
echo ""
echo "Test: extension.yml command files resolve"

while IFS= read -r line; do
  file_ref=$(echo "$line" | sed "s/.*file: *'\{0,1\}\([^']*\)'\{0,1\}/\1/")
  if [ -n "$file_ref" ]; then
    # clean up potential yaml noise
    file_ref=$(echo "$file_ref" | tr -d '"' | tr -d "'")
    assert_file_exists "$HUB_ROOT/$file_ref" "extension.yml ref: $file_ref"
  fi
done < <(grep 'file:' "$HUB_ROOT/extension.yml")

# --- Summary ---
echo ""
if [ "$FAILURES" -eq 0 ]; then
  echo -e "${GREEN}All $TESTS smoke tests passed.${NC}"
  exit 0
else
  echo -e "${RED}$FAILURES of $TESTS tests failed.${NC}"
  exit 1
fi
