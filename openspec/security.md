# Security Constitution

## 1. Trust Boundaries
- All input read from standard input, files (like user-provided markdown or SDD config files), or CLI arguments must be treated as untrusted and validated.
- Input validation must occur at the CLI entry point using Zod (or similar schema validation).

## 2. Execution Security
- Tools and commands executed on behalf of the user must be transparent or sandboxed appropriately.

## 3. Data Isolation & Privacy Rules
- No secrets or sensitive keys should be written to `.flash-mem` or the memory hub.

## 4. Secrets Management Policy
- Secure randomness must be used for sensitive values (no `Math.random()`).

## 5. Audit, Logging & Monitoring Requirements
- Structured logger must be used (no raw `console.log`).
- Logs should include appropriate levels (debug, info, warn, error).

## 6. Operational Security
- Any changes generated must be verified against `src/` prior to publishing.
