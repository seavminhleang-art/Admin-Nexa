import test from 'node:test';
import assert from 'node:assert/strict';
import { passwordSchema, tagSchema, managementError } from '../src/features/admin/workspace/managementValidation.js';

test('password must differ from current and match confirmation', () => {
  const oldPassword = 'old password';
  assert.equal(passwordSchema.safeParse({ oldPassword, newPassword: oldPassword, confirmedNewPassword: oldPassword }).success, false);
  assert.equal(passwordSchema.safeParse({ oldPassword, newPassword: 'new password', confirmedNewPassword: 'different password' }).success, false);
  assert.equal(passwordSchema.safeParse({ oldPassword, newPassword: 'short', confirmedNewPassword: 'short' }).success, false);
  assert.equal(passwordSchema.safeParse({ oldPassword, newPassword: 'new password', confirmedNewPassword: 'new password' }).success, true);
});
test('tag validation trims names and enforces backend limits', () => {
  assert.deepEqual(tagSchema.parse({ tagName: '  React  ' }), { tagName: 'React' });
  for (const tagName of ['', '  ', 'a', 'a'.repeat(51)]) assert.equal(tagSchema.safeParse({ tagName }).success, false);
});
test('tag deletion shows permission and backend conflict errors', () => {
  assert.match(managementError({ status: 403 }, 'tags', 'delete'), /permission/);
  assert.equal(managementError({ status: 409, data: { message: 'Tag is in use' } }, 'tags', 'delete'), 'Tag is in use');
});
