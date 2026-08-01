## 1. Dependency Management

- [x] 1.1 Add `@inquirer/prompts` to `src/package.json` dependencies
- [x] 1.2 Run `npm install` in the `src/` directory

## 2. Refactor install.js Prompts

- [x] 2.1 Import `select` and `checkbox` from `@inquirer/prompts` at the top of `install.js`
- [x] 2.2 Refactor `ask()` function to dynamically dispatch to `checkbox` (for multi-select) or `select` (for single-select) based on the `multi` boolean
- [x] 2.3 Modify the structure of `choices` passed into `@inquirer/prompts` to match their expected `{ value, name }` format
- [x] 2.4 Verify that non-interactive modes (`--yes`) properly bypass the `@inquirer/prompts` calls as they did with `readline`

## 3. Verify changes

- [x] 3.1 Run `node src/install.js init` manually to verify the interactive multi-select UI appears for agents
- [x] 3.2 Run `node src/install.js init --yes --agent opencode --framework openspec --commands init` to ensure no prompts are triggered in headless mode
