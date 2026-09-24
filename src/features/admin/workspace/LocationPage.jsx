import { useState } from 'react';
import { Building2, Layers, DoorOpen, Users, Plus, Search, RefreshCw } from 'lucide-react';
import { useWorkspaceTranslation } from '@/locales/workspace/useWorkspaceTranslation';
import { useAdminResourceQuery } from './liveApi';
import { QueryNotice } from './Dashboard';
import ManageDialog from './ManageDialog';
import { locationHierarchy } from './locationHierarchy';
import './locations.css';

export default function LocationPage() {
  const { w } = useWorkspaceTranslation();
  const query = useAdminResourceQuery('locations');
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(null);
  const rows = query.isError ? [] : query.data?.rows || [];
  const buildings = locationHierarchy(rows);
  const term = search.trim().toLowerCase();
  const filtered = locationHierarchy(rows.filter(row => [row.building, row.floor, row.room].some(value => String(value ?? '').toLowerCase().includes(term))));
  const floorCount = buildings.reduce((sum, building) => sum + building.floors.filter(floor => floor.name).length, 0);
  const roomCount = buildings.reduce((sum, building) => sum + building.floors.reduce((count, floor) => count + new Set(floor.locations.map(row => String(row.room ?? '').trim()).filter(Boolean)).size, 0), 0);
  const loaded = Boolean(query.data) && !query.isError;
  return <div className="loc-page">
    <header className="loc-header"><div><h1>{w('Campus Location & Room Hierarchy')}</h1><p>{w('Explore campus buildings, floors, and rooms.')}</p></div><div className="al-actions"><button className="al-button" disabled={query.isFetching} onClick={query.refetch} aria-label={w('Refresh')}><RefreshCw size={15} /></button><button className="al-button loc-primary" onClick={() => setCreating({})}><Plus size={15} />{w('Add Campus Building')}</button></div></header>
    <div className="loc-stats">{[
      ['Buildings', loaded ? buildings.filter(building => building.name).length : '—', 'Campus buildings', Building2, 'blue'],
      ['Floors', loaded ? floorCount : '—', 'Configured levels', Layers, 'cyan'],
      ['Configured Rooms', loaded ? roomCount : '—', 'Rooms listed in locations', DoorOpen, 'green'],
      ['Total Capacity', '—', 'Capacity data unavailable', Users, 'amber'],
    ].map(([label, value, note, Icon, color]) => <section className="loc-stat" key={label}><div><h2>{w(label)}</h2><strong>{value}</strong><p>{w(note)}</p></div><span className={`loc-icon ${color}`}><Icon size={20} /></span></section>)}</div>
    <label className="loc-search"><Search size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder={w('Filter buildings, floors, or room numbers…')} aria-label={w('Search locations')} /></label>
    <QueryNotice query={query} label={w('locations')} />
    {loaded && <div className="loc-buildings">{filtered.map((building, index) => <details className="loc-building" key={`${term}:${building.name}`} open={Boolean(term) || index === 0}>
      <summary><span className="loc-building-mark">{building.name.slice(0, 3).toUpperCase() || <Building2 size={18} />}</span><span className="loc-building-name"><strong>{building.name || w('Unspecified building')}</strong><small>{w('Campus location')}</small></span><span className="loc-summary-count">{building.floors.filter(floor => floor.name).length} {w('Floors')} · {building.floors.reduce((count, floor) => count + new Set(floor.locations.map(row => String(row.room ?? '').trim()).filter(Boolean)).size, 0)} {w('Rooms')}</span></summary>
      <div className="loc-building-body"><div className="loc-building-actions"><button className="al-button" disabled={!building.name} onClick={() => setCreating({ building: building.name })}><Plus size={13} />{w('Add Floor')}</button></div>
        {building.floors.map(floor => <details className="loc-floor" key={floor.name} open><summary><Layers size={16} /><strong>{floor.name ? `${w('Floor')}: ${floor.name}` : w('No floor specified')}</strong><span>{new Set(floor.locations.map(row => String(row.room ?? '').trim()).filter(Boolean)).size} {w('Rooms')}</span></summary><div className="loc-floor-body"><div className="loc-building-actions"><button className="al-button" disabled={!building.name} onClick={() => setCreating({ building: building.name, floor: floor.name })}><Plus size={13} />{w('Add Room')}</button></div><div className="loc-room-grid">{floor.locations.map((room, roomIndex) => <article className="loc-room" key={room.id ?? roomIndex}><DoorOpen size={17} /><h3>{room.room || w('Location without a room')}</h3><p>{building.name || w('Unspecified building')}{floor.name ? ` · ${floor.name}` : ''}</p><span className="loc-record-id">{w('Location ID')}: {room.id ?? '—'}</span></article>)}</div></div></details>)}
      </div>
    </details>)}{!filtered.length && <div className="al-card al-empty">{w(search ? 'No records match your search.' : 'No locations available.')}</div>}</div>}
    {creating && <ManageDialog resource="locations" action="create" record={creating} onClose={() => setCreating(null)} />}
  </div>;
}
