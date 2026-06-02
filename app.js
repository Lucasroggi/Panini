'use strict';

/* ============================================================
   Panini WM 2026 Tracker
   Frontend: statisch (GitHub Pages)
   Backend : Supabase (Auth + Postgres, Tabelle public.collections)
   ============================================================ */

/* ---------- Supabase-Client ---------- */
const CFG = window.PANINI_CONFIG || {};
const CONFIGURED = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY &&
                      !CFG.SUPABASE_URL.includes('DEIN-PROJEKT') &&
                      window.supabase);
const sb = CONFIGURED ? window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY) : null;

/* Demo-Modus: index.html?demo zeigt die App mit Excel-Stand OHNE Login/Speicherung
   (zum Ausprobieren vor dem Supabase-Setup). */
const DEMO = new URLSearchParams(location.search).has('demo');

/* ---------- Stammdaten: Gruppen & Teams (Endauslosung 05.12.2025) ---------- */
const PER_TEAM = 20;
// Sticker-Beschriftungen: Teams 1..20; FWC zusätzlich "00" (Panini-Logo) vor 1..20
const TEAM_LABELS = Array.from({ length: PER_TEAM }, (_, i) => String(i + 1));
const FWC_LABELS = ['00', ...TEAM_LABELS];

const GROUPS = [
  { letter:'A', teams:[['MEX','Mexiko','🇲🇽'],['RSA','Südafrika','🇿🇦'],['KOR','Südkorea','🇰🇷'],['CZE','Tschechien','🇨🇿']]},
  { letter:'B', teams:[['CAN','Kanada','🇨🇦'],['BIH','Bosnien-Herzegowina','🇧🇦'],['QAT','Katar','🇶🇦'],['SUI','Schweiz','🇨🇭']]},
  { letter:'C', teams:[['BRA','Brasilien','🇧🇷'],['MAR','Marokko','🇲🇦'],['HAI','Haiti','🇭🇹'],['SCO','Schottland','🏴󠁧󠁢󠁳󠁣󠁴󠁿']]},
  { letter:'D', teams:[['USA','USA','🇺🇸'],['PAR','Paraguay','🇵🇾'],['AUS','Australien','🇦🇺'],['TUR','Türkei','🇹🇷']]},
  { letter:'E', teams:[['GER','Deutschland','🇩🇪'],['CUW','Curaçao','🇨🇼'],['CIV','Elfenbeinküste','🇨🇮'],['ECU','Ecuador','🇪🇨']]},
  { letter:'F', teams:[['NED','Niederlande','🇳🇱'],['JPN','Japan','🇯🇵'],['SWE','Schweden','🇸🇪'],['TUN','Tunesien','🇹🇳']]},
  { letter:'G', teams:[['BEL','Belgien','🇧🇪'],['EGY','Ägypten','🇪🇬'],['IRN','Iran','🇮🇷'],['NZL','Neuseeland','🇳🇿']]},
  { letter:'H', teams:[['ESP','Spanien','🇪🇸'],['CPV','Kap Verde','🇨🇻'],['KSA','Saudi-Arabien','🇸🇦'],['URU','Uruguay','🇺🇾']]},
  { letter:'I', teams:[['FRA','Frankreich','🇫🇷'],['SEN','Senegal','🇸🇳'],['IRQ','Irak','🇮🇶'],['NOR','Norwegen','🇳🇴']]},
  { letter:'J', teams:[['ARG','Argentinien','🇦🇷'],['ALG','Algerien','🇩🇿'],['AUT','Österreich','🇦🇹'],['JOR','Jordanien','🇯🇴']]},
  { letter:'K', teams:[['POR','Portugal','🇵🇹'],['COD','DR Kongo','🇨🇩'],['UZB','Usbekistan','🇺🇿'],['COL','Kolumbien','🇨🇴']]},
  { letter:'L', teams:[['ENG','England','🏴󠁧󠁢󠁥󠁮󠁧󠁿'],['CRO','Kroatien','🇭🇷'],['GHA','Ghana','🇬🇭'],['PAN','Panama','🇵🇦']]},
];

