import { defaultPlayers, teams, tactics, roleOptions, instructionOptions, playerPool } from '../../data/site-data.js';
import { $, $all, safeText, clamp, toast } from './ui.js';

const PLAYERS_KEY = 'taamen.radar.v5.players';
const TACTIC_KEY = 'taamen.radar.v5.activeTactic';
const LEGACY_PLAYERS_KEYS = ['taamen.radar.players.v1'];
const LEGACY_TACTIC_KEYS = ['taamen.radar.activeTactic.v1'];
const DRAG_THRESHOLD = 7;
const FIELD_LIMITS = {
  home: { minX: 5, maxX: 49 },
  away: { minX: 51, maxX: 95 }
};

let pitch = null;
let players = [];
let selectedId = '';
let activeTacticId = 'diamond';
let dragging = null;
let dragStart = null;
let activePointer = null;
let movedDuringDrag = false;
let radarController = null;

export function initTactical() {
  pitch = $('#tacticalPitch');
  if (!pitch) return;

  activeTacticId = readActiveTactic();
  players = readPlayers();
  selectedId = players[0]?.id || '';

  renderTacticButtons();
  renderPlayers();
  renderAllPanels();
  bindRadarEvents();
  updateActiveTacticButton();
  updatePitchStatus('الرادار جاهز: اسحب اللاعب، واضغط مرتين للتعديل.');
}

export function getAutoPosition(player) {
  const x = Number(player?.x);
  const y = Number(player?.y);
  const team = player?.team === 'away' ? 'away' : 'home';
  const depth = team === 'home' ? x : 100 - x;

  if (!Number.isFinite(depth) || !Number.isFinite(y)) return 'CM';
  if (depth < 15) return 'GK';
  if (depth < 32) return 'CB';
  if (depth < 45) return 'DM';
  if (depth < 60) return 'CM';
  if (depth < 75) return 'AM';
  if (y < 35) return 'LW';
  if (y > 65) return 'RW';
  return 'ST';
}

function readPlayers() {
  const parsed = readJson(PLAYERS_KEY, null);
  if (isValidPlayers(parsed)) {
    const normalized = normalizePlayers(parsed);
    writeJson(PLAYERS_KEY, normalized);
    return normalized;
  }

  for (const key of LEGACY_PLAYERS_KEYS) {
    const legacy = readJson(key, null);
    if (isValidPlayers(legacy)) {
      const migrated = normalizePlayers(legacy);
      writeJson(PLAYERS_KEY, migrated);
      return migrated;
    }
  }

  const defaults = buildDefaultPlayers();
  writeJson(PLAYERS_KEY, defaults);
  return defaults;
}

function buildDefaultPlayers() {
  return normalizePlayers(defaultPlayers);
}

function isValidPlayers(value) {
  if (!Array.isArray(value) || value.length !== defaultPlayers.length) return false;
  const defaultIds = new Set(defaultPlayers.map(player => player.id));
  const seen = new Set();
  return value.every(player => {
    if (!player || !defaultIds.has(player.id) || seen.has(player.id)) return false;
    seen.add(player.id);
    return ['home', 'away'].includes(player.team) &&
      Number.isFinite(Number(player.x)) &&
      Number.isFinite(Number(player.y)) &&
      typeof player.name === 'string';
  });
}

function normalizePlayers(list) {
  const byId = new Map((Array.isArray(list) ? list : []).map(player => [player.id, player]));
  const merged = defaultPlayers.map(base => {
    const saved = byId.get(base.id) || {};
    const team = base.team === 'away' ? 'away' : 'home';
    const free = saved.teamRole === 'لاعب حر' || base.teamRole === 'لاعب حر';
    const x = clampCoord(Number(saved.x), base.x, team, free);
    const y = round1(clamp(Number.isFinite(Number(saved.y)) ? Number(saved.y) : base.y, 7, 93));
    return {
      ...base,
      team,
      name: String(saved.name || base.name || '').trim() || base.name,
      x,
      y,
      role: getAutoPosition({ team, x, y }),
      teamRole: String(saved.teamRole || base.teamRole || '').trim(),
      instruction: String(saved.instruction || base.instruction || '').trim(),
      captain: Boolean(saved.captain ?? base.captain)
    };
  });
  return normalizeCaptains(merged);
}

