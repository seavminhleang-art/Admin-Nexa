import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useWorkspaceTranslation } from '@/locales/workspace/useWorkspaceTranslation';
import { useAdminResourceQuery } from './liveApi';

export default function AdminNotificationAlerts() {
  const { w } = useWorkspaceTranslation();
  const seenIds = useRef(null);
  const [alerts, setAlerts] = useState([]);
  const query = useAdminResourceQuery(
    { resource: 'notifications', page: 0 },
    { pollingInterval: 15000, refetchOnFocus: true, refetchOnReconnect: true },
  );

  useEffect(() => {
    if (query.isError || !query.data) return;
    const rows = query.data.rows;
    // Existing notifications belong in the inbox; only newly received ones pop up.
    if (seenIds.current === null) {
      seenIds.current = new Set(rows.map((row) => row.id));
      return;
    }
    const incoming = rows.filter((row) =>
      row.id != null && !row.read && !seenIds.current.has(row.id),
    );
    for (const row of rows) seenIds.current.add(row.id);
    if (incoming.length) {
      setAlerts((previous) => [...incoming, ...previous].slice(0, 3));
    }
  }, [query.data, query.isError]);

  return (
    <div className="al-notification-alerts" aria-live="polite" aria-relevant="additions">
      {alerts.map((notification) => (
        <section className="al-notification-alert" key={notification.id}>
          <div>
            <strong>{notification.title || w('Notification')}</strong>
            <p>{notification.body}</p>
            <Link to="/admin/notifications" onClick={() => setAlerts([])}>
              {w('View all →')}
            </Link>
          </div>
          <button
            className="al-icon-button"
            aria-label={w('Close notification')}
            onClick={() => setAlerts((previous) => previous.filter((item) => item.id !== notification.id))}
          >
            <X size={16} />
          </button>
        </section>
      ))}
    </div>
  );
}