/* ---------- Vorbefüllung: fehlende Sticker aus dem Excel-Stand ----------
   Diese Nummern (1..20 je Block) gelten beim ersten Anlegen als FEHLEND,
   alles andere als vorhanden. Hinweis: KSA -> Excel zählt 9 Fehlende,
   im Bild waren nur 8 lesbar. Bitte die 9. Nummer in der App ergänzen. */
const SEED_MISSING = {
  FWC:['00',2,3,6,8,10,15,17,19],
  MEX:[2,12,14,16,17,18], RSA:[2,5,6,10,19], KOR:[2,4,6,9,17,18], CZE:[2,10,12,16],
  CAN:[1,14,16,17], BIH:[7,11,15], QAT:[3,9,11,13,15,18], SUI:[4,10,11,17,20],
  BRA:[1,3,4,15,16,18], MAR:[8,9,11,15,18], HAI:[4,5,9,14,16,17,18], SCO:[13,18,20],
  USA:[1,7,8,11,12,14], PAR:[5,6,8,9,13,18], AUS:[1,4,5,11,13,17,19], TUR:[3,7,8,12,14,17,19,20],
  GER:[10,11,12], CUW:[2,3,8,10,12,14], CIV:[8,11,19], ECU:[2,4,5,8,9,16,18,19],
  NED:[1,2,9,11,15], JPN:[2,4,8,9,15,16,18], SWE:[6,9,12,15,19], TUN:[5,12,19],
  BEL:[2,4,16,20], EGY:[3,7,10,15,17,18], IRN:[2,4,6,10,12,14,16], NZL:[9,10,12],
  ESP:[1,2,6,8,12,15,20], CPV:[7,8,14,16], KSA:[1,4,6,7,8,12,15,16,20], URU:[1,10,11,13,15,19],
  FRA:[1,2,5,8,18,19,20], SEN:[9,11,17], IRQ:[8,12,20], NOR:[10,17,19],
  ARG:[5,12,13,15,19], ALG:[5,11], AUT:[5,10,12,14,15,18,20], JOR:[1,2,7,9,11,16,18,20],
  POR:[3,4,9,16,18,20], COD:[7,13,14,18,19,20], UZB:[2,4,8,9,17,19], COL:[1,2,3,5,9,14],
  ENG:[3,4,5,7,8,11,12,14,15,19], CRO:[2,4,9,10,15,17,19], GHA:[3,5,7,10,14], PAN:[3,6,9,12,14],
};

/* ---------- Abschnittsliste in Album-Reihenfolge ---------- */
const SECTIONS = [{ code:'FWC', name:'Spezial: Panini-Logo, Intro & FIFA-Museum', flag:'🏆', labels:FWC_LABELS, count:FWC_LABELS.length, group:'FWC' }];
GROUPS.forEach(g => g.teams.forEach(([code,name,flag]) =>
  SECTIONS.push({ code, name, flag, labels:TEAM_LABELS, count:TEAM_LABELS.length, group:g.letter })));
const SECTION_BY_CODE = Object.fromEntries(SECTIONS.map(s => [s.code, s]));

/* ISO-Codes für echte Flaggen-Bilder (flagcdn.com) – funktionieren auch auf Windows */
const ISO = {
  MEX:'mx', RSA:'za', KOR:'kr', CZE:'cz', CAN:'ca', BIH:'ba', QAT:'qa', SUI:'ch',
  BRA:'br', MAR:'ma', HAI:'ht', SCO:'gb-sct', USA:'us', PAR:'py', AUS:'au', TUR:'tr',
  GER:'de', CUW:'cw', CIV:'ci', ECU:'ec', NED:'nl', JPN:'jp', SWE:'se', TUN:'tn',
  BEL:'be', EGY:'eg', IRN:'ir', NZL:'nz', ESP:'es', CPV:'cv', KSA:'sa', URU:'uy',
  FRA:'fr', SEN:'sn', IRQ:'iq', NOR:'no', ARG:'ar', ALG:'dz', AUT:'at', JOR:'jo',
  POR:'pt', COD:'cd', UZB:'uz', COL:'co', ENG:'gb-eng', CRO:'hr', GHA:'gh', PAN:'pa',
};
function flagHtml(sec){
  const iso = ISO[sec.code];
  if (iso) return `<img class="flag" src="https://flagcdn.com/24x18/${iso}.png" srcset="https://flagcdn.com/48x36/${iso}.png 2x" width="24" height="18" alt="" loading="lazy" onerror="this.style.display='none'">`;
  return `<span class="flag">${sec.flag || '🏆'}</span>`;
}