function normalizeCaptains(list) {
  const seen = new Set();
  return list.map(player => {
    const wantsCaptain = Boolean(player.captain) || player.teamRole === 'كابتن';
    if (!wantsCaptain || seen.has(player.team)) {
      return {
        ...player,
        captain: false,
        teamRole: player.teamRole === 'كابتن' ? '' : player.teamRole,
        role: getAutoPosition(player)
      };
    }
    seen.add(player.team);
    return { ...player, captain: true, teamRole: player.teamRole === 'كابتن' ? '' : player.teamRole, role: getAutoPosition(player) };
  });
}

function readActiveTactic() {
  const saved = readJson(TACTIC_KEY, null);
  if (tactics[saved]) return saved;

  for (const key of LEGACY_TACTIC_KEYS) {
    const legacy = readJson(key, null);
    if (tactics[legacy]) {
      writeJson(TACTIC_KEY, legacy);
      return legacy;
    }
  }

  writeJson(TACTIC_KEY, 'diamond');
  return 'diamond';
}

function renderTacticButtons() {
  const host = $('#radarTactics');
  if (!host) return;
  host.innerHTML = Object.values(tactics).map(tactic => `
    <button class="radar-btn" data-tactic-id="${safeText(tactic.id)}" type="button">
      <i class="fa-solid ${tactic.id === 'yPress' ? 'fa-bolt' : tactic.id === 'counter' ? 'fa-forward-fast' : 'fa-chess-board'}"></i>
      <span>${safeText(tactic.name)}</span>
    </button>
  `).join('');
}

function renderPlayers() {
  if (!pitch) return;
  pitch.querySelectorAll('.player-token').forEach(node => node.remove());
  const fragment = document.createDocumentFragment();
  players.forEach(player => fragment.appendChild(createToken(player)));
  pitch.appendChild(fragment);
}

function createToken(player) {
  const node = document.createElement('button');
  node.type = 'button';
  node.className = `player-token ${teams[player.team]?.colorClass || ''}`;
  node.classList.toggle('selected-token', selectedId === player.id);
  node.dataset.id = player.id;
  node.dataset.team = player.team;
  node.style.left = `${player.x}%`;
  node.style.top = `${player.y}%`;
  node.setAttribute('aria-label', `${player.name} ${getAutoPosition(player)}`);
  node.innerHTML = tokenHtml(player);

  node.addEventListener('pointerdown', event => startDrag(event, player.id), { passive: false });
  node.addEventListener('dblclick', event => {
    event.preventDefault();
    openPlayerDialog(player.id);
  });
  node.addEventListener('keydown', event => handleTokenKeyboard(event, player.id));
  return node;
}

function tokenHtml(player) {
  const position = getAutoPosition(player);
  return `
    <span class="captain-mark" ${player.captain ? '' : 'hidden'}>C</span>
    <span class="instruction-mark" ${player.instruction ? '' : 'hidden'}>${safeText(player.instruction)}</span>
    <strong class="player-name-label">${safeText(player.name)}</strong>
    <span class="position-badge">${safeText(position)}</span>
    <span class="team-role-badge" ${player.teamRole ? '' : 'hidden'}>${safeText(player.teamRole)}</span>
  `;
}

function renderAllPanels() {
  renderTeamPanel('home');
  renderTeamPanel('away');
  renderSummary();
  renderInspector();
  renderHealth();
}

