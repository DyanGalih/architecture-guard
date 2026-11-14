import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

export type ExecRunner = (args: string[], input?: string, cwd?: string) => string;

export interface ReviewCommentNode {
  id: string;
  databaseId: number;
  author?: {
    login: string;
  } | null;
  body: string;
  createdAt: string;
}

export interface ReviewThreadNode {
  id: string;
  isResolved: boolean;
  isOutdated: boolean;
  path: string;
  line: number | null;
  startLine: number | null;
  diffSide: string | null;
  comments: {
    nodes: ReviewCommentNode[];
  };
}

export interface NormalizedReviewComment {
  id: string;
  databaseId: number;
  author: string;
  body: string;
  createdAt: string;
}

export interface NormalizedReviewThread {
  id: string;
  isResolved: boolean;
  isOutdated: boolean;
  path: string;
  line: number | null;
  startLine: number | null;
  diffSide: string | null;
  comments: NormalizedReviewComment[];
}

export const defaultExecGh: ExecRunner = (args: string[], input?: string, cwd?: string): string => {
  try {
    return execFileSync('gh', args, {
      input,
      cwd,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (error: any) {
    if (error && error.code === 'ENOENT') {
      throw new Error('GitHub CLI (gh) is not installed or not found in PATH. Install gh and try again.');
    }
    const stderr = error.stderr ? String(error.stderr).trim() : '';
    const message = stderr || (error instanceof Error ? error.message : String(error));
    throw new Error(`GitHub CLI command failed: gh ${args.join(' ')}\n${message}`);
  }
};

export function resolveBody(
  options: { body?: string; file?: string },
  stdinReader?: () => string
): string {
  if (options.body && options.body.trim().length > 0) {
    return options.body;
  }

  if (options.file) {
    if (!fs.existsSync(options.file)) {
      throw new Error(`Body file not found: ${options.file}`);
    }
    const content = fs.readFileSync(options.file, 'utf8');
    if (content.trim().length === 0) {
      throw new Error(`Body file is empty: ${options.file}`);
    }
    return content;
  }

  const stdinContent = stdinReader
    ? stdinReader()
    : (!process.stdin.isTTY ? fs.readFileSync(0, 'utf8') : '');

  if (stdinContent && stdinContent.trim().length > 0) {
    return stdinContent;
  }

  throw new Error('No comment or reply body provided. Supply --body <text>, --file <path>, or pipe via stdin.');
}

export function resolveRepoOwnerAndName(
  options: { repo?: string; cwd?: string },
  runner: ExecRunner = defaultExecGh
): { owner: string; repo: string } {
  if (options.repo) {
    const parts = options.repo.split('/');
    if (parts.length >= 2) {
      const repo = parts[parts.length - 1];
      const owner = parts[parts.length - 2];
      return { owner, repo };
    }
  }

  const raw = runner(['repo', 'view', '--json', 'owner,name'], undefined, options.cwd);
  try {
    const parsed = JSON.parse(raw);
    const owner = parsed.owner?.login || parsed.owner;
    const repo = parsed.name;
    if (!owner || !repo) {
      throw new Error(`Unexpected repo view payload: ${raw}`);
    }
    return { owner, repo };
  } catch (err: any) {
    throw new Error(`Failed to determine repository owner and name: ${err.message || String(err)}`);
  }
}

export const THREADS_GRAPHQL_QUERY = `
query($owner: String!, $repo: String!, $pr: Int!, $cursor: String) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $pr) {
      reviewThreads(first: 100, after: $cursor) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          startLine
          diffSide
          comments(first: 100) {
            nodes {
              id
              databaseId
              author {
                login
              }
              body
              createdAt
            }
          }
        }
      }
    }
  }
}
`;

export function runPrThreads(
  prInput: string | number,
  options: { unresolved?: boolean; json?: boolean; repo?: string; cwd?: string } = {},
  runner: ExecRunner = defaultExecGh
): NormalizedReviewThread[] {
  const prNumber = parseInt(String(prInput), 10);
  if (isNaN(prNumber) || prNumber <= 0) {
    throw new Error(`Invalid pull request number: "${prInput}"`);
  }

  const { owner, repo } = resolveRepoOwnerAndName(options, runner);
  const threads: NormalizedReviewThread[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;
  let pageCount = 0;
  const MAX_PAGES = 10;

  while (hasNextPage && pageCount < MAX_PAGES) {
    pageCount++;
    const payload = JSON.stringify({
      query: THREADS_GRAPHQL_QUERY,
      variables: {
        owner,
        repo,
        pr: prNumber,
        cursor,
      },
    });

    const responseRaw = runner(['api', 'graphql', '--input', '-'], payload, options.cwd);
    let parsed: any;
    try {
      parsed = JSON.parse(responseRaw);
    } catch {
      throw new Error(`Invalid JSON response from GitHub GraphQL API: ${responseRaw}`);
    }

    if (parsed.errors && parsed.errors.length > 0) {
      const errMsgs = parsed.errors.map((e: any) => e.message).join('; ');
      throw new Error(`GitHub GraphQL error: ${errMsgs}`);
    }

    const prData = parsed.data?.repository?.pullRequest;
    if (!prData) {
      throw new Error(`Pull request #${prNumber} not found in ${owner}/${repo}`);
    }

    const connection = prData.reviewThreads;
    const nodes: ReviewThreadNode[] = connection?.nodes || [];

    for (const node of nodes) {
      const normalizedComments: NormalizedReviewComment[] = (node.comments?.nodes || []).map((c) => ({
        id: c.id,
        databaseId: c.databaseId,
        author: c.author?.login || 'unknown',
        body: c.body,
        createdAt: c.createdAt,
      }));

      threads.push({
        id: node.id,
        isResolved: Boolean(node.isResolved),
        isOutdated: Boolean(node.isOutdated),
        path: node.path,
        line: node.line,
        startLine: node.startLine,
        diffSide: node.diffSide,
        comments: normalizedComments,
      });
    }

    hasNextPage = Boolean(connection?.pageInfo?.hasNextPage);
    cursor = connection?.pageInfo?.endCursor || null;
  }

  const result = options.unresolved ? threads.filter((t) => !t.isResolved) : threads;

  if (options.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    const summary = `Found ${result.length} ${options.unresolved ? 'unresolved ' : ''}review thread(s) for PR #${prNumber} in ${owner}/${repo}`;
    console.log(summary);
    for (const t of result) {
      const latestComment = t.comments[t.comments.length - 1];
      const author = latestComment ? latestComment.author : 'unknown';
      const status = t.isResolved ? '[Resolved]' : '[Unresolved]';
      const loc = `${t.path}:${t.line ?? 'file'}`;
      console.log(`- ${t.id} ${status} at ${loc} (last by @${author}, ${t.comments.length} comment(s))`);
    }
  }

  return result;
}

export const REPLY_GRAPHQL_MUTATION = `
mutation($threadId: ID!, $body: String!) {
  addPullRequestReviewThreadReply(input: { pullRequestReviewThreadId: $threadId, body: $body }) {
    comment {
      id
      databaseId
      body
      createdAt
    }
  }
}
`;

export function runPrReply(
  options: { thread: string; body?: string; file?: string; json?: boolean; cwd?: string },
  runner: ExecRunner = defaultExecGh,
  stdinReader?: () => string
): { id: string; databaseId: number; body: string; createdAt: string } {
  if (!options.thread || options.thread.trim().length === 0) {
    throw new Error('Thread ID is required (--thread <id>)');
  }

  const body = resolveBody(options, stdinReader);

  const payload = JSON.stringify({
    query: REPLY_GRAPHQL_MUTATION,
    variables: {
      threadId: options.thread.trim(),
      body,
    },
  });

  const responseRaw = runner(['api', 'graphql', '--input', '-'], payload, options.cwd);
  let parsed: any;
  try {
    parsed = JSON.parse(responseRaw);
  } catch {
    throw new Error(`Invalid JSON response from GitHub GraphQL API: ${responseRaw}`);
  }

  if (parsed.errors && parsed.errors.length > 0) {
    const errMsgs = parsed.errors.map((e: any) => e.message).join('; ');
    throw new Error(`Failed to post thread reply: ${errMsgs}`);
  }

  const comment = parsed.data?.addPullRequestReviewThreadReply?.comment;
  if (!comment) {
    throw new Error(`Unexpected mutation response: ${responseRaw}`);
  }

  const result = {
    id: comment.id,
    databaseId: comment.databaseId,
    body: comment.body,
    createdAt: comment.createdAt,
  };

  if (options.json) {
    process.stdout.write(JSON.stringify({ status: 'success', threadId: options.thread, comment: result }, null, 2) + '\n');
  } else {
    console.log(`Successfully replied to review thread ${options.thread} (comment id: ${result.databaseId})`);
  }

  return result;
}

export const RESOLVE_GRAPHQL_MUTATION = `
mutation($threadId: ID!) {
  resolveReviewThread(input: { threadId: $threadId }) {
    thread {
      id
      isResolved
    }
  }
}
`;

export const UNRESOLVE_GRAPHQL_MUTATION = `
mutation($threadId: ID!) {
  unresolveReviewThread(input: { threadId: $threadId }) {
    thread {
      id
      isResolved
    }
  }
}
`;

export function runPrResolve(
  options: { thread: string; unresolve?: boolean; json?: boolean; cwd?: string },
  runner: ExecRunner = defaultExecGh
): { id: string; isResolved: boolean } {
  if (!options.thread || options.thread.trim().length === 0) {
    throw new Error('Thread ID is required (--thread <id>)');
  }

  const isUnresolve = Boolean(options.unresolve);
  const query = isUnresolve ? UNRESOLVE_GRAPHQL_MUTATION : RESOLVE_GRAPHQL_MUTATION;

  const payload = JSON.stringify({
    query,
    variables: {
      threadId: options.thread.trim(),
    },
  });

  const responseRaw = runner(['api', 'graphql', '--input', '-'], payload, options.cwd);
  let parsed: any;
  try {
    parsed = JSON.parse(responseRaw);
  } catch {
    throw new Error(`Invalid JSON response from GitHub GraphQL API: ${responseRaw}`);
  }

  if (parsed.errors && parsed.errors.length > 0) {
    const errMsgs = parsed.errors.map((e: any) => e.message).join('; ');
    throw new Error(`Failed to ${isUnresolve ? 'unresolve' : 'resolve'} thread: ${errMsgs}`);
  }

  const thread = isUnresolve
    ? parsed.data?.unresolveReviewThread?.thread
    : parsed.data?.resolveReviewThread?.thread;

  if (!thread) {
    throw new Error(`Unexpected mutation response: ${responseRaw}`);
  }

  const result = {
    id: thread.id,
    isResolved: Boolean(thread.isResolved),
  };

  if (options.json) {
    process.stdout.write(JSON.stringify({ status: 'success', ...result }, null, 2) + '\n');
  } else {
    const action = result.isResolved ? 'Resolved' : 'Unresolved';
    console.log(`Successfully ${action.toLowerCase()} review thread ${result.id}`);
  }

  return result;
}

export function runPrComment(
  prInput: string | number,
  options: { body?: string; file?: string; json?: boolean; repo?: string; cwd?: string },
  runner: ExecRunner = defaultExecGh,
  stdinReader?: () => string
): { id: number; html_url?: string; body: string } {
  const prNumber = parseInt(String(prInput), 10);
  if (isNaN(prNumber) || prNumber <= 0) {
    throw new Error(`Invalid pull request number: "${prInput}"`);
  }

  const { owner, repo } = resolveRepoOwnerAndName(options, runner);
  const body = resolveBody(options, stdinReader);

  const endpoint = `repos/${owner}/${repo}/issues/${prNumber}/comments`;
  const payload = JSON.stringify({ body });

  const responseRaw = runner(['api', '-X', 'POST', endpoint, '--input', '-'], payload, options.cwd);
  let parsed: any;
  try {
    parsed = JSON.parse(responseRaw);
  } catch {
    throw new Error(`Invalid JSON response from GitHub API: ${responseRaw}`);
  }

  if (parsed.message && !parsed.id) {
    throw new Error(`Failed to post comment: ${parsed.message}`);
  }

  const result = {
    id: parsed.id,
    html_url: parsed.html_url,
    body: parsed.body || body,
  };

  if (options.json) {
    process.stdout.write(JSON.stringify({ status: 'success', pr: prNumber, comment: result }, null, 2) + '\n');
  } else {
    console.log(`Successfully posted comment to PR #${prNumber} (comment id: ${result.id})${result.html_url ? ` - ${result.html_url}` : ''}`);
  }

  return result;
}
