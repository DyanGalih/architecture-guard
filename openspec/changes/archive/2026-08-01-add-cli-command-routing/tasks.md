## 1. Refactor install.js

- [x] 1.1 Extract interactive installation logic from `main()` into `runInit(target, opts)`
- [x] 1.2 Update `parseArgs(argv)` to parse `-v` and `--version` as `opts.version`

## 2. Implement CLI Routing

- [x] 2.1 Add early return in `main()` for `opts.version` to print the package version
- [x] 2.2 Add command routing in `main()` based on `opts.values[0]`
- [x] 2.3 Route `init` command (or an empty command `opts.values[0] == null`) to the `runInit` helper function
- [x] 2.4 Handle explicitly unrecognized commands by printing usage instructions and exiting

## 3. Verify changes

- [x] 3.1 Run `node src/install.js --version` to ensure it prints version and exits
- [x] 3.2 Run `node src/install.js init .` to ensure it starts the installation process
- [x] 3.3 Run `node src/install.js unknown` to ensure it displays an error and usage instructions
- [x] 3.4 Run `node src/install.js` with no commands to ensure it defaults to the installation process (backward compatibility)
