const upper = value => String(value ?? '').toUpperCase();
export function matchesModerationFilter(report, filter) {
  if (filter === 'all') return true;
  if (filter === 'pending') return ['PENDING', 'PENDING_REVIEW'].includes(upper(report.moderationStatus));
  if (filter === 'suspicious') return ['SUSPICIOUS', 'FLAGGED'].includes(upper(report.moderationStatus));
  if (filter === 'hidden') return upper(report.moderationStatus) === 'HIDDEN';
  if (filter === 'resolved') return ['RESOLVED', 'CLAIMED', 'RETURNED'].includes(upper(report.status));
  return false;
}
