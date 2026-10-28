'use strict';
const $ = s => document.querySelector(s);
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const ico = (n, cls) => `<svg class="i${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const pad2 = n => String(n).padStart(2, '0');
const HOUR = 36e5, DAY = 864e5;
const clone = o => JSON.parse(JSON.stringify(o));
const ls = {
  get(k, d){ try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k){ try { localStorage.removeItem(k); } catch {} },
};
function deepMerge(base, add){
  if (!add || typeof add !== 'object' || Array.isArray(add)) return base;
  for (const [k, v] of Object.entries(add)){
    if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) deepMerge(base[k], v);
    else if (v !== undefined) base[k] = v;
  }
  return base;
}

let LANG = 'en';
const tr = (k, vars) => {
  let s = (STR[LANG] && STR[LANG][k] != null) ? STR[LANG][k] : (STR.en[k] != null ? STR.en[k] : k);
  if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace('{' + a + '}', b);
  return s;
};
const trMap = s => tr(s);
const NAV = [
  { k:'live', label:'Live', ic:'live' }, { k:'day', label:'Day', ic:'day' }, { k:'week', label:'Week', ic:'week' },
  { k:'month', label:'Month', ic:'month' }, { k:'year', label:'Year', ic:'year' },
  { k:'players', label:'Active Players', ic:'players' }, { k:'machines', label:'Machines Available', ic:'machine' },
];
const CAT = {
  event:{ ic:'party', pg:'linear-gradient(135deg,#9a68c6,#43295c)' },
  promo:{ ic:'gift', pg:'linear-gradient(135deg,#f3cd68,#b27718)' },
  tournament:{ ic:'trophy', pg:'linear-gradient(135deg,#8a6c4c,#2e231a)' },
  jackpot:{ ic:'diamond', pg:'linear-gradient(135deg,#d0472c,#5d1407)' },
  service:{ ic:'coffee', pg:'linear-gradient(135deg,#3ea676,#1b4d37)' },
  notice:{ ic:'megaphone', pg:'linear-gradient(135deg,#71819a,#323b4a)' },
};
const CAT_KEYS = Object.keys(CAT);
const TYPES = ['slot','roulette','baccarat'];

/* ================= SETTINGS ================= */
const DEF = {
  lang:'en',
  idle:{ source:'smart', layout:'hero', interval:8, ticker:true, greet:'', sub:'', newHours:48, hint:true },
  look:{ theme:'match', bg:{ type:'animated', preset:'champagne', color:'#efe7da', c1:'#fbf6ec', c2:'#e6d5b8', angle:160, tone:'light', img:'', imgType:'', overlay:.15 } },
  feat:{ live:true, day:true, week:true, month:true, year:true, players:true, machines:true, routeAnim:true, seatDots:true, rules:true, langSwitch:true },
  hold:60, timeout:60,
  map:{ gm:{ x:START_DEFAULT_X(), y:START_DEFAULT_Y() }, stair:'B' },
  link:{ url:'', webhook:'' },
};
function START_DEFAULT_X(){ return 552; }
function START_DEFAULT_Y(){ return 912; }
function mergeCfg(d){
  const c = deepMerge(clone(DEF), d || {});
  if (!LANG_CODES.includes(c.lang)) c.lang = 'en';
  if (c.map && c.map.gm && c.map.gm.x === 1116 && c.map.gm.y === 808) c.map.gm = { x:552, y:912 };
  return c;
}

/* ================= STATE ================= */
const S = {
  db:null, mode:'connecting', canWrite:null, assets:null,
  anns:[], rules:[], cfg:null, mach:{ st:{}, zones:{} }, glang:null, sample:null, redit:null,
  view:'idle', filter:'all', slide:0, slideAt:performance.now(), idleList:[], detail:null, detailList:[],
  mapOpen:false, mapFloor:'all', mapType:'all', sel:null, editMap:false, setPos:false,
  onScreen:null, onScreenAt:0, tvSeen:0, lastAct:Date.now(), scale:1,
  tab:'ann', edit:null, sheetOpen:false,
};
const machineStatus = id => S.mach.st[id] || SEED_STATUS[id] || 'free';
const machineType = m => (S.mach.zones[m.z] && S.mach.zones[m.z].type) || ZONES[m.z].type;
const zoneName = z => z;
const GM_DEFAULT = { x:552, y:912 };

/* ================= STORE =================
   Shared store (db capability) when the page runs inside Claude; otherwise a local store in this browser. */
function localDb(){
  const KEY = 'vgn.store.v1';
  let data = ls.get(KEY, null);
  if (!data){
    data = {};
    sampleAnns(Date.now()).forEach((a, i) => { data['ann/s' + (i+1)] = a; });
    sampleRules(Date.now()).forEach((r, i) => { data['rules/r' + (i+1)] = r; });
    if (SEED_KIOSK) data['config/kiosk'] = clone(SEED_KIOSK);
    if (SEED_MACH) data['config/machines'] = clone(SEED_MACH);
  }
  const subs = new Set();
  const save = () => ls.set(KEY, data);
  const fire = () => subs.forEach(f => { try { f(); } catch (e) { console.error(e); } });
  addEventListener('storage', e => { if (e.key === KEY){ data = ls.get(KEY, {}) || {}; fire(); } });
  const snap = p => ({ id:p.split('/').pop(), exists: data[p] != null, data: () => data[p] ? clone(data[p]) : undefined, metadata:{ fromCache:false, hasPendingWrites:false } });
  const docRef = p => ({
    id:p.split('/').pop(), path:p,
    get: async () => snap(p),
    set: async v => { data[p] = clone(v); save(); fire(); },
    update: async v => { if (!data[p]) throw { code:'invalid_argument', message:'missing' }; data[p] = deepMerge(data[p], clone(v)); save(); fire(); },
    delete: async () => { delete data[p]; save(); fire(); },
    onSnapshot(fn){ const f = () => fn(snap(p)); subs.add(f); setTimeout(f, 0); return () => subs.delete(f); },
  });
  const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  return {
    dump: () => clone(data),
    load(d){ data = d && typeof d === 'object' ? clone(d) : {}; save(); fire(); },
    doc: docRef,
    collection(c){
      const q = () => { const docs = Object.keys(data).filter(k => k.startsWith(c + '/') && k.split('/').length === c.split('/').length + 1).sort().map(snap); return { docs, size:docs.length, empty:!docs.length, metadata:{ fromCache:false } }; };
      return { path:c, doc: id => docRef(c + '/' + (id || rid())), limit(){ return this; }, onSnapshot(fn){ const f = () => fn(q()); subs.add(f); setTimeout(f, 0); return () => subs.delete(f); }, get: async () => q() };
    },
  };
}
/* one write at a time per document */
const chains = {};
function queued(path, fn){
  const run = (chains[path] || Promise.resolve()).catch(() => {}).then(fn);
  chains[path] = run;
  return run;
}
async function withRetry(fn){
  try { return await fn(); }
  catch (e){ if (e && e.code === 'unavailable'){ await new Promise(r => setTimeout(r, 400 + Math.random()*600)); return fn(); } throw e; }
}
function errText(e){
  const c = e && e.code;
  if (c === 'invalid_argument') return 'Bạn không có quyền lưu thay đổi, hoặc dữ liệu không hợp lệ.';
  if (c === 'quota_exceeded') return 'Bộ nhớ dữ liệu đã đầy. Hãy xoá bớt thông báo cũ hoặc ảnh lớn rồi thử lại.';
  if (c === 'resource_exhausted') return 'Thao tác quá nhanh. Đợi vài giây rồi thử lại.';
  if (c === 'revoked') return 'Quyền truy cập đã thay đổi. Hãy tải lại trang.';
  return 'Không lưu được. Kiểm tra kết nối rồi thử lại.';
}
let cfgTimer = null, cfgDirty = false;
function saveCfg(){
  if (!S.db) return;
  cfgDirty = true;
  clearTimeout(cfgTimer);
  cfgTimer = setTimeout(() => {
    const body = clone(S.cfg);
    queued('config/kiosk', () => withRetry(() => S.db.doc('config/kiosk').set(body)))
      .then(() => { cfgDirty = false; })
      .catch(e => { cfgDirty = false; toastAdmin(errText(e), true); });
  }, 450);
}
let machPending = {}, machTimer = null;
function saveMachStatus(id, st){
  machPending[id] = st; S.mach.st[id] = st;
  clearTimeout(machTimer);
  machTimer = setTimeout(flushMach, 600);
}
function flushMach(patch){
  if (!S.db) return Promise.resolve();
  const st = machPending; machPending = {};
  const body = patch || { st };
  return queued('config/machines', async () => {
    const ref = S.db.doc('config/machines');
    try { await withRetry(() => ref.update(body)); }
    catch (e){
      if (e && (e.code === 'invalid_argument' || e.code === 'transform_error')){
        const cur = await ref.get();
        if (!cur.exists){ await ref.set(deepMerge({ st:{}, zones:{} }, body)); return; }
      }
      throw e;
    }
  }).catch(e => toastAdmin(errText(e), true));
}
function setMachAll(body){ return queued('config/machines', () => withRetry(() => S.db.doc('config/machines').set(body))).catch(e => toastAdmin(errText(e), true)); }