/* ============================================================
   Zustand
   ============================================================ */
let currentUser = null;
let loadedFor = null;
let state = null;            // { CODE: [ {o:bool, d:int}, ... ] }
let currentTab = 'fehlen';
let filterQuery = '';
let filterOnlyMissing = false;
let saveTimer = null;
let pendingSave = false;

/* Zustand aufbauen: useSeed = Excel-Stand, sonst alles fehlend */
function buildState(useSeed) {
  const s = {};
  for (const sec of SECTIONS) {
    const miss = new Set((useSeed ? (SEED_MISSING[sec.code] || []) : []).map(String));
    s[sec.code] = Array.from({ length: sec.count }, (_, i) => ({
      o: useSeed ? !miss.has(sec.labels[i]) : false,
      d: 0,
    }));
  }
  return s;
}
/* alles vorhanden */
function buildStateAllOwned() {
  const s = {};
  for (const sec of SECTIONS) s[sec.code] = Array.from({ length: sec.count }, () => ({ o: true, d: 0 }));
  return s;
}

/* aus DB geladenen Zustand reparieren (fehlende Abschnitte/Längen ergänzen) */
function normalize(raw) {
  const s = {};
  for (const sec of SECTIONS) {
    const src = Array.isArray(raw?.[sec.code]) ? raw[sec.code] : [];
    s[sec.code] = Array.from({ length: sec.count }, (_, i) => {
      const c = src[i] || {};
      return { o: !!c.o, d: Math.max(0, parseInt(c.d, 10) || 0) };
    });
  }
  return s;
}

/* ---------- Kennzahlen ---------- */
function sectionMissing(code){ return state[code].filter(c => !c.o).length; }
function sectionDoubles(code){ return state[code].reduce((n,c)=> n + (c.o ? c.d : 0), 0); }
function groupMissing(letter){
  return SECTIONS.filter(s=>s.group===letter).reduce((n,s)=> n + sectionMissing(s.code), 0);
}
function groupDoubles(letter){
  return SECTIONS.filter(s=>s.group===letter).reduce((n,s)=> n + sectionDoubles(s.code), 0);
}
function totals(){
  let collected=0, total=0, doubles=0;
  for (const sec of SECTIONS) for (const c of state[sec.code]) {
    total++; if (c.o){ collected++; doubles += c.d; }
  }
  return { collected, total, missing: total-collected, doubles };
}

/* Sticker-Typ als Tooltip */
function typeHint(sec, label){
  if (sec.code === 'FWC'){
    if (label === '00') return 'Panini-Logo';
    return Number(label) <= 9 ? 'Intro-Sticker' : 'FIFA-Museum-Sticker';
  }
  if (label === '1') return 'Vereinswappen';
  if (label === '2') return 'Mannschaftsfoto';
  return 'Spielersticker';
}

/* ============================================================
   Persistenz (Supabase)
   ============================================================ */
async function loadCollection(){
  const { data, error } = await sb.from('collections').select('data').eq('user_id', currentUser.id).maybeSingle();
  if (error){ setStatus('Ladefehler', 'err'); console.error(error); state = buildState(true); return; }
  if (data && data.data && Object.keys(data.data).length){
    state = normalize(data.data);
  } else {
    // Neuer Account: mit Excel-Stand vorbefüllen und sofort speichern
    state = buildState(true);
    await saveNow();
  }
}

