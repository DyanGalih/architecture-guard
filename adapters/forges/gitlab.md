# GitLab Forge

Use this forge for repositories hosted on GitLab.com or a self-hosted GitLab (pass `--forge gitlab` when auto-detection does not recognize the host). Placeholders: `<iid>` is the merge-request IID; `:fullpath` in `glab api` resolves to the current project.

## Access

- **MCP**: GitLab's built-in MCP server (`https://<host>/api/v4/mcp`). `get_merge_request` returns metadata, diffs, discussions, and pipelines; `save_merge_request_review` creates diff notes and notes, replies to and resolves discussions, and submits a review.
- **CLI**: `glab`, authenticated (`glab auth status`). Use `glab api` for REST v4 calls.
- **Permissions**: the `api` scope; resolving discussions needs Developer role or higher.

## Command Map

| Canonical Key | GitLab Invocation or Fallback |
|---|---|
| pr-view | MCP get_merge_request; CLI `glab mr view <iid> -F json` (title, description, author, source_branch, target_branch, sha, state, web_url, diff_refs with base_sha, start_sha, head_sha) |
| pr-diff | MCP get_merge_request with diffs; CLI `glab mr diff <iid> --raw` for the diff and `glab api projects/:fullpath/merge_requests/<iid>/diffs --paginate` for changed files (new_path, old_path, new_file, deleted_file, renamed_file) |
| pr-checkout | CLI `glab mr checkout <iid>` (refuse if local changes would be lost) |
| pr-threads | MCP get_merge_request with discussions; CLI `glab api projects/:fullpath/merge_requests/<iid>/discussions --paginate` (each discussion has id and notes with id, author.username, body, resolvable, resolved, and position.new_path / new_line for diff notes) |
| review-post | MCP save_merge_request_review (create_diff_note and create_note, then submit_review); CLI draft batch: for each inline comment `glab api -X POST projects/:fullpath/merge_requests/<iid>/draft_notes` with note and position[position_type]=text, position[base_sha], position[start_sha], position[head_sha] (all from diff_refs), position[new_path], position[old_path], position[new_line]; the summary as a draft note without position; then `glab api -X POST projects/:fullpath/merge_requests/<iid>/draft_notes/bulk_publish` |
| thread-reply | MCP save_merge_request_review (reply_discussion); CLI `glab api -X POST projects/:fullpath/merge_requests/<iid>/discussions/<discussion id>/notes -f body=<reply>` |
| thread-resolve | MCP save_merge_request_review (resolve_discussion); CLI `glab api -X PUT projects/:fullpath/merge_requests/<iid>/discussions/<discussion id> -f resolved=true` |
| checks-status | MCP list_pipelines / get_pipeline; CLI `glab ci status -b <source branch> -F json`, or `glab api projects/:fullpath/merge_requests/<iid>/pipelines` |

## Notes

- Diff-note positions need all three SHAs from the merge request's `diff_refs`; re-read them right before posting so notes anchor to the current version.
- `new_line` is for added and context lines; for a context line also send `old_line`. Removed lines use `old_line` only.
- Draft notes stay private until `bulk_publish`; if the user stops before publishing, delete the draft notes or leave them for the user to review in the GitLab UI and say which.
- REST lists default to 20 items per page (maximum 100); always pass `--paginate`.
