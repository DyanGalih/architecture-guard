import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  resolveBody,
  resolveRepoOwnerAndName,
  runPrThreads,
  runPrReply,
  runPrResolve,
  runPrComment,
  ExecRunner,
} from './cli/pr';

test('resolveBody: returns explicit body string', () => {
  const result = resolveBody({ body: 'Hello world' });
  assert.strictEqual(result, 'Hello world');
});

test('resolveBody: reads body from file', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-pr-test-'));
  const filePath = path.join(tmpDir, 'body.md');
  try {
    fs.writeFileSync(filePath, 'File comment content');
    const result = resolveBody({ file: filePath });
    assert.strictEqual(result, 'File comment content');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('resolveBody: throws when body file is missing', () => {
  assert.throws(
    () => resolveBody({ file: '/tmp/nonexistent-ag-file-12345.md' }),
    /Body file not found/
  );
});

test('resolveBody: throws when body file is empty', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ag-pr-test-'));
  const filePath = path.join(tmpDir, 'empty.md');
  try {
    fs.writeFileSync(filePath, '   \n  ');
    assert.throws(
      () => resolveBody({ file: filePath }),
      /Body file is empty/
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('resolveBody: reads from stdinReader when no body or file given', () => {
  const result = resolveBody({}, () => 'Piped stdin content');
  assert.strictEqual(result, 'Piped stdin content');
});

test('resolveBody: throws when no body, file, or stdin is provided', () => {
  assert.throws(
    () => resolveBody({}, () => ''),
    /No comment or reply body provided/
  );
});

test('resolveRepoOwnerAndName: parses explicit repo option', () => {
  const dummyRunner: ExecRunner = () => {
    throw new Error('Should not be called');
  };
  const result = resolveRepoOwnerAndName({ repo: 'my-org/my-repo' }, dummyRunner);
  assert.deepStrictEqual(result, { owner: 'my-org', repo: 'my-repo' });

  const hostResult = resolveRepoOwnerAndName({ repo: 'github.com/my-org/my-repo' }, dummyRunner);
  assert.deepStrictEqual(hostResult, { owner: 'my-org', repo: 'my-repo' });
});

test('resolveRepoOwnerAndName: queries repo view via runner', () => {
  const mockRunner: ExecRunner = (args) => {
    assert.deepStrictEqual(args, ['repo', 'view', '--json', 'owner,name']);
    return JSON.stringify({ owner: { login: 'Alice' }, name: 'sample-project' });
  };
  const result = resolveRepoOwnerAndName({}, mockRunner);
  assert.deepStrictEqual(result, { owner: 'Alice', repo: 'sample-project' });
});

test('runPrThreads: queries GraphQL and normalizes threads with pagination', () => {
  const mockRunner: ExecRunner = (args, input) => {
    if (args[0] === 'repo' && args[1] === 'view') {
      return JSON.stringify({ owner: { login: 'Acme' }, name: 'widget' });
    }

    assert.strictEqual(args[0], 'api');
    assert.strictEqual(args[1], 'graphql');
    assert.strictEqual(args[2], '--input');
    assert.strictEqual(args[3], '-');

    const payload = JSON.parse(input!);
    assert.strictEqual(payload.variables.owner, 'Acme');
    assert.strictEqual(payload.variables.repo, 'widget');
    assert.strictEqual(payload.variables.pr, 42);

    if (payload.variables.cursor === null) {
      return JSON.stringify({
        data: {
          repository: {
            pullRequest: {
              reviewThreads: {
                pageInfo: { hasNextPage: true, endCursor: 'cursor_1' },
                nodes: [
                  {
                    id: 'PRRT_1',
                    isResolved: false,
                    isOutdated: false,
                    path: 'src/main.ts',
                    line: 10,
                    startLine: null,
                    diffSide: 'RIGHT',
                    comments: {
                      nodes: [
                        {
                          id: 'PRRC_1',
                          databaseId: 1001,
                          author: { login: 'reviewer1' },
                          body: 'Please fix this',
                          createdAt: '2026-11-14T01:00:00Z',
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      });
    } else if (payload.variables.cursor === 'cursor_1') {
      return JSON.stringify({
        data: {
          repository: {
            pullRequest: {
              reviewThreads: {
                pageInfo: { hasNextPage: false, endCursor: null },
                nodes: [
                  {
                    id: 'PRRT_2',
                    isResolved: true,
                    isOutdated: false,
                    path: 'src/utils.ts',
                    line: 25,
                    startLine: null,
                    diffSide: 'RIGHT',
                    comments: {
                      nodes: [
                        {
                          id: 'PRRC_2',
                          databaseId: 1002,
                          author: { login: 'reviewer2' },
                          body: 'Looks good now',
                          createdAt: '2026-11-14T02:00:00Z',
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      });
    }
    throw new Error(`Unexpected cursor: ${payload.variables.cursor}`);
  };

  const allThreads = runPrThreads(42, { repo: 'Acme/widget' }, mockRunner);
  assert.strictEqual(allThreads.length, 2);
  assert.strictEqual(allThreads[0].id, 'PRRT_1');
  assert.strictEqual(allThreads[0].isResolved, false);
  assert.strictEqual(allThreads[1].id, 'PRRT_2');
  assert.strictEqual(allThreads[1].isResolved, true);

  // Unresolved filter
  const unresolvedOnly = runPrThreads('42', { repo: 'Acme/widget', unresolved: true }, mockRunner);
  assert.strictEqual(unresolvedOnly.length, 1);
  assert.strictEqual(unresolvedOnly[0].id, 'PRRT_1');
});

test('runPrReply: executes GraphQL mutation and returns comment details', () => {
  const mockRunner: ExecRunner = (args, input) => {
    assert.deepStrictEqual(args, ['api', 'graphql', '--input', '-']);
    const payload = JSON.parse(input!);
    assert.strictEqual(payload.variables.threadId, 'PRRT_123');
    assert.strictEqual(payload.variables.body, 'Fixed in latest commit');

    return JSON.stringify({
      data: {
        addPullRequestReviewThreadReply: {
          comment: {
            id: 'PRRC_999',
            databaseId: 99901,
            body: 'Fixed in latest commit',
            createdAt: '2026-11-14T03:00:00Z',
          },
        },
      },
    });
  };

  const result = runPrReply(
    { thread: 'PRRT_123', body: 'Fixed in latest commit' },
    mockRunner
  );

  assert.strictEqual(result.id, 'PRRC_999');
  assert.strictEqual(result.databaseId, 99901);
  assert.strictEqual(result.body, 'Fixed in latest commit');
});

test('runPrResolve: executes resolve and unresolve mutations', () => {
  const mockRunner: ExecRunner = (args, input) => {
    assert.deepStrictEqual(args, ['api', 'graphql', '--input', '-']);
    const payload = JSON.parse(input!);
    assert.strictEqual(payload.variables.threadId, 'PRRT_456');

    if (payload.query.includes('unresolveReviewThread')) {
      return JSON.stringify({
        data: {
          unresolveReviewThread: {
            thread: {
              id: 'PRRT_456',
              isResolved: false,
            },
          },
        },
      });
    }

    return JSON.stringify({
      data: {
        resolveReviewThread: {
          thread: {
            id: 'PRRT_456',
            isResolved: true,
          },
        },
      },
    });
  };

  const resolved = runPrResolve({ thread: 'PRRT_456' }, mockRunner);
  assert.strictEqual(resolved.id, 'PRRT_456');
  assert.strictEqual(resolved.isResolved, true);

  const unresolved = runPrResolve({ thread: 'PRRT_456', unresolve: true }, mockRunner);
  assert.strictEqual(unresolved.id, 'PRRT_456');
  assert.strictEqual(unresolved.isResolved, false);
});

test('runPrComment: posts comment to pull request and returns comment info', () => {
  const mockRunner: ExecRunner = (args, input) => {
    assert.strictEqual(args[0], 'api');
    assert.strictEqual(args[1], '-X');
    assert.strictEqual(args[2], 'POST');
    assert.strictEqual(args[3], 'repos/MyOrg/MyRepo/issues/10/comments');
    assert.strictEqual(args[4], '--input');
    assert.strictEqual(args[5], '-');

    const payload = JSON.parse(input!);
    assert.strictEqual(payload.body, 'Top-level feedback message');

    return JSON.stringify({
      id: 55512,
      html_url: 'https://github.com/MyOrg/MyRepo/pull/10#issuecomment-55512',
      body: 'Top-level feedback message',
    });
  };

  const result = runPrComment(
    10,
    { body: 'Top-level feedback message', repo: 'MyOrg/MyRepo' },
    mockRunner
  );

  assert.strictEqual(result.id, 55512);
  assert.strictEqual(result.html_url, 'https://github.com/MyOrg/MyRepo/pull/10#issuecomment-55512');
});

test('resolveRepoOwnerAndName: throws on invalid repo format', () => {
  const dummyRunner: ExecRunner = () => {
    throw new Error('Should not be called');
  };
  assert.throws(
    () => resolveRepoOwnerAndName({ repo: 'invalid-single-segment' }, dummyRunner),
    /Invalid repository format/
  );
});

test('runPrThreads and runPrComment: reject malformed PR numbers like "42x"', () => {
  const dummyRunner: ExecRunner = () => {
    throw new Error('Should not be called');
  };
  assert.throws(
    () => runPrThreads('42x', { repo: 'owner/repo' }, dummyRunner),
    /Invalid pull request number/
  );
  assert.throws(
    () => runPrComment('42x', { body: 'test', repo: 'owner/repo' }, dummyRunner),
    /Invalid pull request number/
  );
});

test('runPrThreads: paginates comments within a thread', () => {
  const mockRunner: ExecRunner = (args, input) => {
    const payload = JSON.parse(input!);
    if (payload.query.includes('reviewThreads(first: 100')) {
      return JSON.stringify({
        data: {
          repository: {
            pullRequest: {
              reviewThreads: {
                pageInfo: { hasNextPage: false, endCursor: null },
                nodes: [
                  {
                    id: 'PRRT_PAGINATED',
                    isResolved: false,
                    isOutdated: false,
                    path: 'src/main.ts',
                    line: 10,
                    startLine: null,
                    diffSide: 'RIGHT',
                    comments: {
                      pageInfo: { hasNextPage: true, endCursor: 'comment_cursor_1' },
                      nodes: [
                        {
                          id: 'PRRC_1',
                          databaseId: 1,
                          author: { login: 'user1' },
                          body: 'Comment 1',
                          createdAt: '2026-11-14T01:00:00Z',
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      });
    }

    if (payload.query.includes('comments(first: 100, after: $cursor)')) {
      assert.strictEqual(payload.variables.threadId, 'PRRT_PAGINATED');
      assert.strictEqual(payload.variables.cursor, 'comment_cursor_1');
      return JSON.stringify({
        data: {
          node: {
            comments: {
              pageInfo: { hasNextPage: false, endCursor: null },
              nodes: [
                {
                  id: 'PRRC_2',
                  databaseId: 2,
                  author: { login: 'user2' },
                  body: 'Comment 2',
                  createdAt: '2026-11-14T02:00:00Z',
                },
              ],
            },
          },
        },
      });
    }

    throw new Error('Unexpected query');
  };

  const threads = runPrThreads(1, { repo: 'owner/repo' }, mockRunner);
  assert.strictEqual(threads.length, 1);
  assert.strictEqual(threads[0].comments.length, 2);
  assert.strictEqual(threads[0].comments[0].id, 'PRRC_1');
  assert.strictEqual(threads[0].comments[1].id, 'PRRC_2');
});
