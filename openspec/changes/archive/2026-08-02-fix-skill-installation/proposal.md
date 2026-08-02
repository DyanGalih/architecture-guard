## Why

The current installation script (`src/install.js`) blindly prepends a hardcoded YAML frontmatter block to skill templates that already contain their own frontmatter. This results in newly generated `SKILL.md` files (like `ag-architecture-apply`) containing two separate `---` blocks. Antigravity's YAML parser cannot handle double frontmatter and silently ignores these skills, preventing them from loading. Fixing this restores the ability for users to actually use the Architecture Guard skills after installation.

## What Changes

- Modify `src/install.js`, specifically the `installSkillMd` function.
- Parse or extract the existing frontmatter from the template `content` string.
- Construct a single, unified YAML frontmatter block containing the correct `name`, `allowed-tools`, `metadata`, and the extracted `description`.
- Strip the old frontmatter from the template content before appending it.

## Capabilities

### New Capabilities

- `skill-installation`: Refine the logic for parsing and merging YAML frontmatter during skill installation to ensure valid `SKILL.md` generation.

### Modified Capabilities

- None.

## Impact

- **Affected code:** `src/install.js` (`installSkillMd` function).
- **Impacted Systems:** Antigravity agent initialization (the generated skills will now load successfully).