async function saveNow(){
  if (DEMO){ pendingSave = false; setStatus('Demo – nicht gespeichert', ''); return; }
  if (!currentUser || !state) return;
  clearTimeout(saveTimer);
  pendingSave = true;
  setStatus('Speichern …', 'pending');
  const { error } = await sb.from('collections').upsert({
    user_id: currentUser.id,
    data: state,
    updated_at: new Date().toISOString(),
  });
  if (error){ setStatus('Speicherfehler', 'err'); console.error(error); }
  else { pendingSave = false; setStatus('Gespeichert ✓', 'ok'); }
}

function scheduleSave(){
  pendingSave = true;
  setStatus('Speichern …', 'pending');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 700);
}

function setStatus(text, cls){
  const el = document.getElementById('save-status');
  if (!el) return;
  el.textContent = text;
  el.className = 'save-status ' + (cls || '');
}

/* ============================================================
   Rendering
   ============================================================ */
function $(sel){ return document.querySelector(sel); }

/* Höhe der (ggf. mehrzeiligen) Kopfzeile messen, damit die Sticky-Leiste
   robust direkt darunter andockt – unabhängig von Fensterbreite/E-Mail-Länge. */
function updateStickyOffsets(){
  const tb = document.getElementById('topbar');
  if (tb) document.documentElement.style.setProperty('--topbar-h', tb.offsetHeight + 'px');
}

function render(){
  updateSummary();
  if (currentTab === 'fehlen') renderFehlen();
  else renderDoppelt();
}

function updateSummary(){
  const t = totals();
  const pct = t.total ? Math.round(t.collected / t.total * 100) : 0;
  $('#sum-collected').textContent = t.collected;
  $('#sum-total').textContent = t.total;
  $('#sum-pct').textContent = pct + '%';
  $('#sum-missing').textContent = t.missing;
  $('#sum-doubles').textContent = t.doubles;
  $('#progress-fill').style.width = pct + '%';
}

function sectionVisible(sec){
  if (filterQuery){
    const q = filterQuery.toLowerCase();
    if (!sec.code.toLowerCase().includes(q) && !sec.name.toLowerCase().includes(q)) return false;
  }
  return true;
}

/* ---- Reiter „Fehlen“ ---- */
function shareList(title, text){
  if (navigator.share){
    navigator.share({ title, text }).catch(()=>{}); // Abbruch durch Nutzer ignorieren
  } else {
    navigator.clipboard.writeText(text).then(
      ()=> alert('Direktes Teilen wird auf diesem Gerät nicht unterstützt – die Liste wurde stattdessen in die Zwischenablage kopiert.'),
      ()=> alert('Teilen/Kopieren nicht möglich.')
    );
  }
}

