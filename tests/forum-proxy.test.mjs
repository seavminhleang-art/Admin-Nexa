import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/forum.js';

test('production proxy strips Origin while preserving login body, query and bearer token', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url.pathname, '/api/v1/auth/login');
    assert.equal(url.search, '?page=2');
    assert.equal(options.headers.get('origin'), null);
    assert.equal(options.headers.get('cookie'), null);
    assert.equal(options.headers.get('authorization'), 'Bearer test-token');
    assert.equal(options.headers.get('content-type'), 'application/json');
    assert.equal(options.method, 'POST');
    assert.equal(new TextDecoder().decode(options.body), '{}');
    return Response.json({ message: 'Invalid input' }, { status: 400 });
  });
  const response = await handler(new Request('https://admin.example/api/forum?path=auth/login&page=2', {
    method: 'POST', body: '{}', headers: {
      origin: 'https://admin.example', authorization: 'Bearer test-token',
      'content-type': 'application/json', cookie: 'private=value',
    },
  }));
  assert.equal(response.status, 400);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { message: 'Invalid input' });
});

test('proxy preserves successful empty delete responses', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(null, { status: 204 }));
  const response = await handler(new Request('https://admin.example/api/forum?path=posts/12', { method: 'DELETE' }));
  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');
});

test('proxy rejects foreign origins and paths outside the API without fetching', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected fetch'); });
  const foreign = await handler(new Request('https://admin.example/api/forum?path=auth/login', {
    headers: { origin: 'https://other.example' },
  }));
  assert.equal(foreign.status, 403);
  const traversal = await handler(new Request('https://admin.example/api/forum?path=../../private'));
  assert.equal(traversal.status, 400);
  assert.equal(fetch.mock.callCount(), 0);
});

test('proxy returns a gateway error when the backend is unreachable', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('Network failure'); });
  const response = await handler(new Request('https://admin.example/api/forum?path=posts'));
  assert.equal(response.status, 502);
});
