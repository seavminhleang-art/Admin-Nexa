// Ownership is independent of account role. Missing IDs never grant access.
export function ownsReport(report, user) {
  return report?.userId != null && user?.id != null &&
    String(report.userId).trim() !== '' && String(user.id).trim() !== '' &&
    String(report.userId) === String(user.id);
}
