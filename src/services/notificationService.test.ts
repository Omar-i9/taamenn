import assert from 'node:assert/strict';
import test from 'node:test';
import { notificationLedgerDecision } from './notificationService.ts';

test('a disabled notification preference does not consume the event ledger', () => {
  assert.equal(notificationLedgerDecision(false, false), 'skip-disabled');
  assert.equal(notificationLedgerDecision(false, true), 'skip-known');
  assert.equal(notificationLedgerDecision(true, false), 'emit');
  assert.equal(notificationLedgerDecision(true, true), 'skip-known');
});
