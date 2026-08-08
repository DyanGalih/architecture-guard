## Context

See `proposal.md` for the motivation. The `src/extension.yml` uses deprecated command naming conventions (`speckit.ag-*` instead of `speckit.architecture-guard.ag-*`), causing installation warnings. Additionally, the `src/bin/cli.ts` hard-codes the CLI version, leading to manual toil on each release.

## Goals / Non-Goals

**Goals:**
- Eliminate Specify CLI installation warnings by prefixing all commands with `speckit.architecture-guard.`.
- Modify `cli.ts` to locate and parse `package.json` at runtime for the version string.

**Non-Goals:**
- Completely rewriting the CLI or extension manifest layout.
- Changing any underlying command functionality.

## Decisions

- **Version Resolution Logic**: `cli.ts` will use Node.js `fs` and `path` to traverse up from `__dirname` to find `package.json`.
  - *Rationale*: Safe and simple runtime strategy. Alternative considered was using import assertions (`import pkg from '../../package.json' assert { type: 'json' }`), but `fs.readFileSync` avoids TypeScript compilation issues with JSON imports and works reliably.

- **Naming Convention Strategy**: Prefix all commands and hooks with the exact extension ID (`architecture-guard`).
  - *Rationale*: Meets the strictly enforced Specify standard `speckit.{extension_id}.{command}` without breaking existing `ag-*` suffixes that users might recognize.

## Risks / Trade-offs

- [Risk] Path to `package.json` at runtime might differ from development structure due to compiled output `dist/` vs `src/`.
  - *Mitigation*: Fall back to a default version string (e.g. `'0.0.0'`) if `package.json` cannot be found so the CLI does not fatally crash. Check multiple candidate paths relative to `__dirname`.
