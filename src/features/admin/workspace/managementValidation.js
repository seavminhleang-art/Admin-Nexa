import { z } from 'zod';

export const tagSchema = z.object({
  tagName: z.string().trim().min(2, 'Tag name must contain at least 2 characters.').max(50, 'Tag name must contain at most 50 characters.'),
});

export const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Enter your current password.'),
  newPassword: z.string().min(8, 'New password must contain at least 8 characters.').max(100, 'New password must contain at most 100 characters.'),
  confirmedNewPassword: z.string().min(1, 'Confirm your new password.'),
}).superRefine((values, context) => {
  if (values.oldPassword === values.newPassword) context.addIssue({ code: 'custom', path: ['newPassword'], message: 'New password must be different from your current password.' });
  if (values.newPassword !== values.confirmedNewPassword) context.addIssue({ code: 'custom', path: ['confirmedNewPassword'], message: 'Passwords do not match.' });
});

export function managementError(error, resource, action) {
  const status = Number(error?.originalStatus ?? error?.status);
  if (status === 403 && resource === 'tags' && action === 'delete') return 'The server denied tag deletion for this account. Check the account’s backend permissions.';
  const message = error?.data?.message;
  if (typeof message === 'string' && message.trim()) return message;
  if (status === 409 && resource === 'tags') return 'The tag conflicts with existing data. It may already exist or still be used by posts.';
  return '';
}
