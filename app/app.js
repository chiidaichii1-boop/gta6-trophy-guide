// Leonida Trophy Guide: a saved checklist over the 55 GTA VI trophies, with
// filters, a spoiler setting, export/import, and a cited guide per trophy.
// All data lives in data/trophies.json; progress lives in localStorage only.
const KEY = 'gta6-trophy-guide-progress-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoiler-v1';

const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  'side-quests': 'Side quests',
  robbery: 'Robbery',
  completion: '100% checklist',
  misc: 'Misc',
};
const KIND_ORDER = ['story', 'missable', 'collectibles', 'activities', 'side-quests', 'robbery', 'completion', 'misc'];

const rowsEl = document.getElementById('rows');
const detailEl = document.getElementById('detail');
const listMetaEl = document.getElementById('listMeta');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const spoilerEl = document.getElementById('spoiler');
const hideEarnedEl = document.getElementById('hideEarned');
const chipsEl = document.getElementById('kindChips');

let doc = null;
let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
let kindFilter = 'all';
let selectedId = 28; // Positive Mental Attitude: the one possibly missable trophy.
spoilerEl.checked = localStorage.getItem(SPOILER_KEY) === '1';

function saveProgress() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

function isStoryHidden(trophy) {
  return spoilerEl.checked && trophy.kind === 'story' && !earned.has(trophy.name);
}

function updateProgress() {
  const total = doc.trophies.length;
  const byGrade = {};
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const all = doc.trophies.filter((t) => t.grade === grade).length;
    const got = doc.trophies.filter((t) => t.grade === grade && earned.has(t.name)).length;
    byGrade[grade] = `${got}/${all}`;
  }
  document.getElementById('progressCount').textContent = `${earned.size} of ${total} earned`;
  document.getElementById('progressFill').style.width = `${(earned.size / total) * 100}%`;
  document.getElementById('progressGrades').textContent =
    `Platinum ${byGrade.platinum} · Gold ${byGrade.gold} · Silver ${byGrade.silver} · Bronze ${byGrade.bronze}`;
}

function sourceLine(key) {
  const s = doc.sources[key];
  if (!s) return key;
  return s.url ? `<a href="${s.url}" target="_blank" rel="noopener">${s.label}</a>` : s.label;
}

function renderChips() {
  chipsEl.replaceChildren();
  const kinds = ['all', ...KIND_ORDER, 'online'];
  for (const kind of kinds) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = kind === 'all' ? 'All' : kind === 'online' ? 'Online' : KIND_LABELS[kind];
    b.setAttribute('aria-pressed', String(kindFilter === kind));
    b.addEventListener('click', () => {
      kindFilter = kind;
      renderChips();
      renderList();
    });
    chipsEl.append(b);
  }
}

