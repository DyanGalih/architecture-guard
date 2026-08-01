## Context
Currently, the interactive installation process (`init` flow) prompts the user to select which governance commands to install from a provided list. The prompt is handled by a helper function (`ask`) in `src/install.js`. Users who wish to install all available commands must select them one by one. To streamline the setup process, we want to introduce an "All" option that automatically resolves to the full set of governance commands.

## Goals / Non-Goals
**Goals:**
- Provide a simple "All" option in the governance commands selection prompt.
- Automatically map the "All" selection to the complete list of available `COMMANDS`.
- Preserve the ability to select specific, individual commands.

**Non-Goals:**
- Modifying the behavior or content of the actual governance commands.
- Changing other prompts that do not require an "All" selection.

## Decisions
- **Inject "All" Option Locally:** Instead of broadly modifying the `ask()` helper to support an "All" selection (which could have unintended side effects on other prompts), we will handle this in `src/install.js` where the governance commands prompt is defined. 
- **Implementation Strategy:** We will add a pseudo-command or a specific keyword (like "all" or "*") to the prompt instructions. When the user inputs this choice, the logic in `src/install.js` will intercept it and assign the `selectedCommands` array to contain every item in the `COMMANDS` array.
- **Alternative Considered:** Updating the `ask` utility to natively support an "all" option for any multi-select prompt. We rejected this to minimize risk and keep the scope targeted, as it's primarily needed for this specific governance command selection.

## Risks / Trade-offs
- **Risk:** Users might select "All" along with specific commands (e.g., "all, 1, 3"), which could lead to duplicates or parse errors depending on the `ask()` function's robustness.
- **Mitigation:** The logic interpreting the selection in `src/install.js` will explicitly check if the "all" option was selected. If so, it will bypass specific selections and simply return all `COMMANDS`, ignoring redundant specific choices.
