# Bitbucket Cloud Forge

Use this forge for repositories hosted on `bitbucket.org`. Placeholders: `<id>` is the pull-request id; `<workspace>` and `<repo_slug>` come from the `origin` remote. API base: `https://api.bitbucket.org/2.0/repositories/<workspace>/<repo_slug>/pullrequests/<id>`.

## Access

- **MCP**: a Bitbucket-capable MCP server, such as the Atlassian Rovo MCP server with Bitbucket Cloud enabled by your organization. Use its pull-request tools when registered.
- **CLI**: Bitbucket has no official CLI. Without an MCP server, call the REST API 2.0 with credentials the user has already configured (an API token in the environment or a git credential helper). Never ask the user to paste a token into the conversation; if no credentials are configured, use the read-only git fallbacks and write Markdown for the user to post.
- **Permissions**: the `pullrequest` scope to read and comment; `pullrequest:write` for more.

## Command Map

| Canonical Key | Bitbucket Invocation or Fallback |
|---|---|
| pr-view | MCP pull-request read tool; REST GET <base> (read title, description, author, source and destination branches, source commit, state, and links from the response) |
| pr-diff | MCP pull-request diff tool; REST GET <base>/diff (plain text; follow redirects) and GET <base>/diffstat for changed files (paginated; status, old.path, new.path); fallback `git diff <destination>...<source>` after fetching both branches |
| pr-checkout | No API; `git fetch origin <source branch>` then `git switch --detach FETCH_HEAD` (refuse if local changes would be lost) |
| pr-threads | MCP pull-request comments tool; REST GET <base>/comments (paginated; id, user, content.raw, parent.id, inline.path / inline.to / inline.from, resolution, deleted); rebuild threads from parent ids; a root comment without resolution is unresolved |
| review-post | No batched review: one comment per call. MCP pull-request comment tool; REST POST <base>/comments with {"content": {"raw": comment}, "inline": {"path": file, "to": new-side line}}; the summary without inline; fallback write the review as Markdown for the user to post |
| thread-reply | MCP pull-request comment tool with a parent; REST POST <base>/comments with {"content": {"raw": reply}, "parent": {"id": root comment id}} |
| thread-resolve | REST POST <base>/comments/<root comment id>/resolve (DELETE reopens); fallback list the threads for the user to resolve |
| checks-status | REST GET <base>/statuses (state is SUCCESSFUL, FAILED, INPROGRESS, or STOPPED) |

## Notes

- `inline.to` is the line on the new side and `inline.from` the old side.
- Lists are paginated through the `next` link; follow it until absent.
- Bitbucket has no single "review" object: post the approved comments one by one and report any that fail.
