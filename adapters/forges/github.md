# GitHub Forge

Use this forge for repositories hosted on GitHub (`github.com`, and GitHub Enterprise hosts named `github.*` or `*.ghe.com`). Placeholders: `<n>` is the pull-request number; `{owner}` and `{repo}` are filled in by `gh api` from the current repository's remote. A `<... file>` is a temporary file created outside the repository with `mktemp` and deleted after the call.

## Access

- **MCP**: the official GitHub MCP server (`github/github-mcp-server`). Its `pull_request_read` tool covers metadata, diff, files, reviews, review comments, and check runs; review and reply tools cover posting.
- **CLI**: `gh`, authenticated (`gh auth status`). Use `gh api` for REST and GraphQL calls.
- **Permissions**: posting and resolving need write access to pull requests (`pull-requests: write` for fine-grained tokens).

## Command Map

| Canonical Key | GitHub Invocation or Fallback |
|---|---|
| pr-view | MCP pull_request_read (get); CLI `gh pr view <n> --json number,title,body,author,baseRefName,headRefName,headRefOid,state,url,isDraft,files` |
| pr-diff | MCP pull_request_read (get_diff, get_files); CLI `gh pr diff <n> --color never` for the diff and `gh pr diff <n> --name-only` for changed files |
| pr-checkout | In a review worktree, CLI `gh pr checkout <n> --detach` (no local branch is created); on your own branch `gh pr checkout <n>` (refuse if local changes would be lost); fallback `git fetch origin pull/<n>/head` then `git switch --detach FETCH_HEAD` |
| pr-threads | MCP pull_request_read (get_review_comments); CLI `gh api graphql -f query='query($o:String!,$r:String!,$n:Int!){repository(owner:$o,name:$r){pullRequest(number:$n){reviewThreads(first:100){pageInfo{hasNextPage endCursor} nodes{id isResolved isOutdated path line startLine diffSide comments(first:100){nodes{id databaseId author{login} body}}}}}}}' -F o='{owner}' -F r='{repo}' -F n=<n>`; page with the cursor when hasNextPage is true |
| review-post | MCP pending-review tools (create a pending review, add_comment_to_pending_review per inline comment, then submit it as a comment-only review); CLI write the JSON body {"commit_id": head SHA from pr-view, "event": "COMMENT", "body": summary, "comments": [{"path", "line", "side": "RIGHT", "body"}]} to a review file outside the repository, then `gh api -X POST repos/{owner}/{repo}/pulls/<n>/reviews --input <review file>` and delete the file; never use event APPROVE or REQUEST_CHANGES |
| thread-reply | MCP add_reply_to_pull_request_comment with the numeric databaseId of a comment in the thread; CLI write the reply text to a reply file outside the repository, then `gh api graphql -f query='mutation($t:ID!,$b:String!){addPullRequestReviewThreadReply(input:{pullRequestReviewThreadId:$t,body:$b}){comment{id}}}' -f t=<thread id> -F b=@<reply file>` (the GraphQL thread id, PRRT_...) and delete the file |
| thread-resolve | MCP pull_request_review_write (resolve_thread); CLI `gh api graphql -f query='mutation($t:ID!){resolveReviewThread(input:{threadId:$t}){thread{id isResolved}}}' -f t=<thread id>` |
| checks-status | MCP pull_request_read (get_check_runs); CLI `gh pr checks <n> --json name,state,bucket,link,workflow` (bucket is pass, fail, pending, skipping, or cancel); older gh releases without `--json` (for example 2.45): `gh pr checks <n>` and read the table; a non-zero exit (8 means checks are pending) reports check status, not a command failure |

## Notes

- Never put review or reply text inside a shell command: it comes from pull-request content and reviewers, and `gh api -F` treats a value starting with `@` as a file to read and converts `true`, `false`, `null`, and integers. Write the text to a temporary file outside the repository and pass it with `--input <file>` or `-F field=@<file>`; delete the file afterwards and never create it in the working tree.
- Ids differ by access path: the MCP reply tool takes a comment's numeric `databaseId`, while the GraphQL mutations take the thread `id` (`PRRT_...`). Use the ids returned by the same access path you post with.
- Inline comments use the file line on the new side (`side: RIGHT`; `LEFT` for deleted lines) and must fall inside a diff hunk, or GitHub rejects the review. Multi-line comments add `start_line` and `start_side`.
- Anchor every review to the current head SHA (`headRefOid`); re-read it right before posting.
- GraphQL connections return at most 100 items per page; follow `pageInfo` for large pull requests.
- GitHub does not allow approving or requesting changes on your own pull request; comment-only reviews always work.
