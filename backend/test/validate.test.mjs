import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareEnvironment } from './helpers.mjs';

prepareEnvironment('validate');

const { requiredBoolean, requiredEmail, requiredSecret, requiredString, tacticalPlan } = await import('../src/validate.mjs');

function status(fn) {
  try {
    fn();
    return 200;
  } catch (error) {
    return error.status;
  }
}

test('requiredString trims, enforces presence, and caps length', () => {
  assert.equal(requiredString({ name: '  Ada  ' }, 'name'), 'Ada');
  assert.equal(requiredString({ name: 'عمر ابوزينة' }, 'name'), 'عمر ابوزينة');
  assert.equal(requiredString({ message: 'أرغب في المساعدة' }, 'message'), 'أرغب في المساعدة');
  assert.equal(status(() => requiredString({ name: '   ' }, 'name')), 400);
  assert.equal(status(() => requiredString({}, 'name')), 400);
  assert.equal(status(() => requiredString({ name: 42 }, 'name')), 400);
  assert.equal(status(() => requiredString({ name: ['Ada'] }, 'name')), 400);
  assert.equal(status(() => requiredString({ name: null }, 'name')), 400);
  assert.equal(status(() => requiredString({ name: 'x'.repeat(201) }, 'name')), 400);
  assert.equal(requiredString({ name: 'x'.repeat(200) }, 'name').length, 200);
});

test('requiredSecret preserves surrounding whitespace', () => {
  // Trimming a password would silently reject legitimate credentials.
  assert.equal(requiredSecret({ password: '  spaced  ' }, 'password'), '  spaced  ');
  assert.equal(status(() => requiredSecret({ password: '' }, 'password')), 400);
  assert.equal(status(() => requiredSecret({ password: 'short' }, 'password', { min: 12 })), 400);
  assert.equal(status(() => requiredSecret({ password: 'x'.repeat(401) }, 'password')), 400);
});

test('requiredEmail accepts ordinary addresses and rejects malformed ones', () => {
  assert.equal(requiredEmail({ email: ' person@example.com ' }, 'email'), 'person@example.com');
  for (const email of ['no-at-sign', 'missing@domain', 'two@@example.com', '@example.com', 'person@', 'a b@example.com', '']) {
    assert.equal(status(() => requiredEmail({ email }, 'email')), 400, `${email} must be refused`);
  }
});

test('requiredBoolean refuses truthy stand-ins', () => {
  assert.equal(requiredBoolean({ active: true }, 'active'), true);
  assert.equal(requiredBoolean({ active: false }, 'active'), false);
  for (const active of ['true', 'false', 1, 0, null, undefined, [], {}]) {
    assert.equal(status(() => requiredBoolean({ active }, 'active')), 400, `${JSON.stringify(active)} must be refused`);
  }
});

test('a tactical plan is accepted only with in-range coordinates', () => {
  const plan = tacticalPlan({
    plan: {
      formationId: 'diamond',
      landscape: true,
      players: [{ id: 'H1', name: 'Player 1', team: 'home', x: 0, y: 100, captain: true }],
    },
  });
  assert.equal(plan.formationId, 'diamond');
  assert.equal(plan.landscape, true);
  assert.equal(plan.players[0].x, 0);
  assert.equal(plan.players[0].y, 100);
  assert.equal(plan.players[0].captain, true);
});

test('out-of-range or non-numeric coordinates are refused', () => {
  const withCoordinates = (x, y) => ({
    plan: { formationId: 'diamond', players: [{ id: 'H1', team: 'home', x, y }] },
  });
  for (const [x, y] of [[-1, 50], [101, 50], [50, -0.5], [50, 100.5], ['40', 50], [NaN, 50], [Infinity, 50], [null, 50], [undefined, 50]]) {
    assert.equal(status(() => tacticalPlan(withCoordinates(x, y))), 400, `(${x}, ${y}) must be refused`);
  }
});

test('a malformed plan shape is refused', () => {
  assert.equal(status(() => tacticalPlan({})), 400);
  assert.equal(status(() => tacticalPlan({ plan: 'diamond' })), 400);
  assert.equal(status(() => tacticalPlan({ plan: [] })), 400);
  assert.equal(status(() => tacticalPlan({ plan: { players: [] } })), 400, 'formationId is required');
  assert.equal(status(() => tacticalPlan({ plan: { formationId: 'diamond' } })), 400, 'players is required');
  assert.equal(status(() => tacticalPlan({ plan: { formationId: 'diamond', players: 'none' } })), 400);
  assert.equal(status(() => tacticalPlan({
    plan: { formationId: 'diamond', players: Array.from({ length: 41 }, () => ({ id: 'x', team: 'home', x: 1, y: 1 })) },
  })), 400, 'an oversized squad must be refused');
  assert.equal(status(() => tacticalPlan({ plan: { formationId: 'diamond', players: ['not-an-object'] } })), 400);
});

test('unknown plan fields are dropped and long strings are bounded', () => {
  const plan = tacticalPlan({
    plan: {
      formationId: 'x'.repeat(100),
      players: [{
        id: 'y'.repeat(100),
        name: 'z'.repeat(100),
        team: 'sideline',
        x: 10,
        y: 20,
        injected: 'should not persist',
        role: 'GK',
        positionMode: 'manual',
      }],
      injected: 'should not persist',
    },
  });
  assert.equal(plan.formationId.length, 40);
  assert.equal(plan.players[0].id.length, 60);
  assert.equal(plan.players[0].name.length, 60);
  assert.equal(plan.players[0].team, 'home', 'an unknown team falls back to home');
  assert.equal(plan.injected, undefined);
  assert.equal(plan.players[0].injected, undefined);
  // The position label is derived from the coordinates, so a client-sent one is not stored.
  assert.equal(plan.players[0].role, undefined);
  assert.equal(plan.players[0].positionMode, undefined, 'there is no second source of position truth');
});
