import { mediaUrl } from '@/config/mediaUrl';
import { useState } from 'react';
import { Download, Plus, RefreshCw, Search, PackageSearch, MapPin } from 'lucide-react';
import { useWorkspaceTranslation } from '@/locales/workspace/useWorkspaceTranslation';
import { useAdminResourceQuery } from './liveApi';
import { QueryNotice } from './Dashboard';
import ReportRelated from './ReportRelated';
import ManageDialog from './ManageDialog';
import './claim-log.css';

function ReportPhoto({ report }) {
  const [failed, setFailed] = useState(false);
  const { w } = useWorkspaceTranslation();
  return report.photoUrl && !failed
    ? <img src={mediaUrl(report.photoUrl)} alt={report.title || w('Report')} loading="lazy" onError={() => setFailed(true)} />
    : <div className="cl-no-photo"><PackageSearch size={36} /><span>{w('No photo available')}</span></div>;
}

export default function ClaimLog() {
  const { w } = useWorkspaceTranslation();
  const reports = useAdminResourceQuery('lost-found');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [creating, setCreating] = useState(false);
  const rows = reports.isError ? [] : reports.data?.rows || [];
  const categories = [...new Map(rows.filter(row => row.categoryId != null).map(row => [String(row.categoryId), row.categoryName || `#${row.categoryId}`])).entries()];
  const visible = rows.filter(row =>
    (filter === 'all' || row.itemType?.toLowerCase() === filter) &&
    (!category || String(row.categoryId) === category) &&
    [row.title, row.description, row.id, row.locationLabel, row.freeTextLocation].some(value => String(value ?? '').toLowerCase().includes(search.trim().toLowerCase())));
  const selected = visible.find(row => String(row.id) === selectedId) || visible[0];
  function exportCsv() {
    const columns = ['id', 'title', 'itemType', 'categoryName', 'status', 'locationLabel', 'itemDate'];
    const cell = value => {
      const text = String(value ?? '');
      return `"${(/^[=+@\-\t\r]/.test(text) ? "'" + text : text).replaceAll('"', '""')}"`;
    };
    const csv = [columns, ...visible.map(row => columns.map(key => row[key]))].map(row => row.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'lost-found-reports.csv'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="cl-page">
    <header className="cl-header">
      <div className="cl-heading"><span className="cl-brand-icon"><PackageSearch size={25} /></span><div><h1>{w('ISTAD Lost & Found Command Hub')}</h1><p>{w('Browse reports, review matches, and manage ownership claims.')}</p></div></div>
      <div className="al-actions">
        <button className="al-button" disabled={reports.isFetching} onClick={reports.refetch} aria-label={w('Refresh')}><RefreshCw size={15} /></button>
        <button className="al-button" disabled={!visible.length || reports.isFetching} onClick={exportCsv}><Download size={15} />{w('Export CSV')}</button>
        <button className="al-button cl-primary" onClick={() => setCreating(true)}><Plus size={15} />{w('Register item')}</button>
      </div>
    </header>
    <div className="cl-toolbar">
      <div className="cl-filters" role="group" aria-label={w('Report type')}>{[['all', 'All Records'], ['found', 'Found Items'], ['lost', 'Lost Reports']].map(([value, label]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{w(label)}</button>)}</div>
      <label className="cl-search"><Search size={16} /><input aria-label={w('Search reports')} placeholder={w('Search by title, location, or report ID…')} value={search} onChange={event => setSearch(event.target.value)} /></label>
      <select aria-label={w('Category')} value={category} onChange={event => setCategory(event.target.value)}><option value="">{w('All Categories')}</option>{categories.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
    </div>
    <QueryNotice query={reports} label={w('reports')} />
    {!reports.isError && reports.data && <>
      <p className="cl-count">{visible.length} / {rows.length} {w('loaded records')}</p>
      {visible.length ? <div className="cl-layout">
        <section className="cl-grid" aria-label={w('Reports')}>{visible.map(report => <button key={report.id} className={`cl-card ${selected?.id === report.id ? 'is-selected' : ''}`} aria-pressed={selected?.id === report.id} onClick={() => setSelectedId(String(report.id))}>
          <div className="cl-photo"><ReportPhoto key={report.photoUrl} report={report} /><span className={`cl-type ${report.itemType?.toLowerCase() === 'found' ? 'is-found' : ''}`}>{w(report.itemType || 'Report')}</span></div>
          <div className="cl-card-body"><small>#{report.id} · {report.categoryName || w('Uncategorized')}</small><h2>{report.title || w('Report')}</h2><p>{report.description || w('No description provided.')}</p><div className="cl-card-footer"><span className="cl-status">{w(report.status || 'Unknown')}</span><span>{report.locationLabel || report.freeTextLocation || '—'}</span></div></div>
        </button>)}</section>
        <aside className="cl-detail" aria-label={w('Selected report')}>
          <div className="cl-detail-top"><strong>#{selected.id}</strong><span className="cl-status">{w(selected.status || 'Unknown')}</span></div>
          <div className="cl-detail-photo"><ReportPhoto key={`${selected.id}-${selected.photoUrl}`} report={selected} /></div>
          <h2>{selected.title || w('Report')}</h2><p className="cl-description">{selected.description || w('No description provided.')}</p>
          <dl><div><dt><MapPin size={14} />{w('Location')}</dt><dd>{selected.locationLabel || selected.freeTextLocation || '—'}</dd></div><div><dt>{w('Date')}</dt><dd>{selected.itemDate || '—'}</dd></div><div><dt>{w('Category')}</dt><dd>{selected.categoryName || w('Uncategorized')}</dd></div><div><dt>{w('Reporter ID')}</dt><dd>{selected.userId ?? '—'}</dd></div></dl>
          <ReportRelated key={selected.id} report={selected} />
        </aside>
      </div> : <div className="al-card al-empty">{w('No records match your search.')}</div>}
    </>}
    {creating && <ManageDialog resource="lost-found" action="create" onClose={() => setCreating(false)} />}
  </div>;
}