function renderFehlen(){
  // Fehlliste (immer ALLE fehlenden, unabhängig vom Filter) – zum Versenden
  const missLines = [];
  let missTotal = 0;
  for (const sec of SECTIONS){
    const parts = [];
    state[sec.code].forEach((c,i)=>{ if (!c.o){ parts.push(sec.labels[i]); missTotal++; } });
    if (parts.length) missLines.push(`${sec.code} (${sec.name}): ${parts.join(', ')}`);
  }
  const missText = missLines.length
    ? 'Mir fehlen noch diese Panini-WM-2026-Sticker:\n\n' + missLines.join('\n')
    : 'Keine fehlenden Sticker – die Sammlung ist komplett! 🎉';

  const listBox = `
    <div class="swap-box">
      <div class="swap-head">
        <h2>Fehlliste <span class="group-sub">${missTotal} fehlen</span></h2>
        <div class="swap-actions">
          <button id="btn-share-miss" class="btn btn-primary">Teilen</button>
          <button id="btn-copy-miss" class="btn">Liste kopieren</button>
          <button id="btn-print-miss" class="btn">Drucken</button>
        </div>
      </div>
      <pre id="miss-list">${missText.replace(/</g,'&lt;')}</pre>
    </div>`;

  let cardsHtml = '';
  let lastGroup = null;
  for (const sec of SECTIONS){
    if (!sectionVisible(sec)) continue;
    const missing = sectionMissing(sec.code);
    if (filterOnlyMissing && missing === 0) continue;

    if (sec.group !== lastGroup){
      lastGroup = sec.group;
      const label = sec.group === 'FWC' ? 'FWC – Spezialsticker' : 'Gruppe ' + sec.group;
      cardsHtml += `<h2 class="group-head"><span>${label}</span><span class="group-sub">${groupMissing(sec.group)} fehlen</span></h2>`;
    }

    const cells = state[sec.code].map((c,i)=>{
      const label = sec.labels[i];
      return `<button class="cell ${c.o?'owned':'missing'}" data-code="${sec.code}" data-i="${i}" title="Nr. ${label} – ${typeHint(sec,label)} (${c.o?'vorhanden':'fehlt'})">${label}</button>`;
    }).join('');

    cardsHtml += `
      <article class="card ${missing===0?'complete':''}" data-code="${sec.code}">
        <header class="card-head">
          <span class="team">${flagHtml(sec)} <strong>${sec.code}</strong> <span class="tname">${sec.name}</span></span>
          <span class="badge ${missing===0?'badge-ok':''}">${missing===0 ? 'komplett ✓' : missing + '/' + sec.count + ' fehlen'}</span>
        </header>
        <div class="grid">${cells}</div>
      </article>`;
  }
  if (!cardsHtml) cardsHtml = '<p class="empty">Keine Treffer für diesen Filter.</p>';

  $('#tab-fehlen').innerHTML = listBox + cardsHtml;

  const shareBtn = document.getElementById('btn-share-miss');
  if (shareBtn) shareBtn.onclick = ()=> shareList('Meine fehlenden Panini-Sticker (WM 2026)', missText);
  const copyBtn = document.getElementById('btn-copy-miss');
  if (copyBtn) copyBtn.onclick = ()=>{
    navigator.clipboard.writeText(missText).then(
      ()=>{ copyBtn.textContent='Kopiert ✓'; setTimeout(()=>copyBtn.textContent='Liste kopieren',1500); },
      ()=> alert('Konnte nicht in die Zwischenablage kopieren.')
    );
  };
  const printBtn = document.getElementById('btn-print-miss');
  if (printBtn) printBtn.onclick = ()=> window.print();
}

