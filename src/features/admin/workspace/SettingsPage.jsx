import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { UserRound, PackageSearch, ShieldCheck, Bell, Palette, Search } from 'lucide-react';
import { useWorkspaceTranslation } from '@/locales/workspace/useWorkspaceTranslation';
import WorkspaceLanguageSwitcher from '@/Components/common/WorkspaceLanguageSwitcher';
import { useAdminProfileQuery } from './liveApi';
import { QueryNotice } from './Dashboard';
import ManageDialog from './ManageDialog';
import './settings.css';
const sections = [['profile','General & Profile',UserRound],['lost-found','Lost & Found',PackageSearch],['security','Security & Access',ShieldCheck],['notifications','Notifications',Bell],['appearance','Appearance & Khmer Theme',Palette]];
export default function SettingsPage() {
  const { w } = useWorkspaceTranslation();
  const { appearance, updateAppearance } = useOutletContext();
  const [active,setActive] = useState('profile');
  const [search,setSearch] = useState('');
  const [editing,setEditing] = useState(null);
  const profile = useAdminProfileQuery();
  const visible = sections.filter(([,label])=>w(label).toLowerCase().includes(search.toLowerCase()));
  const title = sections.find(([key])=>key===active)[1];

  return <div className="sp-page"><header><h1>{w('Platform Settings')}</h1><p>{w('Manage your account and explore platform configuration.')}</p></header>
    <label className="sp-search"><Search size={15}/><input value={search} onChange={event=>setSearch(event.target.value)} placeholder={w('Search settings categories…')} aria-label={w('Search settings')}/></label>
    <div className="sp-layout"><aside><nav className="sp-nav" aria-label={w('Settings categories')}><h2>{w('CONFIG CATEGORIES')}</h2>{visible.map(([key,label,Icon])=><button key={key} aria-current={active===key?'page':undefined} onClick={()=>setActive(key)}><Icon size={15}/>{w(label)}</button>)}{!visible.length&&<p className="al-data-note">{w('No records match your search.')}</p>}</nav><section className="sp-account"><h2>{w('Signed-in account')}</h2><QueryNotice query={profile} label={w('account profile')}/>{profile.data&&!profile.isError&&<><strong>{profile.data.displayName||'—'}</strong><p>{profile.data.email||'—'}</p></>}</section></aside>
      <main className="sp-content"><div className="sp-panel-heading"><div><h2>{w(title)}</h2><p>{w('Settings for your workspace.')}</p></div></div>
        {active==='profile'&&<section className="sp-card"><h3>{w('Profile')}</h3><QueryNotice query={profile} label={w('account profile')}/>{profile.data&&!profile.isError&&<><dl className="al-profile"><dt>{w('Name')}</dt><dd>{profile.data.displayName||'—'}</dd><dt>{w('Email')}</dt><dd>{profile.data.email||'—'}</dd><dt>{w('Bio')}</dt><dd>{profile.data.bio||'—'}</dd></dl><button className="al-button sp-primary" onClick={()=>setEditing('profile')}>{w('Edit profile')}</button></>}</section>}
        {active==='security'&&<section className="sp-card"><h3>{w('Account security')}</h3><p>{w('Update the password for your signed-in account.')}</p><button className="al-button sp-primary" onClick={()=>setEditing('password')}>{w('Change password')}</button></section>}
        {active==='appearance'&&<section className="sp-card sp-appearance"><h3>{w('Appearance, Modern Themes & Khmer Heritage')}</h3><p>{w('Customize this browser’s display and accessibility preferences.')}</p><h4>{w('Display Theme Mode')}</h4><div className="sp-theme-options" role="group" aria-label={w('Display Theme Mode')}><button aria-pressed={appearance.dark} onClick={()=>updateAppearance({dark:true})}>{w('Dark Mode')}</button><button aria-pressed={!appearance.dark} onClick={()=>updateAppearance({dark:false})}>{w('Light Mode')}</button></div><h4>{w('Accessibility & Comfort Policies')}</h4><div className="sp-accessibility">{[['contrast','High Contrast Text','Increase text and border contrast.'],['reducedMotion','Reduce Motion & Animations','Minimize interface motion.'],['colorblind','Colorblind Assist Mode','Use blue and amber status colors with text labels.']].map(([key,label,description])=><label key={key}><span><strong>{w(label)}</strong><small>{w(description)}</small></span><input type="checkbox" checked={appearance[key]} onChange={event=>updateAppearance({[key]:event.target.checked})}/></label>)}</div><label className="sp-field">{w('Layout & Table Density')}<select value={appearance.density} onChange={event=>updateAppearance({density:event.target.value})}><option value="comfortable">{w('Comfortable (Balanced Spacing)')}</option><option value="compact">{w('Compact')}</option></select></label><div className="sp-password"><div><h3>{w('Workspace language')}</h3><p>{w('Switch between English and Khmer.')}</p></div><WorkspaceLanguageSwitcher/></div><p className="sp-saved">{w('Preferences are saved automatically in this browser.')}</p></section>}
        {active==='notifications'&&<section className="sp-card"><h3>{w('In-app notifications')}</h3><p>{w('Review notifications and mark them as read.')}</p><Link className="al-button sp-primary" to="/admin/notifications">{w('Open notifications')}</Link></section>}
        {active==='lost-found'&&<section className="sp-card"><h3>{w('Lost & Found')}</h3><p>{w('Manage categories, campus locations, reports, and ownership claims.')}</p><div className="sp-supported-links">{[['/admin/categories','Manage categories','Browse and create item categories.'],['/admin/locations','Location','Browse and create campus locations.'],['/admin/claims','Claim Log','Browse reports and review claims and matches for your own reports.']].map(([path,label,description])=><Link key={path} to={path}><strong>{w(label)} →</strong><span>{w(description)}</span></Link>)}</div></section>}
      </main></div>{editing&&<ManageDialog resource={editing} action="update" record={editing==='profile'?profile.data||{}:{}} onClose={()=>setEditing(null)}/>}
  </div>;
}
