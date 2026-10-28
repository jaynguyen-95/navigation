/* ================= CANVAS SCALE ================= */
const frame = $('#frame');
function fit(){
  const vw = innerWidth, vh = innerHeight;
  const W = Math.round(Math.max(1600, Math.min(2400, 720 * vw / Math.max(1, vh))));
  const s = Math.min(vw / W, vh / 720);
  frame.style.setProperty('--W', W); frame.style.setProperty('--s', s); S.scale = s;
}
addEventListener('resize', () => { fit(); if (S.mapOpen) requestAnimationFrame(() => setVB(fitBox(curBox(), 0))); });
fit();

/* ================= BACKDROP (same presets as the Jackpot Dashboard) ================= */
const PRESETS = {
  champagne:{ tone:'light', base:'linear-gradient(150deg,#f8f1e6 0%,#efe2cc 45%,#e3cfae 100%)', blobs:['#f3d27e','#e9b8a2','#fff4dc','#cfae7c'] },
  pearl:{ tone:'light', base:'linear-gradient(160deg,#fbfaf7 0%,#eeeae3 55%,#e1dad0 100%)', blobs:['#ffffff','#e7d8bd','#f2e1ad','#d4cec4'] },
  espresso:{ tone:'dark', base:'linear-gradient(160deg,#5a4635 0%,#3a2d22 55%,#221a13 100%)', blobs:['#b98a2e','#7a5a3a','#e7b955','#4b3b2d'] },
  midnight:{ tone:'dark', base:'linear-gradient(160deg,#1f1913 0%,#110d0a 60%,#060504 100%)', blobs:['#8a6420','#e7b955','#3d3025','#b98a2e'] },
  aurora:{ tone:'light', kind:'flow', stops:['#fbf3e3','#f3d9a4','#efc9b8','#f8ecd2','#e6cfa6'] },
  sunlight:{ tone:'light', kind:'rays', base:'linear-gradient(170deg,#fbf5ea 0%,#f1e3c8 60%,#e6d2ae 100%)', ray:'rgba(255,248,225,.75)', glow:'rgba(255,226,150,.55)' },
  golddust:{ tone:'light', kind:'sparkle', base:'linear-gradient(160deg,#faf5ec,#efe2cb 60%,#e4d1b0)', dot:'#c8963e' },
  emberflow:{ tone:'dark', kind:'flow', stops:['#1a0603','#5a1607','#2a1209','#8f1e00','#120402'] },
  spotlight:{ tone:'dark', kind:'rays', base:'linear-gradient(170deg,#2e241b 0%,#17120d 60%,#0b0806 100%)', ray:'rgba(255,214,140,.16)', glow:'rgba(231,185,85,.35)' },
  starlight:{ tone:'dark', kind:'sparkle', base:'linear-gradient(160deg,#241c15,#120e0a 60%,#070504)', dot:'#f3d27e' },
};
const BG_PRESETS = [
  { k:'champagne', name:'Champagne', type:'animated' }, { k:'pearl', name:'Pearl', type:'animated' }, { k:'aurora', name:'Aurora Gold', type:'animated' },
  { k:'sunlight', name:'Sunlight', type:'animated' }, { k:'golddust', name:'Gold Dust', type:'animated' },
  { k:'cream', name:'Cream', type:'gradient', c1:'#fbf6ec', c2:'#e6d5b8', angle:160, tone:'light' }, { k:'rosegold', name:'Rose Gold', type:'gradient', c1:'#f8ebe3', c2:'#dfbca2', angle:150, tone:'light' },
  { k:'sand', name:'Sand', type:'solid', color:'#efe7da', tone:'light' },
  { k:'espresso', name:'Espresso', type:'animated' }, { k:'midnight', name:'Midnight Gold', type:'animated' }, { k:'emberflow', name:'Ember Flow', type:'animated' },
  { k:'spotlight', name:'Spotlight', type:'animated' }, { k:'starlight', name:'Starlight', type:'animated' },
  { k:'ember', name:'Ember', type:'gradient', c1:'#8f1e00', c2:'#110101', angle:200, tone:'dark' }, { k:'cocoa', name:'Cocoa', type:'gradient', c1:'#4b3b2d', c2:'#15110d', angle:160, tone:'dark' },
  { k:'onyx', name:'Onyx', type:'solid', color:'#15110d', tone:'dark' },
];
function presetSwatch(p){
  if (p.type === 'solid') return p.color;
  if (p.type === 'gradient') return `linear-gradient(${p.angle}deg, ${p.c1}, ${p.c2})`;
  const a = PRESETS[p.k];
  if (a.kind === 'flow') return `linear-gradient(120deg, ${a.stops.join(', ')})`;
  if (a.kind === 'rays') return `repeating-conic-gradient(from 200deg at 50% -20%, ${a.ray} 0deg 4deg, transparent 6deg 14deg), radial-gradient(70% 60% at 50% 0%, ${a.glow}, transparent 70%), ${a.base}`;
  if (a.kind === 'sparkle') return `radial-gradient(circle at 20% 30%, ${a.dot} 0 1.5px, transparent 2.5px), radial-gradient(circle at 70% 60%, ${a.dot} 0 1.5px, transparent 2.5px), radial-gradient(circle at 45% 80%, ${a.dot} 0 1px, transparent 2px), ${a.base}`;
  return `radial-gradient(60% 70% at 20% 20%, ${a.blobs[0]}cc, transparent 70%), radial-gradient(60% 70% at 85% 80%, ${a.blobs[1]}aa, transparent 70%), ${a.base}`;
}
function presetActive(p, b){
  if (p.type !== b.type) return false;
  if (p.type === 'animated') return b.preset === p.k;
  if (p.type === 'solid') return b.color === p.color;
  return b.c1 === p.c1 && b.c2 === p.c2 && +b.angle === p.angle;
}
const imgSrc = v => !v ? '' : v.startsWith('a:') ? '/_blob/' + v.slice(2) : v.startsWith('data:') ? v : '';
let bgKey = '';
function applyLook(){
  const L = S.cfg.look, b = L.bg, el = $('#bg');
  const media = b.type === 'image' && imgSrc(b.img);
  const tone = media ? (b.tone === 'light' ? 'light' : 'dark') : b.type === 'animated' ? (PRESETS[b.preset] || PRESETS.champagne).tone : (b.tone === 'dark' ? 'dark' : 'light');
  frame.dataset.tone = tone;
  frame.dataset.theme = L.theme === 'match' ? tone : (L.theme === 'dark' ? 'dark' : 'light');
  const key = JSON.stringify(b); if (key === bgKey) return; bgKey = key;
  el.style.background = ''; el.style.backgroundSize = ''; el.style.animation = ''; el.innerHTML = '';
  if (b.type === 'solid'){ el.style.background = b.color; return; }
  if (b.type === 'gradient'){ el.style.background = `linear-gradient(${b.angle}deg, ${b.c1}, ${b.c2})`; return; }
  if (media){
    const veil = `<div class="veil" style="background:${tone === 'dark' ? `rgba(20,14,8,${b.overlay})` : `rgba(255,250,240,${b.overlay})`}"></div>`;
    el.style.background = '#2a2018';
    el.innerHTML = ((b.imgType || '').startsWith('video') ? `<video src="${esc(media)}" autoplay muted loop playsinline></video>` : `<img src="${esc(media)}" alt="">`) + veil;
    const v = el.querySelector('video'); if (v){ v.muted = true; v.play && v.play().catch(() => {}); }
    return;
  }
  const p = PRESETS[b.preset] || PRESETS.champagne;
  if (p.kind === 'flow'){ el.style.background = `linear-gradient(120deg, ${p.stops.join(', ')})`; el.style.backgroundSize = '400% 400%'; el.style.animation = 'flow 36s ease-in-out infinite'; el.innerHTML = '<span class="sheen"></span>'; return; }
  if (p.kind === 'rays'){
    el.style.background = p.base;
    el.innerHTML = `<span class="rays" style="background:repeating-conic-gradient(from 0deg at 50% 50%, ${p.ray} 0deg 3deg, transparent 5deg 13deg)"></span><span class="rays r2" style="background:repeating-conic-gradient(from 7deg at 50% 50%, ${p.ray} 0deg 2deg, transparent 4deg 17deg)"></span><span class="glow" style="background:radial-gradient(55% 60% at 50% 0%, ${p.glow}, transparent 70%)"></span>`;
    return;
  }
  if (p.kind === 'sparkle'){
    el.style.background = p.base;
    let r = 1234567, html = ''; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 80; i++){ const sz = 2 + rnd()*4; html += `<span class="spark" style="left:${(rnd()*100).toFixed(2)}%;top:${(rnd()*100).toFixed(2)}%;width:${sz}px;height:${sz}px;background:${p.dot};color:${p.dot};animation-delay:${(rnd()*6).toFixed(2)}s;animation-duration:${(3+rnd()*4).toFixed(2)}s"></span>`; }
    el.innerHTML = html + `<span class="glow" style="background:radial-gradient(60% 60% at 30% 20%, ${p.dot}33, transparent 70%),radial-gradient(50% 60% at 80% 90%, ${p.dot}22, transparent 70%)"></span>`;
    return;
  }
  el.style.background = p.base;
  const pos = [['-6%','-40%',820,'drift1 38s'],['58%','-45%',760,'drift2 46s'],['-8%','30%',720,'drift3 52s'],['64%','25%',780,'drift4 60s']];
  el.innerHTML = p.blobs.map((c, i) => `<span class="blob" style="left:${pos[i][0]};top:${pos[i][1]};width:${pos[i][2]}px;height:${pos[i][2]}px;background:${c};animation:${pos[i][3]} ease-in-out infinite"></span>`).join('');
}

