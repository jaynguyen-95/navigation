/* ================= MAP DRAWING ================= */
const r1 = n => Math.round(n * 10) / 10;
function svgRoom(o){
  const [x0,y0,x1,y1] = o.r, w = x1-x0, h = y1-y0, cx = (x0+x1)/2, cy = (y0+y1)/2;
  let s = '';
  const base = (cls) => `<rect class="${cls}" x="${x0}" y="${y0}" width="${w}" height="${h}" rx="4"/>`;
  switch (o.k){
    case 'stairs': {
      s += base('rm st');
      for (let y = y0 + 8; y < y1 - 4; y += 9) s += `<line class="step" x1="${x0+6}" y1="${y}" x2="${x1-6}" y2="${y}"/>`;
      s += `<line class="rail" x1="${cx}" y1="${y0+6}" x2="${cx}" y2="${y1-6}"/>`;
      break;
    }
    case 'fan': case 'fan2': {
      const cid = 'cp' + x0 + '_' + y0;
      s += `<clipPath id="${cid}"><rect x="${x0+3}" y="${y0+3}" width="${w-6}" height="${h-6}" rx="3"/></clipPath>` + base('rm st') + `<g clip-path="url(#${cid})">`;
      const up = o.k === 'fan';
      const fx = cx, fy = up ? y1 - 24 : y0 + 66;
      const edge = up ? y0 + 6 : y1 - 4;
      for (let i = 0; i <= 12; i++){ const x = x0 + 6 + (w - 12) * i / 12; s += `<line class="step" x1="${r1(fx)}" y1="${fy}" x2="${r1(x)}" y2="${edge}"/>`; }
      if (!up) { s += `<line class="step" x1="${x0+6}" y1="${fy}" x2="${x0+6}" y2="${edge}"/><line class="step" x1="${x1-6}" y1="${fy}" x2="${x1-6}" y2="${edge}"/>`; for (let y = y0 + 10; y < fy; y += 9){ s += `<line class="step" x1="${x0+8}" y1="${y}" x2="${fx-24}" y2="${y}"/><line class="step" x1="${fx+24}" y1="${y}" x2="${x1-8}" y2="${y}"/>`; } }
      for (let k = 1; k <= 5; k++){ const rr = 20 * k; s += `<path class="step" d="M${r1(fx-rr)} ${fy}A${rr} ${rr} 0 0 ${up ? 1 : 0} ${r1(fx+rr)} ${fy}"/>`; }
      s += `</g><rect class="landing" x="${fx-19}" y="${up ? y1-48 : y0+4}" width="38" height="${up ? 44 : 62}" rx="18"/>`;
      break;
    }
    case 'spiral': {
      s += base('rm st');
      const sx = x0 + 34, sy = y0 + 44;
      for (let a = 0; a < 360; a += 30){ const t = a * Math.PI/180; s += `<line class="step" x1="${sx}" y1="${sy}" x2="${r1(sx + 30*Math.cos(t))}" y2="${r1(sy + 30*Math.sin(t))}"/>`; }
      s += `<circle class="step" cx="${sx}" cy="${sy}" r="30" fill="none"/>`;
      for (let x = x0 + 72; x < x1 - 4; x += 10) s += `<line class="step" x1="${x}" y1="${y0+10}" x2="${x}" y2="${y1-10}"/>`;
      s += `<line class="rail" x1="${x0+68}" y1="${cy}" x2="${x1-6}" y2="${cy}"/>`;
      break;
    }
    case 'lift': {
      s += base('rm');
      [[x0+22, 82], [x0+118, 84]].forEach(([lx, lw]) => {
        s += `<rect class="car" x="${lx}" y="${y0+26}" width="${lw}" height="${h-50}" rx="4"/><line class="door" x1="${lx+lw/2}" y1="${y0+30}" x2="${lx+lw/2}" y2="${y1-28}"/><rect class="sill" x="${lx+6}" y="${y1-22}" width="${lw-12}" height="7" rx="2"/>`;
      });
      break;
    }
    case 'shaft': s += base('rm') + `<path class="xline" d="M${x0+10} ${y0+10}L${x1-10} ${y1-10}M${x1-10} ${y0+10}L${x0+10} ${y1-10}"/>`; break;
    case 'wc': {
      s += base('rm wc');
      const n = w > 110 ? 3 : 1;
      for (let i = 0; i < n; i++){ const tx = x0 + w*(i+.5)/n; s += `<rect class="loo" x="${r1(tx-12)}" y="${y0+12}" width="24" height="10" rx="3"/><ellipse class="loo" cx="${r1(tx)}" cy="${y0+34}" rx="11" ry="14"/>`; }
      break;
    }
    case 'station': s += `<rect class="station" x="${x0}" y="${y0}" width="${w}" height="${h}" rx="6"/><rect class="station-in" x="${x0+10}" y="${y0+10}" width="${w-60}" height="${h-20}" rx="4"/><rect class="station-in" x="${x1-44}" y="${y0+10}" width="34" height="${h-20}" rx="10"/>`; break;
    case 'cashier': s += `<rect class="cash" x="${x0}" y="${y0}" width="${w}" height="${h}" rx="8"/>`; break;
    case 'void': s += `<rect class="void" x="${x0}" y="${y0}" width="${w}" height="${h}"/>`; break;
    case 'counter': s += `<path class="counter${o.gm ? ' gmc' : ''}" d="M${x0} ${y0+8}h${w-30}v${h*.38}h30V${y1}H${x0}Z"/><rect class="wood" x="${x0+14}" y="${y0+22}" width="${w-60}" height="${h*.32}" rx="3"/><rect class="wood" x="${x0+8}" y="${y1-38}" width="${w-16}" height="28" rx="3"/>`
      + (o.gm ? `<text class="desk-lab" x="${x0 + 14 + (w-60)/2}" y="${y0 + 22 + h*.16 + 6}">${esc(tr('GM'))}</text>` : ''); break;
    case 'solid': s += `<rect class="solid" x="${x0}" y="${y0}" width="${w}" height="${h}"/>`; break;
    case 'bar': s += `<rect class="counter" x="${x0}" y="${y0}" width="${w}" height="${h}" rx="5"/><rect class="wood" x="${x0+8}" y="${y0+8}" width="${w-16}" height="${h-16}" rx="3"/>`; break;
    default: s += base('rm');
  }
  if (o.lab) s += `<text class="rlab${o.k === 'cashier' ? ' on-wood' : ''}" x="${cx}" y="${o.k === 'bar' ? cy + 7 : cy + 6}">${esc(trMap(o.lab))}</text>`;
  return s;
}
function svgStatic(){
  let s = `<defs>
    <pattern id="hatch" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" class="void-bg"/><line x1="0" y1="0" x2="0" y2="14" class="hatch"/></pattern>
    <radialGradient id="felt" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#3f8a64"/><stop offset="1" stop-color="#1f5a3e"/></radialGradient>
    <radialGradient id="feltDark" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#3a4a3e"/><stop offset="1" stop-color="#1b241e"/></radialGradient>
    <filter id="plateSh" x="-5%" y="-5%" width="110%" height="115%"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#2a1a0a" flood-opacity=".22"/></filter>
  </defs>`;
  PLATES.forEach(p => { s += `<path class="plate" d="${p.d}" filter="url(#plateSh)"/>`; });
  s += `<rect class="hall" x="56" y="657" width="584" height="76"/>`;
  THIN_LINES.forEach(([a,b,c,d]) => { s += `<line class="thin" x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`; });
  ROOMS.forEach(o => { s += svgRoom(o); });
  PILLARS.forEach(([a,b,c,d]) => { s += `<rect class="pillar" x="${a}" y="${b}" width="${c-a}" height="${d-b}" rx="2"/>`; });
  BENCHES.forEach(([a,b,c,d]) => { s += `<rect class="bench" x="${a}" y="${b}" width="${c-a}" height="${d-b}" rx="7"/><line class="bench-l" x1="${a+8}" y1="${(b+d)/2}" x2="${c-8}" y2="${(b+d)/2}"/>`; });
  WALL_LINES.forEach(([a,b,c,d]) => { s += `<line class="wall" x1="${a}" y1="${b}" x2="${c}" y2="${d}"/>`; });
  PLATES.forEach(p => { s += `<path class="plate-edge" d="${p.d}"/>`; });
  OVALS.forEach(([x,y,w,h], i) => {
    const rr = Math.min(w,h)/2;
    s += `<rect class="table-rim" x="${x}" y="${y}" width="${w}" height="${h}" rx="${rr}"/><rect x="${x+7}" y="${y+7}" width="${w-14}" height="${h-14}" rx="${rr-7}" fill="url(#feltDark)"/>`;
    if (i === 1) s += `<circle cx="${x+w/2}" cy="${y+h-34}" r="16" class="wheel-in"/><circle cx="${x+w/2}" cy="${y+h-34}" r="6" class="wheel-hub"/>`;
    else s += `<circle cx="${x+30}" cy="${y+h/2}" r="10" class="wheel-hub"/>`;
  });
  HALF_TABLES.forEach(([cx,cy,r,dir]) => {
    const d = dir === 'down' ? `M${cx-r} ${cy}A${r} ${r} 0 0 0 ${cx+r} ${cy}Z` : `M${cx} ${cy-r}A${r} ${r} 0 0 1 ${cx} ${cy+r}Z`;
    const di = dir === 'down' ? `M${cx-r+9} ${cy}A${r-9} ${r-9} 0 0 0 ${cx+r-9} ${cy}Z` : `M${cx} ${cy-r+9}A${r-9} ${r-9} 0 0 1 ${cx} ${cy+r-9}Z`;
    s += `<path class="table-rim" d="${d}"/><path d="${di}" fill="url(#felt)"/>`;
  });
  WHEELS.forEach(([cx,cy,r]) => {
    s += `<circle class="wheel-rim" cx="${cx}" cy="${cy}" r="${r}"/><circle class="wheel-in" cx="${cx}" cy="${cy}" r="${r-8}"/>`;
    for (let a = 0; a < 360; a += 22.5){ const t = a*Math.PI/180; s += `<line class="wheel-sp" x1="${r1(cx+(r-26)*Math.cos(t))}" y1="${r1(cy+(r-26)*Math.sin(t))}" x2="${r1(cx+(r-10)*Math.cos(t))}" y2="${r1(cy+(r-10)*Math.sin(t))}"/>`; }
    s += `<circle class="wheel-hub" cx="${cx}" cy="${cy}" r="9"/>`;
  });
  const D = DESK;
  s += `<path class="desk" d="M${D.x0} ${D.y0}H${D.x1}V${D.y1}H${D.x1-D.leg}V${D.y0+D.t}H${D.x0+D.leg}V${D.y1}H${D.x0}Z"/>`;
  Object.entries(ZONES).forEach(([z, o]) => { s += `<text class="zlab" x="${o.lx}" y="${o.ly}">${zoneName(z)}</text>`; });
  s += `<g class="flab"><rect x="24" y="-58" width="214" height="44" rx="22"/><text x="131" y="-28">${esc(tr('floor1'))}</text></g>`;
  s += `<g class="flab"><rect x="1530" y="-58" width="214" height="44" rx="22"/><text x="1637" y="-28">${esc(tr('floor2'))}</text></g>`;
  s += `<g class="entr"><path d="M1490 1066l20-18 20 18"/><text x="1510" y="1094">${esc(tr('entrance'))}</text></g>`;
  return s;
}
/* local outward normal of a machine's seat side, rotated into map space */
function seatPoint(m, extra){
  const n = { n:[0,-1], s:[0,1], e:[1,0], w:[-1,0] }[m.side] || [0,-1];
  const half = (m.side === 'n' || m.side === 's') ? m.h/2 : m.w/2;
  const d = half + (extra == null ? 16 : extra);
  const t = m.rot * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t);
  const vx = n[0]*c - n[1]*sn, vy = n[0]*sn + n[1]*c;
  return { x: m.x + vx*d, y: m.y + vy*d };
}
function stripRect(m){
  const t = 7;
  switch (m.side){
    case 's': return [-m.w/2, m.h/2 - t, m.w, t];
    case 'e': return [m.w/2 - t, -m.h/2, t, m.h];
    case 'w': return [-m.w/2, -m.h/2, t, m.h];
    default:  return [-m.w/2, -m.h/2, m.w, t];
  }
}
function svgMachines(){
  let g = '', t = '', d = '';
  for (const m of MACH){
    const col = ZC[m.c || ZONES[m.z].c];
    const [sx,sy,sw,sh] = stripRect(m);
    const st = machineStatus(m.id);
    g += `<g class="m s-${st}" data-id="${m.id}" transform="translate(${r1(m.x)} ${r1(m.y)}) rotate(${r1(m.rot)})">`
      + `<rect class="mh" x="${-m.w/2-8}" y="${-m.h/2-8}" width="${m.w+16}" height="${m.h+16}" rx="10"/>`
      + `<rect class="mb" x="${-m.w/2}" y="${-m.h/2}" width="${m.w}" height="${m.h}" rx="6" fill="${col}"/>`
      + `<rect class="ms" x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="3"/></g>`;
    const fs = m.id.length >= 4 ? 11.5 : 13;
    t += `<text class="mt s-${st}" data-id="${m.id}" x="${r1(m.x)}" y="${r1(m.y + fs*.36)}" style="font-size:${fs}px">${m.id}</text>`;
    if (st === 'busy' || st === 'resv'){ const p = seatPoint(m, 7); d += `<circle class="sd sd-${st}" cx="${r1(p.x)}" cy="${r1(p.y)}" r="6.5"/>`; }
  }
  return `<g id="mBodies">${g}</g><g id="mDots">${d}</g><g id="mText">${t}</g>`;
}

