## 1. Preparation

- [ ] 1.1 Review the current skill generation code in `src/commands/` or `src/orchestration/` to identify where paths are defined.

## 2. Core Implementation

- [x] 2.1 Implement logic to check if a path is defined by the user during skill creation.
- [x] 2.2 Update path resolution to default to Workspace scope `.agents/skills/{skill_name}/SKILL.md` if a path is defined.
- [x] 2.3 Implement a confirmation prompt for Global installation if no path is defined.
- [x] 2.4 Add logic to request necessary permissions for global installation when no path is defined.
- [x] 2.5 Resolve target to Global scope `~/.gemini/antigravity-cli/skills/{skill_name}/SKILL.md` upon confirmation and permission grant.
- [x] 2.6 Update the path resolution logic for generating skills in the Shared scope to `~/.gemini/skills/{skill_name}/SKILL.md`.
- [x] 2.7 Ensure the relevant logic applies the `ag-` prefix automatically if not provided, generating the corresponding folder under the target directory.
- [x] 2.8 Implement upfront check to identify if any requested skills already exist at their resolved target paths.
- [x] 2.9 Add logic to prompt the user only once for overwrite confirmation if existing skills are found.
- [x] 2.10 Pass the overwrite decision to the skill generation logic to skip individual prompts.
- [x] 2.11 Update `installCommand` (or related logic) in `src/install.js` to detect when the `antigravity` target is selected.
- [x] 2.12 When `antigravity` is selected, generate a workflow file in `.agent/workflows/` using the `agx-` prefix and `.md` extension, writing the raw markdown content without the `SKILL.md` frontmatter.

## 3. Verification

- [x] 3.1 Test generating a new skill with a path locally and ensure the folder is created inside `.agents/skills/`.
- [x] 3.2 Test generating a new skill without a path, verify the prompt and permission request, and ensure it goes into `~/.gemini/antigravity-cli/skills/`.
- [x] 3.3 Test generating a new skill as shared and confirm it creates `~/.gemini/skills/`.
- [x] 3.4 Test generating multiple skills where some already exist, verifying the system only prompts once for replacement.
- [x] 3.5 Test generating a command for `antigravity` and verify that a workflow file is created in `.agent/workflows/agx-<name>.md` along with the skill in `.agents/skills/ag-<name>/SKILL.md`.
