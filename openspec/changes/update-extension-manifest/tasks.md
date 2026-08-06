## 1. Extension Manifest Naming

- [x] 1.1 Update `src/extension.yml` to prefix all provided commands with `speckit.architecture-guard.`
- [x] 1.2 Update `src/extension.yml` to prefix all hooks with `speckit.architecture-guard.`

## 2. Dynamic CLI Versioning

- [x] 2.1 Update `src/bin/cli.ts` to include `fs` and `path` imports for reading `package.json`
- [x] 2.2 Update `src/bin/cli.ts` to locate and parse the version string from `package.json` at runtime
- [x] 2.3 Modify the `program.version()` call in `src/bin/cli.ts` to use the dynamic version variable instead of the hardcoded string
