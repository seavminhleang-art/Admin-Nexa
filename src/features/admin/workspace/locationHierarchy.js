// Group the API's location list by building, then by floor.
export function locationHierarchy(rows) {
  const buildings = new Map();

  for (const row of rows) {
    const buildingName = String(row.building ?? '').trim();
    const floorName = String(row.floor ?? '').trim();

    if (!buildings.has(buildingName)) {
      buildings.set(buildingName, {
        name: buildingName,
        floors: new Map(),
      });
    }
    const building = buildings.get(buildingName);

    if (!building.floors.has(floorName)) {
      building.floors.set(floorName, {
        name: floorName,
        locations: [],
      });
    }
    const floor = building.floors.get(floorName);
    floor.locations.push(row);
  }

  // Return ordinary arrays so the page can render each building and floor.
  const result = [];
  for (const building of buildings.values()) {
    result.push({
      name: building.name,
      floors: Array.from(building.floors.values()),
    });
  }
  return result;
}