/* ---- Reiter „Doppelt“ ---- */
function renderDoppelt(){
  // Tauschliste oben
  const swapLines = [];
  for (const sec of SECTIONS){
    const parts = [];
    state[sec.code].forEach((c,i)=>{ if (c.o && c.d>0) parts.push(sec.labels[i] + (c.d>1 ? '×'+c.d : '')); });
    if (parts.length) swapLines.push(`${sec.code} (${sec.name}): ${parts.join(', ')}`);
  }
  const swapText = swapLines.length ? swapLines.join('\n') : 'Noch keine Doppelten erfasst.';
  const t = totals();

  let html = `
    <div class="swap-box">
      <div class="swap-head">
        <h2>Tauschliste <span class="group-sub">${t.doubles} zum Tauschen</span></h2>
        <div class="swap-actions">
          <button id="btn-share-swap" class="btn btn-primary">Teilen</button>
          <button id="btn-copy-swap" class="btn">Liste kopieren</button>
          <button id="btn-print" class="btn">Drucken</button>
        </div>
      </div>
      <pre id="swap-list">${swapText.replace(/</g,'&lt;')}</pre>
    </div>`;

  let lastGroup = null;
  for (const sec of SECTIONS){
    if (!sectionVisible(sec)) continue;
    const ownedCount = state[sec.code].filter(c=>c.o).length;
    if (ownedCount === 0) continue;

    if (sec.group !== lastGroup){
      lastGroup = sec.group;
      const label = sec.group === 'FWC' ? 'FWC – Spezialsticker' : 'Gruppe ' + sec.group;
      html += `<h2 class="group-head"><span>${label}</span><span class="group-sub">${groupDoubles(sec.group)} doppelt</span></h2>`;
    }

    const steppers = state[sec.code].map((c,i)=>{
      const label = sec.labels[i];
      if (!c.o) return `<div class="dbl missing-dbl" title="Sticker Nr. ${label} fehlt noch">#${label}</div>`;
      return `
        <div class="dbl ${c.d>0?'has-dbl':''}">
          <span class="dbl-n">#${label}</span>
          <span class="stepper">
            <button class="step" data-act="dec" data-code="${sec.code}" data-i="${i}" ${c.d===0?'disabled':''}>−</button>
            <span class="dbl-cnt">${c.d}</span>
            <button class="step" data-act="inc" data-code="${sec.code}" data-i="${i}">+</button>
          </span>
        </div>`;
    }).join('');

    const dbl = sectionDoubles(sec.code);
    html += `
      <article class="card" data-code="${sec.code}">
        <header class="card-head">
          <span class="team">${flagHtml(sec)} <strong>${sec.code}</strong> <span class="tname">${sec.name}</span></span>
          <span class="badge ${dbl>0?'badge-dbl':''}">${dbl} doppelt</span>
        </header>
        <div class="dbl-grid">${steppers}</div>
      </article>`;
  }
  $('#tab-doppelt').innerHTML = html;

  const shareBtn = document.getElementById('btn-share-swap');
  if (shareBtn) shareBtn.onclick = ()=> shareList('Meine Panini-Tauschliste (WM 2026)', swapText);
  const copyBtn = document.getElementById('btn-copy-swap');
  if (copyBtn) copyBtn.onclick = ()=>{
    navigator.clipboard.writeText(swapText).then(
      ()=>{ copyBtn.textContent='Kopiert ✓'; setTimeout(()=>copyBtn.textContent='Liste kopieren',1500); },
      ()=> alert('Konnte nicht in die Zwischenablage kopieren.')
    );
  };
  const printBtn = document.getElementById('btn-print');
  if (printBtn) printBtn.onclick = ()=> window.print();
}

/* ============================================================
   Interaktion
   ============================================================ */
function onFehlenClick(e){
  const cell = e.target.closest('.cell');
  if (!cell) return;
  const code = cell.dataset.code, i = +cell.dataset.i;
  state[code][i].o = !state[code][i].o;
  if (!state[code][i].o) state[code][i].d = 0; // fehlend -> kann nicht doppelt sein
  render();
  scheduleSave();
}

function onDoppeltClick(e){
  const btn = e.target.closest('.step');
  if (!btn) return;
  const code = btn.dataset.code, i = +btn.dataset.i, act = btn.dataset.act;
  const cell = state[code][i];
  if (!cell.o) return;
  cell.d = Math.max(0, cell.d + (act === 'inc' ? 1 : -1));
  render();
  scheduleSave();
}

/* ============================================================
   Auth
   ============================================================ */
function authMsg(text, isErr){
  const el = $('#auth-msg');
  el.textContent = text;
  el.className = 'auth-msg ' + (isErr ? 'err' : 'ok');
}

async function handleSession(session){
  currentUser = session?.user || null;
  $('#btn-logout').hidden = !currentUser;
  if (currentUser){
    $('#auth-view').hidden = true;
    $('#main-view').hidden = false;
    $('#user-email').textContent = currentUser.email;
    updateStickyOffsets();
    if (loadedFor !== currentUser.id){
      loadedFor = currentUser.id;
      setStatus('Laden …', 'pending');
      await loadCollection();
      render();
      setStatus('Gespeichert ✓', 'ok');
    }
  } else {
    loadedFor = null; state = null;
    $('#auth-view').hidden = false;
    $('#main-view').hidden = true;
  }
}

/* ============================================================
   Initialisierung
   ============================================================ */
