import test from 'node:test';
import assert from 'node:assert/strict';
import { MISSIONS, findMission } from '../src/game/missions.js';

test('campaign has ten uniquely identified missions in campaign order', () => {
  assert.equal(MISSIONS.length, 10);
  assert.deepEqual(MISSIONS.map((mission) => mission.number), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.equal(new Set(MISSIONS.map((mission) => mission.id)).size, 10);
});

test('every mission has an actionable objective and a reward', () => {
  for (const mission of MISSIONS) {
    assert.ok(mission.title.length > 4);
    assert.ok(mission.reward > 0);
    assert.ok(mission.objectives.length > 0);
    for (const objective of mission.objectives) assert.ok(objective.count > 0);
  }
});

test('mission lookup returns defined missions and nothing invented', () => {
  assert.equal(findMission('feed').title, 'Operation: Feed Everyone');
  assert.equal(findMission('final').number, 10);
  assert.equal(findMission('not-a-real-mission'), undefined);
});
