import assert from 'node:assert/strict';
import test from 'node:test';
import { copyPngToClipboard } from './clipboardImage.ts';

test('clipboard copy is unavailable in Node and is not treated as a capture failure', async () => {
  const blob = new Blob([Uint8Array.from([1, 2, 3])], { type: 'image/png' });
  assert.equal(await copyPngToClipboard(blob), 'unavailable');
});