/* ================= ROUTING (grid + A*) ================= */
const CELL = 6, GW = Math.ceil(MAP_W / CELL), GH = Math.ceil(MAP_H / CELL);
let GRID = null;
function buildGrid(){
  const cv = document.createElement('canvas'); cv.width = GW; cv.height = GH;
  const x = cv.getContext('2d', { willReadFrequently:true });
  x.fillStyle = '#000'; x.fillRect(0, 0, GW, GH);
  x.save(); x.scale(1/CELL, 1/CELL);
  x.fillStyle = '#fff'; PLATES.forEach(p => x.fill(new Path2D(p.d)));
  const PAD = 7;
  x.fillStyle = '#000'; x.strokeStyle = '#000'; x.lineJoin = 'round'; x.lineCap = 'round';
  x.lineWidth = 9 + PAD*2; PLATES.forEach(p => x.stroke(new Path2D(p.d)));
  const box = (x0,y0,x1,y1,p) => { p = p == null ? PAD : p; x.fillRect(x0-p, y0-p, x1-x0+2*p, y1-y0+2*p); };
  ROOMS.forEach(o => box(...o.r)); PILLARS.forEach(p => box(...p)); BENCHES.forEach(b => box(...b, 5));
  x.lineWidth = 8 + PAD*2; WALL_LINES.forEach(([a,b,c,d]) => { x.beginPath(); x.moveTo(a,b); x.lineTo(c,d); x.stroke(); });
  WHEELS.forEach(([cx,cy,r]) => { x.beginPath(); x.arc(cx, cy, r + PAD, 0, 7); x.fill(); });
  OVALS.forEach(([ox,oy,w,h]) => box(ox, oy, ox+w, oy+h));
  HALF_TABLES.forEach(([cx,cy,r]) => { x.beginPath(); x.arc(cx, cy, r + PAD, 0, 7); x.fill(); });
  const D = DESK;
  box(D.x0, D.y0, D.x1, D.y0 + D.t); box(D.x0, D.y0, D.x0 + D.leg, D.y1); box(D.x1 - D.leg, D.y0, D.x1, D.y1);
  for (const m of MACH){ x.save(); x.translate(m.x, m.y); x.rotate(m.rot*Math.PI/180); x.fillRect(-m.w/2-5, -m.h/2-5, m.w+10, m.h+10); x.restore(); }
  x.restore();
  const px = x.getImageData(0, 0, GW, GH).data;
  GRID = new Uint8Array(GW*GH);
  for (let i = 0; i < GW*GH; i++) GRID[i] = px[i*4] > 150 ? 1 : 0;
}
const free = (cx, cy) => cx >= 0 && cy >= 0 && cx < GW && cy < GH && GRID[cy*GW + cx] === 1;
function nearestFree(px, py){
  const cx = Math.floor(px / CELL), cy = Math.floor(py / CELL);
  if (free(cx, cy)) return [cx, cy];
  for (let r = 1; r < 16; r++){
    let best = null, bd = 1e9;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++){
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      if (free(cx+dx, cy+dy)){ const d = dx*dx + dy*dy; if (d < bd){ bd = d; best = [cx+dx, cy+dy]; } }
    }
    if (best) return best;
  }
  return null;
}
function astar(s, t){
  const N = GW*GH, start = s[1]*GW + s[0], goal = t[1]*GW + t[0];
  const g = new Float32Array(N).fill(Infinity), came = new Int32Array(N).fill(-1), shut = new Uint8Array(N);
  const heap = [], push = (f, i) => { heap.push([f, i]); let k = heap.length - 1; while (k > 0){ const p = (k-1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length){ heap[0] = last; let k = 0; for (;;){ const l = 2*k+1, r = l+1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
  const h = i => { const dx = Math.abs(i % GW - t[0]), dy = Math.abs(((i / GW) | 0) - t[1]); return (dx + dy) + (Math.SQRT2 - 2) * Math.min(dx, dy); };
  g[start] = 0; push(h(start), start);
  const D8 = [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,Math.SQRT2],[1,-1,Math.SQRT2],[-1,1,Math.SQRT2],[-1,-1,Math.SQRT2]];
  while (heap.length){
    const [, i] = pop();
    if (i === goal) break;
    if (shut[i]) continue; shut[i] = 1;
    const x = i % GW, y = (i / GW) | 0;
    for (const [dx, dy, c] of D8){
      const nx = x + dx, ny = y + dy;
      if (!free(nx, ny)) continue;
      if (dx && dy && (!free(x+dx, y) || !free(x, y+dy))) continue;
      const j = ny*GW + nx, ng = g[i] + c;
      if (ng < g[j]){ g[j] = ng; came[j] = i; push(ng + h(j), j); }
    }
  }
  if (came[goal] === -1 && goal !== start) return null;
  const out = []; for (let i = goal; i !== -1; i = came[i]) out.push([i % GW, (i / GW) | 0]);
  return out.reverse();
}
function sight(a, b){
  const dx = b[0]-a[0], dy = b[1]-a[1], n = Math.ceil(Math.hypot(dx, dy) * 2.5);
  for (let k = 0; k <= n; k++){
    const x = a[0] + dx*k/n, y = a[1] + dy*k/n;
    if (!free(Math.floor(x), Math.floor(y)) || !free(Math.ceil(x), Math.ceil(y)) || !free(Math.floor(x), Math.ceil(y)) || !free(Math.ceil(x), Math.floor(y))) return false;
  }
  return true;
}
function findPath(from, to){
  if (!GRID) buildGrid();
  const s = nearestFree(from.x, from.y), t = nearestFree(to.x, to.y);
  if (!s || !t) return null;
  const cells = astar(s, t);
  if (!cells) return null;
  const pts = [cells[0]];
  let i = 0;
  while (i < cells.length - 1){
    let j = cells.length - 1;
    while (j > i + 1 && !sight(cells[i], cells[j])) j--;
    pts.push(cells[j]); i = j;
  }
  const P = pts.map(([cx, cy]) => ({ x:(cx + .5)*CELL, y:(cy + .5)*CELL }));
  P[0] = { x:from.x, y:from.y };
  P.push({ x:to.x, y:to.y });
  return P;
}
const pathLen = P => P.reduce((a, p, i) => i ? a + Math.hypot(p.x - P[i-1].x, p.y - P[i-1].y) : 0, 0);
function roundedPath(P, rad){
  if (!P || P.length < 2) return '';
  let d = `M${r1(P[0].x)} ${r1(P[0].y)}`;
  for (let i = 1; i < P.length - 1; i++){
    const a = P[i-1], b = P[i], c = P[i+1];
    const l1 = Math.hypot(b.x-a.x, b.y-a.y), l2 = Math.hypot(c.x-b.x, c.y-b.y);
    const r = Math.min(rad, l1/2, l2/2);
    const p1 = { x: b.x + (a.x-b.x)*r/l1, y: b.y + (a.y-b.y)*r/l1 }, p2 = { x: b.x + (c.x-b.x)*r/l2, y: b.y + (c.y-b.y)*r/l2 };
    d += `L${r1(p1.x)} ${r1(p1.y)}Q${r1(b.x)} ${r1(b.y)} ${r1(p2.x)} ${r1(p2.y)}`;
  }
  const z = P[P.length-1]; d += `L${r1(z.x)} ${r1(z.y)}`;
  return d;
}
