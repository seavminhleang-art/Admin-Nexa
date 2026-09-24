import test from 'node:test';
import assert from 'node:assert/strict';
import { locationHierarchy } from '../src/features/admin/workspace/locationHierarchy.js';
test('groups floors within their own building and preserves room records', () => {
  const rows = [{id:1,building:' A ',floor:'1',room:'101'}, {id:2,building:'A',floor:'1',room:'102'}, {id:3,building:'B',floor:'1',room:'101'}, {id:4,building:'A',floor:'2',room:'201'}];
  const groups = locationHierarchy(rows);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].floors.length, 2);
  assert.deepEqual(groups[0].floors[0].locations.map(row => row.id), [1,2]);
  assert.equal(groups[1].floors[0].locations[0].id, 3);
  assert.equal(rows[0].building, ' A ');
});
test('preserves partial locations and empty collections', () => {
  assert.deepEqual(locationHierarchy([]), []);
  const groups = locationHierarchy([{id:1,building:'A'}, {id:2}]);
  assert.equal(groups[0].floors[0].name, '');
  assert.equal(groups[1].name, '');
  assert.equal(groups[1].floors[0].locations[0].id, 2);
});