function renderTeamPanel(teamKey) {
  const panel = teamKey === 'home' ? $('#radarPanelHome') : $('#radarPanelAway');
  if (!panel) return;
  const team = teams[teamKey] || { name: teamKey, shortName: teamKey };
  const teamPlayers = players.filter(player => player.team === teamKey).sort((a, b) => a.x - b.x);
  const captain = teamPlayers.find(player => player.captain);

  panel.innerHTML = `
    <div class="radar-panel-head">
      <span>${safeText(team.shortName || team.name)}</span>
      <strong>${safeText(captain?.name || 'بدون كابتن')}</strong>
      <small>${teamKey === 'home' ? 'النصف الأيسر' : 'النصف الأيمن'} - ${teamPlayers.length} لاعبين</small>
    </div>
    <div class="radar-lineup-list">
      ${teamPlayers.map(renderLineupPlayer).join('')}
    </div>
  `;
}

function renderLineupPlayer(player) {
  const selected = selectedId === player.id ? ' active' : '';
  const role = [player.captain ? 'كابتن' : '', player.teamRole || 'دور عادي'].filter(Boolean).join(' - ');
  return `
    <div class="lineup-player${selected}" data-player-id="${safeText(player.id)}">
      <button class="lineup-main" data-select-player="${safeText(player.id)}" type="button">
        <span class="lineup-position">${safeText(getAutoPosition(player))}</span>
        <span class="lineup-name">${safeText(player.name)}</span>
        <small>${safeText(role)}${player.instruction ? ` - ${safeText(player.instruction)}` : ''}</small>
      </button>
      <button class="lineup-edit" data-edit-player="${safeText(player.id)}" type="button" aria-label="تعديل ${safeText(player.name)}"><i class="fa-solid fa-pen"></i></button>
    </div>
  `;
}

function renderSummary() {
  const host = $('#radarSummary');
  if (!host) return;
  const tactic = tactics[activeTacticId] || tactics.diamond;
  const homeCaptain = players.find(player => player.team === 'home' && player.captain)?.name || 'غير محدد';
  const awayCaptain = players.find(player => player.team === 'away' && player.captain)?.name || 'غير محدد';
  const homeDepth = averageDepth('home');
  const awayDepth = averageDepth('away');
  const advanced = homeDepth > awayDepth + 3 ? teams.home?.shortName : awayDepth > homeDepth + 3 ? teams.away?.shortName : 'متوازن';

  host.innerHTML = `
    <div>
      <span>الخطة الحالية</span>
      <strong>${safeText(tactic?.name || 'الماسة 1-2-1')}</strong>
    </div>
    <p>${safeText(tactic?.description || 'تحرك حر حسب المباراة.')}</p>
    <div class="radar-summary-metrics">
      <span><b>${safeText(homeCaptain)}</b> قائد النخبة</span>
      <span><b>${safeText(awayCaptain)}</b> قائد التحدي</span>
      <span><b>${safeText(advanced || 'متوازن')}</b> الأكثر تقدمًا</span>
    </div>
  `;
}

function renderInspector() {
  const host = $('#playerInspector');
  if (!host) return;
  const player = findPlayer(selectedId) || players[0];
  if (!player) {
    host.innerHTML = '<h3>مفتش اللاعب</h3><p>اختر لاعبًا من الملعب.</p>';
    return;
  }
  selectedId = player.id;
  host.innerHTML = `
    <h3><i class="fa-solid fa-user-gear"></i> مفتش اللاعب</h3>
    <div class="inspector-grid">
      <span>الاسم</span><strong>${safeText(player.name)}</strong>
      <span>الفريق</span><strong>${safeText(teams[player.team]?.shortName || player.team)}</strong>
      <span>المركز</span><strong>${safeText(getAutoPosition(player))}</strong>
      <span>الدور</span><strong>${safeText([player.captain ? 'كابتن' : '', player.teamRole || 'عادي'].filter(Boolean).join(' - '))}</strong>
      <span>التعليمات</span><strong>${safeText(player.instruction || 'بدون')}</strong>
      <span>الإحداثيات</span><strong>${Math.round(player.x)}% / ${Math.round(player.y)}%</strong>
    </div>
    <button class="ghost-btn full" data-edit-player="${safeText(player.id)}" type="button"><i class="fa-solid fa-pen"></i> تعديل اللاعب</button>
  `;
}

