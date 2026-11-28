# Architecture Guard Scope Assessment

Apply this contract to size proposed work and pick its delivery route. `ag-governed-discover` applies it to the agreed idea, `ag-review-implementation` to each finding (Triage below), and `backlog_queue_check` reads its result. It never writes files and never changes a backlog, a tracker, or `queue.yml`.

Sizes, lanes, and lane escalation come from the `backlog_item` template (`## Item Shape` for the `xs`–`xl` scale, `## Lanes`); resolve it with `architecture-guard resolve template backlog_item` and do not restate them. A scope class is a recommendation: the user may choose the other route, and the choice is recorded.

## Signals

Work out each signal from the proposed work: the backlog items when the work was decomposed, otherwise the single feature as one story. Use their expected files (as `backlog_item` `## Grouping` defines them), the constitutions' declared boundaries, `security_sensitive_paths` and `repositories` from `.architecture-guard/config.yml`. Thresholds come from `routing.scope` in `.architecture-guard/config.yml`; the defaults are shown.

| Signal | Large when |
|---|---|
| User stories | at least `large_at_stories` (default 2, so small work is one user story, matching the single-story rule of `## Story Items` in `backlog_item`), or the work spans more than one feature |
| Boundaries | it touches at least `large_at_boundaries` (default 3) declared architecture boundaries or modules, or more than one entry in `repositories` |
| Sequencing | any item `depends_on` another proposed item |
| Item size | any item is `large_at_size` (default `l`) or larger. Estimate an item without a `size` with the `backlog_item` scale, using the Beads `estimate` column for the time per size; when you cannot estimate it, it counts as `m` |
| Unknowns | any item needs a spike (`research` lane) before code can be written |

## Class

- **large** when any signal above holds.
- **small** otherwise.
- **Security**: the work is security-sensitive when its expected files match a `security_sensitive_paths` glob, or it adds or changes authentication, authorization, secrets, a trust boundary, or which personal data is collected, stored, or exposed (showing data that is already shown does not count). Security-sensitive work always takes the **full** lane and needs Security Review on every route. When it has more than one item, also raise **small** to **large**. A single story stays **small**, because it cannot be broken down further; say that the security flag, not the class, adds the rigor.
- When the expected files cannot be worked out, say so and ask the user to confirm the class instead of guessing.

A **large** class needs a populated Backlog Breakdown. When the user declines to break the work down, route it as **small** and keep the large signals as risks in the handoff.

## Route

| Class | Route |
|---|---|
| small | `ag-workflow`, with the Discovery Summary Draft as its seed: one flow from specification through final review. Mention `ag-governed-spec` followed by `ag-governed-delivery` as the lighter path when the user wants to drive each phase |
| small, stakeholder User Story approval required | `ag-governed-delivery-team` (single-feature path, continuing to Phase 4) |
| large | `ag-governed-delivery-team` to approve and save the Backlog Breakdown and stop after Phase 3, then `ag-governed-backlog` to deliver it. For a solo developer, their own acceptance at its Phase 3 is the stakeholder review |

**One group.** When a **large** class's breakdown forms a single group (every item shares one `group`, as `backlog_item` `## Grouping` defines, and none is a spike), `ag-governed-backlog` would deliver it as one change anyway. Route it through `ag-workflow` as one change instead, with every item of the group as a story of its specification, and say so in the Route. Keep the large route only when stakeholder User Story approval is required, because `ag-governed-delivery-team` stops after Phase 3 for more than one story. The class stays **large**, so its signals stay visible as risks.

The **backlog route** below means `ag-governed-delivery-team` followed by `ag-governed-backlog`: a large class whose breakdown has more than one group, or a single group that needs stakeholder approval.

When a backlog queue is active, `backlog_queue_check` may change the route; its choice wins.

## Output

```markdown
## Scope Assessment
- **Class**: [small / large] ([computed / user override: reason])
- **Signals**: [each signal with its value; mark the deciding ones]
- **Lane**: [full / fix / light / research, from `backlog_item` `## Lanes`, with any escalation]
- **Route**: [`ag-workflow` (one flow, including a large class that forms one group) / the backlog route; and why]
```

## Triage

For a review finding, the same scale decides whether to fix it in the current change or defer it to the backlog. Estimate a finding's size from its smallest fix with the `backlog_item` size scale (the Beads `estimate` column gives the time per size).

- **fix-now** when all of these hold: the finding is `CONFIRMED`, or a deterministic rule or runner reported it; its fix belongs to this change's files or artifacts; the fix stays within one boundary; and its estimated size is at most `fix_now_max_size` from `routing.scope` (default `s`).
- **defer** otherwise: the fix is out of this change's scope, crosses a boundary, needs a spike, is larger than `fix_now_max_size`, or the finding is `PLAUSIBLE` and its assumption must be settled first.
- **Blocking findings are never deferred.** A blocking or P0 finding (from policy, or a blocking constitution or security finding) stays **fix-now** whatever its size; when its fix is large, say that the change cannot merge until it is fixed.

Triage is a recommendation. The user may fix a deferred finding now or defer a fix-now one that is not blocking; record the choice.

A deferred finding becomes a proposed `backlog_item`: `type` `bug` for a defect, `spike` for a `PLAUSIBLE` finding, otherwise `task`; `parent` set to the current change name; `title` and `description` from the finding; `acceptance` from its failure scenario (the scenario no longer produces the wrong result) and its proving check; `size` from the estimate. The proposal is never written by the review.
