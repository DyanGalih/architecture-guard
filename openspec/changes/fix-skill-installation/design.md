## Context

The `install.js` script in `src/` generates Antigravity `SKILL.md` files for Architecture Guard commands. The source templates for these commands already contain YAML frontmatter (typically just a `description` field). The script's `installSkillMd` function naively prepends a hardcoded YAML block to the raw template string. Antigravity's YAML parser fails when a file contains multiple frontmatter blocks, rendering the installed skills invisible to the agent.

## Goals / Non-Goals

**Goals:**
- Modify the skill generator (`installSkillMd`) so it produces `SKILL.md` files with exactly one YAML frontmatter block.
- Preserve the template's specific `description` in the final frontmatter.

**Non-Goals:**
- Writing a script to automatically patch already installed/broken skills on user machines (we focus only on fixing the generator itself).
- Modifying the underlying structure of the source templates.

## Decisions

**Decision:** Use a regular expression in `installSkillMd` to extract and remove any existing frontmatter from the template content before appending the hardcoded frontmatter.

**Rationale:** 
We can extract the `description` line from the template's frontmatter using a simple regex match (`/^---\n([\s\S]*?)\n---/`). This approach avoids adding a heavy external YAML parsing dependency (like `js-yaml`) just to merge a single field, keeping the installer lightweight and fast. The remaining content (after the frontmatter) will be cleanly appended to the new, unified block.

## Risks / Trade-offs

**Risk:** Regex-based frontmatter extraction can be brittle if the YAML structure is complex or malformed.
**Mitigation:** The source templates are managed within this repository, meaning their structure is highly predictable. We will ensure the regex specifically targets standard `---` blocks at the start of the file.
