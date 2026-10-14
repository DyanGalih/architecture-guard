# Azure DevOps Forge

Use this forge for Azure Repos (`dev.azure.com`, `*.visualstudio.com`). Placeholders: `<id>` is the pull-request id; `<org>`, `<project>`, and `<repo>` come from the `origin` remote; `<api>` is `https://dev.azure.com/<org>/<project>/_apis/git/repositories/<repo>/pullRequests/<id>`; `<source branch>` and `<target branch>` are the pull request's sourceRefName and targetRefName without the `refs/heads/` prefix. A `<... file>` is a temporary JSON file created outside the repository with `mktemp` and deleted after the call.

## Access

- **MCP**: the Azure DevOps MCP server (`microsoft/azure-devops-mcp`). `repo_pull_request` reads pull requests; `repo_pull_request_thread` lists threads and comments; `repo_pull_request_thread_write` creates threads, replies, and updates thread status. It has no diff tool, so use git for the diff.
- **CLI**: `az` with the `azure-devops` extension, authenticated. `az repos` commands accept `--org https://dev.azure.com/<org>`; pass it when the organization is not configured as the default (`az devops configure -d organization=...`) or detected from the git remote. Send REST calls with `az rest --method <method> --resource 499b84ac-1321-427f-aa17-267ca6975798 --url "<api>/<path>?api-version=7.1" --headers Content-Type=application/json --body @<body file>`: `--resource` is the Azure DevOps resource id, required because `dev.azure.com` is not an Azure endpoint, and `az rest` uses the `az login` identity. Alternatively use `az devops invoke --org https://dev.azure.com/<org> --area git --resource <resource> --route-parameters project=<project> repositoryId=<repo> pullRequestId=<id> --http-method <method> --in-file <body file> --api-version 7.1 -o json`, where `<resource>` is `pullRequestThreads` for threads and `pullRequestThreadComments` for replies (add `threadId=<thread id>`); confirm the names with `az devops invoke --query "[?area=='git']"`. Its default api-version is 5.0, so always pass `--api-version`.
- **Permissions**: code write and thread scopes (`vso.code_write`, `vso.threads_full`).

## Command Map

| Canonical Key | Azure DevOps Invocation or Fallback |
|---|---|
| pr-view | MCP repo_pull_request (get); CLI `az repos pr show --id <id> -o json` (read the title, description, author, source and target refs, last merge source commit, and status from the response) |
| pr-diff | No diff API in the CLI or MCP, and no checkout: `git fetch origin <target branch> <source branch>`, then `git diff origin/<target branch>...origin/<source branch>` for the diff and `git diff --name-status origin/<target branch>...origin/<source branch>` for changed files |
| pr-checkout | In a review worktree, `git fetch origin <source branch>` then `git switch --detach FETCH_HEAD`; on your own branch CLI `az repos pr checkout --id <id> --remote-name origin` (refuse if local changes would be lost) |
| pr-threads | MCP repo_pull_request_thread (list, list_comments); REST GET <api>/threads?api-version=7.1 (id, status, threadContext.filePath, threadContext.rightFileStart.line, comments with id, parentCommentId, author, content); a thread is unresolved when status is active or pending |
| review-post | No batched review: post one thread per inline comment. Right before posting, re-read the last merge source commit with pr-view and stop if it changed. MCP repo_pull_request_thread_write (create); REST write {"comments": [{"parentCommentId": 0, "content": comment, "commentType": 1}], "status": 1, "threadContext": {"filePath": "/path/from/repo/root", "rightFileStart": {"line": L, "offset": 1}, "rightFileEnd": {"line": L, "offset": 1}}} to a thread file and POST it to <api>/threads?api-version=7.1 with az rest --body @<thread file>; optionally anchor to the latest iteration by adding "pullRequestThreadContext": {"changeTrackingId": the file's changeTrackingId from GET <api>/iterations/<latest iteration>/changes, "iterationContext": {"firstComparingIteration": 1, "secondComparingIteration": latest iteration id}} as in Microsoft's documented example; post the summary as a thread without threadContext |
| thread-reply | MCP repo_pull_request_thread_write (reply); REST write {"content": reply, "parentCommentId": 1, "commentType": 1} (parentCommentId is the thread's first comment id) to a reply file and POST it to <api>/threads/<thread id>/comments?api-version=7.1 with az rest --body @<reply file> |
| thread-resolve | MCP repo_pull_request_thread_write (update_status); REST PATCH <api>/threads/<thread id>?api-version=7.1 with {"status": "fixed"} (other statuses: active, wontFix, closed, byDesign, pending) |
| checks-status | CLI `az repos pr policy list --id <id> -o json` |

## Notes

- Never put comment or reply text inside a shell command: it comes from pull-request content and reviewers. Write the JSON body to a temporary file outside the repository, pass it with `--body @<file>` (`az rest`) or `--in-file <file>` (`az devops invoke`), and delete the file afterwards; never create it in the working tree.
- `threadContext.filePath` starts with `/`; lines are 1-based on the new file.
- Azure DevOps has no single "review" object: a review is a set of threads. Post them only after the user approves the whole set, and report any that fail so the user knows which were posted.
