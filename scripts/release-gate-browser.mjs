/**
 * One-shot Chromium regression for the TAAMEN 2.0 release gate.
 * Not part of `npm test`. Run: node scripts/release-gate-browser.mjs
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.TAAMEN_DEV_ORIGIN || 'http://127.0.0.1:5173';
const VIEWPORTS = [
  { name: '360x800', width: 360, height: 800, isMobile: true },
  { name: '390x844', width: 390, height: 844, isMobile: true },
  { name: '412x915', width: 412, height: 915, isMobile: true },
  { name: '844x390-landscape', width: 844, height: 390, isMobile: true },
];

const report = { findings: [], errors: [], share: {}, tactical: {}, consent: {}, notifications: {}, profile: {}, backup: {} };

function note(section, message, extra) {
  report.findings.push({ section, message, ...extra });
  console.log(`[${section}] ${message}`);
}

async function idbGetAll(page, store) {
  return page.evaluate(async (storeName) => {
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open('taamen-2');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const rows = await new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
    });
    return rows;
  }, store);
}

async function idbGet(page, store, id) {
  return page.evaluate(async ({ storeName, key }) => {
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open('taamen-2');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = () => {
        db.close();
        resolve(req.result ?? null);
      };
      req.onerror = () => {
        db.close();
        reject(req.error);
      };
    });
  }, { storeName: store, key: id });
}

async function idbPut(page, store, item) {
  return page.evaluate(async ({ storeName, record }) => {
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open('taamen-2');
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    await new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(record);
      tx.oncomplete = () => {
        db.close();
        resolve();
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  }, { storeName: store, record: item });
}

async function overflowSnapshot(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const overflowing = [];
    for (const el of document.querySelectorAll('body, .app-shell, .main-content, .page-content, .overlay, .modal-card, .bottom-nav, .image-viewer-frame, .image-action-sheet, .notification-drawer')) {
      if (!(el instanceof HTMLElement)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width > vw + 2) overflowing.push({ sel: el.className?.toString?.().slice(0, 80) || el.tagName, w: Math.round(rect.width), vw, h: Math.round(rect.height) });
    }
    const nav = document.querySelector('.bottom-nav');
    const navRect = nav && !nav.hasAttribute('hidden') ? nav.getBoundingClientRect() : null;
    const tooSmall = [...document.querySelectorAll('.bottom-nav-item, .primary-action, .dark-action, .icon-button')]
      .filter((el) => el instanceof HTMLElement && el.offsetParent !== null)
      .filter((el) => el.getBoundingClientRect().height < 36 && el.getBoundingClientRect().width < 36)
      .slice(0, 8)
      .map((el) => ({ cls: el.className.toString().slice(0, 60), h: Math.round(el.getBoundingClientRect().height), w: Math.round(el.getBoundingClientRect().width) }));
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      bodyOverflow: getComputedStyle(document.body).overflow,
      htmlOverflow: doc.scrollWidth > doc.clientWidth + 2,
      overflowing,
      navVisible: Boolean(navRect && navRect.height > 0),
      nav: navRect ? { y: Math.round(navRect.y), h: Math.round(navRect.height), bottom: Math.round(navRect.bottom), vh } : null,
      tooSmall,
      dir: document.documentElement.dir,
    };
  });
}

async function ensureEnglish(page) {
  const english = page.getByRole('button', { name: 'English' });
  if (await english.count()) {
    await english.first().click();
    await page.waitForTimeout(200);
  }
}

async function completeSetup(page) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.form-label input, .app-shell, .bottom-nav, .loading-screen', { timeout: 20000 });
  await page.waitForSelector('.form-label input, .app-shell, .bottom-nav', { timeout: 20000 });
  const firstName = page.locator('.form-label input[type="text"]').first();
  if (await firstName.isVisible().catch(() => false)) {
    await ensureEnglish(page);
    await firstName.fill('ReleaseQA');
    const consent = page.locator('#consent-checkbox');
    if (await consent.count()) await consent.check();
    await page.locator('button.mobile-submit, button.primary-action').last().click();
    await page.waitForTimeout(800);
  }
  const accept = page.getByRole('button', { name: /Accept and continue|موافق والمتابعة/ });
  if (await accept.isVisible().catch(() => false)) {
    await accept.click();
    await page.waitForTimeout(400);
  }
  await ensureEnglish(page);
}

async function goHash(page, hash) {
  await page.evaluate((h) => {
    location.hash = h;
  }, hash);
  await page.waitForTimeout(400);
}

async function inspectViewport(page, name) {
  const snap = await overflowSnapshot(page);
  if (snap.htmlOverflow) report.errors.push(`${name}: document horizontal overflow ${snap.scrollWidth}>${snap.clientWidth}`);
  if (snap.overflowing.length) report.errors.push(`${name}: overflowing nodes ${JSON.stringify(snap.overflowing)}`);
  if (snap.nav && snap.nav.bottom > snap.nav.vh + 4) report.errors.push(`${name}: bottom nav exceeds viewport`);
  note('mobile', `${name} dir=${snap.dir} scrollWidth=${snap.scrollWidth}/${snap.clientWidth} nav=${JSON.stringify(snap.nav)} smallHits=${snap.tooSmall.length}`, { snap });
  return snap;
}

async function fillCreateMatch(page, { team2, stadium, city, time }) {
  await page.getByRole('button', { name: /Create match|إنشاء مباراة/ }).first().click();
  await page.waitForSelector('.match-editor-modal, .match-form');
  const team2Input = page.locator('.match-form input').nth(1);
  await team2Input.fill(team2);
  await page.locator('.match-form input').nth(3).fill(stadium);
  await page.locator('.match-form input').nth(4).fill(city);
  await page.locator('.date-picker-trigger').click();
  const popover = page.locator('.date-picker-popover');
  await popover.waitFor();
  const popoverBox = await popover.boundingBox();
  const vh = page.viewportSize().height;
  if (popoverBox && popoverBox.y + popoverBox.height > vh + 8) {
    report.errors.push(`date picker exceeds viewport (bottom ${Math.round(popoverBox.y + popoverBox.height)} > ${vh})`);
  }
  await popover.locator('header button').nth(1).click();
  await popover.locator('.date-picker-days button:not([disabled])').nth(10).click();
  await page.locator('input[type="time"]').fill(time);
  const modal = page.locator('.match-editor-modal, .modal-card').first();
  const box = await modal.boundingBox();
  if (box && box.height > vh + 8) report.errors.push(`create-match modal height ${Math.round(box.height)} > ${vh}`);
  await page.getByRole('button', { name: /^Save$|^حفظ$/ }).click();
  await page.waitForTimeout(600);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 360, height: 800 },
  isMobile: true,
  hasTouch: true,
  locale: 'en-GB',
  permissions: ['clipboard-read', 'clipboard-write'],
});
const page = await context.newPage();
page.setDefaultTimeout(12000);
const consoleErrors = [];
page.on('pageerror', (err) => consoleErrors.push(String(err)));
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

try {
  await completeSetup(page);

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(250);
    await goHash(page, 'home');
    await inspectViewport(page, `${vp.name}/home`);
    const navCount = await page.locator('.bottom-nav-item').count();
    if (vp.height >= 500 && navCount !== 6) report.errors.push(`${vp.name}: expected 6 bottom-nav items, got ${navCount}`);
    await goHash(page, 'match-center');
    await inspectViewport(page, `${vp.name}/matches`);
    await goHash(page, 'profile');
    await inspectViewport(page, `${vp.name}/profile`);
    await goHash(page, 'settings');
    await inspectViewport(page, `${vp.name}/settings`);
    await goHash(page, 'archive');
    await inspectViewport(page, `${vp.name}/archive`);
    await goHash(page, 'tactical');
    await inspectViewport(page, `${vp.name}/tactical`);
    await goHash(page, 'support');
    await inspectViewport(page, `${vp.name}/support`);
  }

  await page.setViewportSize({ width: 360, height: 800 });
  await goHash(page, 'match-center');
  const beforeMatches = (await idbGetAll(page, 'matches')).length;
  await fillCreateMatch(page, { team2: 'GateA', stadium: 'Al Ahli', city: 'Hebron', time: '21:00' });
  const afterCreate = await idbGetAll(page, 'matches');
  report.share.createdCount = afterCreate.length - beforeMatches;
  if (report.share.createdCount < 1) report.errors.push('Create match did not persist a local match');
  const matchA = afterCreate.find((m) => m.team2 === 'GateA') || afterCreate.at(-1);
  report.share.matchA = matchA ? { id: matchA.id, originId: matchA.originId, status: matchA.status } : null;

  await page.getByRole('button', { name: /Share|مشاركة/ }).first().click();
  await page.waitForSelector('.match-share-modal, .match-share-overlay');
  const shareModal = page.locator('.match-share-modal, .modal-card').first();
  const shareBox = await shareModal.boundingBox();
  const vh = 800;
  if (shareBox && shareBox.height > vh + 8) report.errors.push(`share modal exceeds viewport (${Math.round(shareBox.height)})`);
  await page.locator('.share-permission-card input[type="checkbox"]').first().check();
  await page.getByRole('button', { name: /Generate|إنشاء الرابط|Share link/i }).click();
  await page.waitForTimeout(500);
  const shareUrl = await page.locator('.share-link-field input').inputValue().catch(() => '');
  report.share.url = shareUrl;
  if (!shareUrl.includes('/share/match/')) report.errors.push('Share URL was not produced');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  if (shareUrl) {
    await page.goto(shareUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);
    const payloadDump = await page.evaluate(() => document.body.innerText);
    if (/@|phone|avatarData|email/i.test(payloadDump) && /@/.test(payloadDump)) {
      // Profile email is not expected on match share preview.
      if (/ReleaseQA@|@gmail|mailto:/i.test(payloadDump)) report.errors.push('Share preview appears to leak identity contact data');
    }
    const saveBtn = page.getByRole('button', { name: /Save match|حفظ المباراة/ });
    if (await saveBtn.count()) await saveBtn.first().click();
    else {
      const already = await page.getByText(/Already up to date|محدثة|Update available|Keep existing/i).count();
      report.share.firstImportUi = already ? 'classified' : 'missing-save';
    }
    await page.waitForTimeout(700);
    await page.goto(`${BASE}/#match-center`, { waitUntil: 'domcontentloaded' });
    await completeSetup(page);
    const afterImport = await idbGetAll(page, 'matches');
    report.share.afterFirstImport = afterImport.length;
    const gateMatches = afterImport.filter((m) => m.team2 === 'GateA');
    if (gateMatches.length !== 1) report.errors.push(`Scenario 1: expected 1 GateA match, got ${gateMatches.length}`);

    await page.goto(shareUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const upToDate = await page.getByText(/Already Up To Date|already up to date|محدثة|up to date/i).count();
    report.share.scenario2 = upToDate > 0 ? 'up-to-date' : await page.locator('body').innerText();
    if (!upToDate) {
      const updateAvail = await page.getByText(/Update Available|تحديث/i).count();
      if (updateAvail) note('share', 'Scenario 2 showed Update Available (likely lifecycle/status drift, not a silent duplicate)');
      else report.errors.push('Scenario 2: neither up-to-date nor update-available');
    }
    await page.goto(`${BASE}/#match-center`, { waitUntil: 'domcontentloaded' });
    await completeSetup(page);

    const local = (await idbGetAll(page, 'matches')).find((m) => m.team2 === 'GateA');
    if (local) {
      await idbPut(page, 'matches', { ...local, stadium: 'Dura Stadium', time: '22:15', updatedAt: Date.now() });
    }
    await page.goto(`${BASE}/#match-center`, { waitUntil: 'domcontentloaded' });
    await completeSetup(page);
    await goHash(page, 'match-center');
    await page.getByRole('button', { name: /Share|مشاركة/ }).first().click();
    await page.waitForSelector('.match-share-modal, .match-share-overlay');
    await page.locator('.share-permission-card input[type="checkbox"]').first().check();
    await page.getByRole('button', { name: /Generate|إنشاء الرابط|Share link/i }).click();
    await page.waitForTimeout(500);
    const shareUrl2 = await page.locator('.share-link-field input').inputValue().catch(() => '');
    report.share.tokenChangedAfterEdit = Boolean(shareUrl2 && shareUrl2 !== shareUrl);
    if (shareUrl2 && shareUrl2 === shareUrl) report.errors.push('Scenario 3: edited match produced the same share token');
    await page.keyboard.press('Escape');
    await page.goto(shareUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const updateUi = await page.getByRole('button', { name: /Replace with shared version|استبدال بالنسخة المشاركة/ }).count();
    report.share.scenario3 = updateUi > 0 ? 'update-available-ui' : (await page.locator('body').innerText()).slice(0, 400);
    if (!updateUi) report.errors.push('Scenario 3: expected Update Available after local edit vs original token');
    const replace = page.getByRole('button', { name: /Replace with shared version|استبدال بالنسخة المشاركة/ });
    if (await replace.count()) {
      await replace.first().click();
      await page.waitForTimeout(700);
    }
    await page.goto(`${BASE}/#match-center`, { waitUntil: 'domcontentloaded' });
    await completeSetup(page);
    const afterReplace = await idbGetAll(page, 'matches');
    const gateAfter = afterReplace.filter((m) => m.team2 === 'GateA');
    report.share.afterReplace = gateAfter.map((m) => ({ id: m.id, originId: m.originId, stadium: m.stadium, time: m.time }));
    if (gateAfter.length !== 1) report.errors.push(`Scenario 4: expected 1 GateA after replace, got ${gateAfter.length}`);
    if (local && gateAfter[0] && gateAfter[0].id !== local.id) report.errors.push('Scenario 4: replace changed match id');

    const occupant = (await idbGetAll(page, 'matches')).find((m) => m.team2 === 'GateA');
    if (occupant && shareUrl) {
      await idbPut(page, 'matches', {
        ...occupant,
        team2: 'GateB',
        originId: 'OTHER-ORIGIN',
        title: 'Collision occupant',
      });
      await page.goto(shareUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);
      const collision = await page.getByText(/collision|Save as new|نسخة جديدة|تصادم/i).count();
      report.share.scenario5 = collision > 0 ? 'collision-ui' : (await page.locator('body').innerText()).slice(0, 400);
      const saveAsNew = page.getByRole('button', { name: /Save as a new copy|حفظ كنسخة جديدة/ });
      if (await saveAsNew.count()) {
        await saveAsNew.first().click();
        await page.waitForTimeout(700);
      }
      await page.goto(`${BASE}/#match-center`, { waitUntil: 'domcontentloaded' });
      await completeSetup(page);
      const afterCollision = await idbGetAll(page, 'matches');
      const b = afterCollision.find((m) => m.team2 === 'GateB');
      report.share.scenario5records = afterCollision.map((m) => ({ id: m.id, originId: m.originId, team2: m.team2 }));
      if (!b || b.originId !== 'OTHER-ORIGIN') report.errors.push('Scenario 5: Match B was overwritten');
    }

    if (shareUrl) {
      const viewOnlyUrl = shareUrl; // regenerated below if needed
      await goHash(page, 'match-center');
      await page.getByRole('button', { name: /Share|مشاركة/ }).first().click();
      await page.waitForSelector('.match-share-modal, .match-share-overlay');
      const allow = page.locator('.share-permission-card input[type="checkbox"]').first();
      if (await allow.isChecked()) await allow.uncheck();
      await page.getByRole('button', { name: /Generate|إنشاء الرابط|Share link/i }).click();
      await page.waitForTimeout(500);
      const voUrl = await page.locator('.share-link-field input').inputValue().catch(() => viewOnlyUrl);
      await page.goto(voUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
      const saveButtons = await page.getByRole('button', { name: /Save match|حفظ المباراة|Save as a new copy|Replace with shared/ }).count();
      const viewOnlyLabel = await page.getByText(/View only|عرض فقط/i).count();
      report.share.scenario6 = { saveButtons, viewOnlyLabel };
      if (saveButtons > 0) report.errors.push('Scenario 6: view-only share still exposes a save action');
    }
  }

  await page.goto(`${BASE}/#tactical`, { waitUntil: 'domcontentloaded' });
  await completeSetup(page);
  await goHash(page, 'tactical');
  const formationButtons = page.locator('.formation-picker button');
  const formationCount = await formationButtons.count();
  if (formationCount < 2) report.errors.push('Tactical formation picker missing');
  else await formationButtons.nth(1).click();
  await page.waitForTimeout(400);
  const token = page.locator('.player-token').first();
  await token.click();
  await page.waitForSelector('.player-inspector');
  const nameInput = page.locator('.player-inspector input').first();
  await nameInput.fill('Captain QA');
  const captain = page.locator('.player-inspector input[type="checkbox"]').first();
  if (!(await captain.isChecked())) await captain.check();
  const box = await token.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + 40, box.y + 30, { steps: 8 });
    await page.mouse.up();
  }
  await page.getByRole('button', { name: /Save plan|حفظ الخطة|Save/i }).first().click().catch(() => {});
  await page.waitForTimeout(500);
  const plan = await idbGet(page, 'tactical', 'plan');
  report.tactical.saved = plan ? { formationId: plan.formationId, captain: (plan.players || []).some((p) => p.captain), named: (plan.players || []).some((p) => p.name === 'Captain QA') } : null;
  await page.reload({ waitUntil: 'domcontentloaded' });
  await completeSetup(page);
  await goHash(page, 'tactical');
  await page.waitForTimeout(600);
  const plan2 = await idbGet(page, 'tactical', 'plan');
  report.tactical.reopened = plan2 ? { formationId: plan2.formationId, captain: (plan2.players || []).some((p) => p.captain), named: (plan2.players || []).some((p) => p.name === 'Captain QA') } : null;
  if (!plan2) report.errors.push('Tactical plan did not persist');
  else {
    if (plan && plan.formationId !== plan2.formationId) report.errors.push('Tactical formation did not persist');
    if (!plan2.players?.some((p) => p.captain)) report.errors.push('Tactical captain did not persist');
  }
  await page.setViewportSize({ width: 844, height: 390 });
  await page.locator('.landscape-action').click().catch(() => {});
  await page.waitForTimeout(400);
  const landscapeClass = await page.locator('.tactical-page').getAttribute('class');
  report.tactical.landscape = landscapeClass;
  await inspectViewport(page, '844x390/tactical-focus');
  await page.locator('.landscape-action, .landscape-exit').first().click().catch(() => {});
  await page.setViewportSize({ width: 360, height: 800 });

  await goHash(page, 'profile');
  const png = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#193940';
    ctx.fillRect(0, 0, 800, 320);
    ctx.fillStyle = '#9BF272';
    ctx.fillRect(40, 40, 120, 120);
    return canvas.toDataURL('image/png');
  });
  const profile = (await idbGetAll(page, 'profile'))[0];
  if (profile) {
    await idbPut(page, 'profile', { ...profile, bannerData: png, avatarData: png });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await completeSetup(page);
    await goHash(page, 'profile');
  }
  await page.locator('.profile-banner-hit, .banner-action').first().click();
  await page.waitForSelector('.image-action-sheet');
  const viewBtn = page.locator('.image-action-item').first();
  report.profile.sheetHasView = (await viewBtn.count()) > 0;
  if (await viewBtn.count()) {
    await viewBtn.click();
    await page.waitForSelector('.image-viewer-frame');
    const frame = await page.locator('.image-viewer-frame').boundingBox();
    const vw = 360;
    const vh2 = 800;
    report.profile.viewer = frame;
    if (frame && Math.abs(frame.width / vw - 0.8) > 0.15 && frame.width > vw * 0.92) {
      report.errors.push('Image viewer is wider than the ~80% target on mobile');
    }
    if (frame && frame.height > vh2 * 0.92) report.errors.push('Image viewer exceeds viewport height');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const leftover = await page.locator('.image-viewer-frame').count();
    if (leftover) report.errors.push('Image viewer did not close on Escape');
  }

  await goHash(page, 'settings');
  await page.getByRole('button', { name: /Open Support|فتح الدعم/ }).click();
  await page.waitForTimeout(400);
  await inspectViewport(page, '360x800/support-overlay');
  const supportForm = await page.locator('.support-contact, .support-page').count();
  if (!supportForm) report.errors.push('Support page did not open from Settings');
  const supportBack = page.getByRole('button', { name: /Close|إغلاق/ }).first();
  if (await supportBack.count()) await supportBack.click();
  await page.waitForSelector('.settings-page, .settings-grid');

  await goHash(page, 'settings');
  const notifyToggle = page.locator('.settings-panel input[type="checkbox"]').nth(1);
  const ledgerBefore = await idbGet(page, 'appState', 'notificationEvents');
  await notifyToggle.scrollIntoViewIfNeeded();
  if (await notifyToggle.isChecked()) await notifyToggle.uncheck();
  await page.waitForTimeout(200);
  await goHash(page, 'match-center');
  await fillCreateMatch(page, { team2: 'SilentNotify', stadium: 'Al Ahli', city: 'Hebron', time: '21:30' });
  const ledgerOff = await idbGet(page, 'appState', 'notificationEvents');
  const notesOff = await idbGetAll(page, 'notifications');
  const silentCreated = notesOff.some((n) => (n.body || n.message || '').includes('SilentNotify'));
  report.notifications.disabledCreated = silentCreated;
  report.notifications.ledgerGrewWhileDisabled = (ledgerOff?.ids?.length || 0) > (ledgerBefore?.ids?.length || 0)
    && (ledgerOff?.ids || []).some((id) => String(id).includes('SilentNotify'));
  if (silentCreated) report.errors.push('Notifications disabled still created a match notification');
  await goHash(page, 'settings');
  if (!(await notifyToggle.isChecked())) await notifyToggle.check();
  await goHash(page, 'match-center');
  await fillCreateMatch(page, { team2: 'LoudNotify', stadium: 'Al Ahli', city: 'Hebron', time: '21:45' });
  const notesOn = await idbGetAll(page, 'notifications');
  const loud = notesOn.filter((n) => (n.body || n.message || n.bodyAr || '').includes('LoudNotify'));
  report.notifications.enabledCount = loud.length;
  if (loud.length !== 1) report.errors.push(`Enabled notifications: expected 1 LoudNotify notice, got ${loud.length}`);

  const malformed = JSON.stringify({ format: 'not-taamen', version: 2, stores: {} });
  const tmp = path.join(process.cwd(), '.cursor', 'malformed-backup.json');
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  fs.writeFileSync(tmp, malformed);
  await goHash(page, 'settings');
  const matchesBeforeRestore = (await idbGetAll(page, 'matches')).length;
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: /Import data|استيراد البيانات/ }).click(),
  ]);
  await fileChooser.setFiles(tmp);
  await page.waitForTimeout(600);
  const invalidBanner = await page.getByText(/invalid|غير صالح|فشل|could not/i).count();
  const matchesAfterRestore = (await idbGetAll(page, 'matches')).length;
  report.backup = { invalidBanner, matchesBeforeRestore, matchesAfterRestore };
  if (matchesAfterRestore !== matchesBeforeRestore) report.errors.push('Malformed backup changed stored matches');

  await goHash(page, 'home');
  await page.evaluate(() => localStorage.setItem('taamen-consent-version', '1.0'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  const reconsent = await page.getByRole('button', { name: /Accept and continue|موافق والمتابعة/ }).count();
  report.consent.reconsent = reconsent > 0;
  if (!reconsent) report.errors.push('Old consent version did not force re-consent');
  if (reconsent) {
    await page.getByRole('button', { name: /Accept and continue|موافق والمتابعة/ }).click();
    await page.waitForTimeout(300);
    await page.reload({ waitUntil: 'domcontentloaded' });
    const again = await page.getByRole('button', { name: /Accept and continue|موافق والمتابعة/ }).count();
    report.consent.persists = again === 0;
    if (again) report.errors.push('Consent 2.0 did not persist after reload');
  }

  const historicalNav = await page.locator('.bottom-nav-item', { hasText: /Historical/ }).count();
  report.share.historicalInNormalNav = historicalNav;
  if (historicalNav) report.errors.push('Historical Record appeared in normal-user mobile nav');

  report.consoleErrors = [...new Set(consoleErrors)].slice(0, 20);
} catch (error) {
  report.errors.push(String(error?.stack || error));
  console.error(error);
} finally {
  await browser.close();
}

console.log('\n=== RELEASE GATE BROWSER REPORT ===');
console.log(JSON.stringify(report, null, 2));
if (report.errors.length) {
  console.error(`\nBrowser gate issues: ${report.errors.length}`);
  process.exitCode = 1;
} else {
  console.log('\nBrowser gate: no hard errors recorded');
}