function renderHealth() {
  const host = $('#formationHealth');
  if (!host) return;
  const label = getFormationHealth();
  host.innerHTML = `
    <h3><i class="fa-solid fa-heart-pulse"></i> صحة التشكيلة</h3>
    <strong class="health-pill">${safeText(label)}</strong>
    <p>المؤشر يعتمد على عمق الفريقين وانتشار اللاعبين أفقيًا ووجود كابتن لكل فريق.</p>
  `;
}

function bindRadarEvents() {
  if (radarController) radarController.abort();
  radarController = new AbortController();
  const { signal } = radarController;

  window.addEventListener('pointermove', moveDrag, { passive: false, signal });
  window.addEventListener('pointerup', endDrag, { passive: false, signal });
  window.addEventListener('pointercancel', endDrag, { passive: false, signal });

  $('#radar')?.addEventListener('click', event => {
    const tacticButton = event.target.closest('[data-tactic-id]');
    if (tacticButton) {
      event.preventDefault();
      applyTactic(tacticButton.dataset.tacticId);
      return;
    }

    const selectButton = event.target.closest('[data-select-player]');
    if (selectButton) {
      event.preventDefault();
      selectPlayer(selectButton.dataset.selectPlayer);
      return;
    }

    const editButton = event.target.closest('[data-edit-player]');
    if (editButton) {
      event.preventDefault();
      openPlayerDialog(editButton.dataset.editPlayer);
    }
  }, { signal });

  $('#saveRadarPlan')?.addEventListener('click', event => {
    event.preventDefault();
    saveState();
    toast('تم تثبيت الخطة الحالية', { icon: 'fa-floppy-disk' });
  }, { signal });

  $('#resetRadarPlan')?.addEventListener('click', event => {
    event.preventDefault();
    resetRadar();
  }, { signal });

  $('#repairRadarPlan')?.addEventListener('click', event => {
    event.preventDefault();
    players = normalizePlayers(players);
    saveState();
    renderPlayers();
    renderAllPanels();
    updatePitchStatus('تم إصلاح بيانات الرادار وحصر اللاعبين داخل الملعب.');
    toast('تم إصلاح الرادار بسرعة', { icon: 'fa-screwdriver-wrench' });
  }, { signal });

  $('#exportRadarPlan')?.addEventListener('click', event => {
    event.preventDefault();
    exportPitchImage();
  }, { signal });

  bindPlayerDialog();
}

function bindPlayerDialog() {
  const dialog = $('#playerDialog');
  const form = $('#playerForm');
  if (!dialog || !form || form.dataset.v5Bound === 'true') return;

  form.dataset.v5Bound = 'true';
  fillSelect(form.elements.playerLibrary, [
    { value: '', label: 'اكتب الاسم يدويًا أو اختر لاعبًا', hint: '' },
    ...playerPool.map(player => ({ value: player.name, label: player.tag ? `${player.name} - ${player.tag}` : player.name, hint: player.preferredRole || '' }))
  ]);
  fillSelect(form.elements.teamRole, roleOptions);
  fillSelect(form.elements.instruction, instructionOptions);

  form.elements.playerLibrary?.addEventListener('change', event => {
    const value = event.target.value;
    if (!value) return;
    form.elements.name.value = value;
    const preferredRole = event.target.selectedOptions?.[0]?.dataset?.hint || '';
    if (preferredRole && [...form.elements.teamRole.options].some(option => option.value === preferredRole)) {
      form.elements.teamRole.value = preferredRole;
      updateSelectHint(form.elements.teamRole, '#roleHint');
    }
  });

  form.elements.teamRole?.addEventListener('change', () => {
    updateSelectHint(form.elements.teamRole, '#roleHint');
    if (form.elements.teamRole.value === 'كابتن') form.elements.captain.checked = true;
  });
  form.elements.instruction?.addEventListener('change', () => updateSelectHint(form.elements.instruction, '#instructionHint'));

  form.addEventListener('submit', event => {
    event.preventDefault();
    saveDialogChanges();
  });

  $('#savePlayerChanges')?.addEventListener('click', event => {
    event.preventDefault();
    saveDialogChanges();
  });
  $('#closePlayerDialog')?.addEventListener('click', event => {
    event.preventDefault();
    closeDialog();
  });
  $('#clearPlayer')?.addEventListener('click', event => {
    event.preventDefault();
    resetDialogPlayer();
  });

  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeDialog();
  });
}

