/* ================= STAFF SETTINGS ================= */
const TABS = [['ann','Thông báo'],['rules','Quy định CLB'],['idle','Màn hình chờ'],['look','Giao diện'],['feat','Tính năng'],['map','Bản đồ & máy'],['tv','Kết nối Dashboard']];
const CAT_VI = { event:'Sự kiện', promo:'Khuyến mãi', tournament:'Giải đấu', jackpot:'Jackpot', service:'Dịch vụ', notice:'Thông tin' };
const PRIO_VI = { normal:'Bình thường', featured:'Nổi bật', urgent:'Khẩn cấp' };
const TYPE_VI = { slot:'Slot', roulette:'Roulette', baccarat:'Baccarat' };
const opt = (on, attrs, label) => `<button class="opt${on ? ' on' : ''}" ${attrs}>${esc(label)}</button>`;
const tog = (on, attrs) => `<button class="tog${on ? ' on' : ''}" role="switch" aria-checked="${!!on}" ${attrs}></button>`;
const swRow = (label, small, on, attrs) => `<div class="sw"><span>${esc(label)}${small ? `<small>${esc(small)}</small>` : ''}</span>${tog(on, attrs)}</div>`;
const getPath = (o, p) => p.split('.').reduce((a, k) => a == null ? a : a[k], o);
function setPath(o, p, v){ const ks = p.split('.'); let t = o; ks.slice(0, -1).forEach(k => { if (!t[k] || typeof t[k] !== 'object') t[k] = {}; t = t[k]; }); t[ks[ks.length - 1]] = v; }
const toLocal = ts => { if (!ts) return ''; const d = new Date(ts); return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const fromLocal = s => { if (!s) return null; const t = new Date(s).getTime(); return isFinite(t) ? t : null; };
const fmtAdmin = ts => { const d = new Date(ts); return `${pad2(d.getDate())}/${pad2(d.getMonth()+1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; };
const RO = () => S.canWrite === false;
const LANG_VI = { en:'English', ko:'한국어', vi:'Tiếng Việt', zh:'中文', ja:'日本語' };
/* per-language content editing: 'base' is the default text shown when a language has no translation */
const fv = (ed, f) => { const c = ed.lang || 'base'; if (c === 'base') return ed.d[f] || ''; return (ed.d.tr && ed.d.tr[c] && ed.d.tr[c][f]) || ''; };
const fph = (ed, f, ph) => (ed.lang && ed.lang !== 'base') ? (ed.d[f] || ph) : ph;
function setField(ed, f, v){ const c = ed.lang || 'base'; if (c === 'base'){ ed.d[f] = v; return; } ed.d.tr = ed.d.tr || {}; ed.d.tr[c] = ed.d.tr[c] || {}; ed.d.tr[c][f] = v; }
function langTabs(ed, fields){
  const d = ed.d, cur = ed.lang || 'base';
  const has = c => d.tr && d.tr[c] && fields.some(f => d.tr[c][f] && String(d.tr[c][f]).trim());
  return `<div class="fld"><label>Ngôn ngữ nội dung</label><div class="ltabs">${[['base','Mặc định']].concat(LANG_CODES.map(c => [c, LANG_VI[c]])).map(([c, l]) => `<button class="${cur === c ? 'on' : ''}" data-elang="${c}">${esc(l)}${c === 'base' ? '' : `<i class="${has(c) ? '' : 'no'}"></i>`}</button>`).join('')}</div>
    <span class="hint2">${cur === 'base' ? 'Nội dung mặc định hiện cho mọi ngôn ngữ chưa có bản dịch (chấm xanh = đã có bản dịch).' : `Bản dịch ${esc(LANG_VI[cur])}. Ô nào để trống sẽ dùng nội dung mặc định.`}</span>
    ${S.sample ? `<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button class="sbtn" data-a="autoTr"${RO() ? ' disabled' : ''}>${ico('translate')}Tự dịch sang 5 ngôn ngữ bằng Claude</button><span class="msg" id="trMsg"></span></div>` : ''}</div>`;
}
const trCodes = o => LANG_CODES.filter(c => o.tr && o.tr[c] && Object.values(o.tr[c]).some(v => v && String(v).trim())).map(c => c.toUpperCase());
function sampleErr(e){
  const c = e && e.code;
  if (c === 'not_granted') return 'Trang chưa được phép dùng Claude để dịch. Cho phép khi được hỏi, hoặc tự nhập bản dịch.';
  if (c === 'rate_limited') return 'Claude đang bận. Đợi một lúc rồi bấm dịch lại.';
  if (c === 'invalid_json') return 'Kết quả dịch không đọc được. Bấm dịch lại, hoặc rút ngắn nội dung.';
  return (e && e.message && !e.code) ? e.message : 'Không dịch được lúc này. Bạn có thể tự nhập bản dịch.';
}
async function autoTranslate(ed, fields){
  const src = {}; fields.forEach(f => { src[f] = ed.d[f] || ''; });
  if (!String(src.title || '').trim()) throw new Error('Nhập nội dung mặc định (ít nhất là tiêu đề) trước khi dịch.');
  const shape = '{' + fields.map(f => `"${f}":""`).join(',') + '}';
  const prompt = `Translate this text from a gaming club's guest information screen into English (en), Korean (ko), Vietnamese (vi), Simplified Chinese (zh) and Japanese (ja).\nKeep machine numbers, zone codes such as BK07, times, dates, amounts and brand names exactly as written. Keep line breaks and bullet characters. Use a clear, polite tone for guests. Leave a field empty when the source field is empty.\nReply with only JSON shaped like {"en":${shape},"ko":${shape},"vi":${shape},"zh":${shape},"ja":${shape}}.\n\nSource JSON:\n${JSON.stringify(src)}`;
  const out = await S.sample.json(prompt, { modelTier:'default' });
  if (!out || typeof out !== 'object') throw new Error('Kết quả dịch không hợp lệ.');
  ed.d.tr = ed.d.tr || {}; let n = 0;
  for (const c of LANG_CODES){
    const t = out[c]; if (!t || typeof t !== 'object') continue;
    ed.d.tr[c] = {}; fields.forEach(f => { if (typeof t[f] === 'string') ed.d.tr[c][f] = t[f].slice(0, f === 'body' ? 2000 : 200); }); n++;
  }
  return n;
}

function openSheet(){ S.sheetOpen = true; $('#scrim').hidden = false; $('#sheet').hidden = false; renderTabs(); renderSheet(); }
function closeSheet(){
  if (S.edit) syncDraft();
  if (S.redit) syncRule();
  S.sheetOpen = false; $('#scrim').hidden = true; $('#sheet').hidden = true;
  if (location.hash) try { history.replaceState(null, '', location.pathname + location.search); } catch {}
}
function guardedOpen(){ const pin = ls.get('vgn.pin', ''); if (!pin) return openSheet(); showPin(String(pin)); }
function renderTabs(){ $('#stabs').innerHTML = TABS.map(([k, l]) => `<button class="${S.tab === k ? 'on' : ''}" data-tab="${k}" role="tab" aria-selected="${S.tab === k}">${esc(l)}</button>`).join(''); }
$('#stabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (!b) return; if (S.edit) syncDraft(); if (S.redit) syncRule(); S.tab = b.dataset.tab; renderTabs(); renderSheet(); $('#shBody').scrollTop = 0; });
$('#shClose').addEventListener('click', closeSheet);
$('#scrim').addEventListener('click', closeSheet);

function banner(){
  let s = '';
  if (S.mode === 'local') s += `<div class="banner">Chế độ cục bộ: dữ liệu lưu trong trình duyệt của máy này. Dùng "Sao lưu dữ liệu" ở tab Tính năng để chuyển thông báo và cài đặt sang máy khác.</div>`;
  if (S.mode === 'connecting') s += `<div class="banner">Đang kết nối dữ liệu…</div>`;
  if (RO()) s += `<div class="banner err">Bạn chỉ có quyền xem. Nhờ chủ sở hữu cấp quyền Contributor trở lên để lưu thay đổi.</div>`;
  return s + `<p class="msg" id="shMsg" aria-live="polite"></p>`;
}
function rangeAdmin(a){ return `${a.start ? fmtAdmin(a.start) : 'Ngay'} → ${a.end ? fmtAdmin(a.end) : 'Không hết hạn'}`; }
function annRow(a){
  const st = annState(a, Date.now());
  return `<div class="arow${st === 'off' || st === 'expired' ? ' offr' : ''}"><div class="th">${picHTML(a)}</div><div style="min-width:0"><b>${esc(a.title)}</b><small>${a.prio !== 'normal' ? `<span class="mini ${a.prio === 'urgent' ? 'u' : 'f'}">${esc(PRIO_VI[a.prio])}</span>` : ''}${isNew(a) && st === 'live' ? '<span class="mini n">Mới</span>' : ''}<span class="mini">${esc(CAT_VI[a.cat] || 'Thông tin')}</span>${a.sample ? '<span class="mini">Mẫu</span>' : ''}<span>${esc(rangeAdmin(a))}</span><span>${trCodes(a).length ? 'Dịch: ' + trCodes(a).join(' · ') : 'Chưa dịch'}</span></small></div>
    <div class="acts">${tog(a.on !== false, `data-a="togAnn" data-id="${esc(a.id)}" aria-label="Bật/tắt"${RO() ? ' disabled' : ''}`)}<button class="sbtn ic" data-a="editAnn" data-id="${esc(a.id)}" aria-label="Sửa">${ico('edit')}</button><button class="sbtn ic red" data-a="delAnn" data-id="${esc(a.id)}" aria-label="Xoá"${RO() ? ' disabled' : ''}>${ico('trash')}</button></div></div>`;
}
function tabAnn(){
  if (S.edit) return annForm();
  const now = Date.now(), G = { live:[], scheduled:[], off:[], expired:[] };
  sortAnns(S.anns).forEach(a => G[annState(a, now)].push(a));
  const sec = (k, title, extra) => G[k].length ? `<div class="grp"><div class="sec-t"><span>${esc(title)} · ${G[k].length}</span>${extra || ''}</div><div class="alist">${G[k].map(annRow).join('')}</div></div>` : '';
  return `<section>${banner()}
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="sbtn gold" data-a="newAnn"${RO() ? ' disabled' : ''}>${ico('plus')}Thêm thông báo</button><button class="sbtn" data-a="addSamples"${RO() ? ' disabled' : ''}>Thêm bộ thông báo mẫu</button></div>
    ${S.anns.length ? '' : `<p class="hint2">Chưa có thông báo nào. Bấm "Thêm thông báo" để tạo cái đầu tiên, hoặc thêm bộ mẫu để xem thử rồi sửa lại.</p>`}
    ${sec('live', 'Đang hiển thị')}${sec('scheduled', 'Sắp hiển thị')}${sec('off', 'Đã tắt')}${sec('expired', 'Đã hết hạn — tự ẩn', `<button class="sbtn red" data-a="delExpired"${RO() ? ' disabled' : ''}>Xoá tất cả</button>`)}
  </section>`;
}
function annForm(){
  const d = S.edit.d, id = S.edit.id;
  return `<section>${banner()}
    <div class="sec-t"><span>${id ? 'Sửa thông báo' : 'Thông báo mới'}</span></div>
    ${langTabs(S.edit, ['title','summary','body','place'])}
    <div class="fld"><label for="fTitle">Tiêu đề${(S.edit.lang || 'base') === 'base' ? ' *' : ''}</label><input id="fTitle" type="text" maxlength="90" value="${esc(fv(S.edit, 'title'))}" placeholder="${esc(fph(S.edit, 'title', 'Mystery Jackpot Weekend'))}"></div>
    <div class="fld"><label for="fSum">Tóm tắt — hiện trên thumbnail, 1–2 câu</label><input id="fSum" type="text" maxlength="160" value="${esc(fv(S.edit, 'summary'))}" placeholder="${esc(fph(S.edit, 'summary', 'Thông tin chính khách cần thấy ngay'))}"></div>
    <div class="fld"><label for="fBody">Nội dung chi tiết</label><textarea id="fBody" maxlength="2000" placeholder="${esc(fph(S.edit, 'body', 'Hiện khi khách chạm vào thông báo'))}">${esc(fv(S.edit, 'body'))}</textarea></div>
    <div class="fld"><label>Danh mục</label><div class="opts">${CAT_KEYS.map(k => opt(d.cat === k, `data-ef="cat" data-v="${k}"`, CAT_VI[k])).join('')}</div></div>
    <div class="fld"><label>Mức ưu tiên</label><div class="opts">${['normal','featured','urgent'].map(k => opt(d.prio === k, `data-ef="prio" data-v="${k}"`, PRIO_VI[k])).join('')}</div>
      <span class="hint2">Khẩn cấp: luôn đứng đầu, viền đỏ và chữ chạy cuối màn hình. Nổi bật: ưu tiên trên màn hình chờ.</span></div>
    <div class="row2"><div class="fld"><label for="fStart">Bắt đầu hiển thị</label><input id="fStart" type="datetime-local" value="${toLocal(d.start)}"></div><div class="fld"><label for="fEnd">Tự hết hạn lúc</label><input id="fEnd" type="datetime-local" value="${toLocal(d.end)}"></div></div>
    <div class="opts">${[['none','Không hết hạn'],['1','+1 ngày'],['3','+3 ngày'],['7','+1 tuần'],['month','Cuối tháng']].map(([k, l]) => opt(false, `data-endq="${k}"`, l)).join('')}</div>
    <div class="fld"><label for="fPlace">Địa điểm</label><input id="fPlace" type="text" maxlength="60" value="${esc(fv(S.edit, 'place'))}" placeholder="${esc(fph(S.edit, 'place', 'Floor 2 · BK13'))}"></div>
    <div class="fld"><label>Hình ảnh</label><div class="imgprev">${picHTML(d)}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><label class="sbtn" for="fImg">${ico('image')}Chọn ảnh</label><input id="fImg" type="file" accept="image/*" hidden>${d.img ? `<button class="sbtn red" data-a="rmImg">Bỏ ảnh</button>` : ''}<span class="msg" id="imgMsg"></span></div>
      <span class="hint2">Không chọn ảnh thì app tự tạo ảnh bìa theo danh mục.</span></div>
    ${swRow('Đang hiển thị', 'Tắt để ẩn tạm thời mà không xoá', d.on !== false, 'data-eftog="on"')}
    ${swRow('Ghim lên màn hình chờ', 'Dùng khi màn hình chờ đặt nội dung "Chọn thủ công"', !!d.idle, 'data-eftog="idle"')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:6px"><button class="sbtn gold" data-a="saveAnn"${RO() ? ' disabled' : ''}>${ico('check')}Lưu thông báo</button><button class="sbtn" data-a="cancelEdit">Huỷ</button>${id ? `<button class="sbtn red" data-a="delAnn" data-id="${esc(id)}"${RO() ? ' disabled' : ''}>${ico('trash')}Xoá</button>` : ''}</div>
  </section>`;
}
function syncDraft(){
  if (!S.edit) return;
  const d = S.edit.d, v = id => { const el = document.getElementById(id); return el ? el.value : null; };
  const t = v('fTitle'); if (t != null) setField(S.edit, 'title', t);
  const s = v('fSum'); if (s != null) setField(S.edit, 'summary', s);
  const b = v('fBody'); if (b != null) setField(S.edit, 'body', b);
  const p = v('fPlace'); if (p != null) setField(S.edit, 'place', p);
  const st = v('fStart'); if (st != null) d.start = fromLocal(st);
  const en = v('fEnd'); if (en != null) d.end = fromLocal(en);
}
function tabRules(){
  if (S.redit) return ruleForm();
  const list = sortRules(S.rules);
  return `<section>${banner()}
    ${swRow('Hiện mục "Club Rules" cho khách', 'Một mục riêng cạnh phần thông báo', S.cfg.feat.rules !== false, 'data-tog="feat.rules"')}
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="sbtn gold" data-a="newRule"${RO() ? ' disabled' : ''}>${ico('plus')}Thêm quy định</button><button class="sbtn" data-a="addRuleSamples"${RO() ? ' disabled' : ''}>Thêm bộ quy định mẫu</button></div>
    ${list.length ? `<div class="alist">${list.map((r, i) => `<div class="rrow${r.on === false ? ' offr' : ''}"><span class="rn">${i + 1}</span><span class="ri">${ico(RULE_ICONS.includes(r.ic) ? r.ic : 'shield')}</span><div style="min-width:0"><b>${esc(r.title)}</b><small>${esc(r.body)}</small><small>${r.sample ? 'Mẫu · ' : ''}${trCodes(r).length ? 'Bản dịch: ' + trCodes(r).join(' · ') : 'Chưa có bản dịch'}</small></div>
      <div class="acts">${tog(r.on !== false, `data-a="togRule" data-id="${esc(r.id)}" aria-label="Bật/tắt"${RO() ? ' disabled' : ''}`)}<button class="sbtn ic" data-a="upRule" data-id="${esc(r.id)}" aria-label="Lên"${i === 0 || RO() ? ' disabled' : ''}>${ico('up')}</button><button class="sbtn ic" data-a="downRule" data-id="${esc(r.id)}" aria-label="Xuống"${i === list.length - 1 || RO() ? ' disabled' : ''}>${ico('down')}</button><button class="sbtn ic" data-a="editRule" data-id="${esc(r.id)}" aria-label="Sửa">${ico('edit')}</button><button class="sbtn ic red" data-a="delRule" data-id="${esc(r.id)}" aria-label="Xoá"${RO() ? ' disabled' : ''}>${ico('trash')}</button></div></div>`).join('')}</div>`
      : `<p class="hint2">Chưa có quy định nào. Bấm "Thêm quy định" hoặc thêm bộ mẫu rồi sửa lại cho đúng với câu lạc bộ.</p>`}
  </section>`;
}
function ruleForm(){
  const ed = S.redit, d = ed.d, id = ed.id, base = (ed.lang || 'base') === 'base';
  return `<section>${banner()}
    <div class="sec-t"><span>${id ? 'Sửa quy định' : 'Quy định mới'}</span></div>
    ${langTabs(ed, ['title','body'])}
    <div class="fld"><label for="rTitle">Tiêu đề${base ? ' *' : ''}</label><input id="rTitle" type="text" maxlength="80" value="${esc(fv(ed, 'title'))}" placeholder="${esc(fph(ed, 'title', 'Bring your passport'))}"></div>
    <div class="fld"><label for="rBody">Nội dung</label><textarea id="rBody" maxlength="800" placeholder="${esc(fph(ed, 'body', 'Giải thích ngắn gọn cho khách'))}">${esc(fv(ed, 'body'))}</textarea></div>
    <div class="fld"><label>Biểu tượng</label><div class="icopick">${RULE_ICONS.map(k => `<button class="${d.ic === k ? 'on' : ''}" data-ric="${k}" aria-label="${k}">${ico(k)}</button>`).join('')}</div></div>
    ${swRow('Đang hiển thị', 'Tắt để ẩn tạm thời mà không xoá', d.on !== false, 'data-rtog="on"')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;padding-top:6px"><button class="sbtn gold" data-a="saveRule"${RO() ? ' disabled' : ''}>${ico('check')}Lưu quy định</button><button class="sbtn" data-a="cancelRule">Huỷ</button>${id ? `<button class="sbtn red" data-a="delRule" data-id="${esc(id)}"${RO() ? ' disabled' : ''}>${ico('trash')}Xoá</button>` : ''}</div>
  </section>`;
}
function syncRule(){
  if (!S.redit) return;
  const t = document.getElementById('rTitle'); if (t) setField(S.redit, 'title', t.value);
  const b = document.getElementById('rBody'); if (b) setField(S.redit, 'body', b.value);
}
const ruleRef = id => S.db.doc('rules/' + id);
const writeRule = (id, body) => queued('rules/' + id, () => withRetry(() => ruleRef(id).set(body)));
async function moveRule(id, dir){
  const list = sortRules(S.rules), i = list.findIndex(r => r.id === id), j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
  for (let k = 0; k < list.length; k++){
    const r = list[k], o = (k + 1) * 10;
    if (r.order !== o){ r.order = o; await queued('rules/' + r.id, () => withRetry(() => ruleRef(r.id).update({ order:o, updated:Date.now() }))); }
  }
  renderSheet(); renderBoard(true);
}
function tabIdle(){
  const I = S.cfg.idle;
  return `<section>${banner()}
    <div class="grp"><h4>Nội dung màn hình chờ</h4><div class="opts">${[['smart','Tự động: khẩn + nổi bật + mới'],['featured','Chỉ khẩn & nổi bật'],['all','Tất cả đang hiệu lực'],['pick','Chọn thủ công (đã ghim)']].map(([k, l]) => opt(I.source === k, `data-set="idle.source" data-v="${k}"`, l)).join('')}</div>
      <span class="hint2">Thông báo khẩn luôn được đưa lên đầu, bất kể lựa chọn nào.</span></div>
    <div class="grp"><h4>Bố cục</h4><div class="opts">${opt(I.layout === 'hero', 'data-set="idle.layout" data-v="hero"', 'Thông báo lớn + danh sách tiếp theo')}${opt(I.layout === 'full', 'data-set="idle.layout" data-v="full"', 'Một thông báo toàn khung')}</div></div>
    <div class="grp"><h4>Thời gian mỗi thông báo</h4><div class="opts">${[6,8,10,15,20].map(n => opt(I.interval === n, `data-set="idle.interval" data-v="${n}"`, n + ' giây')).join('')}</div></div>
    <div class="grp"><h4>Lời chào</h4>
      <div class="fld"><label for="gTitle">Tiêu đề</label><input id="gTitle" type="text" maxlength="60" data-in="idle.greet" value="${esc(I.greet)}" placeholder="${esc(STR[S.cfg.lang].welcome)}"></div>
      <div class="fld"><label for="gSub">Dòng phụ</label><input id="gSub" type="text" maxlength="90" data-in="idle.sub" value="${esc(I.sub)}" placeholder="${esc(STR[S.cfg.lang].welcome_s)}"></div>
      <span class="hint2">Để trống sẽ dùng câu mặc định theo ngôn ngữ hiển thị.</span></div>
    <div class="grp"><h4>Nhãn "Mới" trong</h4><div class="opts">${[[24,'24 giờ'],[48,'48 giờ'],[72,'3 ngày'],[168,'7 ngày']].map(([n, l]) => opt(I.newHours === n, `data-set="idle.newHours" data-v="${n}"`, l)).join('')}</div></div>
    <div class="grp">${swRow('Chữ chạy cho thông báo khẩn', 'Hiện ở cuối màn hình khi có thông báo khẩn', I.ticker, 'data-tog="idle.ticker"')}${swRow('Gợi ý "Chạm để xem tất cả"', '', I.hint, 'data-tog="idle.hint"')}</div>
  </section>`;
}
function tabLook(){
  const L = S.cfg.look, b = L.bg;
  const tiles = BG_PRESETS.map(p => `<button class="bgt${presetActive(p, b) ? ' on' : ''}" data-bgp="${p.k}"><span class="swc" style="background:${presetSwatch(p)}"></span>${esc(p.name)}</button>`).join('');
  let custom = '';
  if (b.type === 'solid') custom = `<div class="swatches"><label>Màu nền <input type="color" data-in="look.bg.color" value="${esc(b.color)}"></label></div>`;
  else if (b.type === 'gradient') custom = `<div class="swatches"><label>Màu 1 <input type="color" data-in="look.bg.c1" value="${esc(b.c1)}"></label><label>Màu 2 <input type="color" data-in="look.bg.c2" value="${esc(b.c2)}"></label></div><div class="fld"><label for="gAng">Góc chuyển màu · ${b.angle}°</label><input id="gAng" type="range" min="0" max="360" step="5" data-in="look.bg.angle" value="${b.angle}"></div>`;
  else if (b.type === 'image') custom = `<div class="imgprev" style="background:#2a2018">${imgSrc(b.img) ? ((b.imgType || '').startsWith('video') ? `<video src="${esc(imgSrc(b.img))}" muted autoplay loop playsinline style="width:100%;height:100%;object-fit:cover"></video>` : `<img src="${esc(imgSrc(b.img))}" alt="" style="width:100%;height:100%;object-fit:cover">`) : ''}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><label class="sbtn" for="fBg">${ico('image')}Chọn ảnh hoặc video</label><input id="fBg" type="file" accept="image/*,video/mp4,video/webm" hidden><span class="msg" id="bgMsg"></span></div>
      <div class="fld"><label for="gOv">Lớp phủ để chữ dễ đọc · ${Math.round(b.overlay*100)}%</label><input id="gOv" type="range" min="0" max="0.7" step="0.05" data-in="look.bg.overlay" value="${b.overlay}"></div>`;
  return `<section>${banner()}
    <div class="grp"><h4>Ngôn ngữ mặc định cho khách</h4><div class="opts">${LANGS.map(([c, n]) => opt(S.cfg.lang === c, `data-set="lang" data-v="${c}"`, n)).join('')}</div>
      ${swRow('Cho khách tự đổi ngôn ngữ', 'Nút quả địa cầu ở phần thông báo và bản đồ. Tự về ngôn ngữ mặc định khi không ai chạm.', S.cfg.feat.langSwitch !== false, 'data-tog="feat.langSwitch"')}
      <span class="hint2">Cài đặt nhân viên luôn bằng tiếng Việt.</span></div>
    <div class="grp"><h4>Giao diện</h4><div class="opts">${[['match','Theo nền'],['light','Sáng'],['dark','Tối']].map(([k, l]) => opt(L.theme === k, `data-set="look.theme" data-v="${k}"`, l)).join('')}</div></div>
    <div class="grp"><h4>Nền có sẵn — giống Jackpot Dashboard</h4><div class="bgtiles">${tiles}</div></div>
    <div class="grp"><h4>Tự chọn nền</h4><div class="opts">${[['solid','Màu đơn'],['gradient','Chuyển màu'],['image','Ảnh / video']].map(([k, l]) => opt(b.type === k, `data-set="look.bg.type" data-v="${k}"`, l)).join('')}</div>
      ${b.type !== 'animated' ? `<div class="opts">${opt(b.tone !== 'dark', 'data-set="look.bg.tone" data-v="light"', 'Nền sáng')}${opt(b.tone === 'dark', 'data-set="look.bg.tone" data-v="dark"', 'Nền tối')}</div>` : ''}
      ${custom}</div>
  </section>`;
}
function tabFeat(){
  const F = S.cfg.feat, pin = ls.get('vgn.pin', '');
  return `<section>${banner()}
    <div class="grp"><h4>Phần thông báo</h4>${swRow('Mục Club Rules', 'Quy định câu lạc bộ, một mục riêng', S.cfg.feat.rules !== false, 'data-tog="feat.rules"')}</div>
    <div class="grp"><h4>Nút điều hướng</h4>${NAV.map(n => swRow(n.label, STR.vi[n.k + '_s'] || '', F[n.k] !== false, `data-tog="feat.${n.k}"`)).join('')}</div>
    <div class="grp"><h4>Giữ màn hình Dashboard sau khi khách chọn</h4><div class="opts">${[[30,'30 giây'],[60,'1 phút'],[120,'2 phút'],[300,'5 phút']].map(([n, l]) => opt(S.cfg.hold === n, `data-set="hold" data-v="${n}"`, l)).join('')}</div><span class="hint2">Hết thời gian, Dashboard trở lại tự động xoay vòng.</span></div>
    <div class="grp"><h4>Tự quay về màn hình chờ khi không ai chạm</h4><div class="opts">${[[30,'30 giây'],[45,'45 giây'],[60,'1 phút'],[90,'90 giây'],[120,'2 phút']].map(([n, l]) => opt(S.cfg.timeout === n, `data-set="timeout" data-v="${n}"`, l)).join('')}</div></div>
    <div class="grp"><h4>Bản đồ</h4>${swRow('Hiệu ứng chạy dọc đường đi', '', F.routeAnim, 'data-tog="feat.routeAnim"')}${swRow('Chấm người chơi cạnh máy đang dùng', '', F.seatDots, 'data-tog="feat.seatDots"')}</div>
    ${S.mode === 'local' && S.db && S.db.dump ? `<div class="grp"><h4>Sao lưu dữ liệu</h4><span class="hint2">Tải về một file chứa toàn bộ thông báo, quy định, trạng thái máy và cài đặt. Mở cài đặt trên máy khác rồi nhập file này để dùng y hệt.</span>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="sbtn gold" data-a="backup">${ico('down')}Tải file sao lưu</button><label class="sbtn" for="fRestore">${ico('up')}Nhập file sao lưu</label><input id="fRestore" type="file" accept="application/json,.json" hidden></div></div>` : ''}
    <div class="grp"><h4>Khoá cài đặt bằng PIN — chỉ trên máy này</h4>
      <div class="row2"><div class="fld"><label for="pinIn">${pin ? 'Đổi PIN' : 'Đặt PIN (4–6 số)'}</label><input id="pinIn" type="password" inputmode="numeric" maxlength="6" placeholder="••••"></div><div style="display:flex;gap:8px;align-items:flex-end"><button class="sbtn gold" data-a="savePin">Lưu PIN</button>${pin ? '<button class="sbtn red" data-a="clearPin">Bỏ PIN</button>' : ''}</div></div>
      <span class="hint2">${pin ? 'Đang bật: khách phải nhập PIN khi giữ nút cài đặt.' : 'Chưa bật. Mở cài đặt bằng cách giữ nút bánh răng 1,5 giây.'}</span></div>
  </section>`;
}
function tabMap(){
  const C = counts(), g = S.cfg.map.gm;
  const zr = Object.keys(ZONES).map(z => { const t = machineType({ z }); return `<div class="zrow"><i style="background:${ZC[ZONES[z].c]}"></i><span>${z} · T${ZONES[z].f}</span><div class="opts">${TYPES.map(k => opt(t === k, `data-zt="${z}" data-v="${k}"`, TYPE_VI[k])).join('')}</div></div>`; }).join('');
  return `<section>${banner()}
    <div class="grp"><h4>Vị trí màn hình này</h4><span class="hint2">Đang đặt tại ${Math.abs(g.x - GM_DEFAULT.x) < 2 && Math.abs(g.y - GM_DEFAULT.y) < 2 ? 'quầy GM (mặc định, như ảnh sơ đồ)' : `điểm tự chọn (${g.x}, ${g.y})`}. Mọi đường chỉ dẫn bắt đầu từ đây.</span>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="sbtn" data-a="setPos"${RO() ? ' disabled' : ''}>${ico('pin')}Chọn lại trên bản đồ</button><button class="sbtn" data-a="resetPos"${RO() ? ' disabled' : ''}>Về bàn GM</button></div></div>
    <div class="grp"><h4>Lối lên Tầng 2</h4><div class="opts">${opt(S.cfg.map.stair === 'B', 'data-set="map.stair" data-v="B"', 'Cầu thang B — sảnh dưới, cạnh khu BK05')}${opt(S.cfg.map.stair === 'A', 'data-set="map.stair" data-v="A"', 'Cầu thang A — cạnh thang máy')}</div></div>
    <div class="grp"><h4>Trạng thái máy</h4><span class="hint2">${MACH.length} máy · ${C.free} trống · ${C.busy} đang chơi · ${C.resv} đã đặt · ${C.off} bảo trì. Trạng thái ban đầu lấy theo sơ đồ gốc.</span>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="sbtn gold" data-a="editMap"${RO() ? ' disabled' : ''}>${ico('edit')}Chỉnh trên bản đồ</button><button class="sbtn red" data-a="resetMach"${RO() ? ' disabled' : ''}>Đặt lại theo sơ đồ gốc</button></div></div>
    <div class="grp"><h4>Nhập trạng thái từ hệ thống</h4>
      <div class="fld"><label for="fImport">Dán JSON</label><textarea id="fImport" class="code" spellcheck="false" placeholder='{"2015":"busy","2017":"free","2022":"maintenance"}'></textarea></div>
      <span class="hint2">Nhận dạng: {"số máy": "trạng thái"} hoặc [{"id": "2015", "status": "in_use"}]. Trạng thái: free / available, busy / in_use, reserved, maintenance / offline.</span>
      <div><button class="sbtn" data-a="importMach"${RO() ? ' disabled' : ''}>Áp dụng</button></div></div>
    <div class="grp"><h4>Loại máy theo khu</h4><div style="display:flex;flex-direction:column;gap:8px">${zr}</div></div>
  </section>`;
}
const SNIPPET = `/* Vegas Navigation remote: paste inside the Jackpot Dashboard <script>, below the go() function. */
(function(){
  var TAB = { day:0, week:1, month:2, year:3, live:4, players:4, machines:4 };
  var bc = null; try { bc = new BroadcastChannel('vegas-jackpot'); } catch (e) {}
  function ack(src){ var m = { type:'vegas:ack', at:Date.now() }; if (bc) bc.postMessage(m); if (src && src.postMessage) src.postMessage(m, '*'); }
  function hear(m, src){
    if (!m || typeof m !== 'object') return;
    if (m.type === 'vegas:ping') return ack(src);
    if (m.type !== 'vegas:nav') return;
    if (TAB[m.view] != null) go(TAB[m.view]);
    ack(src);
  }
  if (bc) bc.onmessage = function(e){ hear(e.data); };
  addEventListener('message', function(e){ hear(e.data, e.source); });
  ack();
})();`;
function tabTv(){
  const seen = S.tvSeen ? `Đã nhận tín hiệu từ Jackpot Dashboard lúc ${hm(S.tvSeen)}.` : 'Chưa nhận tín hiệu từ Jackpot Dashboard.';
  return `<section>${banner()}
    <p class="note" style="color:#6a5845">Các nút Live, Day, Week, Month, Year, Active Players và Machines Available gửi lệnh tới Jackpot Dashboard trên màn hình lớn. Lệnh đi được khi hai trang chạy trên cùng một máy tính (ví dụ máy mini PC nối cả màn hình bar và TV) hoặc trên cùng server nội bộ, và Dashboard đã gắn đoạn mã nhận lệnh bên dưới.</p>
    <div class="grp"><h4>Trạng thái</h4><span class="hint2" style="font-weight:700;color:${S.tvSeen && Date.now() - S.tvSeen < 65000 ? '#1f7a50' : '#7d6a55'}">${esc(seen)}</span>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${['live','day','week','month','year'].map(v => `<button class="sbtn" data-a="testSend" data-v="${v}">Gửi thử: ${v.toUpperCase()}</button>`).join('')}</div></div>
    <div class="grp"><h4>Mở Dashboard từ màn hình này</h4>
      <div class="fld"><label for="tvUrl">Địa chỉ Jackpot Dashboard</label><input id="tvUrl" type="url" data-in="link.url" value="${esc(S.cfg.link.url)}" placeholder="http://192.168.1.20/jackpot-dashboard.html"></div>
      <div><button class="sbtn" data-a="openTv">${ico('tv')}Mở ở cửa sổ mới</button></div>
      <span class="hint2">Kéo cửa sổ vừa mở sang TV rồi bấm F để toàn màn hình.</span></div>
    <div class="grp"><h4>Webhook (tuỳ chọn)</h4>
      <div class="fld"><label for="tvHook">Gọi địa chỉ này mỗi lần khách chọn</label><input id="tvHook" type="url" data-in="link.webhook" value="${esc(S.cfg.link.webhook)}" placeholder="http://192.168.1.20:8080/nav?view={view}"></div>
      <span class="hint2">{view} được thay bằng live, day, week, month, year, players, machines hoặc auto.</span></div>
    <div class="grp"><div class="sec-t"><span>Đoạn mã cho Jackpot Dashboard</span><button class="sbtn" data-a="copySnippet">${ico('copy')}Sao chép</button></div><pre class="code" id="snip">${esc(SNIPPET)}</pre></div>
  </section>`;
}
function renderSheet(force){
  if (!S.sheetOpen) return;
  const body = $('#shBody');
  const f = document.activeElement;
  if (!force && f && body.contains(f) && f.matches('input[type=text],input[type=url],textarea,input[type=password]')) return;
  const html = { ann:tabAnn, rules:tabRules, idle:tabIdle, look:tabLook, feat:tabFeat, map:tabMap, tv:tabTv }[S.tab]();
  const st = body.scrollTop; body.innerHTML = html; body.scrollTop = st;
}
function refreshAll(){ applyLook(); setLang(S.glang); }
function afterCfg(rerender){ if (RO()) return toastAdmin('Bạn chỉ có quyền xem.', true); saveCfg(); refreshAll(); if (rerender !== false) renderSheet(); }
const ST_ALIAS = v => {
  const s = String(v == null ? '' : v).toLowerCase().replace(/[^a-z]/g, '');
  if (['free','available','idle','open','empty','vacant','trong','ready'].includes(s)) return 'free';
  if (['busy','inuse','playing','occupied','active','play','used'].includes(s)) return 'busy';
  if (['resv','reserved','booked','hold','reserve','booking'].includes(s)) return 'resv';
  if (['off','maintenance','error','offline','down','broken','out','outofservice','baotri','disabled'].includes(s)) return 'off';
  return null;
};
function parseImport(txt){
  let j; try { j = JSON.parse(txt); } catch { return null; }
  const out = {};
  const take = (id, st) => { id = String(id == null ? '' : id).trim(); const s = ST_ALIAS(st); if (MBY[id] && s) out[id] = s; };
  const list = Array.isArray(j) ? j : Array.isArray(j && j.machines) ? j.machines : Array.isArray(j && j.data) ? j.data : null;
  if (list) list.forEach(r => { if (r && typeof r === 'object') take(r.id ?? r.machine ?? r.mc ?? r.number ?? r.machine_no, r.status ?? r.state ?? r.st); });
  else if (j && typeof j === 'object') Object.entries(j).forEach(([k, v]) => take(k, v));
  return out;
}
async function readImage(file, maxW, forBg){
  if (!file) return null;
  const isVideo = (file.type || '').startsWith('video');
  if (isVideo){ if (!S.assets) throw new Error('Video nền cần mở trang từ link Claude (có lưu tệp).'); const r = await S.assets.upload(file); return { v:'a:' + r.id, type:file.type }; }
  const img = await new Promise((res, rej) => { const i = new Image(); const u = URL.createObjectURL(file); i.onload = () => { URL.revokeObjectURL(u); res(i); }; i.onerror = () => rej(new Error('Không đọc được ảnh này.')); i.src = u; });
  const k = Math.min(1, maxW / img.width), c = document.createElement('canvas');
  c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  if (S.assets){
    const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', .85));
    try { const up = await S.assets.upload(blob, { type:'image/jpeg' }); return { v:'a:' + up.id, type:'image/jpeg' }; } catch {}
  }
  const k2 = Math.min(1, (forBg ? 1280 : 900) / c.width), c2 = document.createElement('canvas');
  c2.width = Math.round(c.width * k2); c2.height = Math.round(c.height * k2); c2.getContext('2d').drawImage(c, 0, 0, c2.width, c2.height);
  let d = c2.toDataURL('image/jpeg', .74); if (d.length > 190000) d = c2.toDataURL('image/jpeg', .55);
  return { v:d, type:'image/jpeg' };
}
function arm(btn, label){
  if (btn.classList.contains('arm')) return true;
  btn.classList.add('arm'); const old = btn.innerHTML; btn.textContent = label || 'Bấm lần nữa để xoá';
  setTimeout(() => { if (btn.isConnected){ btn.classList.remove('arm'); btn.innerHTML = old; } }, 3500);
  return false;
}
const annRef = id => S.db.doc('ann/' + id);
const writeAnn = (id, body) => queued('ann/' + id, () => withRetry(() => annRef(id).set(body)));
const newId = () => 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
$('#shBody').addEventListener('click', async e => {
  const t = e.target;
  const set = t.closest('[data-set]');
  if (set){ const raw = set.dataset.v, v = /^-?\d+(\.\d+)?$/.test(raw) ? +raw : raw; setPath(S.cfg, set.dataset.set, v); if (set.dataset.set === 'look.bg.type' && v === 'image' && !S.cfg.look.bg.tone) S.cfg.look.bg.tone = 'dark'; return afterCfg(); }
  const tg = t.closest('[data-tog]');
  if (tg){ setPath(S.cfg, tg.dataset.tog, !getPath(S.cfg, tg.dataset.tog)); return afterCfg(); }
  const bp = t.closest('[data-bgp]');
  if (bp){ const p = BG_PRESETS.find(x => x.k === bp.dataset.bgp); const b = S.cfg.look.bg; b.type = p.type; if (p.type === 'animated') b.preset = p.k; if (p.type === 'solid') b.color = p.color; if (p.type === 'gradient'){ b.c1 = p.c1; b.c2 = p.c2; b.angle = p.angle; } if (p.tone) b.tone = p.tone; return afterCfg(); }
  const ef = t.closest('[data-ef]');
  if (ef){ syncDraft(); S.edit.d[ef.dataset.ef] = ef.dataset.v; return renderSheet(); }
  const et = t.closest('[data-eftog]');
  if (et){ syncDraft(); const k = et.dataset.eftog; S.edit.d[k] = k === 'on' ? S.edit.d.on === false : !S.edit.d[k]; return renderSheet(); }
  const eq = t.closest('[data-endq]');
  if (eq){ syncDraft(); const d = S.edit.d, k = eq.dataset.endq, base = Math.max(d.start || Date.now(), Date.now());
    if (k === 'none') d.end = null; else if (k === 'month'){ const x = new Date(base); d.end = new Date(x.getFullYear(), x.getMonth() + 1, 0, 23, 59).getTime(); }
    else { const x = new Date(base + (+k) * DAY); x.setHours(23, 59, 0, 0); d.end = x.getTime(); }
    return renderSheet(); }
  const el = t.closest('[data-elang]');
  if (el){ const ed = S.tab === 'rules' ? S.redit : S.edit; if (!ed) return; if (S.tab === 'rules') syncRule(); else syncDraft(); ed.lang = el.dataset.elang; return renderSheet(true); }
  const ric = t.closest('[data-ric]');
  if (ric && S.redit){ syncRule(); S.redit.d.ic = ric.dataset.ric; return renderSheet(true); }
  const rt = t.closest('[data-rtog]');
  if (rt && S.redit){ syncRule(); S.redit.d.on = S.redit.d.on === false; return renderSheet(true); }
  const zt = t.closest('[data-zt]');
  if (zt){ if (RO()) return; const z = zt.dataset.zt; S.mach.zones[z] = { type:zt.dataset.v }; flushMach({ zones:{ [z]:{ type:zt.dataset.v } } }); renderSheet(); renderTiles(); if (S.mapOpen) renderMapPanel(); return; }
  const a = t.closest('[data-a]'); if (!a || a.disabled) return;
  const k = a.dataset.a, id = a.dataset.id;
  try {
    if (k === 'autoTr'){
      const rules = S.tab === 'rules', ed = rules ? S.redit : S.edit; if (!ed || !S.sample) return;
      if (rules) syncRule(); else syncDraft();
      const m = $('#trMsg'); a.disabled = true; if (m){ m.textContent = 'Claude đang dịch… thường mất 10–40 giây'; m.className = 'msg'; }
      try { const n = await autoTranslate(ed, rules ? ['title','body'] : ['title','summary','body','place']); renderSheet(true); const m2 = $('#trMsg'); if (m2){ m2.textContent = `Đã dịch ${n} ngôn ngữ. Kiểm tra từng tab rồi bấm Lưu.`; m2.className = 'msg ok'; } }
      catch (err){ a.disabled = false; const m3 = $('#trMsg'); if (m3){ m3.textContent = sampleErr(err); m3.className = 'msg err'; } }
      return;
    }
    if (k === 'newRule'){ const maxO = S.rules.reduce((x, r) => Math.max(x, r.order || 0), 0); S.redit = { id:null, lang:'base', d:{ title:'', body:'', ic:'shield', on:true, order:maxO + 10, tr:{} } }; renderSheet(true); $('#shBody').scrollTop = 0; return; }
    if (k === 'editRule'){ const x = S.rules.find(q => q.id === id); if (!x) return; const d = clone(x); delete d.id; S.redit = { id, lang:'base', d }; renderSheet(true); $('#shBody').scrollTop = 0; return; }
    if (k === 'cancelRule'){ S.redit = null; return renderSheet(true); }
    if (k === 'saveRule'){
      syncRule(); const d = S.redit.d;
      d.title = (d.title || '').trim(); d.body = (d.body || '').trim();
      if (!d.title) return toastAdmin('Nhập tiêu đề mặc định trước khi lưu.', true);
      const wid = S.redit.id || newId();
      const body = { title:d.title, body:d.body, ic:RULE_ICONS.includes(d.ic) ? d.ic : 'shield', on:d.on !== false, order:typeof d.order === 'number' ? d.order : 999, tr:cleanTr(d.tr, ['title','body']), created:d.created || Date.now(), updated:Date.now() };
      if (d.sample) body.sample = true;
      a.disabled = true; await writeRule(wid, body);
      S.redit = null; renderSheet(true); toastAdmin('Đã lưu quy định.'); return;
    }
    if (k === 'togRule'){ const x = S.rules.find(q => q.id === id); if (!x) return; await queued('rules/' + id, () => withRetry(() => ruleRef(id).update({ on: x.on === false, updated:Date.now() }))); return; }
    if (k === 'upRule' || k === 'downRule'){ a.disabled = true; await moveRule(id, k === 'upRule' ? -1 : 1); return; }
    if (k === 'delRule'){ if (!arm(a)) return; await queued('rules/' + id, () => withRetry(() => ruleRef(id).delete())); if (S.redit && S.redit.id === id) S.redit = null; renderSheet(true); toastAdmin('Đã xoá quy định.'); return; }
    if (k === 'addRuleSamples'){ a.disabled = true; const maxO = S.rules.reduce((x, r) => Math.max(x, r.order || 0), 0); const list = sampleRules(Date.now()); for (const r of list){ r.order += maxO; await writeRule(newId(), r); } toastAdmin(`Đã thêm ${list.length} quy định mẫu (có sẵn 5 ngôn ngữ). Hãy sửa cho đúng với câu lạc bộ.`); return; }
    if (k === 'newAnn'){ S.edit = { id:null, lang:'base', d:{ tr:{}, title:'', summary:'', body:'', cat:'event', prio:'normal', start:Date.now(), end:null, place:'', img:'', on:true, idle:true } }; renderSheet(); $('#shBody').scrollTop = 0; return; }
    if (k === 'editAnn'){ const x = S.anns.find(q => q.id === id); if (!x) return; const d = clone(x); delete d.id; S.edit = { id, lang:'base', d }; renderSheet(); $('#shBody').scrollTop = 0; return; }
    if (k === 'cancelEdit'){ S.edit = null; return renderSheet(); }
    if (k === 'rmImg'){ syncDraft(); S.edit.d.img = ''; return renderSheet(); }
    if (k === 'saveAnn'){
      syncDraft(); const d = S.edit.d;
      d.title = (d.title || '').trim(); d.summary = (d.summary || '').trim(); d.body = (d.body || '').trim(); d.place = (d.place || '').trim();
      if (!d.title) return toastAdmin('Nhập tiêu đề ở tab "Mặc định" trước khi lưu.', true);
      if (d.end && d.start && d.end <= d.start) return toastAdmin('Thời điểm hết hạn phải sau thời điểm bắt đầu.', true);
      const wid = S.edit.id || newId();
      const body = { tr:cleanTr(d.tr, ['title','summary','body','place']), title:d.title, summary:d.summary, body:d.body, cat:CAT[d.cat] ? d.cat : 'notice', prio:['normal','featured','urgent'].includes(d.prio) ? d.prio : 'normal', start:d.start || Date.now(), end:d.end || null, place:d.place, img:d.img || '', on:d.on !== false, idle:!!d.idle, created:d.created || Date.now(), updated:Date.now() };
      if (d.sample) body.sample = true;
      a.disabled = true;
      await writeAnn(wid, body);
      S.edit = null; renderSheet(); toastAdmin('Đã lưu thông báo.'); return;
    }
    if (k === 'togAnn'){ const x = S.anns.find(q => q.id === id); if (!x) return; await queued('ann/' + id, () => withRetry(() => annRef(id).update({ on: x.on === false, updated:Date.now() }))); return; }
    if (k === 'delAnn'){ if (!arm(a)) return; const x = S.anns.find(q => q.id === id); await queued('ann/' + id, () => withRetry(() => annRef(id).delete())); if (x && x.img && x.img.startsWith('a:') && S.assets && !S.anns.some(q => q.id !== id && q.img === x.img)) S.assets.delete(x.img.slice(2)).catch(() => {}); if (S.edit && S.edit.id === id) S.edit = null; renderSheet(); toastAdmin('Đã xoá thông báo.'); return; }
    if (k === 'delExpired'){ if (!arm(a)) return; const ex = S.anns.filter(q => annState(q, Date.now()) === 'expired'); for (const q of ex) await queued('ann/' + q.id, () => withRetry(() => annRef(q.id).delete())); toastAdmin(`Đã xoá ${ex.length} thông báo hết hạn.`); return; }
    if (k === 'addSamples'){ a.disabled = true; const list = sampleAnns(Date.now()); for (const s of list) await writeAnn(newId(), s); toastAdmin(`Đã thêm ${list.length} thông báo mẫu. Hãy sửa nội dung cho đúng với câu lạc bộ.`); return; }
    if (k === 'setPos'){ closeSheet(); S.setPos = true; if (!S.mapOpen) openMap(); else { unselect(); } renderMapTip(); return; }
    if (k === 'resetPos'){ S.cfg.map.gm = { ...GM_DEFAULT }; return afterCfg(); }
    if (k === 'editMap'){ closeSheet(); S.editMap = true; if (!S.mapOpen) openMap(); else unselect(); renderMapMachines(); renderMapTip(); return; }
    if (k === 'resetMach'){ if (!arm(a, 'Bấm lần nữa để đặt lại')) return; machPending = {}; S.mach.st = {}; await setMachAll({ st:{}, zones:S.mach.zones }); renderTiles(); renderSheet(); toastAdmin('Đã đặt lại trạng thái theo sơ đồ gốc.'); return; }
    if (k === 'importMach'){ const r = parseImport($('#fImport').value); if (!r) return toastAdmin('JSON không hợp lệ. Kiểm tra dấu ngoặc và dấu phẩy.', true); const n = Object.keys(r).length; if (!n) return toastAdmin('Không tìm thấy số máy nào khớp với bản đồ.', true); Object.assign(S.mach.st, r); await flushMach({ st:r }); renderTiles(); renderSheet(); toastAdmin(`Đã cập nhật ${n} máy.`); return; }
    if (k === 'openTv'){ const ok = Link.open(); toastAdmin(ok ? 'Đã mở Dashboard ở cửa sổ mới.' : 'Không mở được cửa sổ. Kiểm tra địa chỉ (bắt đầu bằng http:// hoặc https://) và cho phép cửa sổ bật lên.', !ok); return; }
    if (k === 'testSend'){ Link.send(a.dataset.v); S.onScreen = a.dataset.v; S.onScreenAt = Date.now(); renderTiles(); renderStatus(); toastAdmin(`Đã gửi lệnh ${a.dataset.v.toUpperCase()}.`); return; }
    if (k === 'copySnippet'){
      try { await navigator.clipboard.writeText(SNIPPET); toastAdmin('Đã sao chép đoạn mã.'); }
      catch { const r = document.createRange(); r.selectNodeContents($('#snip')); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); toastAdmin('Đã chọn sẵn đoạn mã, nhấn Ctrl+C để sao chép.'); }
      return;
    }
    if (k === 'backup'){
      const d = new Date(), name = `vegas-navigation-backup-${d.getFullYear()}${pad2(d.getMonth()+1)}${pad2(d.getDate())}-${pad2(d.getHours())}${pad2(d.getMinutes())}.json`;
      const blob = new Blob([JSON.stringify({ app:'vegas-navigation', v:1, at:Date.now(), data:S.db.dump() }, null, 2)], { type:'application/json' });
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toastAdmin(`Đã tải ${name}.`); return;
    }
    if (k === 'savePin'){ const v = ($('#pinIn').value || '').trim(); if (!/^\d{4,6}$/.test(v)) return toastAdmin('PIN gồm 4 đến 6 chữ số.', true); ls.set('vgn.pin', v); renderSheet(); toastAdmin('Đã bật khoá PIN trên máy này.'); return; }
    if (k === 'clearPin'){ ls.del('vgn.pin'); renderSheet(); toastAdmin('Đã bỏ khoá PIN.'); return; }
  } catch (err){ a.disabled = false; toastAdmin(err && err.message && !err.code ? err.message : errText(err), true); }
});
let inT = null;
$('#shBody').addEventListener('input', e => {
  const el = e.target.closest('[data-in]'); if (!el) return;
  const v = el.type === 'range' || el.type === 'number' ? +el.value : el.value;
  setPath(S.cfg, el.dataset.in, v);
  if (el.type === 'range'){ const lab = el.closest('.fld') && el.closest('.fld').querySelector('label'); if (lab) lab.textContent = lab.textContent.replace(/·.*$/, '· ' + (el.dataset.in.endsWith('angle') ? v + '°' : Math.round(v*100) + '%')); }
  clearTimeout(inT); inT = setTimeout(() => afterCfg(false), el.type === 'color' || el.type === 'range' ? 60 : 350);
});
$('#shBody').addEventListener('change', async e => {
  const t = e.target;
  if (t.id === 'fImg' && t.files && t.files[0]){
    const m = $('#imgMsg'); if (m) m.textContent = 'Đang tải ảnh…';
    try { syncDraft(); const r = await readImage(t.files[0], 1600, false); S.edit.d.img = r.v; renderSheet(); }
    catch (err){ if (m){ m.textContent = err.message || 'Không tải được ảnh.'; m.className = 'msg err'; } }
  }
  if (t.id === 'fRestore' && t.files && t.files[0]){
    try {
      const j = JSON.parse(await t.files[0].text());
      if (!j || j.app !== 'vegas-navigation' || !j.data || typeof j.data !== 'object') throw new Error('File này không phải file sao lưu của Vegas Navigation.');
      cfgDirty = false; S.db.load(j.data); renderSheet(true);
      toastAdmin(`Đã nhập dữ liệu sao lưu ngày ${fmtAdmin(j.at || Date.now())}.`);
    } catch (err){ toastAdmin(err.message && !err.code ? err.message : 'Không đọc được file sao lưu.', true); }
    t.value = '';
  }
  if (t.id === 'fBg' && t.files && t.files[0]){
    const m = $('#bgMsg'); if (m) m.textContent = 'Đang tải…';
    try { const r = await readImage(t.files[0], 2400, true); const b = S.cfg.look.bg; b.type = 'image'; b.img = r.v; b.imgType = r.type; if (!b.tone) b.tone = 'dark'; afterCfg(); }
    catch (err){ if (m){ m.textContent = err.message || 'Không tải được tệp.'; m.className = 'msg err'; } }
  }
});

/* PIN pad (kiosk) */
function hidePin(){ const ov = $('#pinov'); ov.hidden = true; ov.innerHTML = ''; }
function showPin(pin){
  let v = ''; const ov = $('#pinov');
  const draw = err => { ov.innerHTML = `<div class="pinbox lg"><b>${esc(tr('pinT'))}</b><div class="pd${err ? ' err' : ''}">${Array.from({ length:pin.length }, (_, i) => `<i class="${i < v.length ? 'f' : ''}"></i>`).join('')}</div><div class="keys">${['1','2','3','4','5','6','7','8','9','×','0','⌫'].map(k => `<button class="press" data-k="${k}" aria-label="${k === '×' ? 'Cancel' : k === '⌫' ? 'Delete' : k}">${k}</button>`).join('')}</div></div>`; };
  draw(false); ov.hidden = false;
  ov.onclick = e => {
    const b = e.target.closest('[data-k]');
    if (!b){ if (e.target === ov) hidePin(); return; }
    const k = b.dataset.k;
    if (k === '×') return hidePin();
    if (k === '⌫') v = v.slice(0, -1); else v += k;
    if (v.length >= pin.length){ if (v === pin){ hidePin(); openSheet(); return; } v = ''; return draw(true); }
    draw(false);
  };
}

/* ================= STORE SUBSCRIPTIONS ================= */
function normAnn(id, d){
  if (!d || typeof d !== 'object') return null;
  const title = String(d.title || '').trim(); if (!title) return null;
  const num = v => (typeof v === 'number' && isFinite(v)) ? v : null;
  return { id, title, summary:String(d.summary || ''), body:String(d.body || ''), cat:CAT[d.cat] ? d.cat : 'notice', prio:['normal','featured','urgent'].includes(d.prio) ? d.prio : 'normal',
    start:num(d.start), end:num(d.end), place:String(d.place || ''), img:typeof d.img === 'string' ? d.img : '', on:d.on !== false, idle:!!d.idle, created:num(d.created), updated:num(d.updated), sample:!!d.sample, tr:cleanTr(d.tr, ['title','summary','body','place']) };
}
function normRule(id, d){
  if (!d || typeof d !== 'object') return null;
  const title = String(d.title || '').trim(); if (!title) return null;
  const num = v => (typeof v === 'number' && isFinite(v)) ? v : null;
  return { id, title, body:String(d.body || ''), ic:typeof d.ic === 'string' ? d.ic : 'shield', order:num(d.order) || 0, on:d.on !== false, tr:cleanTr(d.tr, ['title','body']), created:num(d.created), updated:num(d.updated), sample:!!d.sample };
}
function subscribe(){
  const db = S.db;
  db.collection('ann').limit(400).onSnapshot(snap => {
    S.anns = snap.docs.map(d => normAnn(d.id, d.data())).filter(Boolean);
    renderBoard(true);
    if (S.sheetOpen && S.tab === 'ann' && !S.edit) renderSheet();
  }, err => console.warn('ann', err));
  db.collection('rules').limit(200).onSnapshot(snap => {
    S.rules = snap.docs.map(d => normRule(d.id, d.data())).filter(Boolean);
    renderBoard(true);
    if (S.sheetOpen && S.tab === 'rules' && !S.redit) renderSheet();
  }, err => console.warn('rules', err));
  db.doc('config/kiosk').onSnapshot(snap => {
    if (cfgDirty) return;
    S.cfg = mergeCfg(snap.exists ? snap.data() : null);
    refreshAll();
    if (S.sheetOpen) renderSheet();
  }, err => console.warn('cfg', err));
  db.doc('config/machines').onSnapshot(snap => {
    const d = snap.exists ? (snap.data() || {}) : {};
    S.mach = { st:{ ...(d.st || {}), ...machPending }, zones:{ ...(d.zones || {}) } };
    renderTiles();
    if (S.mapOpen){ renderMapMachines(); if (!S.sel) renderMapPanel(); }
    if (S.sheetOpen && S.tab === 'map') renderSheet();
  }, err => console.warn('mach', err));
}

/* ================= BOOT ================= */
const gear = $('#gear'); let holdT = null;
gear.addEventListener('pointerdown', () => { gear.classList.add('hold'); clearTimeout(holdT); holdT = setTimeout(() => { holdT = null; gear.classList.remove('hold'); guardedOpen(); }, 1500); });
['pointerup','pointerleave','pointercancel'].forEach(ev => gear.addEventListener(ev, () => { if (holdT){ clearTimeout(holdT); holdT = null; gear.classList.remove('hold'); } }));
gear.addEventListener('click', () => { if (!S.sheetOpen && $('#pinov').hidden) toast(`${ico('lock')}<span>Giữ 1,5 giây để mở cài đặt</span>`); });
document.addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('input,textarea,select')) return;
  if (e.key === 'Escape'){
    if (S.sheetOpen) return closeSheet();
    if (!$('#pinov').hidden) return hidePin();
    if (S.detail){ S.detail = null; return renderDetail(); }
    if (S.mapOpen) return closeMap();
    if (S.view !== 'idle') return setView('idle');
  }
  if (S.sheetOpen) return;
  if ((e.key === 's' || e.key === 'S') && !e.metaKey && !e.ctrlKey && !e.altKey){ e.preventDefault(); guardedOpen(); }
  else if (e.key === 'f' || e.key === 'F'){ try { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {}); } catch {} }
});
async function wake(){ try { await navigator.wakeLock.request('screen'); } catch {} }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') wake(); });

Link.init();
applyLook(); setLang(null); wake();
requestAnimationFrame(frameLoop);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (S.mapOpen) setVB(fitBox(curBox(), 0)); });
(async () => {
  const c = window.claude;
  let db = null, user = null;
  if (c && c.use){ try { [db, user] = await Promise.all([c.use('db').catch(() => null), c.use('user').catch(() => null)]); } catch {} }
  if (db){
    S.db = db; S.mode = 'live';
    if (user){ try { S.canWrite = await user.can('data.write'); } catch { S.canWrite = null; } }
    c.use('assets').then(a => { S.assets = a; }).catch(() => {});
    c.use('sample').then(sm => { S.sample = sm; if (S.sheetOpen) renderSheet(); }).catch(() => {});
  } else { S.db = localDb(); S.mode = 'local'; S.canWrite = true; }
  subscribe();
  if (/^#(admin|settings)$/.test(location.hash)) guardedOpen();
})();
