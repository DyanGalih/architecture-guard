# Repository Context

The **workspace** is the directory that holds `.architecture-guard/`: rules, constitutions, configuration, and the specification artifacts the adapter maps. It may wrap **application repositories** with their own git history and `origin` (for example `src/`, often gitignored by the workspace), listed under `repositories` in `.architecture-guard/config.yml`:

```yaml
repositories:
  - name: app        # used with --repo and in reports
    path: src        # relative to the workspace, inside it
    roles: [code]    # code: reviewed, tested, hygiene; specs: holds specification artifacts
```

Without `repositories`, the workspace is the only repository and every rule below reduces to today's single-repository behavior. A workspace that is not itself a git repository has no workspace git steps (no branch check, commit, or push there); its repositories still do.

## Owning repository

The **owning repository** of a path is the configured repository whose `path` contains it (longest match); otherwise the workspace. Paths in reports, task lists, and tool output are workspace-relative (`src/app/...`).

## Where each step runs

- **Git** (`status`, `diff`, `log`, `branch`, `worktree`, commit, push): in the owning repository (`git -C <path>`). Never infer one repository's state from another's.
- **Branch preflight**: check `git branch --show-current` in every repository the phase will write to (the workspace for specification artifacts, each owning repository for code). Stop if any of them is on a protected branch; create or select a feature branch per repository, with approval, and report the branch per repository.
- **Changed files**: `architecture-guard detect-changed-files --json` run from the workspace lists the workspace's changes and every configured repository's, as workspace-relative paths; `--repo <name>` limits it to one repository (and is required with `--base`), and `--security-sensitive` applies the workspace's `security_sensitive_paths` (workspace-relative globs) plus each repository's own (repository-relative globs). Run inside a configured repository, it still uses the workspace's settings.
- **Hygiene**: `architecture-guard hygiene --json --target <workspace>` scans the workspace and every configured repository; pass changed files to `--files` as workspace-relative paths. When scanning a checkout outside the workspace (a pull-request worktree), add `--policy-root <workspace>` so the policy and rules stay the workspace's.
- **Security review**: dispatch the host Security Review once per owning repository, from that repository's directory, with that repository's changed files; a review run from the workspace sees no change inside a nested repository. If it cannot be scoped, report it `Degraded`, never passed.
- **Tests and builds**: in the owning repository, with that repository's own tooling.
- **Code host (forge) actions**: from the owning repository's directory, so the host CLI resolves `<owner>`, `<repo>`, and similar values from that repository's `origin`. For a pull request given as a URL, use the repository (the workspace or a configured repository) whose `origin` matches it; if none matches, stop and ask. For a bare number, ask which repository it belongs to. The installed pull-request skills target one code host per workspace; when a repository's host differs, report it instead of guessing.

## Writes

- Propose **one commit per repository**, listing the repository, branch, and files. A commit never spans repositories.
- Ask separately before pushing each repository, naming the repository, remote, and branch. Never force-push.
- A pull request belongs to one repository; a change that touches several repositories opens one per repository and links them.

## Rules stay in the workspace

Rules, constitutions (including paths under `governance`), adapters, and configuration come from the workspace, never from an application repository's or a pull request's copy. An application repository's own `.architecture-guard/config.yml` contributes only its `security_sensitive_paths`.
