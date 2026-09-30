import test from 'node:test';
import assert from 'node:assert/strict';
import { isAdminAccountEmail } from '../src/features/auth/adminAccount.js';

test('accepts only the registered email, ignoring case and surrounding whitespace', () => {
  assert.equal(isAdminAccountEmail('adminnexa123@gmail.com'), true);
  assert.equal(isAdminAccountEmail(' AdminNexa123@Gmail.com '), true);
  for (const value of [undefined, null, '', 'other@gmail.com', 'adminnexa123@gmail.com.attacker.test', 'adminnexa123+other@gmail.com']) {
    assert.equal(isAdminAccountEmail(value), false);
  }
});
