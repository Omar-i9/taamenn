import { defaultPlayers, teams, tactics, roleOptions, instructionOptions } from '../../data/site-data.js';
import { $, $all, safeText, clamp, toast } from './ui.js';
import { read, write, remove } from './storage.js';

let pitch = null;
let dragged = null;
let selectedPlayer = null;
let activePointer = null;

export function initTactical() {
  pitch = $('#tacticalPitch');
  if (!pitch) return;
  renderPlayers();
  bindPitchEvents();
  bindToolbar();
  bindPlayerDialog();
  toast('معلومة: اضغط مرتين على اللاعب لتعديل دوره وتعليماته', { icon: 'fa-circle-info', duration: 4200 });
}

function normalizeCaptains(players) {
  const seen = new Set();
  let changed = false;
  const normalized = players.map(player => {
    const isCaptain = Boolean(player.captain) || player.teamRole === 'كابتن';
    if (!isCaptain) return { ...player, captain: false };
    if (seen.has(player.team)) {
      changed = true;
      return { ...player, captain: false, teamRole: player.teamRole === 'كابتن' ? '' : player.teamRole };
    }
    seen.add(player.team);
    return { ...player, captain: true, teamRole: 'كابتن' };
  });
  if (changed) write('players', normalized);
  return normalized;
}

function getSavedPlayers() {
  return normalizeCaptains(read('players', null) || defaultPlayers);
}

function savePlayersFromDom() {
  const list = $all('.player-token', pitch).map(node => ({
    id: node.dataset.id,
    team: node.dataset.team,
    name: node.dataset.name,
    x: Number(node.dataset.x),
    y: Number(node.dataset.y),
    role: roleFromPosition(node.dataset.team, Number(node.dataset.x), Number(node.dataset.y)),
    teamRole: node.dataset.teamRole || '',
    instruction: node.dataset.instruction || '',
    captain: node.dataset.captain === 'true'
  }));
  write('players', normalizeCaptains(list));
}

function renderPlayers() {
  pitch.querySelectorAll('.player-token').forEach(node => node.remove());
  getSavedPlayers().forEach(player => pitch.appendChild(createPlayer(player)));
}

function createPlayer(player) {
  const team = teams[player.team] || teams.home;
  const node = document.createElement('button');
  node.type = 'button';
  node.className = `player-token ${team.colorClass}`;
  node.dataset.id = player.id;
  node.dataset.team = player.team;
  node.dataset.name = player.name;
  node.dataset.x = player.x;
  node.dataset.y = player.y;
  node.dataset.teamRole = player.teamRole || '';
  node.dataset.instruction = player.instruction || '';
  node.dataset.captain = String(Boolean(player.captain));
  node.style.left = `${player.x}%`;
  node.style.top = `${player.y}%`;
  node.innerHTML = playerInner(player);

  node.addEventListener('pointerdown', event => startDrag(event, node));
  node.addEventListener('dblclick', event => {
    event.preventDefault();
    openPlayerDialog(node);
  });
  return node;
}

function playerInner(player) {
  const position = roleFromPosition(player.team, Number(player.x), Number(player.y));
  const captain = Boolean(player.captain) || player.teamRole === 'كابتن';
  const teamRole = captain ? 'كابتن' : (player.teamRole || '');
  return `
    <span class="captain-mark" ${captain ? '' : 'hidden'}>C</span>
    <span class="instruction-mark" ${player.instruction ? '' : 'hidden'}>${safeText(player.instruction || '')}</span>
    <strong class="player-name-label">${safeText(player.name)}</strong>
    <span class="position-badge">${safeText(position)}</span>
    <span class="team-role-badge" ${teamRole ? '' : 'hidden'}>${safeText(teamRole)}</span>
  `;
}

function bindPitchEvents() {
  window.addEventListener('pointermove', moveDrag);
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
}

function bindToolbar() {
  $('#applyDiamond')?.addEventListener('click', () => applyTactic('diamond'));
  $('#applySquare')?.addEventListener('click', () => applyTactic('square'));
  $('#applyPyramid')?.addEventListener('click', () => applyTactic('pyramid'));
  $('#applyYPress')?.addEventListener('click', () => applyTactic('yPress'));
  $('#resetPitch')?.addEventListener('click', () => {
    remove('players');
    renderPlayers();
    toast('تمت إعادة ضبط الملعب', { icon: 'fa-rotate-right' });
  });
  $('#savePitch')?.addEventListener('click', savePitchImage);
}

function startDrag(event, node) {
  if (event.button !== 0) return;
  event.preventDefault();
  dragged = node;
  selectedPlayer = node;
  activePointer = event.pointerId;
  try { node.setPointerCapture(event.pointerId); } catch (_) {}
  node.classList.add('dragging');
  const status = $('#pitchStatus');
  if (status) status.textContent = `تحريك: ${node.dataset.name}`;
}

