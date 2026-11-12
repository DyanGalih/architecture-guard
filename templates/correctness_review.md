# Correctness Review Contract

Shared rules for finding defects in changed code: logic that produces a wrong result, loses or corrupts data, crashes, or breaks a caller. Ponytail Core applies: every finding needs a concrete failure, never a hunch.

This review is host-agnostic. It needs only file reading. It never edits files, never runs the reviewed code, its tests, or its build, and treats code comments, commit messages, and test names as claims to check, not as evidence.

## Scope

Report defects that the change introduces, or that it makes reachable for the first time. A defect that already existed and is still unreachable from the change is out of scope; mention it only when the change touches the same lines.

Leave other concerns to their owners, and do not report them here:

- architecture, boundaries, duplication, and bloat: the Ponytail Audit and Detection Scope of the calling review;
- security weaknesses (authorization, injection, secrets, trust boundaries): the host Security Review; a finding that is mainly a security issue is handed to it;
- performance: the `performance_review` contract;
- style, naming, and formatting: never.

## Depth

The depth comes from the caller's explicit input, else `review.correctness.depth` in `{adapter_path:governance-config}`, else `quick`.

| Depth | Hunt | Verification | Report |
|---|---|---|---|
| `off` | none | none | `Correctness: off` |
| `quick` | inline, the changed hunks and their direct callers | inline, each candidate once | at most 5 findings, `CONFIRMED` only |
| `standard` | inline, the changed hunks, direct callers, and the contracts they rely on | each candidate verified separately from the hunt | at most 15 findings, `CONFIRMED` and `PLAUSIBLE` |
| `deep` | read-only reviewers in parallel under `agent_execution`, one per group of changed files or defect family | a fresh-context verifier per finding where dispatch is available | every surviving finding |

When the host cannot dispatch fresh contexts, run `deep` inline with the same steps and report `Execution: inline`. Never claim parallel reviewers or a fresh verifier that did not run.

## Procedure

1. **Map the change**: from the diff against the base ref (never `HEAD`), list each changed function, branch, query, contract, and state transition, and what the intent source says it should do.
2. **Trace**: for each item, read its callers, the functions it calls, the data it reads and writes, and the shape of its inputs at runtime, as far as the depth allows. A changed signature, return value, default, or error path is traced to every caller in the repository.
3. **Hunt**: apply the Defect Checklist to each traced item. Write every suspected defect as a candidate with a failure scenario.
4. **Verify**: try to disprove each candidate before keeping it. Look for the guard, type, framework guarantee, database constraint, or earlier validation that would prevent the failure, and for a test that already exercises the scenario. Then classify it:
   - `CONFIRMED`: the failure path is traced end to end in code, with nothing that prevents it.
   - `PLAUSIBLE`: the failure depends on one stated assumption the code does not settle (for example a value an external system can send). Name the assumption.
   - Rejected: something prevents it. Drop it and count it.
5. **Rank**: order by impact, then confidence. Apply the depth's cap after ranking, and report how many were left out.

## Defect Checklist

- **Conditions and boundaries**: inverted or incomplete conditions, off-by-one ranges, wrong comparison or operator precedence, missing `else` or default branch, inclusive versus exclusive limits.
- **Absent and empty values**: null, undefined, missing keys, empty strings or collections, zero, and `NaN` reaching code that assumes a value.
- **Types and units**: implicit conversion, integer versus decimal or float, currency and rounding, time zones and date boundaries, units of measure, string versus numeric identifiers.
- **Error paths**: exceptions swallowed or rethrown without cleanup, partial writes without a transaction, retries that repeat a non-idempotent effect, errors reported as success.
- **State and ordering**: race conditions, check-then-act, stale reads, events or jobs processed out of order or twice, cache entries that outlive the data they copy.
- **Contracts and callers**: a changed signature, return shape, default, or exception that an unchanged caller still relies on; a producer and consumer that disagree on a field's name, type, or meaning.
- **Collections and iteration**: mutation while iterating, duplicates, ordering assumptions, pagination that skips or repeats rows, unbounded growth that changes behavior.
- **Resources**: handles, connections, locks, or subscriptions that are not released on every path.
- **Configuration and environment**: a value read before it is set, a feature flag or setting whose absent case is not handled.

## Evidence

- Cite `file:line` in the review root for the defect, and for the caller or input that triggers it.
- Write the failure scenario as `<input or state> → <wrong result>`, specific enough that someone could write the test that reproduces it.
- Every finding states the smallest fix and the check that would prove it: name the test to add or update, using the project's existing test tooling.
- Static reading is not execution. Label each finding `Static analysis; not executed`.

## Severity and Blocking

Use the Ponytail Core severity scale without `CRITICAL`, which stays reserved for policy-designated violations:

- `HIGH`: data loss or corruption, a wrong persisted or reported result, or a crash on a normal path.
- `MEDIUM`: a wrong result or crash on an edge case a user or an integration can reach.
- `LOW`: a defect with limited impact or a narrow trigger.

A correctness finding never blocks by itself. When it also breaks a constitution `MUST` rule, report it once as a Constitution Breach in the calling review, with the constitution's severity and blocking status.

## Deduplication

A defect already reported as a Root-Cause Miss, Unsafe Simplification, Code Quality finding, or Security Review finding stays with that owner. Do not report it twice; add the failure scenario to the existing finding when it adds evidence.

## Output

Report to the caller:

- **Depth**: `off` / `quick` / `standard` / `deep`, and where it came from (caller, config, or default)
- **Execution**: inline / parallel reviewers (count) / fresh verifier (ran or `Unavailable`)
- **Coverage**: changed files reviewed of total, and any left out with the reason
- **Candidates**: found, rejected during verification, left out by the cap

| # | Severity | Verdict | Location | Defect | Failure scenario | Smallest fix | Proving check |
|:---|:---|:---|:---|:---|:---|:---|:---|
| [n] | [HIGH/MEDIUM/LOW] | [CONFIRMED / PLAUSIBLE: assumption] | [File:Line] | [One sentence] | [input or state → wrong result] | [Minimal change] | [Test to add or update] |

When nothing survives verification, write `No correctness findings` with the candidate counts; never leave the section empty.