function startDrag(event, id) {
  if (event.button !== undefined && event.button !== 0) return;
  if ($('#playerDialog')?.open) return;
  const token = tokenFor(id);
  const player = findPlayer(id);
  if (!token || !player) return;

  event.preventDefault();
  event.stopPropagation();
  selectPlayer(id, false);
  dragging = { id, token };
  activePointer = event.pointerId;
  movedDuringDrag = false;
  dragStart = { x: event.clientX, y: event.clientY, at: Date.now() };
  token.classList.add('dragging');
  try { token.setPointerCapture(event.pointerId); } catch (_) {}
}

function moveDrag(event) {
  if (!dragging || !pitch || event.pointerId !== activePointer) return;
  event.preventDefault();
  const player = findPlayer(dragging.id);
  if (!player) return;
  const rect = pitch.getBoundingClientRect();
  const dx = Math.abs(event.clientX - dragStart.x);
  const dy = Math.abs(event.clientY - dragStart.y);
  if (dx + dy > DRAG_THRESHOLD) movedDuringDrag = true;

  const free = player.teamRole === 'لاعب حر';
  const x = clampCoord(((event.clientX - rect.left) / rect.width) * 100, player.x, player.team, free);
  const y = round1(clamp(((event.clientY - rect.top) / rect.height) * 100, 7, 93));
  Object.assign(player, { x, y, role: getAutoPosition({ ...player, x, y }) });
  updateToken(dragging.token, player);
  updatePitchStatus(`${player.name}: ${player.role} - ${Math.round(x)}% / ${Math.round(y)}%`);
  renderInspector();
  renderHealth();
}

function endDrag(event) {
  if (!dragging) return;
  event?.preventDefault?.();
  const { id, token } = dragging;
  const quickTap = dragStart && Date.now() - dragStart.at < 420 && !movedDuringDrag;

  try { if (activePointer !== null) token.releasePointerCapture(activePointer); } catch (_) {}
  token.classList.remove('dragging');

  if (movedDuringDrag) {
    saveState();
    renderAllPanels();
  } else if (quickTap) {
    selectPlayer(id);
  }

  dragging = null;
  dragStart = null;
  activePointer = null;
  movedDuringDrag = false;
}

function handleTokenKeyboard(event, id) {
  const player = findPlayer(id);
  if (!player) return;
  const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '];
  if (!keys.includes(event.key)) return;
  event.preventDefault();
  if (event.key === 'Enter' || event.key === ' ') {
    openPlayerDialog(id);
    return;
  }

  const step = event.shiftKey ? 4 : 1.5;
  const free = player.teamRole === 'لاعب حر';
  let x = player.x;
  let y = player.y;
  if (event.key === 'ArrowUp') y -= step;
  if (event.key === 'ArrowDown') y += step;
  if (event.key === 'ArrowLeft') x += document.dir === 'rtl' ? step : -step;
  if (event.key === 'ArrowRight') x += document.dir === 'rtl' ? -step : step;
  player.x = clampCoord(x, player.x, player.team, free);
  player.y = round1(clamp(y, 7, 93));
  player.role = getAutoPosition(player);
  updateToken(tokenFor(id), player);
  saveState();
  renderAllPanels();
}

