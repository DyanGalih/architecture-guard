# NPM Publish

## ADDED Requirements

### Requirement: Package published as `architecture-guard` on npm
Name `architecture-guard` SHALL be the npm package name. Verified available (404 on registry). The system SHALL include a `package.json` with a `bin` entry pointing to `install.js` so users can install globally or execute directly.

#### Scenario: Global install
- **WHEN** user runs `npm install -g architecture-guard`
- **THEN** the `install.js` CLI is available as `architecture-guard` or `npx architecture-guard`

#### Scenario: Execute via npx without install
- **WHEN** user runs `npx architecture-guard`
- **THEN** the installer runs without requiring prior global install

### Requirement: Package metadata follows npm conventions
The `package.json` SHALL include name, version, description, license, keywords, repository link, and author fields.

#### Scenario: npm info displays correct metadata
- **WHEN** user runs `npm info architecture-guard`
- **THEN** name, description, version, license, repository URL, and keywords related to "sdd", "architecture", "governance", "speckit", "openspec", "ai-agent" are visible

### Requirement: Only installer related files published to npm
The npm publish SHALL include only files necessary for the installer to work: `install.js`, `adapters/`, `orchestration/`, `templates/`, `presets/`, `hygiene-rules/`, `sonar-rules/`, the changed-file detection scripts used by standalone review, `package.json`, `README.md`, `LICENSE`, and installer documentation.

#### Scenario: npm pack excludes dev files
- **WHEN** running `npm pack`
- **THEN** `.git/`, `docs/`, `examples/`, non-runtime scripts, `CONTRIBUTING.md`, test files, and `.opencode/` directories are excluded from the tarball

### Requirement: Versioning follows semver
The system SHALL follow semantic versioning for npm releases.

#### Scenario: New patch release
- **WHEN** a bug fix is published
- **THEN** the patch version increments (x.y.Z+1)

### Requirement: README includes npm install instructions
The published README SHALL document `npx architecture-guard` and `npm install -g architecture-guard` as primary install methods alongside existing SpecKit extension installation.

#### Scenario: Published README shows npm entry points
- **WHEN** a user reads the published package README
- **THEN** both `npx architecture-guard` and `npm install -g architecture-guard` are documented as install methods
