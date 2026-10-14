# Generic Git Forge

Use this forge for any git repository without a supported code-host integration. It works from plain `git` and never writes to a code host: every write action produces Markdown for the user to post manually.

## Inputs

Ask the user for the base ref and head ref of the change under review (for example `origin/main` and `feature/x`) when they are not given. Fetch them first with `git fetch` if they are remote refs.

## Command Map

| Canonical Key | Generic Git Invocation or Fallback |
|---|---|
| pr-view | No pull-request metadata; record the user-provided base ref, head ref, `git log --format='%h %an %s' <base>..<head>`, and `git rev-parse <head>` as the head SHA |
| pr-diff | `git diff <base>...<head>` for the unified diff and `git diff --name-status <base>...<head>` for changed files (three-dot: changes on head since the merge-base) |
| pr-checkout | `git switch --detach <head>` (or `git worktree add <dir> <head>` to keep the current checkout); never discard local changes |
| pr-threads | No hosted threads; ask the user to paste or export the review comments, then treat each comment as a thread keyed by file and line |
| review-post | Unsupported; write the approved review to `.architecture-guard/reviews/<base>..<head>.md` (summary plus `path:line` comments) for the user to post |
| thread-reply | Unsupported; write the approved replies to `.architecture-guard/reviews/replies.md`, one section per thread, for the user to post |
| thread-resolve | Unsupported; list the threads the user chose to resolve in the replies file so they can resolve them on the host |
| checks-status | Unsupported; ask the user for CI status, or run the project's local test command when they approve |