/* ================= DATES (per language) ================= */
const WD = { en:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], vi:['CN','T2','T3','T4','T5','T6','T7'], ko:['일','월','화','수','목','금','토'], zh:['周日','周一','周二','周三','周四','周五','周六'], ja:['日','月','火','水','木','金','土'] };
const WDL = { en:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], vi:['Chủ nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'], ko:['일요일','월요일','화요일','수요일','목요일','금요일','토요일'], zh:['星期日','星期一','星期二','星期三','星期四','星期五','星期六'], ja:['日曜日','月曜日','火曜日','水曜日','木曜日','金曜日','土曜日'] };
const MON_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], MONL_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const hm = ts => { const d = new Date(ts); return pad2(d.getHours()) + ':' + pad2(d.getMinutes()); };
const sameDay = (a, b) => { const x = new Date(a), y = new Date(b); return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate(); };
function fmtDay(ts){
  const now = Date.now();
  if (sameDay(ts, now)) return tr('today');
  if (sameDay(ts, now + DAY)) return tr('tomorrow');
  const d = new Date(ts), w = d.getDay(), dd = d.getDate(), mm = d.getMonth() + 1;
  switch (LANG){
    case 'vi': return `${WD.vi[w]}, ${dd}/${mm}`;
    case 'ko': return `${mm}월 ${dd}일 (${WD.ko[w]})`;
    case 'zh': return `${mm}月${dd}日 ${WD.zh[w]}`;
    case 'ja': return `${mm}月${dd}日(${WD.ja[w]})`;
    default: return `${WD.en[w]} ${dd} ${MON_EN[d.getMonth()]}`;
  }
}
function longDate(d){
  const w = d.getDay(), dd = d.getDate(), mm = d.getMonth() + 1;
  switch (LANG){
    case 'vi': return `${WDL.vi[w]}, ${dd}/${mm}/${d.getFullYear()}`;
    case 'ko': return `${mm}월 ${dd}일 ${WDL.ko[w]}`;
    case 'zh': return `${mm}月${dd}日 ${WDL.zh[w]}`;
    case 'ja': return `${mm}月${dd}日 ${WDL.ja[w]}`;
    default: return `${WDL.en[w]}, ${dd} ${MONL_EN[d.getMonth()]}`;
  }
}
const timed = ts => { const d = new Date(ts); return !(d.getHours() === 0 && d.getMinutes() === 0) && !(d.getHours() === 23 && d.getMinutes() === 59); };
const dayTime = ts => fmtDay(ts) + (timed(ts) ? ' ' + hm(ts) : '');
function fmtRange(a){
  const s = a.start, e = a.end;
  if (s && e){
    if (sameDay(s, e)) return `${fmtDay(s)}${timed(s) ? ' · ' + hm(s) : ''}${timed(e) ? '–' + hm(e) : ''}`;
    if (s <= Date.now()) return tr('until_t', { d:dayTime(e) });
    return `${dayTime(s)} – ${dayTime(e)}`;
  }
  if (s && s > Date.now()) return tr('from_t', { d:dayTime(s) });
  if (e) return tr('until_t', { d:dayTime(e) });
  return '';
}