function applyFilters() {
  const q = searchEl.value.trim().toLowerCase();
  return doc.trophies.filter((t) => {
    if (kindFilter === 'online') return false;
    if (kindFilter !== 'all' && t.kind !== kindFilter) return false;
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (hideEarnedEl.checked && earned.has(t.name)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.when).toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderList() {
  const shown = applyFilters();
  rowsEl.replaceChildren();
  if (kindFilter === 'online') {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No online trophies — GTA VI has no online mode at launch, so every one of the 55 is single-player.';
    rowsEl.append(li);
  } else if (shown.length === 0) {
    const li = document.createElement('li');
    li.className = 'empty';
    li.textContent = 'No trophies match these filters.';
    rowsEl.append(li);
  }
  for (const t of shown) {
    const li = document.createElement('li');
    li.className = 'trophy-row' + (t.id === selectedId ? ' selected' : '') + (earned.has(t.name) ? ' earned' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('click', (e) => e.stopPropagation());
    box.addEventListener('change', () => {
      toggleEarned(t.name, box.checked);
    });
    const mid = document.createElement('div');
    const hidden = isStoryHidden(t);
    const name = document.createElement('div');
    name.className = 'trophy-name';
    name.textContent = hidden ? 'Hidden story trophy' : t.name;
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = hidden ? 'Earn it to reveal its name and description.' : t.description;
    const tags = document.createElement('div');
    tags.className = 'trophy-tags';
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = KIND_LABELS[t.kind] ?? t.kind;
    tags.append(kindTag);
    if (t.count_note) {
      const countTag = document.createElement('span');
      countTag.className = 'tag count';
      countTag.textContent = t.count_note;
      tags.append(countTag);
    }
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'tag missable';
      m.textContent = 'Potentially missable';
      tags.append(m);
    }
    if (t.hidden && !hidden) {
      const h = document.createElement('span');
      h.className = 'tag';
      h.textContent = 'Hidden on PS5';
      tags.append(h);
    }
    mid.append(name, desc, tags);
    const grade = document.createElement('span');
    grade.className = `grade ${t.grade}`;
    grade.textContent = t.grade;
    li.append(box, mid, grade);
    li.addEventListener('click', () => selectTrophy(t.id));
    rowsEl.append(li);
  }
  listMetaEl.textContent = kindFilter === 'online'
    ? '0 online trophies'
    : `${shown.length} of ${doc.trophies.length} trophies · ${earned.size} earned`;
}

function renderDetail() {
  const t = doc.trophies.find((x) => x.id === selectedId) ?? doc.trophies[0];
  detailEl.replaceChildren();
  const grade = document.createElement('span');
  grade.className = `grade ${t.grade}`;
  grade.textContent = t.grade;
  detailEl.append(grade);
  if (isStoryHidden(t)) {
    const h = document.createElement('h2');
    h.textContent = 'Hidden story trophy';
    const p = document.createElement('p');
    p.textContent = 'This is a story trophy. Its name, description and guide stay hidden until you earn it — or turn off “Hide story spoilers” above.';
    detailEl.append(h, p);
    return;
  }
  const h = document.createElement('h2');
  h.textContent = t.name;
  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = `Official description: “${t.description}”`;
  const when = document.createElement('p');
  when.className = 'when';
  when.textContent = `When: ${t.when}` + (t.count_note ? ` · ${t.count_note}` : '');
  detailEl.append(h, official, when);
  if (t.missable) {
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.textContent = 'Potentially missable — the only trophy on the list that may be. Do the Chapter 1 balcony meditation at Jason’s house; it is gone after Chapter 1.';
    detailEl.append(warn);
  }
  if (t.note) {
    const note = document.createElement('p');
    note.className = 'note';
    note.textContent = t.note;
    detailEl.append(note);
  }
  const guideH = document.createElement('h3');
  guideH.textContent = 'Guide — in our own words';
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  detailEl.append(guideH, guide);
  const srcH = document.createElement('h3');
  srcH.textContent = 'Sources';
  const ul = document.createElement('ul');
  ul.className = 'source-list';
  for (const key of t.src) {
    const li = document.createElement('li');
    li.innerHTML = sourceLine(key);
    ul.append(li);
  }
  detailEl.append(srcH, ul);
  if (t.steps && t.steps.length) {
    const stepsH = document.createElement('h3');
    stepsH.textContent = 'Steps';
    const ol = document.createElement('ol');
    ol.className = 'steps';
    for (const s of t.steps) {
      const li = document.createElement('li');
      li.textContent = s;
      ol.append(li);
    }
    detailEl.append(stepsH, ol);
  }
  const status = document.createElement('p');
  status.className = 'earned-line';
  status.textContent = earned.has(t.name) ? '✓ Earned — ticked off in your checklist.' : 'Not earned yet — tick its box in the list to mark it.';
  detailEl.append(status);
}

function renderRoadmap() {
  const ol = document.getElementById('roadmapSteps');
  ol.replaceChildren();
  for (const step of doc.roadmap) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    h.textContent = `Step ${step.step}: ${step.title}`;
    const time = document.createElement('p');
    time.className = 'time';
    time.textContent = step.time;
    const text = document.createElement('p');
    text.textContent = step.text;
    const src = document.createElement('p');
    src.className = 'src';
    src.textContent = 'Sources: ' + step.src.map((k) => doc.sources[k].label).join(' · ');
    li.append(h, time, text, src);
    ol.append(li);
  }
  const list = document.getElementById('sourceList');
  list.replaceChildren();
  for (const key of Object.keys(doc.sources)) {
    const li = document.createElement('li');
    li.innerHTML = sourceLine(key);
    list.append(li);
  }
}

function selectTrophy(id) {
  selectedId = id;
  renderList();
  renderDetail();
}

function toggleEarned(name, on) {
  if (on) earned.add(name);
  else earned.delete(name);
  saveProgress();
  updateProgress();
  renderList();
  renderDetail();
}

function exportProgress() {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned] }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress(file) {
  file.text().then((text) => {
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return;
    }
    const names = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(names)) return;
    const known = new Set(doc.trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => known.has(n)));
    saveProgress();
    updateProgress();
    renderList();
    renderDetail();
  });
}

async function loadTrophies() {
  const res = await fetch('data/trophies.json');
  doc = await res.json();
  renderChips();
  renderRoadmap();
  updateProgress();
  renderList();
  renderDetail();
}

searchEl.addEventListener('input', renderList);
gradeEl.addEventListener('change', renderList);
hideEarnedEl.addEventListener('change', renderList);
spoilerEl.addEventListener('change', () => {
  localStorage.setItem(SPOILER_KEY, spoilerEl.checked ? '1' : '0');
  renderList();
  renderDetail();
});
document.getElementById('export').addEventListener('click', exportProgress);
document.getElementById('import').addEventListener('change', (e) => {
  if (e.target.files[0]) importProgress(e.target.files[0]);
});
document.getElementById('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveProgress();
    updateProgress();
    renderList();
    renderDetail();
  }
});
document.getElementById('missableJump').addEventListener('click', () => {
  kindFilter = 'all';
  searchEl.value = '';
  renderChips();
  selectTrophy(28);
  document.querySelector('.trophy-row.selected')?.scrollIntoView({ block: 'center' });
});

loadTrophies();
