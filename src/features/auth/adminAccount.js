export const ADMIN_ACCOUNT_EMAIL = 'adminnexa123@gmail.com';

export function isAdminAccountEmail(email) {
  return typeof email === 'string' && email.trim().toLowerCase() === ADMIN_ACCOUNT_EMAIL;
}