function moveDrag(event) {
  if (!dragged || !pitch) return;
  const rect = pitch.getBoundingClientRect();
  const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 3, 97);
  const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 5, 95);
  dragged.style.left = `${x}%`;
  dragged.style.top = `${y}%`;
  dragged.dataset.x = String(Math.round(x * 10) / 10);
  dragged.dataset.y = String(Math.round(y * 10) / 10);
  updateTokenBadges(dragged);
  const status = $('#pitchStatus');
  if (status) status.textContent = `${dragged.dataset.name}: ${roleFromPosition(dragged.dataset.team, x, y)} (${Math.round(x)}%, ${Math.round(y)}%)`;
}

function endDrag() {
  if (!dragged) return;
  try { if (activePointer !== null) dragged.releasePointerCapture(activePointer); } catch (_) {}
  dragged.classList.remove('dragging');
  dragged.animate([
    { transform: 'translate(-50%, -50%) scale(1.1)' },
    { transform: 'translate(-50%, -50%) scale(.96)' },
    { transform: 'translate(-50%, -50%) scale(1)' }
  ], { duration: 280, easing: 'ease-out' });
  savePlayersFromDom();
  dragged = null;
  activePointer = null;
  const status = $('#pitchStatus');
  if (status) status.textContent = 'تم حفظ التمركز محليًا';
}

function updateTokenBadges(node) {
  const position = node.querySelector('.position-badge');
  const teamRole = node.querySelector('.team-role-badge');
  const instruction = node.querySelector('.instruction-mark');
  const captain = node.querySelector('.captain-mark');
  const pos = roleFromPosition(node.dataset.team, Number(node.dataset.x), Number(node.dataset.y));
  if (position) position.textContent = pos;
  if (teamRole) {
    const role = node.dataset.captain === 'true' ? 'كابتن' : node.dataset.teamRole;
    teamRole.textContent = role || '';
    teamRole.hidden = !role;
  }
  if (instruction) {
    instruction.textContent = node.dataset.instruction || '';
    instruction.hidden = !node.dataset.instruction;
  }
  if (captain) captain.hidden = node.dataset.captain !== 'true';
}

function roleFromPosition(team, x, y) {
  const depth = team === 'home' ? x : 100 - x;
  if (depth < 12) return 'GK';
  if (depth < 32) return y < 30 ? 'LB' : y > 70 ? 'RB' : 'CB';
  if (depth < 46) return 'CDM';
  if (depth < 68) return y < 30 ? 'LM' : y > 70 ? 'RM' : 'CM';
  if (depth < 84) return y < 30 ? 'LW' : y > 70 ? 'RW' : 'CAM';
  return y < 30 ? 'LW' : y > 70 ? 'RW' : 'ST';
}

function applyTactic(id) {
  const tactic = tactics[id];
  if (!tactic) return;
  const byTeam = { home: 0, away: 0 };
  $all('.player-token', pitch).forEach(node => {
    const team = node.dataset.team;
    const index = byTeam[team]++;
    const pos = tactic.positions[team]?.[index];
    if (!pos) return;
    node.dataset.x = pos.x;
    node.dataset.y = pos.y;
    node.style.left = `${pos.x}%`;
    node.style.top = `${pos.y}%`;
    updateTokenBadges(node);
    node.animate([
      { transform: 'translate(-50%, -50%) scale(1)' },
      { transform: 'translate(-50%, -50%) scale(1.12)' },
      { transform: 'translate(-50%, -50%) scale(1)' }
    ], { duration: 420, easing: 'ease-out' });
  });
  savePlayersFromDom();
  toast(`تم تطبيق تكتيك ${tactic.name}`, { icon: 'fa-chess-board' });
}

function fillSelect(select, options) {
  if (!select) return;
  select.innerHTML = options.map(item => `<option value="${safeText(item.value)}" data-hint="${safeText(item.hint)}">${safeText(item.label)}</option>`).join('');
}

function updateSelectHint(select, hintId) {
  const hint = $(hintId);
  if (!select || !hint) return;
  hint.textContent = select.selectedOptions?.[0]?.dataset?.hint || '';
}

