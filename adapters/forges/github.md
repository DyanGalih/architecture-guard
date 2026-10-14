# GitHub Forge

Use this forge for repositories hosted on GitHub. Placeholders: `<n>` is the pull-request number, `<owner>`/`<repo>` come from the `origin` remote.

## Access

- **MCP**: the official GitHub MCP server (`github/github-mcp-server`). Its `pull_request_read` tool covers metadata, diff, files, reviews, review comments, and check runs; review and reply tools cover posting.
- **CLI**: `gh`, authenticated (`gh auth status`). Use `gh api` for REST and GraphQL calls.
- **Permissions**: posting and resolving need write access to pull requests (`pull-requests: write` for fine-grained tokens).

## Command Map

| Canonical Key | GitHub Invocation or Fallback |
|---|---|
| pr-view | MCP pull_request_read (get); CLI `gh pr view <n> --json number,title,body,author,baseRefName,headRefName,headRefOid,state,url,isDraft,files` |
| pr-diff | MCP pull_request_read (get_diff, get_files); CLI `gh pr diff <n> --color never` for the diff and `gh pr diff <n> --name-only` for changed files |
| pr-checkout | CLI `gh pr checkout <n>` (refuse if local changes would be lost); fallback `git fetch origin pull/<n>/head` then `git switch --detach FETCH_HEAD` |
| pr-threads | MCP pull_request_read (get_review_comments); CLI `gh api graphql -f query='query($o:String!,$r:String!,$n:Int!){repository(owner:$o,name:$r){pullRequest(number:$n){reviewThreads(first:100){pageInfo{hasNextPage endCursor} nodes{id isResolved isOutdated path line startLine diffSide comments(first:100){nodes{id databaseId author{login} body}}}}}}}' -F o=<owner> -F r=<repo> -F n=<n>`; page with the cursor when hasNextPage is true |
| review-post | MCP pending-review tools (create a pending review, add_comment_to_pending_review per inline comment, then submit it as a comment-only review); CLI one call `gh api -X POST repos/<owner>/<repo>/pulls/<n>/reviews --input review.json` with body {"commit_id": head SHA from pr-view, "event": "COMMENT", "body": summary, "comments": [{"path", "line", "side": "RIGHT", "body"}]}; never use event APPROVE or REQUEST_CHANGES |
| thread-reply | MCP add_reply_to_pull_request_comment; CLI `gh api graphql -f query='mutation($t:ID!,$b:String!){addPullRequestReviewThreadReply(input:{pullRequestReviewThreadId:$t,body:$b}){comment{id}}}' -F t=<thread id> -F b=<reply>` |
| thread-resolve | MCP pull_request_review_write (resolve_thread); CLI `gh api graphql -f query='mutation($t:ID!){resolveReviewThread(input:{threadId:$t}){thread{id isResolved}}}' -F t=<thread id>` |
| checks-status | MCP pull_request_read (get_check_runs); CLI `gh pr checks <n> --json name,state,bucket,link,workflow` (bucket is pass, fail, pending, skipping, or cancel) |

## Notes

- Inline comments use the file line on the new side (`side: RIGHT`; `LEFT` for deleted lines) and must fall inside a diff hunk, or GitHub rejects the review. Multi-line comments add `start_line` and `start_side`.
- Anchor every review to the current head SHA (`headRefOid`); re-read it right before posting.
- GraphQL connections return at most 100 items per page; follow `pageInfo` for large pull requests.
- GitHub does not allow approving or requesting changes on your own pull request; comment-only reviews always work.
