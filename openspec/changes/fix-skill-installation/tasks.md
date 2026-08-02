## 1. Skill Generator Update

- [x] 1.1 In `src/install.js`, locate `installSkillMd` and add a Regex block to extract any existing frontmatter from the `content` parameter (specifically targeting the `description`).
- [x] 1.2 Construct the new YAML frontmatter block merging the `name`, `metadata`, and the extracted `description`.
- [x] 1.3 Strip the original frontmatter from `content` so the final output string contains exactly one `---` block at the top.

## 2. Validation

- [x] 2.1 Run the installation script locally to generate a test skill and manually verify that `SKILL.md` contains only a single frontmatter block.
