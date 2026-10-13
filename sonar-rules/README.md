# SonarLint Rules Bundle

The bundled rule set used by the `ag-review-implementation` skill during its optional code quality scan. It is repository-native and IDE-agnostic: any agent that can read the project can use it, with or without SonarLint installed.

## Where It Is Installed

| Install | Path |
|---|---|
| Standalone (`architecture-guard init`) | `.architecture-guard/sonar-rules/` (the adapter's `sonar-rules` path) |
| Legacy Spec Kit extension | `.specify/extensions/architecture-guard/sonar-rules/` |

## Files

- `sonarlint-rules.json` — the rule set.
- `rules-manifest.json` — version, verification source, language support, and rule count.
- `README.md` — this file.

## What Is Bundled

24 rules for Java, JavaScript, TypeScript, and Python that signal architecture problems rather than style:

- **Brain overload / complexity** — cognitive and cyclomatic complexity, long functions, oversized files and classes.
- **Dependency** — long parameter lists and, for Java, class coupling.
- **Structure** — duplicated literals that often encode a rule or contract value with no single owner.

Every `key`, `name`, and `severity` matches SonarSource's own rule metadata (sonar-java, SonarJS, sonar-python), verified on 2026-10-13. `severity` is SonarSource's default severity; the review maps it onto Architecture Guard's shared severity scale. `tags` are Architecture Guard categories used to group findings, not SonarSource tags. `description` explains the architecture signal and is Architecture Guard's own text.

Style rules (formatting, naming) and TODO tracking are deliberately excluded; TODO markers are covered by the `todo-comments` hygiene rule.

## How It Is Used

`ag-review-implementation` loads the bundle, applies it heuristically to the changed files (or runs SonarLint when a SonarLint tool is available), keeps findings related to complexity, coupling, or structure, suppresses duplicates of architecture violations, and reports them as a separate code quality section. Heuristic findings are labelled `Heuristic Sonar Rules Analysis`, never as SonarLint output.

## Changing the Rules

Edit `sonarlint-rules.json` directly — for example, remove languages you do not use or add rules your team relies on. When adding a rule:

1. Use a real SonarSource key (`<language>:S<number>`), and copy its title and default severity from [rules.sonarsource.com](https://rules.sonarsource.com).
2. Keep it architecture-relevant: complexity, size, coupling, or ownership. Do not add style or naming rules.
3. Update `total_rules`, `architecture_rules_count`, and `language_support` in `rules-manifest.json`.

Edits to an installed copy are replaced on the next `architecture-guard init`; keep project-specific changes under version control so they can be reapplied.
