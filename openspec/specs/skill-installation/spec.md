## ADDED Requirements

### Requirement: Single Frontmatter Generation
The installation script (`src/install.js`) MUST generate `SKILL.md` files containing exactly one valid YAML frontmatter block. It MUST parse or strip any existing YAML frontmatter blocks from the source templates prior to writing the final output.

#### Scenario: Installing a skill from a template with existing frontmatter
- **WHEN** the source markdown template contains an existing YAML frontmatter block (e.g. with a `description` field)
- **THEN** the generator extracts that description, merges it into the new standard frontmatter block, and strips the original block from the template content before saving the `SKILL.md` file.
