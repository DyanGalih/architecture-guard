# Rule: Unresolved Governance Citations

**Identifier**: `unresolved-governance-citations`
**Description**: Report cited constitution or governance documents that reviewers cannot open: the path is outside the repository, gitignored, or missing.
**Default Severity**: Warning
**Recommendation**: Keep every governance document that code, comments or specifications cite inside the repository and tracked, and declare it under `governance` in `.architecture-guard/config.yml`. Fix or remove links that point outside the repository.

## Detection Logic

Scan text files for cited paths that contain a slash and name a `*constitution*.md` file (Markdown link targets, paths in prose or comments). Resolve each from the citing file and, for non-relative paths, from the repository root. Report it when no candidate is in the reviewed file set (tracked, or untracked and not gitignored). Bare file names such as `constitution.md` are treated as prose and not reported, and files under hidden directories (installed tool and agent prompts such as `.claude/` or `.codex/`) are skipped. In a workspace with `repositories`, a file inside a repository must cite documents that repository holds.
