## 1. Preparation

- [x] 1.1 Analyze the current governance command selection prompt implementation in `src/install.js`.

## 2. Core Implementation

- [x] 2.1 Update the prompt options for governance selection in `src/install.js` to include an "All" option (e.g., adding a pseudo-command or instructions to type a specific keyword).
- [x] 2.2 Add logic in `src/install.js` immediately following the governance prompt to intercept the "All" choice. If selected, set the chosen array to the full `COMMANDS` list.

## 3. Verification

- [x] 3.1 Verify that selecting the "All" option successfully selects all available governance commands without errors.
- [x] 3.2 Verify that selecting specific options (without "All") still works perfectly.
- [x] 3.3 Verify that selecting "All" alongside other options safely resolves to all commands without duplicating entries.
