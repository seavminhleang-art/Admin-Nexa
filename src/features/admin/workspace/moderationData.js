// Use moderationStatus for review decisions and status for item resolution.
export function matchesModerationFilter(report, filter) {
  if (filter === 'all') {
    return true;
  }
  if (filter === 'pending') {
    const status = String(report.moderationStatus ?? '').toUpperCase();
    return status === 'PENDING' || status === 'PENDING_REVIEW';
  }
  if (filter === 'suspicious') {
    const status = String(report.moderationStatus ?? '').toUpperCase();
    return status === 'SUSPICIOUS' || status === 'FLAGGED';
  }
  if (filter === 'hidden') {
    const status = String(report.moderationStatus ?? '').toUpperCase();
    return status === 'HIDDEN';
  }
  if (filter === 'resolved') {
    const status = String(report.status ?? '').toUpperCase();
    return status === 'RESOLVED' || status === 'CLAIMED' || status === 'RETURNED';
  }
  return false;
}