function bindPlayerDialog() {
  const dialog = $('#playerDialog');
  const form = $('#playerForm');
  if (!dialog || !form) return;

  fillSelect(form.elements.teamRole, roleOptions);
  fillSelect(form.elements.instruction, instructionOptions);
  form.elements.teamRole?.addEventListener('change', () => updateSelectHint(form.elements.teamRole, '#roleHint'));
  form.elements.instruction?.addEventListener('change', () => updateSelectHint(form.elements.instruction, '#instructionHint'));

  form.addEventListener('submit', event => {
    const submitter = event.submitter?.value;
    if (submitter !== 'save' || !selectedPlayer) return;
    event.preventDefault();
    const data = new FormData(form);
    const nextName = String(data.get('name') || '').trim() || selectedPlayer.dataset.name;
    const nextRole = String(data.get('teamRole') || '').trim();
    const nextInstruction = String(data.get('instruction') || '').trim();
    const wantsCaptain = nextRole === 'كابتن';

    if (wantsCaptain) {
      const currentCaptain = $all('.player-token', pitch).find(node =>
        node.dataset.team === selectedPlayer.dataset.team &&
        node.dataset.id !== selectedPlayer.dataset.id &&
        node.dataset.captain === 'true'
      );
      if (currentCaptain) {
        toast(`فريق ${teams[selectedPlayer.dataset.team]?.shortName || ''} عليه كابتن بالفعل: ${currentCaptain.dataset.name}`, {
          kind: 'error',
          icon: 'fa-triangle-exclamation',
          duration: 5200
        });
        form.elements.teamRole.focus();
        return;
      }
    }

    if (wantsCaptain) {
      $all('.player-token', pitch)
        .filter(node => node.dataset.team === selectedPlayer.dataset.team)
        .forEach(node => {
          node.dataset.captain = node.dataset.id === selectedPlayer.dataset.id ? 'true' : 'false';
          if (node.dataset.id !== selectedPlayer.dataset.id && node.dataset.teamRole === 'كابتن') node.dataset.teamRole = '';
          updateTokenBadges(node);
        });
    } else if (selectedPlayer.dataset.captain === 'true') {
      selectedPlayer.dataset.captain = 'false';
    }

    selectedPlayer.dataset.name = nextName;
    selectedPlayer.dataset.teamRole = nextRole;
    selectedPlayer.dataset.instruction = nextInstruction;
    selectedPlayer.dataset.captain = String(wantsCaptain);
    selectedPlayer.innerHTML = playerInner({
      name: selectedPlayer.dataset.name,
      x: Number(selectedPlayer.dataset.x),
      y: Number(selectedPlayer.dataset.y),
      team: selectedPlayer.dataset.team,
      teamRole: selectedPlayer.dataset.teamRole,
      instruction: selectedPlayer.dataset.instruction,
      captain: selectedPlayer.dataset.captain === 'true'
    });
    savePlayersFromDom();
    dialog.close();
    toast('تم حفظ اللاعب', { icon: 'fa-check' });
  });

  $('#clearPlayer')?.addEventListener('click', () => {
    if (!selectedPlayer) return;
    const original = defaultPlayers.find(p => p.id === selectedPlayer.dataset.id);
    if (!original) return;
    selectedPlayer.dataset.name = original.name;
    selectedPlayer.dataset.teamRole = original.teamRole || '';
    selectedPlayer.dataset.instruction = original.instruction || '';
    selectedPlayer.dataset.captain = String(Boolean(original.captain));
    selectedPlayer.innerHTML = playerInner({ ...original, x: Number(selectedPlayer.dataset.x), y: Number(selectedPlayer.dataset.y) });
    savePlayersFromDom();
    dialog.close();
    toast('تم مسح تعديلات اللاعب', { icon: 'fa-eraser' });
  });
}

function openPlayerDialog(node) {
  selectedPlayer = node;
  const dialog = $('#playerDialog');
  const form = $('#playerForm');
  if (!dialog || !form) return;
  form.elements.id.value = node.dataset.id;
  form.elements.name.value = node.dataset.name;
  form.elements.teamRole.value = node.dataset.captain === 'true' ? 'كابتن' : (node.dataset.teamRole || '');
  form.elements.instruction.value = node.dataset.instruction || '';
  updateSelectHint(form.elements.teamRole, '#roleHint');
  updateSelectHint(form.elements.instruction, '#instructionHint');
  dialog.showModal();
}

async function savePitchImage() {
  if (!pitch) return;
  if (!window.html2canvas) {
    toast('مكتبة حفظ الصورة لم تحمل بعد', { kind: 'error', icon: 'fa-triangle-exclamation' });
    return;
  }
  try {
    const canvas = await window.html2canvas(pitch, { backgroundColor: '#12452b', scale: 2 });
    const link = document.createElement('a');
    link.download = `taamen-tactic-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast('تم حفظ صورة التشكيلة', { icon: 'fa-camera' });
  } catch (error) {
    console.error(error);
    toast('فشل حفظ صورة التشكيلة', { kind: 'error', icon: 'fa-triangle-exclamation' });
  }
}
