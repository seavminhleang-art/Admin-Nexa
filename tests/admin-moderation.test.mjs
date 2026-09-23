import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesModerationFilter } from '../src/features/admin/workspace/moderationData.js';
import { managementRequest } from '../src/features/admin/workspace/managementRequests.js';

test('moderation classification uses moderation status, not item lifecycle status', () => {
  assert.equal(matchesModerationFilter({ status: 'OPEN' }, 'pending'), false);
  assert.equal(matchesModerationFilter({ moderationStatus: 'pending' }, 'pending'), true);
  assert.equal(matchesModerationFilter({ moderationStatus: 'PENDING_REVIEW' }, 'pending'), true);
  assert.equal(matchesModerationFilter({ moderationStatus: 'FLAGGED' }, 'suspicious'), true);
  assert.equal(matchesModerationFilter({ moderationStatus: 'HIDDEN' }, 'hidden'), true);
  assert.equal(matchesModerationFilter({ status: 'CLAIMED' }, 'resolved'), true);
  assert.equal(matchesModerationFilter({}, 'all'), true);
  assert.equal(matchesModerationFilter({}, 'hidden'), false);
});
test('category creation uses the documented endpoint; hiding is unsupported', () => {
  assert.deepEqual(managementRequest({ resource: 'categories', action: 'create', body: { name: 'Keys' } }), { url: '/lost-found/categories', method: 'POST', body: { name: 'Keys' } });
  assert.throws(() => managementRequest({ resource: 'lost-found', action: 'hide', id: 1 }));
});
