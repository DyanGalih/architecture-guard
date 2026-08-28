# Inter-Agent Teammate Communication Protocols

This document defines the peer-to-peer communication patterns for Claude Code Agent Teams within Architecture Guard.

## 1. Implementor Dependency Coordination (FE <-> BE)

When frontend and backend implementors run concurrently:
1. **Frontend Inquiry**: When `Implementor - FE` begins a component that consumes an API endpoint, it queries `Implementor - BE`:
   ```markdown
   From: implementor-fe
   To: implementor-be
   Subject: Schema Query: [Endpoint/Feature Name]
   Message: Checking if the request/response DTO contracts or endpoint signatures for [Feature] are finalized in the backend.
   ```
2. **Backend Response**:
   - *If Ready*: `Implementor - BE` replies with the exact file path and TypeScript/JSON/DTO interface references (e.g., `src/dto/auth.dto.ts`).
   - *If In Progress*: `Implementor - BE` provides the estimated interface contract, allowing `Implementor - FE` to mock the interface temporarily without blocking.

## 2. Test Boundary Negotiation (Unit Test <-> BE/FE)

1. `Implementor - Unit Test` queries `Implementor - BE` or `FE` regarding exported service methods and mock fixtures.
2. Direct communication ensures test files align with actual export signatures, preventing phantom method calls.

## 3. Reviewer Escalation & HITL Gate Protocols

### HITL Gate 1 (Artifact Gap - Analyst Reviewer -> Human)
```markdown
[HITL Gate 1: Artifact Review]
Analyst Reviewer identified the following gaps:
- [Rule]: [Violation summary]
- [Target]: [proposal.md / spec.md / design.md / tasks.md]

Options:
1. [Apply Fix] -> Message Analyst Creator to revise artifacts.
2. [Ignore / Proceed] -> Dispatch to Implementors.
```

### HITL Gate 2 (Code Drift - Code Reviewer -> Human)
```markdown
[HITL Gate 2: Implementation Drift Review]
Code Reviewer identified boundary drift in implementation:
- [File]: [Violation path]
- [Boundary]: [e.g. Controller executing raw SQL / Domain accessing HTTP context]

Options:
1. [Request Fix] -> Message Analyst Creator to update tasks.md and re-assign to Implementor.
2. [Approve & Archive] -> Proceed to /ag-governed-archive.
```
