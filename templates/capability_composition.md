# Architecture Guard Capability Composition Contract

Use this contract whenever one Architecture Guard command delegates to another Architecture Guard capability.

## Resolve the delegated capability

1. Prefer the host's registered capability lookup when it exposes the installed prompt body.
2. On skill-based hosts, directly read the sibling skill file for the exact capability, normally `../ag-<capability>/SKILL.md` relative to the current skill. Account for installer conflict suffixes only when the active capability registration identifies one; never guess among multiple copies.
3. On command-file hosts, directly read the registered sibling command file, normally `ag-<capability>.md` in the same command directory.
4. Treat the resolved file as the source of truth. Execute its instructions in the current session with the current arguments and artifact context unless the host provides a real capability-dispatch API.

## Do not fake dispatch

- Do not execute a Markdown or `SKILL.md` path as a shell command.
- Do not assume that writing `/ag-<capability>` in prose invokes anything.
- Do not reproduce a delegated capability from memory or copy only a summary of it.
- Do not silently substitute a similarly named native SDD command for an Architecture Guard capability.

## Preserve boundaries

- Pass the active adapter, change identifier, artifact paths, user arguments, prior findings, and already-granted approvals into the delegated capability.
- Preserve every approval, safety, severity, read-only, and verification gate in the delegated file. An approval from one capability does not satisfy a distinct gate in another.
- Return the delegated result to the caller, including degraded or blocked status and unresolved findings, before continuing the parent workflow.
- Prevent recursion: if the delegated capability routes back to a capability already active in the current call chain, stop and report the cycle instead of invoking it again.

## Missing capability

Only use an inline fallback when direct inspection confirms that no registered capability body or installed sibling file exists. Report the missing capability and the fallback taken. If the parent command does not define a complete inline fallback, stop and tell the user which capability must be installed; do not invent its behavior.
