## Context

The `architecture-guard` CLI is distributed via npm. Currently, users have no in-tool way to update to the latest version. This design covers the implementation of a `self-update` command.

## Goals / Non-Goals

**Goals:**
- Provide an `update` command in the CLI.
- Automatically check the npm registry for the latest version.
- Download and install the latest version via `npm install -g architecture-guard@latest` or equivalent.

**Non-Goals:**
- Automatically updating without user intent (e.g. background polling and forced updates) is out of scope.
- Updating via other package managers (e.g., yarn, pnpm) is supported only if the environment natively executes npm commands. We'll default to `npm`.

## Decisions

1. **Version Checking Mechanism**: 
   - **Decision**: We will use the npm registry API (`https://registry.npmjs.org/architecture-guard/latest`) or execute `npm view architecture-guard version` to get the latest version.
   - **Rationale**: Relying on native `npm view` ensures we use the user's configured npm registry (which may be a private proxy) instead of hardcoding the public registry URL.

2. **Update Execution**:
   - **Decision**: We will spawn a child process running `npm install -g architecture-guard@latest`.
   - **Rationale**: This is the standard way to globally update a CLI package installed via npm.

## Risks / Trade-offs

- **Risk**: The user might have installed the package locally rather than globally, or using a tool like `npx` or `specify`. 
  - **Mitigation**: We can detect if it's a global install, but for simplicity, we will attempt the global install update. If it fails, we inform the user to manually run the install command.
