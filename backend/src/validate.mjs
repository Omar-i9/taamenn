import { HttpError } from './http.mjs';

export function requiredString(body, field, { min = 1, max = 200 } = {}) {
  const value = body[field];
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be a string.`);
  const trimmed = value.trim();
  if (trimmed.length < min) throw new HttpError(400, `${field} is required.`);
  if (value.length > max) throw new HttpError(400, `${field} is too long.`);
  return trimmed;
}

/** Passwords are not trimmed: leading and trailing spaces are legitimate characters. */
export function requiredSecret(body, field, { min = 1, max = 400 } = {}) {
  const value = body[field];
  if (typeof value !== 'string') throw new HttpError(400, `${field} must be a string.`);
  if (value.length < min) throw new HttpError(400, `${field} is required.`);
  if (value.length > max) throw new HttpError(400, `${field} is too long.`);
  return value;
}

export function requiredBoolean(body, field) {
  const value = body[field];
  if (typeof value !== 'boolean') throw new HttpError(400, `${field} must be a boolean.`);
  return value;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function requiredEmail(body, field, { max = 254 } = {}) {
  const value = requiredString(body, field, { max });
  if (!EMAIL.test(value)) throw new HttpError(400, 'A valid email address is required.');
  return value;
}

const COORDINATE_KEYS = ['x', 'y'];

/**
 * Tactical plans are stored, so they are shape-checked rather than accepted wholesale.
 * Unknown fields are dropped instead of persisted.
 */
export function tacticalPlan(body) {
  const plan = body.plan;
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) {
    throw new HttpError(400, 'plan must be an object.');
  }
  const formationId = typeof plan.formationId === 'string' ? plan.formationId.slice(0, 40) : '';
  if (!formationId) throw new HttpError(400, 'plan.formationId is required.');
  if (!Array.isArray(plan.players)) throw new HttpError(400, 'plan.players must be an array.');
  if (plan.players.length > 40) throw new HttpError(400, 'plan.players is too large.');

  const players = plan.players.map((player, index) => {
    if (!player || typeof player !== 'object') throw new HttpError(400, `plan.players[${index}] must be an object.`);
    const out = {
      id: typeof player.id === 'string' && player.id ? player.id.slice(0, 60) : `p${index}`,
      name: typeof player.name === 'string' ? player.name.slice(0, 60) : '',
      team: player.team === 'away' ? 'away' : 'home',
      role: typeof player.role === 'string' ? player.role.slice(0, 20) : '',
      teamRole: typeof player.teamRole === 'string' ? player.teamRole.slice(0, 40) : '',
      instruction: typeof player.instruction === 'string' ? player.instruction.slice(0, 60) : '',
      captain: player.captain === true,
      positionMode: player.positionMode === 'manual' ? 'manual' : 'auto',
    };
    for (const key of COORDINATE_KEYS) {
      const value = Number(player[key]);
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        throw new HttpError(400, `plan.players[${index}].${key} must be between 0 and 100.`);
      }
      out[key] = value;
    }
    return out;
  });

  return { formationId, players, landscape: plan.landscape === true };
}
