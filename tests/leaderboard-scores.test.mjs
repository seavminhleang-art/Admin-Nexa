import test from 'node:test';
import assert from 'node:assert/strict';
import { rankContributors } from '../src/features/admin/workspace/leaderboardScores.js';

test('adds post scores per author and ranks highest totals first', () => {
  const rows = rankContributors([
    { ownerId: 1, score: 5 },
    { ownerId: '1', score: -2 },
    { ownerId: 2, score: 4 },
    { ownerId: 3, score: -1 },
  ]);
  assert.deepEqual(rows.map(({ id, points, rank }) => [id, points, rank]), [
    [2, 4, 1], [1, 3, 2], [3, -1, 3],
  ]);
});

test('equal totals share a rank with consistent ordering', () => {
  const rows = rankContributors([
    { ownerId: 10, score: 5 },
    { ownerId: 2, score: 5 },
    { ownerId: 3, score: 1 },
  ]);
  assert.deepEqual(rows.map(({ id, rank }) => [id, rank]), [[2, 1], [10, 1], [3, 3]]);
});

test('handles empty data and invalid scores without inventing points', () => {
  assert.deepEqual(rankContributors([]), []);
  const rows = rankContributors([
    null, { score: 100 }, { ownerId: 1 },
    { ownerId: 1, score: NaN }, { ownerId: 2, score: 0 },
  ]);
  assert.deepEqual(rows.map(({ points, rank }) => [points, rank]), [[0, 1], [0, 1]]);
});
