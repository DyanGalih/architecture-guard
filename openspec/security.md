# Security Constitution

## 1. Trust Boundaries
- All input read from standard input, files (like user-provided markdown or SDD config files), or CLI arguments must be treated as untrusted and validated.

## 2. Execution Security
- Tools and commands executed on behalf of the user must be transparent or sandboxed appropriately.

## 3. Data Isolation & Privacy Rules
- No secrets or sensitive keys should be written to `.flash-mem` or the memory hub.

## 4. Operational Security
- Any changes generated must be verified against `src/` prior to publishing.
