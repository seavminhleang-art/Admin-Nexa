import { Users, Activity, ShieldAlert, LockKeyhole } from 'lucide-react';
import { useWorkspaceTranslation } from '@/locales/workspace/useWorkspaceTranslation';
import { useAdminResourceQuery } from './liveApi';
import ResourcePage from './ResourcePage';
import './users.css';
export default function UserManagement() {
  const { w } = useWorkspaceTranslation();
  const query = useAdminResourceQuery('users');
  const rows = query.isError ? [] : query.data?.rows || [];
  const loaded = Boolean(query.data) && !query.isError;
  return <div className="um-layout"><div className="um-main">
    <header className="um-header"><h1>{w('User Management')}</h1><p>{w('Manage community accounts and profiles.')}</p></header>
    <div className="um-stats">{[['Loaded users',loaded?rows.length:'—',Users,'blue'],['Active sessions','—',Activity,'green'],['Support review','—',ShieldAlert,'amber'],['Restricted users',loaded && rows.length && rows.every(user=>typeof user.status==='string')?rows.filter(user=>['BLOCKED','SUSPENDED'].includes(user.status.toUpperCase())).length:'—',LockKeyhole,'red']].map(([label,value,Icon,color])=><section key={label} className={`um-stat ${color}`}><Icon size={16}/><h2>{w(label)}</h2><strong>{value}</strong><small>{w(label==='Loaded users'?'Loaded records':value==='—'?'Data unavailable':'Based on loaded users')}</small></section>)}</div>
    <div className="um-table-card"><ResourcePage resource="users" embedded /></div>
    </div>
  </div>;
}
