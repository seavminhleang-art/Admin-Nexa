import { Link } from 'react-router-dom';
import { Users, Activity, ShieldAlert, LockKeyhole, Bell } from 'lucide-react';
import { useWorkspaceTranslation } from '@/locales/workspace/useWorkspaceTranslation';
import { useAdminResourceQuery } from './liveApi';
import { QueryNotice, dateOf } from './Dashboard';
import ResourcePage from './ResourcePage';
import './users.css';
export default function UserManagement() {
  const { w } = useWorkspaceTranslation();
  const query = useAdminResourceQuery('users');
  const notifications = useAdminResourceQuery({resource:'notifications',page:0});
  const rows = query.isError ? [] : query.data?.rows || [];
  const loaded = Boolean(query.data) && !query.isError;
  return <div className="um-layout"><div className="um-main">
    <header className="um-header"><h1>{w('User Management')}</h1><p>{w('Manage community accounts and profiles.')}</p></header>
    <div className="um-stats">{[['Loaded users',loaded?rows.length:'—',Users,'blue'],['Active sessions','—',Activity,'green'],['Support review','—',ShieldAlert,'amber'],['Restricted users',loaded && rows.length && rows.every(user=>typeof user.status==='string')?rows.filter(user=>['BLOCKED','SUSPENDED'].includes(user.status.toUpperCase())).length:'—',LockKeyhole,'red']].map(([label,value,Icon,color])=><section key={label} className={`um-stat ${color}`}><Icon size={16}/><h2>{w(label)}</h2><strong>{value}</strong><small>{w(label==='Loaded users'?'Loaded records':value==='—'?'Data unavailable':'Based on loaded users')}</small></section>)}</div>
    <div className="um-table-card"><ResourcePage resource="users" embedded /></div>
    </div><aside className="um-sidebar"><div className="um-side-title"><h2>{w('Notifications')}</h2><Link to="/admin/notifications">{w('View all →')}</Link></div><QueryNotice query={notifications} label={w('notifications')}/>{!notifications.isError&&notifications.data?.rows.slice(0,6).map((item,index)=><div className="um-notification" key={item.id??index}><Bell size={16}/><div><strong>{item.title||item.message||item.body||w('Notification')}</strong><small>{dateOf(item)?.toLocaleDateString()||'—'}</small></div></div>)}{notifications.data?.rows.length===0&&<p className="al-data-note">{w('No notifications.')}</p>}<h2>{w('Activities')}</h2><p className="al-data-note">{w('Activity history is unavailable.')}</p></aside>
  </div>;
}
