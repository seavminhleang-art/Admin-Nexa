import test from 'node:test';
import assert from 'node:assert/strict';
import { ownsReport } from '../src/features/admin/workspace/reportOwnership.js';
test('report ownership matches API userId, including string IDs', () => {
  assert.equal(ownsReport({ userId: 6 }, { id: 6 }), true);
  assert.equal(ownsReport({ userId: 6 }, { id: '6' }), true);
  assert.equal(ownsReport({ userId: 12 }, { id: 6, role: 'admin' }), false);
});
test('missing identity or owner never permits related requests', () => {
  for (const [report, user] of [[null, null], [{}, {}], [{ userId: 6 }, null], [null, { id: 6 }], [{ userId: '' }, { id: '' }]]) {
    assert.equal(ownsReport(report, user), false);
  }
});