/* ================= ANNOUNCEMENTS + RULES ================= */
function annState(a, now){
  if (a.on === false) return 'off';
  if (a.end && a.end <= now) return 'expired';
  if (a.start && a.start > now) return 'scheduled';
  return 'live';
}
const isNew = a => Date.now() - (a.created || a.start || 0) < S.cfg.idle.newHours * HOUR;
const rank = a => (a.prio === 'urgent' ? 0 : a.prio === 'featured' ? 2 : 4) + (isNew(a) ? 0 : 1);
const sortAnns = list => list.slice().sort((a, b) => rank(a) - rank(b) || (b.start || b.created || 0) - (a.start || a.created || 0));
const activeAnns = () => sortAnns(S.anns.filter(a => annState(a, Date.now()) === 'live'));
const sortRules = list => list.slice().sort((a, b) => (a.order || 0) - (b.order || 0) || (a.created || 0) - (b.created || 0));
const activeRules = () => sortRules(S.rules.filter(r => r.on !== false));
const rulesOn = () => S.cfg.feat.rules !== false;
const RULE_ICONS = ['idcard','usercheck','camoff','smoke','shirt','wrench','smile','shield','clock','info','alert','coffee'];
function badgesHTML(a, withCat){
  let s = '';
  if (a.prio === 'urgent') s += `<span class="bd u">${ico('alert')}${esc(tr('urgent'))}</span>`;
  else if (a.prio === 'featured') s += `<span class="bd f">${ico('star')}${esc(tr('featured'))}</span>`;
  if (isNew(a) && a.prio !== 'urgent') s += `<span class="bd n">${esc(tr('new'))}</span>`;
  if (withCat) s += `<span class="bd">${esc(tr('cat_' + (CAT[a.cat] ? a.cat : 'notice')))}</span>`;
  return s;
}
function metaHTML(a){
  const r = fmtRange(a), pl = LT(a, 'place');
  return (r ? `<span>${ico('cal')}${esc(r)}</span>` : '') + (pl ? `<span>${ico('pin')}${esc(pl)}</span>` : '');
}
function picHTML(a){
  const src = imgSrc(a.img);
  if (src) return `<div class="pic"><img src="${esc(src)}" alt="" loading="lazy"></div>`;
  const c = CAT[a.cat] || CAT.notice;
  const pg = a.prio === 'urgent' ? 'linear-gradient(135deg,#f0624b,#8a170c)' : c.pg;
  const icon = c.ic === 'diamond' ? '<svg viewBox="0 0 24 46" style="fill:rgba(255,255,255,.92);stroke:none"><use href="#diamond"/></svg>' : ico(c.ic);
  return `<div class="pic"><div class="poster" style="--pg:${pg}"><span class="pk">${esc(tr('cat_' + (CAT[a.cat] ? a.cat : 'notice')))}</span><span class="pi">${icon}</span></div></div>`;
}
function idleItems(){
  const act = activeAnns(), src = S.cfg.idle.source;
  let list;
  if (src === 'featured') list = act.filter(a => a.prio !== 'normal');
  else if (src === 'all') list = act;
  else if (src === 'pick') list = act.filter(a => a.prio === 'urgent' || a.idle);
  else {
    list = act.filter(a => a.prio !== 'normal' || isNew(a));
    if (list.length < 4) list = list.concat(act.filter(a => !list.includes(a)).slice(0, 4 - list.length));
  }
  if (!list.length) list = act;
  return list.slice(0, 10);
}
const langBtn = () => S.cfg.feat.langSwitch !== false ? `<button class="langbtn lg press" data-act="lang" aria-label="${esc(tr('lang'))}">${ico('globe')}<b>${LANG.toUpperCase()}</b></button>` : '';
function renderHeader(){
  const act = activeAnns(), u = act.filter(a => a.prio === 'urgent').length;
  const tabs = [['idle', 'star', tr('tabHl'), ''], ['all', 'grid', tr('tabAll'), `<span class="n${u ? ' u' : ''}">${act.length}</span>`]];
  if (rulesOn()) tabs.push(['rules', 'book', tr('tabRules'), '']);
  const title = S.view === 'rules' ? tr('tabRules') : S.view === 'all' ? tr('all') : (S.cfg.idle.greet || tr('welcome'));
  const sub = S.view === 'rules' ? tr('rules_s') : (S.cfg.idle.sub || tr('welcome_s'));
  $('#bh').innerHTML = `<div class="tx"><h2>${esc(title)}</h2><p>${esc(sub)}</p></div>
    <nav class="btabs lg" aria-label="Sections">${tabs.map(([k, ic, l, x]) => `<button class="press${S.view === k ? ' on' : ''}" data-view="${k}"${S.view === k ? ' aria-current="page"' : ''}>${ico(ic)}<span>${esc(l)}</span>${x}</button>`).join('')}</nav>${langBtn()}`;
}
function emptyHTML(){
  if (S.mode === 'connecting') return `<div class="empty lg"><div><svg class="dm" aria-hidden="true"><use href="#diamond"/></svg><h3>${esc(S.cfg.idle.greet || tr('welcome'))}</h3></div></div>`;
  return `<div class="empty lg"><div><svg class="dm" aria-hidden="true"><use href="#diamond"/></svg><h3>${esc(tr('none'))}</h3><p>${esc(tr('none_s'))}</p></div></div>`;
}
function renderIdle(){
  const v = $('#vIdle');
  const list = idleItems();
  const prevId = S.idleList[S.slide] && S.idleList[S.slide].id;
  S.idleList = list;
  const keep = list.findIndex(a => a.id === prevId);
  S.slide = keep >= 0 ? keep : 0;
  if (!list.length){ v.innerHTML = emptyHTML(); return; }
  v.innerHTML = `<div class="idle${S.cfg.idle.layout === 'full' ? ' full' : ''}"><div class="hero press" id="hero" role="button"></div><div class="next" id="next"></div></div>`;
  paintHero(false); paintNext();
}
function heroSlide(a){
  return `<div class="slide">${picHTML(a)}<div class="copy lg"><div class="badges">${badgesHTML(a, true)}</div><h3>${esc(LT(a, 'title'))}</h3>${LT(a, 'summary') ? `<p class="sum">${esc(LT(a, 'summary'))}</p>` : ''}<div class="meta">${metaHTML(a)}<span class="more">${esc(tr('more'))}${ico('chev')}</span></div><div class="prog"><i></i></div></div></div>`;
}
function paintHero(anim){
  const h = $('#hero'), a = S.idleList[S.slide];
  if (!h || !a) return;
  h.dataset.id = a.id;
  const dots = S.idleList.length > 1 ? `<div class="dots">${S.idleList.map((_, i) => `<i class="${i === S.slide ? 'on' : ''}"></i>`).join('')}</div>` : '';
  if (!anim){ h.innerHTML = heroSlide(a) + dots; return; }
  h.querySelectorAll('.slide').forEach(s => { s.classList.add('out'); setTimeout(() => s.remove(), 750); });
  const old = h.querySelector('.dots'); if (old) old.remove();
  h.insertAdjacentHTML('beforeend', heroSlide(a) + dots);
  const ns = h.querySelectorAll('.slide'); const n = ns[ns.length - 1];
  n.classList.add('out'); requestAnimationFrame(() => requestAnimationFrame(() => n.classList.remove('out')));
}
function nextItems(){
  const L = S.idleList, out = [];
  for (let k = 1; k < L.length && out.length < 3; k++) out.push(L[(S.slide + k) % L.length]);
  if (out.length < 3){ for (const a of activeAnns()){ if (out.length >= 3) break; if (!out.includes(a) && a !== L[S.slide]) out.push(a); } }
  return out;
}
function paintNext(){
  const box = $('#next'); if (!box) return;
  const out = nextItems();
  box.innerHTML = `<h4>${esc(tr('upNext'))}</h4>` + out.map(a => `<button class="ni lg press" data-id="${esc(a.id)}"><div class="th">${picHTML(a)}</div><div style="min-width:0">${a.prio === 'urgent' || isNew(a) ? `<div class="badges">${badgesHTML(a, false)}</div>` : ''}<b>${esc(LT(a, 'title'))}</b><small>${esc(fmtRange(a) || tr('cat_' + a.cat))}</small></div></button>`).join('')
    + (S.cfg.idle.hint ? `<span class="hint">${ico('hand')}${esc(tr('tapAll'))}</span>` : '');
}
function allList(){
  const act = activeAnns(), f = S.filter;
  return f === 'all' ? act : f === 'urgent' ? act.filter(a => a.prio === 'urgent') : act.filter(a => a.cat === f);
}
function renderAll(){
  const v = $('#vAll'), act = activeAnns();
  const cnt = {}; act.forEach(a => cnt[a.cat] = (cnt[a.cat] || 0) + 1);
  const u = act.filter(a => a.prio === 'urgent').length;
  if (S.filter !== 'all' && S.filter !== 'urgent' && !cnt[S.filter]) S.filter = 'all';
  if (S.filter === 'urgent' && !u) S.filter = 'all';
  const chip = (f, label, c, cls) => `<button class="chip lg press${cls ? ' ' + cls : ''}${S.filter === f ? ' on' : ''}" data-f="${f}">${esc(label)}<span class="c">${c}</span></button>`;
  const chips = chip('all', tr('allChip'), act.length) + (u ? chip('urgent', tr('urgent'), u, 'u') : '') + CAT_KEYS.filter(k => cnt[k]).map(k => chip(k, tr('cat_' + k), cnt[k])).join('');
  const list = allList();
  const cards = list.length ? list.map(a => `<button class="card lg press${a.prio === 'urgent' ? ' urg' : ''}" data-id="${esc(a.id)}"><div class="th">${picHTML(a)}<div class="badges">${badgesHTML(a, false)}</div></div><div class="cb"><b>${esc(LT(a, 'title'))}</b>${LT(a, 'summary') ? `<p>${esc(LT(a, 'summary'))}</p>` : ''}<div class="meta">${metaHTML(a)}</div></div></button>`).join('') : `<div class="none">${esc(act.length ? tr('noneFilter') : tr('none'))}</div>`;
  const g = v.querySelector('.grid'), st = g ? g.scrollTop : 0;
  v.innerHTML = `<div class="allv"><div class="chips">${chips}</div><div class="grid">${cards}</div></div>`;
  v.querySelector('.grid').scrollTop = st;
}
function renderRules(){
  const v = $('#vRules'), list = activeRules();
  if (!list.length){ v.innerHTML = `<div class="empty lg"><div><span class="rbig">${ico('book')}</span><h3>${esc(tr('noRules'))}</h3></div></div>`; return; }
  const g = v.querySelector('.rgrid'), st = g ? g.scrollTop : 0;
  v.innerHTML = `<div class="rgrid">${list.map((r, i) => `<button class="rcard lg press" data-rid="${esc(r.id)}"><span class="rnum">${i + 1}</span><span class="ric">${ico(RULE_ICONS.includes(r.ic) ? r.ic : 'shield')}</span><span class="rtx"><b>${esc(LT(r, 'title'))}</b><span>${esc(LT(r, 'body'))}</span></span></button>`).join('')}</div>`;
  v.querySelector('.rgrid').scrollTop = st;
}
function renderTicker(){
  const t = $('#ticker');
  const urg = activeAnns().filter(a => a.prio === 'urgent');
  if (!S.cfg.idle.ticker || !urg.length){ t.innerHTML = ''; return; }
  const items = urg.map(a => `<span><b>${esc(LT(a, 'title'))}</b>${LT(a, 'summary') ? `<em>${esc(LT(a, 'summary'))}</em>` : ''}</span>`).join('');
  const len = urg.reduce((n, a) => n + LT(a, 'title').length + LT(a, 'summary').length, 0);
  t.innerHTML = `<div class="ticker lg" data-act="urgent"><span class="bd u">${ico('alert')}${esc(tr('urgent'))}</span><div class="mq"><div style="--mqd:${Math.max(18, Math.round(len * .22))}s"><span class="cp">${items}</span><span class="cp" aria-hidden="true">${items}</span></div></div></div>`;
}
function renderDetail(){
  const box = $('#detail');
  if (!S.detail){ box.innerHTML = ''; return; }
  const ids = S.detailList, i = ids.indexOf(S.detail);
  const nav = `<div class="acts"><button class="rb lg press" data-act="prev" aria-label="${esc(tr('prev'))}"${i <= 0 ? ' disabled' : ''}>${ico('chevl')}</button><button class="rb lg press" data-act="next" aria-label="${esc(tr('next'))}"${i < 0 || i >= ids.length - 1 ? ' disabled' : ''}>${ico('chev')}</button><span class="sp"></span><button class="pill lg press gold" data-act="closeDetail">${ico('close')}${esc(tr('close'))}</button></div>`;
  if (S.detail.startsWith('r:')){
    const r = S.rules.find(x => x.id === S.detail.slice(2));
    if (!r){ S.detail = null; box.innerHTML = ''; return; }
    const n = activeRules().indexOf(r) + 1;
    box.innerHTML = `<div class="dt lg"><aside class="dside rule"><span class="rnum big">${n || ''}</span><span class="ric big">${ico(RULE_ICONS.includes(r.ic) ? r.ic : 'shield')}</span><span class="bd">${esc(tr('tabRules'))}</span></aside><div class="tx"><h3>${esc(LT(r, 'title'))}</h3><div class="body">${esc(LT(r, 'body'))}</div>${nav}</div></div>`;
    return;
  }
  const a = S.anns.find(x => x.id === S.detail);
  if (!a){ S.detail = null; box.innerHTML = ''; return; }
  const sum = LT(a, 'summary'), body = LT(a, 'body');
  box.innerHTML = `<div class="dt lg"><aside class="dside"><div class="dimg">${picHTML(a)}</div><div class="badges">${badgesHTML(a, true)}</div><div class="dmeta">${metaHTML(a)}</div></aside><div class="tx"><h3>${esc(LT(a, 'title'))}</h3><div class="body">${sum && body !== sum ? `<p class="lead">${esc(sum)}</p>` : ''}${esc(body || sum)}</div>${nav}</div></div>`;
}
let boardSig = '';
function renderBoard(force){
  const act = activeAnns();
  const sig = LANG + '|' + JSON.stringify(S.cfg.idle) + '|' + rulesOn() + '|' + act.map(a => a.id + ':' + (a.updated || '') + ':' + isNew(a)).join(',') + '|' + S.anns.length + '|' + S.rules.map(r => r.id + ':' + (r.updated || '') + ':' + r.on + ':' + r.order).join(',');
  if (!force && sig === boardSig) return;
  boardSig = sig;
  if (S.view === 'rules' && !rulesOn()) S.view = 'idle';
  renderHeader(); renderTicker();
  if (S.view === 'all') renderAll(); else if (S.view === 'rules') renderRules(); else renderIdle();
  $('#vIdle').hidden = S.view !== 'idle'; $('#vAll').hidden = S.view !== 'all'; $('#vRules').hidden = S.view !== 'rules';
  renderDetail();
  renderTiles();
}
function setView(v){
  S.view = v; S.detail = null;
  if (v === 'all') renderAll(); else if (v === 'rules') renderRules(); else { S.slideAt = performance.now(); renderIdle(); }
  $('#vIdle').hidden = v !== 'idle'; $('#vAll').hidden = v !== 'all'; $('#vRules').hidden = v !== 'rules';
  renderHeader(); renderDetail();
}
function openDetail(id, list){ S.detail = id; S.detailList = list; renderDetail(); }
$('#board').addEventListener('click', e => {
  const tab = e.target.closest('[data-view]');
  if (tab){ if (tab.dataset.view === 'all') S.filter = 'all'; return setView(tab.dataset.view); }
  const act = e.target.closest('[data-act]');
  if (act){
    const k = act.dataset.act;
    if (k === 'lang') return openLang();
    if (k === 'urgent'){ S.filter = 'urgent'; return setView('all'); }
    if (k === 'closeDetail'){ S.detail = null; return renderDetail(); }
    if (k === 'prev' || k === 'next'){ const i = S.detailList.indexOf(S.detail) + (k === 'next' ? 1 : -1); if (S.detailList[i]){ S.detail = S.detailList[i]; renderDetail(); } return; }
    return;
  }
  const ch = e.target.closest('.chip[data-f]');
  if (ch){ S.filter = ch.dataset.f; renderAll(); return; }
  const card = e.target.closest('.card[data-id]');
  if (card) return openDetail(card.dataset.id, allList().map(a => a.id));
  const rc = e.target.closest('.rcard[data-rid]');
  if (rc) return openDetail('r:' + rc.dataset.rid, activeRules().map(r => 'r:' + r.id));
  const ni = e.target.closest('.ni[data-id]');
  if (ni) return openDetail(ni.dataset.id, S.idleList.map(a => a.id).concat(nextItems().filter(a => !S.idleList.includes(a)).map(a => a.id)));
  const hero = e.target.closest('#hero');
  if (hero && hero.dataset.id) return openDetail(hero.dataset.id, S.idleList.map(a => a.id));
});

