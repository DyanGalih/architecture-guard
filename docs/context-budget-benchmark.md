# Budgeted Context Benchmark

Use this protocol before describing Budgeted Architecture Context Retrieval as a token optimization for a project or release. The orchestration layer is prompt-driven, so results must come from comparable agent runs rather than static file-size claims.

## Fixture Profiles

Generate reproducible baseline fixtures into an empty temporary directory:

```bash
npx architecture-guard create-fixtures /tmp/architecture-guard-context-fixtures
```

The generator creates:

| Profile | Active specs | Historical specs | Expected use |
| --- | ---: | ---: | --- |
| Small | 1 | 0-2 | Detect overhead regression |
| Medium | 1 | 8-15 | Validate ordinary savings |
| Large | 1 | 30+ | Validate scaling and targeted expansion |

Each profile must include at least one shared invariant, one cross-feature dependency, and one pair of similar but distinct requirements. Medium and large profiles must also include one explicit conflict.

Replace or enrich the generated prose with project-realistic specifications before a release-grade benchmark. The generated fixtures validate the retrieval shape and counts; they do not substitute for real-world semantic measurements.

## Scenarios

Run the same planning or review request with the same model and active feature:

1. Existing targeted behavior.
2. Budgeted mode with sufficient Flash-Mem results.
3. Budgeted mode with Flash-Mem unavailable.
4. Budgeted mode with stale fallback context.
5. Budgeted mode with a conflict that requires one targeted historical expansion.

Start each run from a clean conversation. Do not reuse hidden context between scenarios.

## Measurements

Record provider-reported input tokens when available. Otherwise record the exact characters or bytes loaded and label the measurement as an estimate.

| Profile | Scenario | Input tokens or estimate | Files opened | Memory summaries | Full memory entries | Historical specs | Required constraints recalled | Conflicts detected |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Small | | | | | | | | |
| Medium | | | | | | | | |
| Large | | | | | | | | |

## Acceptance Criteria

- No active requirement is lost.
- No conflict is silently merged or hidden.
- A sufficient Flash-Mem path does not load `system_context.md`.
- Historical specs are opened only for named gaps.
- Medium and large profiles use fewer context tokens than targeted behavior.
- The small profile adds no more than 5% context.

If these criteria are not met, describe the feature as progressive or budgeted retrieval only, not as a verified token optimization.
