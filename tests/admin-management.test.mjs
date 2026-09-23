import test from 'node:test';
import assert from 'node:assert/strict';
import { managementRequest } from '../src/features/admin/workspace/managementRequests.js';

test('creates and updates supported content with its request body', () => {
  for (const resource of ['posts', 'comments', 'tags']) {
    const body = { title: 'Example content' };
    assert.deepEqual(managementRequest({ resource, action: 'create', body }), { url: `/${resource}`, method: 'POST', body });
    assert.deepEqual(managementRequest({ resource, action: 'update', id: 7, body }), { url: `/${resource}/7`, method: 'PUT', body });
  }
});
test('deletes only resources with documented delete endpoints', () => {
  for (const resource of ['users', 'posts', 'comments', 'tags']) {
    assert.deepEqual(managementRequest({ resource, action: 'delete', id: 12 }), { url: `/${resource}/12`, method: 'DELETE' });
  }
  for (const resource of ['lost-found', 'marketplace', 'notifications']) {
    assert.throws(() => managementRequest({ resource, action: 'delete', id: 12 }));
  }
});
test('profile updates and claim decisions use their documented endpoints', () => {
  const body = { username: 'Admin', bio: 'About me' };
  assert.deepEqual(managementRequest({ resource: 'profile', action: 'update', body }), { url: '/users/update-user', method: 'PUT', body });
  for (const action of ['approve', 'reject']) {
    assert.deepEqual(managementRequest({ resource: 'claims', action, id: 3 }), { url: `/lost-found/claims/3/${action}`, method: 'PATCH' });
  }
});
test('rejects missing IDs and unsupported admin operations', () => {
  for (const args of [
    { resource: 'posts', action: 'update' }, { resource: 'users', action: 'delete' },
    { resource: 'users', action: 'block', id: 1 }, { resource: 'users', action: 'update', id: 1 },
    { resource: 'moderation', action: 'approve', id: 1 }, { resource: 'marketplace', action: 'create' },
  ]) assert.throws(() => managementRequest(args));
});
test('match decisions encode the supported statuses', () => {
  assert.deepEqual(managementRequest({ resource: 'matches', action: 'confirm', id: 8 }), { url: '/lost-found/matches/8?status=CONFIRMED', method: 'PATCH' });
  assert.deepEqual(managementRequest({ resource: 'matches', action: 'reject', id: 8 }), { url: '/lost-found/matches/8?status=REJECTED', method: 'PATCH' });
});
