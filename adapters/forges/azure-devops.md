# Azure DevOps Forge

Use this forge for Azure Repos (`dev.azure.com`, `*.visualstudio.com`). Placeholders: `<id>` is the pull-request id; `<org>`, `<project>`, and `<repo>` come from the `origin` remote.

## Access

- **MCP**: the Azure DevOps MCP server (`microsoft/azure-devops-mcp`). `repo_pull_request` reads pull requests; `repo_pull_request_thread` lists threads and comments; `repo_pull_request_thread_write` creates threads, replies, and updates thread status. It has no diff tool, so use git for the diff.
- **CLI**: `az` with the `azure-devops` extension, authenticated (`az login` or `az devops login`). REST calls use `https://dev.azure.com/<org>/<project>/_apis/git/repositories/<repo>/pullRequests/<id>` with `api-version=7.1`; send them with `az rest` or `az devops invoke --area git --route-parameters project=<project> repositoryId=<repo> pullRequestId=<id> --api-version 7.1 --http-method POST --in-file body.json` (the default api-version is 5.0, so always pass it).
- **Permissions**: code write and thread scopes (`vso.code_write`, `vso.threads_full`).

## Command Map

| Canonical Key | Azure DevOps Invocation or Fallback |
|---|---|
| pr-view | MCP repo_pull_request (get); CLI `az repos pr show --id <id> -o json` (read the title, description, author, source and target refs, last merge source commit, and status from the response) |
| pr-diff | No diff API in the CLI or MCP; check out the pull request (pr-checkout), then `git diff <target>...<source>` and `git diff --name-status <target>...<source>` |
| pr-checkout | CLI `az repos pr checkout --id <id> --remote-name origin` (refuse if local changes would be lost) |
| pr-threads | MCP repo_pull_request_thread (list, list_comments); REST GET …/pullRequests/<id>/threads?api-version=7.1 (id, status, threadContext.filePath, threadContext.rightFileStart.line, comments with id, parentCommentId, author, content); a thread is unresolved when status is active or pending |
| review-post | No batched review: post one thread per inline comment. MCP repo_pull_request_thread_write (create); REST POST …/threads?api-version=7.1 with {"comments": [{"parentCommentId": 0, "content": comment, "commentType": 1}], "status": 1, "threadContext": {"filePath": "/path/from/repo/root", "rightFileStart": {"line": L, "offset": 1}, "rightFileEnd": {"line": L, "offset": 1}}}; post the summary as a thread without threadContext |
| thread-reply | MCP repo_pull_request_thread_write (reply); REST POST …/threads/<thread id>/comments?api-version=7.1 with {"content": reply, "parentCommentId": 1, "commentType": 1} |
| thread-resolve | MCP repo_pull_request_thread_write (update_status); REST PATCH …/threads/<thread id>?api-version=7.1 with {"status": "fixed"} (other statuses: active, wontFix, closed, byDesign, pending) |
| checks-status | CLI `az repos pr policy list --id <id> -o json` |

## Notes

- `threadContext.filePath` starts with `/`; lines and offsets are 1-based on the new file.
- Azure DevOps has no single "review" object: a review is a set of threads. Post them only after the user approves the whole set, and report any that fail so the user knows which were posted.
