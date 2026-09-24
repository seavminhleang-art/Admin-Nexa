export function locationHierarchy(rows) {
  const buildings = new Map();
  for (const row of rows) {
    const building = String(row.building ?? '').trim();
    const floor = String(row.floor ?? '').trim();
    if (!buildings.has(building)) buildings.set(building, { name: building, floors: new Map() });
    const entry = buildings.get(building);
    if (!entry.floors.has(floor)) entry.floors.set(floor, { name: floor, locations: [] });
    entry.floors.get(floor).locations.push(row);
  }
  return [...buildings.values()].map(building => ({ ...building, floors: [...building.floors.values()] }));
}
