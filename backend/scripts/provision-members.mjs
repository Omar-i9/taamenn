/**
 * Provision Private Circle passwords for members that already exist in the operator
 * dataset (backend/data.json, which is never committed).
 *
 * This script contains no roster: real member identities live only in the operator
 * dataset. Generated passwords are printed once and only their hashes are stored.
 *
 *   node --env-file=.env scripts/provision-members.mjs                 # members without a password
 *   node --env-file=.env scripts/provision-members.mjs --all           # rotate every member
 *   node --env-file=.env scripts/provision-members.mjs --user omar     # a single member
 */
import crypto from 'node:crypto';
import { hashPassword } from '../src/passwords.mjs';
import { store } from '../src/store.mjs';

const args = process.argv.slice(2);
const rotateAll = args.includes('--all');
const userIndex = args.indexOf('--user');
const onlyUser = userIndex >= 0 ? args[userIndex + 1] : '';

function generatePassword() {
  // 20 base64url characters: comfortably above the 12-character minimum.
  return crypto.randomBytes(18).toString('base64url').slice(0, 20);
}

const data = await store.load();
if (!data.members.length) {
  console.error('No members found in backend/data.json. Add the member records first.');
  process.exit(1);
}

const issued = [];
await store.update(current => {
  for (const member of current.members) {
    if (onlyUser && member.username !== onlyUser) continue;
    if (!onlyUser && !rotateAll && member.passwordHash) continue;
    const password = generatePassword();
    member.passwordHash = hashPassword(password);
    member.updatedAt = Date.now();
    issued.push({ username: member.username, displayName: member.displayName, role: member.role, password });
  }
});

if (!issued.length) {
  console.log('Nothing to provision. Use --all to rotate existing passwords or --user <username> for one member.');
  process.exit(0);
}

console.log('\nTAAMEN PRIVATE CIRCLE CREDENTIALS — SHOWN ONCE\n');
for (const row of issued) {
  console.log(`${row.displayName} (${row.username}) [${row.role}] -> ${row.password}`);
}
console.log('\nOnly password hashes are stored. Deliver these securely and do not commit them.\n');
