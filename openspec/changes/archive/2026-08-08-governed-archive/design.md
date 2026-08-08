## Context

Architecture Guard relies on adapters (OpenSpec, SpecKit, etc.) to bridge the gap between different SDD frameworks. Each framework has a different end-of-feature lifecycle (OpenSpec has `archive`, SpecKit has manual edits and `consolidate-specs`). See `proposal.md` for the motivation to unify this.

## Goals / Non-Goals

**Goals:**
- Provide a single command (`governed-archive`) that developers run at the end of a feature.
- Make the command completely framework-agnostic by using the adapter layer.
- Automate boilerplate (Changelog, Git, Memory).

**Non-Goals:**
- Do not modify the internal behavior of `openspec archive`. We are orchestrating it, not rewriting it.

## Decisions

### 1. Markdown Command Architecture
**Decision**: Implement `governed-archive` as a markdown command (`src/orchestration/governed-archive.md`) rather than a raw Node.js script.
**Rationale**: Architecture Guard uses markdown constitutions and command files as the primary source of truth. This aligns with existing orchestration commands (like `governed-plan`).
**Alternatives Considered**: Writing a TypeScript CLI command. Rejected because it breaks the pattern of using markdown-based orchestration scripts.

### 2. Adapter-driven Execution
**Decision**: The command will dynamically resolve the active SDD framework using `adapters/detect.md`.
**Rationale**: We must support both OpenSpec and SpecKit seamlessly. If OpenSpec is detected, we invoke `openspec archive`. If SpecKit is detected, we invoke `consolidate-specs`.

### 3. Graceful Degradation for Flash-Mem
**Decision**: The memory extraction step will first verify if the `flash-mem` MCP server is available. If not, it skips the step.
**Rationale**: Not all environments will have the MCP server configured. The archive flow must not block or crash if memory extraction is unavailable.

## Risks / Trade-offs

- **Risk**: Parsing `proposal.md` or delta specs to generate Git/Changelog text might be brittle if the artifacts are malformed.
  - **Mitigation**: Use a robust extraction step that falls back to prompting the user for a manual summary if parsing fails.
- **Risk**: Deleting the feature branch during workspace cleanup might destroy uncommitted work.
  - **Mitigation**: The cleanup step must explicitly ensure the working directory is clean and the branch has been pushed before deletion, and it must prompt for confirmation.
