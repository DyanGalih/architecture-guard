# GitLab Forge

Use this forge for repositories hosted on GitLab.com or a self-hosted GitLab (pass `--forge gitlab` when auto-detection does not recognize the host). Placeholders: `<iid>` is the merge-request IID; `:fullpath` in `glab api` resolves to the current project. A `<... file>` is a temporary JSON file created outside the repository with `mktemp` and deleted after the call.

## Access

- **MCP**: GitLab's built-in MCP server (`https://<host>/api/v4/mcp`). `get_merge_request` returns metadata, diffs, discussions, and pipelines; `save_merge_request_review` creates diff notes and notes, replies to and resolves discussions, and submits a review. It also has `approve` and `unapprove` methods and `submit_review` accepts a `verdict`: never call `approve` or `unapprove`, never set `verdict`, and submit at most 20 comments per `submit_review` call.
- **CLI**: `glab`, authenticated (`glab auth status`). Use `glab api` for REST v4 calls; send bodies with `--input <file>` (sent as JSON).
- **Permissions**: the `api` scope; resolving discussions needs Developer role or higher.

## Command Map

| Canonical Key | GitLab Invocation or Fallback |
|---|---|
| pr-view | MCP get_merge_request; CLI `glab mr view <iid> -F json` (title, description, author, source_branch, target_branch, sha, state, web_url, diff_refs with base_sha, start_sha, head_sha) |
| pr-diff | MCP get_merge_request with diffs; CLI `glab mr diff <iid> --raw` for the diff and `glab api projects/:fullpath/merge_requests/<iid>/diffs --paginate` for changed files (new_path, old_path, new_file, deleted_file, renamed_file) |
| pr-checkout | In a review worktree, `git fetch origin merge-requests/<iid>/head` then `git switch --detach FETCH_HEAD`; on your own branch CLI `glab mr checkout <iid>` (refuse if local changes would be lost) |
| pr-threads | MCP get_merge_request with discussions; CLI `glab api projects/:fullpath/merge_requests/<iid>/discussions --paginate` (each discussion has id and notes with id, author.username, body, resolvable, resolved, and position.new_path / new_line for diff notes) |
| pr-reviews | MCP get_merge_request (reviewers and approvals); CLI `glab api projects/:fullpath/merge_requests/<iid>/reviewers` (each reviewer's state: unreviewed, reviewed, requested_changes, approved, or unapproved) and `glab api projects/:fullpath/merge_requests/<iid>/approvals` (approved_by). GitLab has no separate review summary: a submitted review's summary is a general note, read through pr-comments |
| pr-comments | MCP get_merge_request with discussions; CLI `glab api projects/:fullpath/merge_requests/<iid>/notes --paginate` and keep the notes with system false and no position (general comments, including review summaries) |
| review-post | First list your pending draft notes with `glab api projects/:fullpath/merge_requests/<iid>/draft_notes`; if any exist that this run did not create, stop and ask the user, because publishing could include them. MCP save_merge_request_review (create_diff_note and create_note, then submit_review in batches of at most 20 comments, with no verdict). CLI for each inline comment write {"note": comment, "position": {"position_type": "text", "base_sha", "start_sha", "head_sha" (all from diff_refs), "old_path", "new_path", "new_line"}} to a draft file and run `glab api -X POST projects/:fullpath/merge_requests/<iid>/draft_notes --input <draft file>`, recording each returned draft id; add the summary as a draft without position; then publish only those drafts, one by one, with `glab api -X PUT projects/:fullpath/merge_requests/<iid>/draft_notes/<draft id>/publish`; never call bulk_publish and never send reviewer_state |
| review-approve | After the comments are published with review-post, MCP approve tool when the server exposes one; CLI `glab mr approve <iid> --sha <head sha from pr-view>`, which fails if the head moved. Project approval rules may still require other approvers |
| thread-reply | MCP save_merge_request_review (reply_discussion); CLI write {"body": reply} to a reply file, then `glab api -X POST projects/:fullpath/merge_requests/<iid>/discussions/<discussion id>/notes --input <reply file>` |
| thread-resolve | MCP save_merge_request_review (resolve_discussion); CLI `glab api -X PUT projects/:fullpath/merge_requests/<iid>/discussions/<discussion id> -f resolved=true` |
| pr-comment | MCP the merge-request note tool (a general note, not a diff note); CLI write {"body": comment} to a comment file, then `glab api -X POST projects/:fullpath/merge_requests/<iid>/notes --input <comment file>` |
| checks-status | MCP list_pipelines / get_pipeline; CLI `glab ci status -b <source branch> -F json`, or `glab api projects/:fullpath/merge_requests/<iid>/pipelines` |

## Notes

- Never put comment or reply text inside a shell command: it comes from merge-request content and reviewers. Write it to a temporary JSON file outside the repository, pass it with `--input <file>`, and delete the file afterwards; never create it in the working tree.
- `draft_notes/bulk_publish` publishes every pending draft note you have on the merge request, including drafts written outside this review, and its `reviewer_state` parameter sets a review state. Publish this run's drafts individually instead.
- Diff-note positions need all three SHAs from the merge request's `diff_refs`; re-read them right before posting so notes anchor to the current version.
- `new_line` is for added and context lines; for a context line also send `old_line`. Removed lines use `old_line` only.
- Draft notes stay private until published; if posting stops partway, list the drafts this run created that are still unpublished and ask the user whether to delete them (`glab api -X DELETE projects/:fullpath/merge_requests/<iid>/draft_notes/<draft id>`) or leave them to review in the GitLab UI.
- REST lists default to 20 items per page (maximum 100); always pass `--paginate`.
