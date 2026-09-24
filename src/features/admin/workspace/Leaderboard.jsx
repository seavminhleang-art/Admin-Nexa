import { useState } from 'react';
import { Trophy, Medal, Users, Download, Search, RefreshCw } from 'lucide-react';
import { useWorkspaceTranslation } from '@/locales/workspace/useWorkspaceTranslation';
import { useAdminResourceQuery } from './liveApi';
import { QueryNotice } from './Dashboard';
import './leaderboard.css';

function Avatar({ user }) {
  const [failed, setFailed] = useState(false);
  return <span className="lb-avatar">{user.avatar && !failed ? <img src={user.avatar} alt="" onError={() => setFailed(true)} /> : (user.displayName || '?').slice(0, 2).toUpperCase()}</span>;
}
const score = user => Number.isFinite(user.reputation) ? user.reputation : null;
export default function Leaderboard() {
  const { w } = useWorkspaceTranslation();
  const query = useAdminResourceQuery('leaderboard');
  const [search, setSearch] = useState('');
  const rows = query.isError ? [] : [...(query.data?.rows || [])].sort((a, b) => (score(b) ?? -Infinity) - (score(a) ?? -Infinity));
  const ranked = rows.filter(user => score(user) != null);
  const visible = rows.map((user, index) => ({ user, rank: score(user) == null ? null : index + 1 })).filter(({user}) => [user.displayName, user.id].some(value => String(value ?? '').toLowerCase().includes(search.trim().toLowerCase())));
  const loaded = Boolean(query.data) && !query.isError;
  const number = value => value == null ? '—' : value.toLocaleString();
  function exportCsv() {
    const cell = value => { const text = String(value ?? ''); return `"${(/^[=+@\-\t\r]/.test(text) ? "'" + text : text).replaceAll('"', '""')}"`; };
    const csv = [['Rank','Name','User ID','Reputation'], ...visible.map(({user,rank}) => [rank,user.displayName,user.id,score(user)])].map(row => row.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF',csv], {type:'text/csv;charset=utf-8'}));
    const link = document.createElement('a'); link.href=url; link.download='leaderboard.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
  }
  return <div className="lb-page">
    <header className="lb-header"><div><h1>{w('Leaderboard')}</h1><p>{w('Loaded users ranked by reputation.')}</p></div><div className="al-actions"><button className="al-button" onClick={query.refetch} disabled={query.isFetching} aria-label={w('Refresh')}><RefreshCw size={15}/></button><button className="al-button" onClick={exportCsv} disabled={!visible.length || query.isFetching}><Download size={15}/>{w('Export CSV')}</button></div></header>
    <div className="lb-stats">{[['Total reputation',loaded && ranked.length ? ranked.reduce((sum,user)=>sum+score(user),0):null,Trophy],['Ranked members',loaded?ranked.length:null,Medal],['Highest reputation',loaded?score(ranked[0] || {}):null,Trophy],['Loaded members',loaded?rows.length:null,Users]].map(([label,value,Icon])=><section key={label}><Icon size={18}/><h2>{w(label)}</h2><strong>{number(value)}</strong><small>{w('Based on loaded users')}</small></section>)}</div>
    <QueryNotice query={query} label={w('leaderboard')}/>
    {loaded && <>
      <section className="lb-podium"><span className="lb-podium-label"><Trophy size={13}/>{w('Campus Champions')}</span><h2>{w('Top Community Contributors')}</h2><p>{w('Ranked by reputation')}</p>
        {ranked.length ? <div className="lb-winners">{ranked.slice(0,3).map((user,index)=><article className={`lb-winner lb-place-${index+1}`} key={user.id}><span className="lb-medal"><Medal size={13}/>#{index+1} {w(['Champion','Silver','Bronze'][index])}</span><Avatar key={user.avatar} user={user}/><h3>{user.displayName || w('Member')}</h3><small>{w('User ID')}: {user.id}</small><p className="lb-bio">{user.bio || w('Community member')}</p><div className="lb-score"><span>{w('Reputation')}</span><strong>{number(score(user))}</strong></div></article>)}</div> : <p className="al-empty">{w('No reputation data available.')}</p>}
      </section>
      <section className="lb-ranking"><div className="lb-ranking-title"><span><Trophy size={16}/>{w('Overall Honor Roll')}</span><small>{w('Based on loaded users')}</small></div><label className="lb-search"><Search size={16}/><input value={search} onChange={event=>setSearch(event.target.value)} placeholder={w('Search by name or user ID…')} aria-label={w('Search members')}/></label>
        <div className="al-table-wrap"><table><thead><tr>{['Rank','Member','Reputation','About'].map(label=><th key={label}>{w(label)}</th>)}</tr></thead><tbody>{visible.map(({user,rank})=><tr key={user.id}><td><span className={`lb-rank ${rank && rank<=3?'lb-rank-'+rank:''}`}>{rank?`#${rank}`:'—'}</span></td><td><div className="lb-member"><Avatar key={user.avatar} user={user}/><div><strong>{user.displayName || w('Member')}</strong><small>{w('User ID')}: {user.id}</small></div></div></td><td><strong>{number(score(user))}</strong></td><td className="lb-about">{user.bio || '—'}</td></tr>)}</tbody></table></div>{!visible.length && <p className="al-empty">{w('No records match your search.')}</p>}
      </section>
    </>}
  </div>;
}
