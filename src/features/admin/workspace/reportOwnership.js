// Ownership is independent of account role. Missing IDs never grant access.
export function ownsReport(report, user) {
  if (report?.userId == null || user?.id == null) {
    return false;
  }

  const ownerId = String(report.userId);
  const userId = String(user.id);
  if (ownerId.trim() === '' || userId.trim() === '') {
    return false;
  }

  return ownerId === userId;
}