function applyTactic(id) {
  const tactic = tactics[id];
  if (!tactic) return;
  activeTacticId = id;
  const counters = { home: 0, away: 0 };
  players = players.map(player => {
    const index = counters[player.team]++;
    const next = tactic.positions?.[player.team]?.[index];
    if (!next) return player;
    const free = player.teamRole === 'لاعب حر';
    const x = clampCoord(Number(next.x), player.x, player.team, free);
    const y = round1(clamp(Number(next.y), 7, 93));
    return { ...player, x, y, role: getAutoPosition({ ...player, x, y }) };
  });

  writeJson(TACTIC_KEY, activeTacticId);
  saveState();
  renderPlayers();
  renderAllPanels();
  updateActiveTacticButton();
  updatePitchStatus(`تم تطبيق ${tactic.name}`);
  toast(`تم تطبيق ${tactic.name}`, { icon: id === 'yPress' ? 'fa-bolt' : 'fa-chess-board' });
}

function openPlayerDialog(id) {
  const player = findPlayer(id);
  const dialog = $('#playerDialog');
  const form = $('#playerForm');
  if (!player || !dialog || !form) return;

  selectPlayer(id, false);
  form.elements.id.value = player.id;
  form.elements.name.value = player.name;
  form.elements.playerLibrary.value = '';
  form.elements.teamRole.value = player.teamRole || '';
  form.elements.instruction.value = player.instruction || '';
  form.elements.captain.checked = Boolean(player.captain);
  updateSelectHint(form.elements.teamRole, '#roleHint');
  updateSelectHint(form.elements.instruction, '#instructionHint');

  try {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  } catch (_) {
    dialog.setAttribute('open', '');
  }
  setTimeout(() => form.elements.name?.focus(), 80);
}

function saveDialogChanges() {
  const dialog = $('#playerDialog');
  const form = $('#playerForm');
  if (!dialog || !form || !form.reportValidity()) return;
  const id = form.elements.id.value;
  const player = findPlayer(id);
  if (!player) return;

  const nextName = String(form.elements.name.value || '').trim() || player.name;
  const nextRole = String(form.elements.teamRole.value || '').trim();
  const nextInstruction = String(form.elements.instruction.value || '').trim();
  const wantsCaptain = Boolean(form.elements.captain.checked) || nextRole === 'كابتن';

  players = players.map(item => {
    if (item.team === player.team && item.id !== player.id && wantsCaptain) {
      return { ...item, captain: false, teamRole: item.teamRole === 'كابتن' ? '' : item.teamRole };
    }
    if (item.id !== player.id) return item;
    const next = {
      ...item,
      name: nextName,
      teamRole: nextRole === 'كابتن' ? '' : nextRole,
      instruction: nextInstruction,
      captain: wantsCaptain
    };
    next.x = clampCoord(next.x, item.x, next.team, next.teamRole === 'لاعب حر');
    next.role = getAutoPosition(next);
    return next;
  });

  saveState();
  renderPlayers();
  renderAllPanels();
  closeDialog();
  toast('تم حفظ تعديل اللاعب', { icon: 'fa-check' });
}

function resetDialogPlayer() {
  const form = $('#playerForm');
  const id = form?.elements.id.value;
  const base = defaultPlayers.find(player => player.id === id);
  if (!base) return;
  players = normalizePlayers(players.map(player => player.id === id ? { ...base } : player));
  saveState();
  renderPlayers();
  renderAllPanels();
  closeDialog();
  toast('تمت إعادة اللاعب لوضعه الافتراضي', { icon: 'fa-rotate-left' });
}