function wireEvents(){
  // Auth-Formular
  $('#auth-form').addEventListener('submit', async (e)=>{
    e.preventDefault();
    if (!sb) return;
    const email = $('#auth-email').value.trim();
    const pw = $('#auth-pw').value;
    const mode = e.submitter && e.submitter.value === 'signup' ? 'signup' : 'signin';
    authMsg('Bitte warten …', false);
    if (mode === 'signup'){
      const { data, error } = await sb.auth.signUp({ email, password: pw });
      if (error) return authMsg(error.message, true);
      if (!data.session) authMsg('Konto erstellt. Falls E-Mail-Bestätigung aktiv ist: Postfach prüfen, dann anmelden.', false);
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password: pw });
      if (error) return authMsg(error.message, true);
    }
  });

  $('#btn-logout').addEventListener('click', async ()=>{ if (sb) await sb.auth.signOut(); });

  // Reiter
  document.querySelectorAll('.tab-btn').forEach(b=>{
    b.addEventListener('click', ()=>{
      currentTab = b.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(x=>x.classList.toggle('active', x===b));
      $('#tab-fehlen').hidden = currentTab !== 'fehlen';
      $('#tab-doppelt').hidden = currentTab !== 'doppelt';
      render();
    });
  });

  // Toolbar
  $('#search').addEventListener('input', (e)=>{ filterQuery = e.target.value.trim(); render(); });
  $('#only-missing').addEventListener('change', (e)=>{ filterOnlyMissing = e.target.checked; render(); });

  // Zurücksetzen-Menü
  $('#reset-seed').addEventListener('click', ()=> doReset('seed'));
  $('#reset-empty').addEventListener('click', ()=> doReset('empty'));
  $('#reset-all').addEventListener('click', ()=> doReset('all'));

  // Event-Delegation für die Panels
  $('#tab-fehlen').addEventListener('click', onFehlenClick);
  $('#tab-doppelt').addEventListener('click', onDoppeltClick);
}

function startDemo(){
  currentUser = { id:'demo', email:'Demo' };
  state = buildState(true);
  $('#auth-view').hidden = true;
  $('#main-view').hidden = false;
  $('#btn-logout').hidden = true;
  $('#user-email').textContent = 'Demo-Modus – nicht gespeichert';
  setStatus('Demo – nicht gespeichert', '');
  render();
  updateStickyOffsets();
}

function init(){
  if (!CONFIGURED && !DEMO){
    $('#config-error').hidden = false;
    $('#app').hidden = true;
    return;
  }
  wireEvents();
  updateStickyOffsets();
  window.addEventListener('resize', updateStickyOffsets);
  window.addEventListener('load', updateStickyOffsets);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateStickyOffsets);

  // Ausstehende Speicherung sichern, wenn die Seite in den Hintergrund geht/geschlossen wird
  const flush = ()=>{ if (pendingSave){ clearTimeout(saveTimer); saveNow(); } };
  document.addEventListener('visibilitychange', ()=>{ if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('pagehide', flush);

  if (DEMO){ startDemo(); return; }
  // Auth-Status beobachten
  sb.auth.onAuthStateChange((_e, session)=> handleSession(session));
  sb.auth.getSession().then(({ data })=> handleSession(data.session));
}

function doReset(kind){
  const labels = {
    seed:  'Sammlung auf den Excel-Ausgangsstand setzen (262 fehlend)?',
    empty: 'Komplett zurücksetzen – ALLE Sticker auf „fehlt“?',
    all:   'Alle Sticker als „vorhanden“ markieren?',
  };
  if (!confirm(labels[kind] + '\n\nDas überschreibt deinen aktuellen Stand.')) return;
  state = kind === 'seed' ? buildState(true) : kind === 'all' ? buildStateAllOwned() : buildState(false);
  // Doppelte bei "empty" leeren passiert automatisch; bei "all" bleiben d=0
  render();
  saveNow();
  document.getElementById('reset-menu').open = false;
}

document.addEventListener('DOMContentLoaded', init);
