# Rule: Deprecated & Dangerous Code

**Identifier**: `deprecated-and-dangerous-code`
**Description**: Detect and forbid obsolete, deprecated, removed, or dangerous language and framework APIs that cause runtime errors, security vulnerabilities, or severe regressions.
**Default Severity**: Critical
**Recommendation**: Always replace deprecated or dangerous constructs with standard, actively supported language or framework capabilities prior to writing or committing code.

## Purpose

AI agents and developers frequently introduce deprecated SDK methods, obsolete language syntax, or dangerous functions when generating implementation code. This rule provides an authoritative pre-implementation reference and verification gate to eliminate obsolete code patterns before they cause runtime failures.

---

## Pattern Catalog by Language & Framework

### 1. PHP (PHP 8.0 - 8.3+)

| Deprecated / Dangerous Pattern | Failure Mode / Risk | Approved Modern Replacement |
|---|---|---|
| Dynamic Properties (setting undeclared class properties) | Deprecated in PHP 8.2; fatal in PHP 9.0 | Explicitly declare typed properties or use `#[AllowDynamicProperties]` attribute when justified |
| `utf8_encode()`, `utf8_decode()` | Deprecated in PHP 8.2; removed in PHP 9.0 | `mb_convert_encoding()` or `intl` extension (`UConverter`) |
| `create_function()` | Removed in PHP 8.0 (Fatal Error / RCE risk) | Native anonymous functions / closures (`function() {}` or `fn() => ...`) |
| `each()` | Removed in PHP 8.0 | `foreach ($array as $key => $value)` or `ArrayIterator` |
| `mysql_*` functions (`mysql_query`, `mysql_connect`) | Removed in PHP 7.0 | `PDO` with prepared statements or `mysqli` |
| `unserialize()` on untrusted input | Arbitrary PHP object injection / RCE | `json_decode()` or safe typed DTO deserialization |
| `eval()` with variable or user input | Remote Code Execution (RCE) | Structured data parsing, strategies, or expression language engines |

---

### 2. JavaScript / TypeScript / Node.js

| Deprecated / Dangerous Pattern | Failure Mode / Risk | Approved Modern Replacement |
|---|---|---|
| `new Buffer(...)` | Deprecated and security vulnerability | `Buffer.from(...)` or `Buffer.alloc(...)` |
| `String.prototype.substr()` | Deprecated in Web standards | `String.prototype.substring()` or `String.prototype.slice()` |
| `fs.exists()` | Deprecated; causes race conditions (TOCTOU) | `fs.access()`, `fs.promises.access()`, or handle `ENOENT` on `fs.readFile()` / `fs.stat()` |
| Synchronous blocking I/O (`fs.readFileSync`, `crypto.pbkdf2Sync`) inside web request handlers | Blocks Node.js event loop, crippling throughput | Asynchronous APIs (`fs.promises.*`, `async/await`) |
| `document.write()` | Performance regression, security risks | DOM APIs (`element.appendChild()`, `textContent`) or framework data-binding |
| Loose `eval()` / `new Function()` with dynamic strings | Cross-Site Scripting (XSS) / Code Injection | Standard parser, JSON parsing, or isolated sandbox |

---

### 3. Angular (Modern Angular 16 - 19+)

| Deprecated / Dangerous Pattern | Failure Mode / Risk | Approved Modern Replacement |
|---|---|---|
| Unmanaged `.subscribe()` in components | Memory leak, stale event triggers | `AsyncPipe` (`observable$ \| async`), `toSignal()`, or `takeUntilDestroyed()` |
| Direct DOM access (`document.getElementById()`, `element.innerHTML`) | Breaks Server-Side Rendering (SSR) & Hydration, XSS risk | Angular Template syntax, Signals, `Renderer2`, `ElementRef`, or `isPlatformBrowser()` guards |
| Mutating `@Input()` or `input()` properties directly | One-way data-flow violation, unpredictable change detection | Readonly inputs, emit events via `output()`, or use two-way `model()` |
| `ComponentFactoryResolver` | Deprecated in Angular 13+; removed in modern Angular | `ViewContainerRef.createComponent()` |
| Legacy NgModule declarations for new features | Increased bundle size, complex boilerplate | Standalone Components (`standalone: true` or default in v17+) |

---

### 4. React (React 18 - 19+)

| Deprecated / Dangerous Pattern | Failure Mode / Risk | Approved Modern Replacement |
|---|---|---|
| Legacy lifecycles (`componentWillMount`, `componentWillReceiveProps`, `componentWillUpdate`) | Removed or dangerous in Concurrent React | `useEffect()`, `useLayoutEffect()`, or custom hooks |
| `defaultProps` on Function Components | Deprecated in React 18+; removed in React 19 | JavaScript default parameter values (`function Component({ prop = defaultVal })`) |
| Direct state mutation (e.g. `this.state.x = y` or mutating state objects directly) | Breaks React re-renders and immutability guarantees | `useState()`, `useReducer()`, or immutable state updates (`setState({...prev, x: y})`) |
| Unmemoized heavy calculations in render body | Severe frame drops and UI lag | `useMemo()` or derive state in event handlers / state stores |

---

### 5. Security & General Web Standards

| Deprecated / Dangerous Pattern | Failure Mode / Risk | Approved Modern Replacement |
|---|---|---|
| Plain `md5()` or `sha1()` for passwords | Cryptographically broken; trivial collision/rainbow attacks | `bcrypt`, `argon2id`, or PBKDF2 with high iteration counts |
| `Math.random()` for tokens, nonces, or security keys | Cryptographically insecure PRNG (predictable numbers) | `crypto.getRandomValues()` (Web API) or `crypto.randomBytes()` (Node.js) |
| Hardcoded API secrets, JWT keys, or database credentials | Secret exposure in version control | Environment variables / Secret manager services |

---

## Detection & Enforcement

1. **Pre-Implementation Preflight (`ag-governed-implement`)**:
   - Before implementing any task, check the active language and framework against this catalog.
   - If an obsolete pattern is considered in the technical design or task, substitute the approved replacement immediately.
2. **Review & Verification Gates (`ag-verify`, `ag-review-implementation`)**:
   - Flag any presence of listed deprecated or dangerous patterns as a **Critical** blocking violation.
   - Do not pass verification until obsolete code is replaced with modern, supported constructs.

---

## Continuous Growth & Self-Learning Flow

This catalog is designed to **grow dynamically during development**:

1. **User Reported / Remediated Deprecations**:
   - Whenever the user corrects an obsolete API or reports a deprecation/runtime error during implementation, Architecture Guard logs the entry into this file under the matching ecosystem section.
2. **Post-Implementation & Archival Learning (`ag-governed-archive`, `ag-verify`)**:
   - Newly discovered deprecated methods or refactored unsafe patterns are proposed for capture into:
     - Local Hygiene Rule (`.architecture-guard/hygiene-rules/deprecated-and-dangerous-code.md`)
     - Flash-Mem durable knowledge objects (`add_knowledge_object` / `add_memory` with tags `#deprecated-code`, `#anti-pattern`)
3. **Project-Specific Custom Entries**:
   - Teams can append internal legacy methods or deprecated service classes directly to this table to prevent AI agents from re-introducing them in future tasks.