function closeDialog() {
  const dialog = $('#playerDialog');
  if (!dialog) return;
  try {
    if (dialog.open && typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  } catch (_) {
    dialog.removeAttribute('open');
  }
}

function selectPlayer(id, rerender = true) {
  if (!findPlayer(id)) return;
  selectedId = id;
  $all('.player-token', pitch || document).forEach(token => token.classList.toggle('selected-token', token.dataset.id === id));
  if (rerender) renderAllPanels();
}

function updateToken(token, player) {
  if (!token) return;
  token.style.left = `${player.x}%`;
  token.style.top = `${player.y}%`;
  token.setAttribute('aria-label', `${player.name} ${getAutoPosition(player)}`);
  token.innerHTML = tokenHtml(player);
  token.classList.toggle('selected-token', selectedId === player.id);
}

function resetRadar() {
  players = buildDefaultPlayers();
  activeTacticId = 'diamond';
  selectedId = players[0]?.id || '';
  saveState();
  writeJson(TACTIC_KEY, activeTacticId);
  renderPlayers();
  renderAllPanels();
  updateActiveTacticButton();
  updatePitchStatus('تمت إعادة ضبط الرادار بالكامل.');
  toast('تمت إعادة ضبط الرادار', { icon: 'fa-rotate-left' });
}

function saveState() {
  players = normalizePlayers(players);
  writeJson(PLAYERS_KEY, players);
  writeJson(TACTIC_KEY, activeTacticId);
}

function updateActiveTacticButton() {
  $all('[data-tactic-id]').forEach(button => button.classList.toggle('active', button.dataset.tacticId === activeTacticId));
}

function fillSelect(select, options) {
  if (!select) return;
  select.innerHTML = options.map(item => `<option value="${safeText(item.value)}" data-hint="${safeText(item.hint || '')}">${safeText(item.label)}</option>`).join('');
}

function updateSelectHint(select, hintSelector) {
  const hint = document.querySelector(hintSelector);
  if (!select || !hint) return;
  hint.textContent = select.selectedOptions?.[0]?.dataset?.hint || '';
}

function averageDepth(team) {
  const group = players.filter(player => player.team === team);
  if (!group.length) return 0;
  return group.reduce((sum, player) => sum + (team === 'home' ? player.x : 100 - player.x), 0) / group.length;
}

function getFormationHealth() {
  const homeCaptain = players.some(player => player.team === 'home' && player.captain);
  const awayCaptain = players.some(player => player.team === 'away' && player.captain);
  const homeDepth = averageDepth('home');
  const awayDepth = averageDepth('away');
  const spread = players.reduce((sum, player) => sum + Math.abs(player.y - 50), 0) / Math.max(players.length, 1);

  if (!homeCaptain || !awayCaptain) return 'ينقصه قائد';
  if (homeDepth > 37 && awayDepth > 37) return 'ضغط عالي';
  if (homeDepth < 25 && awayDepth < 25) return 'دفاعي';
  if (spread > 25) return 'مفتوح جدًا';
  if (homeDepth > 33 || awayDepth > 33) return 'هجومي';
  return 'متوازن';
}

async function exportPitchImage() {
  if (!pitch) return;
  if (!window.html2canvas) {
    toast('أداة التصدير لم تكتمل بعد، حاول بعد ثوانٍ.', { kind: 'error', icon: 'fa-triangle-exclamation' });
    return;
  }

  try {
    pitch.classList.add('saving-shot');
    const canvas = await window.html2canvas(pitch, { backgroundColor: '#0f3d27', scale: Math.min(2, window.devicePixelRatio || 1.5) });
    const link = document.createElement('a');
    link.download = `taamen-radar-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast('تم تصدير صورة الرادار', { icon: 'fa-camera' });
  } catch (error) {
    console.warn('Radar export failed:', error);
    toast('تعذر تصدير صورة الرادار', { kind: 'error', icon: 'fa-triangle-exclamation' });
  } finally {
    pitch.classList.remove('saving-shot');
  }
}

function clampCoord(value, fallback, team, free = false) {
  const raw = Number.isFinite(Number(value)) ? Number(value) : fallback;
  if (free) return round1(clamp(raw, 5, 95));
  const limits = FIELD_LIMITS[team] || FIELD_LIMITS.home;
  return round1(clamp(raw, limits.minX, limits.maxX));
}

function findPlayer(id) {
  return players.find(player => player.id === id) || null;
}

function tokenFor(id) {
  return pitch?.querySelector(`.player-token[data-id="${CSS.escape(id)}"]`) || null;
}

function updatePitchStatus(text) {
  const status = $('#pitchStatus');
  if (status) status.textContent = text;
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.warn('Radar storage read failed:', error);
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Radar storage write failed:', error);
    return false;
  }
}

function round1(value) {
  return Math.round(Number(value) * 10) / 10;
}