/* ================= GUEST LANGUAGE ================= */
function setLang(code){
  S.glang = code && code !== S.cfg.lang ? code : null;
  LANG = S.glang || S.cfg.lang;
  frame.lang = LANG;
  tickClock(); renderStatus(); renderBoard(true);
  $('#navHint').textContent = tr('tapShow');
  $('#zLang').innerHTML = `${ico('globe')}<b>${LANG.toUpperCase()}</b>`;
  $('#zLang').hidden = S.cfg.feat.langSwitch === false;
  if ($('#mStatic').firstChild) buildMapStatic();
  if (S.mapOpen){ renderMapMachines(); renderYou(); renderMapTip(); if (S.sel){ S.plan = planRoute(MBY[S.sel]); drawRoute(S.plan); } renderMapPanel(); }
}
function openLang(){
  const ov = $('#langpop');
  ov.innerHTML = `<div class="langbox lg" role="dialog" aria-label="Language"><b class="lt">Language · 언어 · Ngôn ngữ · 语言 · 言語</b><div class="langs">${LANGS.map(([c, n, en]) => `<button class="lgo press${LANG === c ? ' on' : ''}" data-lang="${c}" lang="${c}"><b>${esc(n)}</b><small>${esc(en)}</small>${LANG === c ? ico('check') : ''}</button>`).join('')}</div><button class="pill lg press" data-lang="x">${ico('close')}${esc(tr('close'))}</button></div>`;
  ov.hidden = false;
}
$('#langpop').addEventListener('click', e => {
  const b = e.target.closest('[data-lang]');
  if (!b){ if (e.target.id === 'langpop') $('#langpop').hidden = true; return; }
  if (b.dataset.lang !== 'x') setLang(b.dataset.lang);
  $('#langpop').hidden = true;
});

