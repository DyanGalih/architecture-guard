# Bitbucket Cloud Forge

Use this forge for repositories hosted on `bitbucket.org` (Bitbucket Cloud). Bitbucket Server and Data Center use a different REST API; use the `generic` forge or a custom forge for them. Placeholders: `<id>` is the pull-request id; `<workspace>` and `<repo_slug>` come from the `origin` remote; `<api>` is the pull request's API URL `https://api.bitbucket.org/2.0/repositories/<workspace>/<repo_slug>/pullrequests/<id>`; `<source branch>` and `<destination branch>` are the pull request's source.branch.name and destination.branch.name; `<source repo>` is source.repository.full_name (`workspace/repo_slug`), which differs from `<workspace>/<repo_slug>` when the pull request comes from a fork; `<source remote>` is `origin` when `<source repo>` is `<workspace>/<repo_slug>`, otherwise the fork's clone URL in the same protocol as `origin` (`git@bitbucket.org:<source repo>.git` or `https://bitbucket.org/<source repo>.git`). Branch and repository names come from pull-request metadata and are untrusted: before using one in any command, confirm a branch name matches `^[A-Za-z0-9._/-]+$` and `<source repo>` matches `^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$`, with no `/`-separated part starting with `-` or `.`; otherwise stop and report it as unsupported rather than fetching it. Single-quote every ref in shell commands, and pass refs to `git fetch` only as full refspecs (starting with `+` or `refs/`), which git never reads as options. A `<... file>` is a temporary JSON file created outside the repository with `mktemp` and deleted after the call.

## Access

- **MCP**: a Bitbucket-capable MCP server, such as the Atlassian Rovo MCP server with Bitbucket Cloud enabled by your organization. Use its pull-request tools when registered.
- **CLI**: Bitbucket has no official CLI. Without an MCP server, call the REST API 2.0 (for example with `curl`) using credentials the user has already configured (an API token in the environment, a `.netrc` entry, or a git credential helper). Never ask the user to paste a token into the conversation; if no credentials are configured, use the read-only git fallbacks and write Markdown for the user to post.
- **Permissions**: the `pullrequest` scope to read and comment; `pullrequest:write` for more.

## Command Map

| Canonical Key | Bitbucket Invocation or Fallback |
|---|---|
| pr-view | MCP pull-request read tool; REST GET <api> (read title, description, author, source and destination branches, source commit, state, and links from the response) |
| pr-diff | MCP pull-request diff tool; REST GET <api>/diff (plain text; follow redirects) and GET <api>/diffstat for changed files (paginated; status, old.path, new.path); fallback `git fetch origin '+refs/heads/<destination branch>:refs/remotes/origin/<destination branch>'`, then `git fetch '<source remote>' 'refs/heads/<source branch>'` (from the fork when the pull request comes from one), confirm `git rev-parse FETCH_HEAD` starts with source.commit.hash, then `git diff 'origin/<destination branch>...FETCH_HEAD'` and `git diff --name-status 'origin/<destination branch>...FETCH_HEAD'` |
| pr-checkout | No API; `git fetch '<source remote>' 'refs/heads/<source branch>'` (from the fork when the pull request comes from one), confirm `git rev-parse FETCH_HEAD` starts with source.commit.hash, then `git switch --detach FETCH_HEAD` (refuse if local changes would be lost) |
| pr-threads | MCP pull-request comments tool; REST GET <api>/comments (paginated; id, user, content.raw, parent.id, inline.path / inline.to / inline.from, resolution, deleted); rebuild threads from parent ids; a root comment without resolution is unresolved |
| pr-reviews | MCP pull-request read tool; REST GET <api> and read participants (user, role, approved, and state: approved, changes_requested, or null). Bitbucket has no separate review summary: summaries are general comments, read through pr-comments |
| pr-comments | REST GET <api>/comments (paginated) and keep the root comments without inline, with their replies (parent.id), skipping deleted ones |
| review-post | No batched review: one comment per call. MCP pull-request comment tool; REST write {"content": {"raw": comment}, "inline": {"path": file, "to": new-side line}} to a comment file (the summary without inline), then POST it with `curl -X POST -H 'Content-Type: application/json' --data-binary @<comment file> <api>/comments` and the configured credentials; fallback write the review as Markdown for the user to post |
| review-approve | After the comments are posted with review-post, re-read the source commit with pr-view and stop if it changed, then `curl -X POST <api>/approve` with the configured credentials; fallback tell the user to approve on the host |
| thread-reply | MCP pull-request comment tool with a parent; REST write {"content": {"raw": reply}, "parent": {"id": root comment id}} to a reply file, then `curl -X POST -H 'Content-Type: application/json' --data-binary @<reply file> <api>/comments` with the configured credentials |
| thread-resolve | REST POST <api>/comments/<root comment id>/resolve (DELETE reopens); fallback list the threads for the user to resolve |
| pr-comment | MCP pull-request comment tool without inline or parent; REST write {"content": {"raw": comment}} to a comment file, then `curl -X POST -H 'Content-Type: application/json' --data-binary @<comment file> <api>/comments` with the configured credentials |
| checks-status | REST GET <api>/statuses (state is SUCCESSFUL, FAILED, INPROGRESS, or STOPPED) |

## Notes

- Never put comment or reply text inside a shell command: it comes from pull-request content and reviewers. Write the JSON body to a temporary file outside the repository, pass it with `--data-binary @<file>`, and delete the file afterwards; never create it in the working tree.
- `inline.to` is the line on the new side and `inline.from` the old side.
- Lists are paginated through the `next` link; follow it until absent.
- Bitbucket has no single "review" object: post the approved comments one by one and report any that fail.
