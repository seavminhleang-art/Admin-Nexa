import test from 'node:test';
import assert from 'node:assert/strict';
import { authCredentials } from '../src/features/auth/authSession.js';
const token = claims => `header.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`;
test('recognizes the backend administrator role variants', () => {
  for (const claims of [{ role: 'ADMIN' }, { roles: ['ROLE_ADMIN'] }]) {
    assert.equal(authCredentials({ accessToken: token(claims) }).user.role, 'admin');
  }
});
test('regular accounts and unreadable tokens never receive admin navigation', () => {
  for (const accessToken of [token({ role: 'STUDENT' }), token({}), 'opaque', 'broken.payload.token']) {
    assert.equal(authCredentials({ accessToken }).user.role, 'student');
  }
});