/* ================= NAV TILES + REMOTE LINK ================= */
const TAB_INDEX = { day:0, week:1, month:2, year:3, live:4, players:4, machines:4 };
const Link = {
  bc:null, win:null,
  init(){
    try { this.bc = new BroadcastChannel('vegas-jackpot'); this.bc.onmessage = e => this.hear(e.data); } catch {}
    addEventListener('message', e => this.hear(e.data));
    this.post({ type:'vegas:ping', at:Date.now() });
    setInterval(() => this.post({ type:'vegas:ping', at:Date.now() }), 20000);
  },
  hear(m){ if (m && typeof m === 'object' && (m.type === 'vegas:ack' || m.type === 'vegas:hello' || m.type === 'vegas:state')){ S.tvSeen = Date.now(); renderStatus(); if (S.sheetOpen && S.tab === 'tv') renderSheet(); } },
  post(msg){
    try { this.bc && this.bc.postMessage(msg); } catch {}
    try { if (this.win && !this.win.closed) this.win.postMessage(msg, '*'); } catch {}
  },
  send(view){
    const msg = { type:'vegas:nav', view, tab: TAB_INDEX[view] != null ? TAB_INDEX[view] : null, hold:S.cfg.hold, at:Date.now() };
    this.post(msg);
    const u = (S.cfg.link.webhook || '').trim();
    if (/^https?:\/\//i.test(u)){ try { fetch(u.replace('{view}', encodeURIComponent(view)).replace('{tab}', msg.tab == null ? '' : msg.tab), { mode:'no-cors', keepalive:true }).catch(() => {}); } catch {} }
  },
  open(){
    const u = (S.cfg.link.url || '').trim();
    if (!/^https?:\/\//i.test(u)) return false;
    try { this.win = window.open(u, 'vegas-dashboard'); } catch { this.win = null; }
    return !!this.win;
  },
};
const labelOf = k => (NAV.find(n => n.k === k) || {}).label || k;
function counts(){
  const c = { free:0, busy:0, resv:0, off:0, byType:{ slot:0, roulette:0, baccarat:0 } };
  for (const m of MACH){ const s = machineStatus(m.id); c[s] = (c[s] || 0) + 1; if (s === 'free'){ const t = machineType(m); c.byType[t] = (c.byType[t] || 0) + 1; } }
  return c;
}
function renderTiles(){
  const f = S.cfg.feat, C = counts();
  const on = NAV.filter(n => f[n.k] !== false);
  const per = on.filter(n => ['day','week','month','year'].includes(n.k));
  const pm = on.filter(n => n.k === 'players' || n.k === 'machines');
  $('#tiles').innerHTML = on.map(n => {
    let cls = 'tile lg press';
    const span = n.k === 'live' || (per.length % 2 === 1 && per[per.length - 1] === n) || (pm.length === 1 && pm[0] === n);
    if (n.k === 'live') cls += ' live';
    if (n.k === 'machines') cls += ' mach';
    if (span) cls += ' span';
    if (S.onScreen === n.k) cls += ' on';
    let inner;
    if (n.k === 'players' || n.k === 'machines'){
      const v = n.k === 'players' ? C.busy : C.free;
      inner = `<span class="ti">${ico(n.ic)}</span><span class="tt"><span class="tl" style="font-size:19px;letter-spacing:.08em;white-space:normal">${esc(n.label)}</span><span class="tv">${v}<small>${esc(tr(n.k + '_s'))}</small></span></span>`;
    } else inner = `<span class="ti">${ico(n.ic)}</span><span class="tt"><span class="tl">${esc(n.label)}</span><span class="ts">${esc(tr(n.k + '_s'))}</span></span>`;
    return `<button class="${cls}" data-k="${n.k}">${inner}<span class="tag"><i></i>${esc(tr('onScreen'))}</span>${n.k === 'machines' ? `<span class="go">${ico('chev')}</span>` : ''}</button>`;
  }).join('');
  const rows = 1 + Math.ceil(per.length / 2) + (pm.length ? 1 : 0) - (f.live === false ? 1 : 0);
  $('#tiles').style.gridTemplateRows = `repeat(${Math.max(1, rows)}, minmax(0,1fr))`;
}
function renderStatus(){
  const ok = Date.now() - S.tvSeen < 65000;
  $('#status').innerHTML = `<i class="dot${ok ? ' ok' : ''}"></i>${ico('tv', 'tv')}<span>${esc(tr('bigScreen'))}</span><b>${esc(S.onScreen ? labelOf(S.onScreen) : tr('autoRot'))}</b>`;
}
function navTo(k){
  S.onScreen = k; S.onScreenAt = Date.now();
  Link.send(k);
  renderTiles(); renderStatus();
  if (k === 'machines'){ openMap(); toast(`${ico('tv')}<span>${esc(tr('sentMap'))}</span>`); }
  else toast(`${ico('tv')}<span>${esc(tr('sent'))}: <b>${esc(labelOf(k))}</b></span>`);
}
$('#tiles').addEventListener('click', e => { const b = e.target.closest('.tile'); if (b) navTo(b.dataset.k); });
let toastT;
function toast(html){ const t = $('#toast'); t.innerHTML = html; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 3200); }
function toastAdmin(msg, err){
  const m = $('#shMsg');
  if (S.sheetOpen && m){ m.textContent = msg; m.className = 'msg' + (err ? ' err' : ' ok'); }
  else toast(`${ico(err ? 'alert' : 'check')}<span>${esc(msg)}</span>`);
}
function tickClock(){ const d = new Date(); $('#clkT').textContent = pad2(d.getHours()) + ':' + pad2(d.getMinutes()); $('#clkD').textContent = longDate(d); }

/* ================= MAP ================= */
const msvg = $('#msvg');
let VB = { x:-10, y:-70, w:2070, h:1180 };
const BOX = { all:{ x0:14, y0:-66, x1:2046, y1:1102 }, 1:{ x0:14, y0:-66, x1:1500, y1:1070 }, 2:{ x0:1515, y0:-66, x1:2046, y1:1070 } };
const curBox = () => BOX[S.mapFloor] || BOX.all;
function setVB(v){ VB = v; msvg.setAttribute('viewBox', `${r1(v.x)} ${r1(v.y)} ${r1(v.w)} ${r1(v.h)}`); }
function fitBox(b, pad){
  const r = msvg.getBoundingClientRect(); const ar = r.width && r.height ? r.width / r.height : 2;
  let w = b.x1 - b.x0 + 2*pad, h = b.y1 - b.y0 + 2*pad;
  if (w / h > ar) h = w / ar; else w = h * ar;
  const minW = 760; if (w < minW){ w = minW; h = w / ar; }
  return { x:(b.x0 + b.x1)/2 - w/2, y:(b.y0 + b.y1)/2 - h/2, w, h };
}
let vbAnim = 0;
function animVB(to, ms){
  const from = { ...VB }, t0 = performance.now(), id = ++vbAnim; ms = ms || 650;
  const step = t => { if (id !== vbAnim) return; const k = Math.min(1, (t - t0)/ms), e = 1 - Math.pow(1 - k, 3);
    setVB({ x:from.x + (to.x-from.x)*e, y:from.y + (to.y-from.y)*e, w:from.w + (to.w-from.w)*e, h:from.h + (to.h-from.h)*e }); if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function zoomAt(p, f){
  const w = Math.max(360, Math.min(2800, VB.w * f)), k = w / VB.w, h = VB.h * k;
  animVB({ x:p.x - (p.x - VB.x)*k, y:p.y - (p.y - VB.y)*k, w, h }, 380);
}
function buildMapStatic(){ $('#mStatic').innerHTML = svgStatic(); }
function renderMapMachines(){
  $('#mMach').innerHTML = svgMachines();
  msvg.classList.toggle('nodots', !S.cfg.feat.seatDots);
  $('#mDots').style.display = S.cfg.feat.seatDots ? '' : 'none';
  markMap();
}
function markMap(){
  const t = S.mapType;
  msvg.querySelectorAll('#mBodies .m').forEach(g => {
    const m = MBY[g.dataset.id];
    g.classList.toggle('dim', t !== 'all' && machineType(m) !== t && !S.editMap);
    g.classList.toggle('tsel', S.sel === m.id);
  });
}
function renderYou(){
  const g = S.cfg.map.gm;
  $('#mYou').innerHTML = `<g class="you" transform="translate(${g.x} ${g.y})" pointer-events="none"><circle class="p" r="42"/><circle class="c" r="14"/><path class="tri" d="M-11 -38L11 -38L0 -25Z"/><rect x="-104" y="-82" width="208" height="44" rx="22"/><text y="-53">${esc(tr('youHere'))}</text></g>`;
}
const MBY = Object.fromEntries(MACH.map(m => [m.id, m]));
const ZCENT = {};
for (const z of Object.keys(ZONES)){ const ms = MACH.filter(m => m.z === z); ZCENT[z] = { x:ms.reduce((a, m) => a + m.x, 0)/ms.length, y:ms.reduce((a, m) => a + m.y, 0)/ms.length }; }
const mColor = m => ZC[m.c || ZONES[m.z].c];
function openMap(){
  S.mapOpen = true; S.sel = null; S.plan = null;
  $('#mapov').hidden = false;
  if (!$('#mStatic').firstChild) buildMapStatic();
  renderMapMachines(); renderYou(); $('#mRoute').innerHTML = ''; stopComet();
  renderMapPanel(); renderMapTip();
  requestAnimationFrame(() => setVB(fitBox(curBox(), 0)));
}
function closeMap(){
  S.mapOpen = false; S.sel = null; S.plan = null; S.editMap = false; S.setPos = false; stopComet();
  $('#mapov').hidden = true; $('#editbar').hidden = true;
  if (S.onScreen === 'machines'){ S.onScreen = null; Link.send('auto'); renderTiles(); renderStatus(); }
}
function floorSegHTML(){
  return [['all', tr('bothFloors')], ['1', tr('f1')], ['2', tr('f2')]].map(([k, l]) => `<button data-floor="${k}" class="${String(S.mapFloor) === k ? 'on' : ''}">${esc(l)}</button>`).join('');
}
function renderFloorSeg(){}
function renderMapTip(){
  const tip = $('#maptip');
  const txt = S.setPos ? tr('posHint') : S.editMap ? tr('editHint') : S.sel ? tr('follow') : tr('map_s');
  tip.innerHTML = `${ico(S.sel ? 'route' : 'hand')}${esc(txt)}`;
  tip.hidden = S.editMap || S.setPos;
  const eb = $('#editbar');
  eb.hidden = !(S.editMap || S.setPos);
  if (!eb.hidden){
    const C = counts();
    eb.innerHTML = S.setPos ? `<span>${esc(tr('posHint'))}</span><span class="sp"></span><button class="pill lg press" data-act="endEdit">${esc('Huỷ')}</button>`
      : `<span>Chế độ nhân viên · chạm vào máy để đổi: Trống → Đang chơi → Đã đặt → Bảo trì</span><span class="sp"></span><span style="font-variant-numeric:tabular-nums">${C.free} trống · ${C.busy} chơi</span><button class="pill lg press gold" data-act="endEdit">${ico('check')}Xong</button>`;
  }
}
function zonesSorted(){
  const g = S.cfg.map.gm;
  return Object.keys(ZONES).sort((a, b) => {
    const d = z => Math.hypot(ZCENT[z].x - g.x, ZCENT[z].y - g.y) + (ZONES[z].f === 2 ? 900 : 0);
    return d(a) - d(b);
  });
}
function renderMapPanel(){
  const mp = $('#mp');
  if (S.sel && S.plan){ mp.innerHTML = routeCardHTML(); return; }
  const C = counts();
  const typeSeg = ['all', ...TYPES].map(t => `<button data-type="${t}" class="${S.mapType === t ? 'on' : ''}">${esc(tr('t_' + t))} <small>${t === 'all' ? C.free : (C.byType[t] || 0)}</small></button>`).join('');
  let groups = '';
  for (const z of zonesSorted()){
    const Z = ZONES[z];
    if (S.mapFloor !== 'all' && String(Z.f) !== String(S.mapFloor)) continue;
    const ms = MACH.filter(m => m.z === z && machineStatus(m.id) === 'free' && (S.mapType === 'all' || machineType(m) === S.mapType)).sort((a, b) => +a.id - +b.id);
    if (!ms.length) continue;
    groups += `<div class="zg"><h5><i style="background:${ZC[Z.c]}"></i>${esc(z)} · ${esc(tr('f' + Z.f))}<em>${ms.length} ${esc(tr('free'))}</em></h5><div class="mps">${ms.map(m => `<button class="mpill press" style="--zc:${mColor(m)}" data-mid="${m.id}">${m.id}</button>`).join('')}</div></div>`;
  }
  mp.innerHTML = `<div class="mp-h"><button class="pill lg press back" data-act="closeMap">${ico('back')}${esc(tr('back'))}</button><div class="ttl"><b>${esc(tr('map_t'))}</b><span>${C.free} ${esc(tr('free'))} · ${C.busy} ${esc(tr('l_busy').toLowerCase())}</span></div></div>
    <div class="mp-f"><div class="seg">${typeSeg}</div><div class="seg">${floorSegHTML()}</div></div>
    <div class="mlist">${groups || `<p class="note">${esc(tr('noFree'))}</p>`}</div>
    <div class="legend"><span><i></i>${esc(tr('l_free'))}</span><span><i class="b"></i>${esc(tr('l_busy'))}</span><span><i class="r"></i>${esc(tr('l_resv'))}</span><span><i class="o"></i>${esc(tr('l_off'))}</span><span><b class="p"></b>${esc(tr('player'))}</span></div>`;
}
function planRoute(m){
  const start = S.cfg.map.gm, seat = seatPoint(m), f = ZONES[m.z].f;
  if (f === 1){ const p = findPath(start, seat); return { m, legs:p ? [p] : [], ok:!!p, len:p ? pathLen(p) : 0, l1:p ? pathLen(p) : 0, f2:false }; }
  const st = STAIRS[S.cfg.map.stair] || STAIRS.B;
  const p1 = findPath(start, st.f1), p2 = findPath(st.f2, seat);
  return { m, legs:[p1, p2].filter(Boolean), ok:!!(p1 && p2), len:(p1 ? pathLen(p1) : 0) + (p2 ? pathLen(p2) : 0), l1:p1 ? pathLen(p1) : 0, l2:p2 ? pathLen(p2) : 0, f2:true, st };
}
const meters = u => Math.max(1, Math.round(u * M_PER_UNIT));
function nearLandmark(m){
  const f = ZONES[m.z].f; let best = null, bd = 300;
  for (const L of LANDMARKS){ if (L.f !== f || L.k === 'gm') continue; const d = Math.hypot(L.x - m.x, L.y - m.y); if (d < bd){ bd = d; best = L; } }
  return best ? tr('st_near', { lm: tr('lm_' + best.k) }) : '';
}
function routeCardHTML(){
  const P = S.plan, m = P.m, st = machineStatus(m.id), col = mColor(m), Z = ZONES[m.z];
  const total = meters(P.len) + (P.f2 ? 6 : 0);
  const secs = Math.round(total / 1.0 + (P.f2 ? 25 : 0));
  const walk = secs < 60 ? `${secs} ${tr('sec')}` : `${Math.max(1, Math.round(secs / 60))} ${tr('min')}`;
  const near = nearLandmark(m);
  let steps = `<li><i>${ico('pin')}</i>${esc(tr('st_start'))}</li>`;
  if (P.f2){
    steps += `<li><i>${ico('walk')}</i>${esc(tr('st_walk', { m:meters(P.l1), to:tr(P.st.name) }))}</li>`;
    steps += `<li class="up"><i>${ico('up')}</i>${esc(tr('st_up', { s:tr(P.st.name) }))}</li>`;
    steps += `<li><i>${ico('walk')}</i>${esc(tr('st_f2', { m:meters(P.l2), z:m.z }))}${near ? esc(tr('sep') + near) : ''}</li>`;
  } else steps += `<li><i>${ico('walk')}</i>${esc(tr('st_walk', { m:meters(P.l1), to:tr('zone') + ' ' + m.z }))}${near ? esc(tr('sep') + near) : ''}</li>`;
  steps += `<li class="end" style="--zc:${col}"><i>${ico('machine')}</i>${esc(tr('st_end', { id:m.id }))}</li>`;
  const note = !P.ok ? `<p class="note warn">${esc(tr('noRoute'))}</p>` : st === 'busy' ? `<p class="note warn">${esc(tr('busyNote'))}</p>` : st === 'resv' ? `<p class="note warn">${esc(tr('resvNote'))}</p>` : st === 'off' ? `<p class="note warn">${esc(tr('offNote'))}</p>` : '';
  return `<div class="mp-h"><button class="pill lg press back" data-act="unsel">${ico('back')}${esc(tr('allMachines'))}</button><div class="ttl"><b>${esc(tr('directions'))}</b><span>${esc(tr('follow'))}</span></div></div>
    <div class="rc" style="grid-row:span 2">
      <div class="big"><div class="num" style="--zc:${col}">${m.id}</div><div><b>${esc(tr('t_' + machineType(m)))}</b><span>${esc(tr('zone'))} ${esc(m.z)} · ${esc(tr('f' + Z.f))}</span><span>${esc(tr('l_' + st))}</span></div></div>
      ${P.ok ? `<div class="stat"><div><small>${esc(tr('dist'))}</small><b>≈ ${total} m</b></div><div><small>${esc(tr('walk'))}</small><b>≈ ${esc(walk)}</b></div></div>` : ''}
      ${note}
      <ol class="steps">${steps}</ol>
    </div>
    <div class="mbtns"><button class="pill lg press" data-act="unsel">${esc(tr('another'))}</button><button class="pill lg press gold" data-act="closeMap">${ico('check')}${esc(tr('done'))}</button></div>`;
}
function selectMachine(id){
  const m = MBY[id]; if (!m) return;
  S.sel = id; S.plan = planRoute(m);
  drawRoute(S.plan); renderMapPanel(); markMap(); renderMapTip();
  const g = S.cfg.map.gm;
  const pts = [g, { x:g.x - 90, y:g.y - 95 }, { x:g.x + 90, y:g.y + 110 }, { x:m.x, y:m.y - 60 }, { x:m.x, y:m.y + 30 }];
  S.plan.legs.forEach(P => P.forEach(p => pts.push(p)));
  const b = { x0:Math.min(...pts.map(p => p.x)), y0:Math.min(...pts.map(p => p.y)), x1:Math.max(...pts.map(p => p.x)), y1:Math.max(...pts.map(p => p.y)) };
  animVB(fitBox(b, 90));
}
function drawRoute(P){
  const m = P.m; let s = '';
  if (P.ok){
    P.legs.forEach((L, i) => { const d = roundedPath(L, 24); s += `<path class="route-bg" d="${d}"/><path class="route rl" data-leg="${i}" d="${d}"/>${S.cfg.feat.routeAnim ? `<path class="route-dash" d="${d}"/>` : ''}`; });
    if (P.f2){
      const a = P.st.f1, b = P.st.f2, cx = (a.x + b.x)/2, cy = Math.min(a.y, b.y) - 170;
      const lx = .25*a.x + .5*cx + .25*b.x, ly = .25*a.y + .5*cy + .25*b.y;
      s += `<path class="hop" d="M${a.x} ${a.y}Q${r1(cx)} ${r1(cy)} ${b.x} ${b.y}"/><g class="hop-l" transform="translate(${r1(lx)} ${r1(ly)})"><rect x="-104" y="-24" width="208" height="44" rx="22"/><text y="6">${esc(tr('upTo2'))}</text></g>`;
    }
  } else {
    const g = S.cfg.map.gm; s += `<path class="hop" d="M${g.x} ${g.y}L${r1(m.x)} ${r1(m.y)}"/>`;
  }
  s += `<g transform="translate(${r1(m.x)} ${r1(m.y)}) rotate(${r1(m.rot)})"><rect class="tgt-ring" x="${-m.w/2-6}" y="${-m.h/2-6}" width="${m.w+12}" height="${m.h+12}" rx="11"/></g>`;
  const ly = m.y - Math.max(m.w, m.h)/2 - 32;
  s += `<g class="dest" transform="translate(${r1(m.x)} ${r1(ly)})"><rect x="-46" y="-23" width="92" height="42" rx="21"/><text y="6">${m.id}</text></g>`;
  if (P.ok && S.cfg.feat.routeAnim) s += `<circle class="comet" id="comet" r="10" cx="${S.cfg.map.gm.x}" cy="${S.cfg.map.gm.y}"/>`;
  $('#mRoute').innerHTML = s;
  startComet();
}
let cometId = 0;
function stopComet(){ cometId++; }
function startComet(){
  const id = ++cometId;
  const c = $('#comet'); if (!c) return;
  const legs = [...msvg.querySelectorAll('#mRoute .rl')];
  const lens = legs.map(p => p.getTotalLength()), total = lens.reduce((a, b) => a + b, 0);
  if (!total) return;
  const dur = Math.max(2600, total / 0.32), pause = 900; let t0 = performance.now();
  const step = t => {
    if (id !== cometId || !c.isConnected) return;
    let k = (t - t0) / dur;
    if (k > 1 + pause/dur){ t0 = t; k = 0; }
    let d = Math.min(1, k) * total, i = 0;
    while (i < legs.length - 1 && d > lens[i]){ d -= lens[i]; i++; }
    const p = legs[i].getPointAtLength(Math.min(d, lens[i]));
    c.setAttribute('cx', r1(p.x)); c.setAttribute('cy', r1(p.y));
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
function unselect(){
  S.sel = null; S.plan = null; stopComet(); $('#mRoute').innerHTML = '';
  renderMapPanel(); markMap(); renderMapTip();
  animVB(fitBox(curBox(), 0));
}
const CYCLE = { free:'busy', busy:'resv', resv:'off', off:'free' };
function cycleStatus(m){
  const next = CYCLE[machineStatus(m.id)] || 'free';
  saveMachStatus(m.id, next);
  renderMapMachines(); renderMapTip(); renderTiles();
}
/* pan / pinch / tap */
const ptrs = new Map(); let drag = null, pinch = null;
function svgPt(cx, cy){ const p = msvg.createSVGPoint(); p.x = cx; p.y = cy; return p.matrixTransform(msvg.getScreenCTM().inverse()); }
msvg.addEventListener('pointerdown', e => {
  try { msvg.setPointerCapture(e.pointerId); } catch {}
  ptrs.set(e.pointerId, { x:e.clientX, y:e.clientY });
  vbAnim++;
  if (ptrs.size === 1){ drag = { x:e.clientX, y:e.clientY, vb:{ ...VB }, moved:false }; pinch = null; }
  else if (ptrs.size === 2){
    const [a, b] = [...ptrs.values()];
    pinch = { d:Math.hypot(a.x - b.x, a.y - b.y), vb:{ ...VB }, c:svgPt((a.x + b.x)/2, (a.y + b.y)/2) };
    if (drag) drag.moved = true;
  }
});
msvg.addEventListener('pointermove', e => {
  if (!ptrs.has(e.pointerId)) return;
  ptrs.set(e.pointerId, { x:e.clientX, y:e.clientY });
  const r = msvg.getBoundingClientRect(), upp = VB.w / r.width;
  if (pinch && ptrs.size >= 2){
    const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
    const k = Math.max(360, Math.min(2800, pinch.vb.w * pinch.d / d)) / pinch.vb.w;
    setVB({ x:pinch.c.x - (pinch.c.x - pinch.vb.x)*k, y:pinch.c.y - (pinch.c.y - pinch.vb.y)*k, w:pinch.vb.w*k, h:pinch.vb.h*k });
    return;
  }
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (!drag.moved && Math.hypot(dx, dy) > 9) drag.moved = true;
  if (drag.moved) setVB({ x:drag.vb.x - dx*upp, y:drag.vb.y - dy*upp, w:VB.w, h:VB.h });
});
function endPtr(e){
  if (!ptrs.has(e.pointerId)) return;
  const wasTap = drag && !drag.moved && ptrs.size === 1 && e.type === 'pointerup';
  ptrs.delete(e.pointerId);
  if (wasTap) mapTap(e);
  if (!ptrs.size){ drag = null; pinch = null; }
}
msvg.addEventListener('pointerup', endPtr); msvg.addEventListener('pointercancel', endPtr);
msvg.addEventListener('wheel', e => { e.preventDefault(); zoomAt(svgPt(e.clientX, e.clientY), e.deltaY > 0 ? 1.25 : 0.8); }, { passive:false });
function mapTap(e){
  const p = svgPt(e.clientX, e.clientY);
  if (S.setPos){ S.cfg.map.gm = { x:Math.round(p.x), y:Math.round(p.y) }; saveCfg(); S.setPos = false; renderYou(); renderMapTip(); toastAdmin('Đã cập nhật vị trí bàn GM.'); if (S.sheetOpen) renderSheet(); return; }
  const r = msvg.getBoundingClientRect(), upx = r.width / VB.w, R = Math.max(26, 30 / upx);
  let best = null, bd = R*R;
  for (const m of MACH){ const dx = m.x - p.x, dy = m.y - p.y, d = dx*dx + dy*dy; if (d < bd){ bd = d; best = m; } }
  if (best){ if (S.editMap) cycleStatus(best); else selectMachine(best.id); return; }
  if (!S.editMap && VB.w > 900) zoomAt(p, .5);
}
$('#zIn').addEventListener('click', () => zoomAt({ x:VB.x + VB.w/2, y:VB.y + VB.h/2 }, .7));
$('#zOut').addEventListener('click', () => zoomAt({ x:VB.x + VB.w/2, y:VB.y + VB.h/2 }, 1.4));
$('#zFit').addEventListener('click', () => animVB(fitBox(curBox(), 0)));
$('#zLang').addEventListener('click', openLang);
$('#mapov').addEventListener('click', e => {
  const a = e.target.closest('[data-act]');
  if (a){ const k = a.dataset.act;
    if (k === 'closeMap') return closeMap();
    if (k === 'unsel') return unselect();
    if (k === 'endEdit'){ S.editMap = false; S.setPos = false; flushMach(); renderMapMachines(); renderMapTip(); renderMapPanel(); if (S.sheetOpen) renderSheet(); return; }
  }
  const t = e.target.closest('[data-type]'); if (t){ S.mapType = t.dataset.type; renderMapPanel(); markMap(); return; }
  const fl = e.target.closest('[data-floor]'); if (fl){ S.mapFloor = fl.dataset.floor === 'all' ? 'all' : fl.dataset.floor; renderMapPanel(); animVB(fitBox(curBox(), 0)); return; }
  const mp = e.target.closest('[data-mid]'); if (mp) selectMachine(mp.dataset.mid);
});

/* ================= IDLE LOOP + INACTIVITY ================= */
function frameLoop(t){
  const visible = S.view === 'idle' && !S.detail && !S.mapOpen && S.idleList.length > 1;
  if (visible){
    const dur = S.cfg.idle.interval * 1000, p = (t - S.slideAt) / dur;
    const pg = document.querySelector('#hero .slide:last-of-type .prog i'); if (pg) pg.style.width = Math.min(100, p * 100) + '%';
    if (p >= 1){ S.slide = (S.slide + 1) % S.idleList.length; S.slideAt = t; paintHero(true); paintNext(); }
  } else S.slideAt = t;
  requestAnimationFrame(frameLoop);
}
['pointerdown','keydown','wheel'].forEach(ev => addEventListener(ev, () => { S.lastAct = Date.now(); }, { passive:true, capture:true }));
function resetToIdle(){
  if (S.mapOpen) closeMap();
  $('#langpop').hidden = true;
  if (S.glang) setLang(null);
  S.detail = null; S.filter = 'all';
  if (S.view !== 'idle') setView('idle'); else renderDetail();
}
setInterval(() => {
  const now = Date.now();
  if (S.onScreen && now - S.onScreenAt > S.cfg.hold * 1000){ S.onScreen = null; Link.send('auto'); renderTiles(); renderStatus(); }
  const busyStaff = S.sheetOpen || S.editMap || S.setPos || !$('#pinov').hidden;
  if (!busyStaff && now - S.lastAct > S.cfg.timeout * 1000 && (S.mapOpen || S.view !== 'idle' || S.detail || S.glang || !$('#langpop').hidden)) resetToIdle();
}, 1000);
setInterval(() => { tickClock(); renderBoard(false); }, 15000);
