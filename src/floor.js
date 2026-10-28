/* ================= FLOOR PLAN =================
   Map units are pixels of the club's floor-plan image (2050 × 1080).
   Floor 1 is the large plate on the left, Floor 2 the plate on the right. */
const MAP_W = 2050, MAP_H = 1080;
const ZC = { blue:'#3550d6', red:'#c43c28', plum:'#7d4fa6', gold:'#e3b230', olive:'#9c8534', green:'#2e9466', steel:'#3d6ea8', slate:'#677589' };
/* zone: floor, colour, default game type, label position */
const ZONES = {
  BK01:{ f:1, c:'blue',  type:'roulette', lx:150, ly:54 },
  BK02:{ f:1, c:'blue',  type:'roulette', lx:665, ly:127 },
  BT08:{ f:1, c:'slate', type:'baccarat', lx:970, ly:204 },
  BK08:{ f:1, c:'plum',  type:'slot',     lx:990, ly:288 },
  BT09:{ f:1, c:'steel', type:'slot',     lx:1030, ly:491 },
  BT10:{ f:1, c:'plum',  type:'baccarat', lx:858, ly:686 },
  BK03:{ f:1, c:'red',   type:'slot',     lx:761, ly:722 },
  BK04:{ f:1, c:'red',   type:'slot',     lx:972, ly:740 },
  BK02B:{ f:1, c:'red',  type:'slot',     lx:764, ly:902 },
  BK05:{ f:1, c:'red',   type:'slot',     lx:1135, ly:918 },
  BK06:{ f:1, c:'green', type:'slot',     lx:1276, ly:913 },
  BK07:{ f:1, c:'red',   type:'slot',     lx:1395, ly:750 },
  BK01B:{ f:1, c:'plum', type:'slot',     lx:345, ly:888 },
  ER01:{ f:2, c:'gold',  type:'roulette', lx:1892, ly:258 },
  BK13:{ f:2, c:'olive', type:'slot',     lx:1655, ly:567 },
  BK12:{ f:2, c:'olive', type:'slot',     lx:1907, ly:567 },
  BK11:{ f:2, c:'olive', type:'slot',     lx:1660, ly:902 },
  BK10:{ f:2, c:'olive', type:'slot',     lx:1790, ly:965 },
};
const MACH = [];
function addM(z, id, x, y, o){
  o = o || {};
  MACH.push({ id:String(id), z, x, y, w:o.w || 34, h:o.h || 42, side:o.side || 'n', rot:o.rot || 0, c:o.c || null });
}
/* axis-aligned machines: the seat is on `side`; portrait for n/s, landscape for e/w */
function line(z, ids, pts, side, o){
  o = o || {};
  const land = side === 'e' || side === 'w';
  ids.forEach((id, i) => addM(z, id, pts[i][0], pts[i][1], { side, w: land ? (o.d || 42) : (o.wd || 34), h: land ? (o.wd || 34) : (o.d || 42), c:o.c }));
}
const rowAt = (xs, y) => xs.map(x => [x, y]);
const colAt = (x, ys) => ys.map(y => [x, y]);
/* seats around a table or wheel: angle = direction the player faces away from (outward) */
function ring(z, ids, cx, cy, r, angles, o){
  o = o || {};
  ids.forEach((id, i) => { const a = angles[i] * Math.PI / 180; addM(z, id, cx + r*Math.cos(a), cy + r*Math.sin(a), { side:'n', rot: angles[i] + 90, w:o.w || 32, h:o.h || 32 }); });
}

/* ---- Floor 1 ---- */
line('BK01', [105,104,103,102,101], rowAt([265,308,353,400,445], 81), 'n');
addM('BK01', 106, 216, 101, { side:'n', rot:-45 });
line('BK01', [107,108,109,110,111], colAt(198, [145,186,226,266,306]), 'w');
addM('BK01', 112, 216, 347, { side:'n', rot:-135 });
line('BK01', [113,114,115,116,117], rowAt([265,316,359,404,446], 358), 's');

line('BK02', [231,230,229,228,227,226,225,224], rowAt([510,553,598,641,688,732,776,820], 81), 'n');
line('BK02', [223,222,221,220,219], rowAt([568,608,652,690,732], 171), 'n');
line('BK02', [218,217,216], colAt(779, [211,255,297]), 'e');
line('BK02', [210,211,212,213,214,215], rowAt([538,576,615,653,691,730], 341), 's');
line('BK02', [201,202,203,204,205,206,207,208,209], rowAt([489,527,565,605,645,682,720,760,801], 452), 's');

ring('BT08', [15,14,13,12,11], 970, 62, 86, [158,125,90,55,22], { w:34, h:34 });
line('BK08', [6006,6005,6004,6003,6002,6001], colAt(867, [217,254,291,328,365,402]), 'e', { d:33, wd:34 });
line('BT09', [501,502,503], rowAt([1062,1105,1146], 426), 's', { wd:33, d:28 });
line('BT09', [504,505], rowAt([1080,1127], 486), 's', { wd:33, d:28 });
line('BT09', [506,507,508], rowAt([1066,1109,1148], 548), 's', { wd:33, d:28 });
line('BT09', [509,510], rowAt([1084,1131], 622), 's', { wd:33, d:28 });
ring('BT10', [21,22,23,24,25], 900, 570, 76, [-70,-36,0,36,72], { w:32, h:30 });

line('BK03', [1020,1019,1018,1017], colAt(691, [749,785,820,856]), 'e', { d:44, wd:34 });
line('BK03', [1001,1002,1003,1004], colAt(830, [747,782,817,852]), 'w', { d:42, wd:34 });
line('BK04', [1030,1029,1028,1027,1026,1025], colAt(897, [708,743,777,812,846,881]), 'e', { d:44, wd:33 });
line('BK04', [1503,1504], colAt(1025, [781,823]), 'w', { d:35, wd:28, c:'green' });
line('BK02B', [1012,1011,1010,1009], colAt(693, [924,959,995,1030]), 'e', { d:43, wd:34 });
line('BK02B', [1013,1014,1015,1016], colAt(836, [924,959,995,1030]), 'w', { d:43, wd:34 });

line('BK07', [2015,2016,2017,2018,2019,2020,2021], rowAt([1196,1238,1282,1329,1373,1417,1463], 699), 's', { wd:36 });
line('BK07', [2022,2023,2024], [[1457,786],[1456,832],[1453,878]], 'w', { d:36, wd:34 });
addM('BK07', 2025, 1446, 930, { side:'n', rot:-49, w:34, h:38 });
addM('BK07', 2026, 1421, 974, { side:'n', rot:-34, w:34, h:38 });
addM('BK07', 2027, 1382, 1002, { side:'n', rot:-20, w:34, h:38 });
line('BK07', [1008,2007,2008], rowAt([1235,1282,1332], 806), 'n');
line('BK07', [1005,1006,1007], rowAt([1235,1282,1332], 855), 's');
line('BK05', [2003,2002,2001], colAt(1077, [948,986,1025]), 'e', { d:37, wd:36 });
line('BK05', [2004,2005,2006], colAt(1190, [946,985,1024]), 'w', { d:34, wd:34 });
line('BK06', [2011,2012], [[1275,947],[1277,1004]], 'e', { d:40, wd:32 });
line('BK01B', [7004,7003,7002,7001], colAt(271, [918,956,994,1031]), 'e', { d:36, wd:32 });
line('BK01B', [7005,7006,7007,7008], colAt(418, [916,953,992,1030]), 'w', { d:36, wd:32 });

/* ---- Floor 2 ---- */
{ const cx = 1727, cy = 20;
  [[301,1633,111],[302,1676,137],[303,1727,150],[304,1778,137],[305,1824,115]].forEach(([id,x,y]) => {
    const a = Math.atan2(y - cy, x - cx) * 180 / Math.PI;
    addM('ER01', id, x, y, { side:'s', rot: a - 90, w:35, h:40 });
  });
}
line('ER01', [306,307,308,309], rowAt([1647,1697,1760,1808], 210), 's', { wd:35, d:36 });
line('ER01', [310,311,312,313], rowAt([1647,1697,1760,1808], 275), 's', { wd:35, d:36 });
line('ER01', [314,315,316,317], rowAt([1647,1697,1760,1808], 341), 's', { wd:35, d:36 });
line('BK13', [3028,3027], rowAt([1613,1689], 440), 'n', { wd:34, d:36 });
line('BK13', [3024,3025,3026], rowAt([1581,1652,1715], 507), 's', { wd:34, d:36 });
line('BK13', [3023,3022,3021], rowAt([1581,1652,1715], 621), 'n', { wd:34, d:36 });
line('BK12', [3013,3014], rowAt([1865,1942], 440), 'n', { wd:34, d:36 });
line('BK12', [3016,3017,3018], rowAt([1824,1907,1981], 508), 's', { wd:34, d:36 });
line('BK12', [3019,3015,3020], rowAt([1824,1907,1981], 618), 'n', { wd:34, d:36 });
line('BK11', [3010,3011,3012], rowAt([1571,1645,1715], 802), 's', { wd:34, d:42 });
addM('BK11', 3008, 1629, 997, { side:'n', rot:30, w:34, h:40 });
line('BK11', [3007], [[1716,1026]], 'n', { wd:34, d:42 });
line('BK10', [3004,3005,3006], rowAt([1853,1918,1987], 903), 's', { wd:34, d:44 });
line('BK10', [3003,3002,3001], rowAt([1853,1918,1987], 1025), 'n', { wd:34, d:42 });

/* statuses read from the floor plan: avatar = in use, booking icon = reserved, dark = maintenance */
const SEED_STATUS = (() => {
  const s = {};
  const put = (st, list) => list.split(/\s+/).filter(Boolean).forEach(id => s[id] = st);
  put('busy', '109 112 114 116 224 225 226 227 228 229 230 231 223 221 220 217 210 211 213 215 201 203 204 206 13 6005 6003 6002 6001 501 503 504 505 508 509 1020 1019 1001 1002 1004 1030 1029 1026 1025 1011 1010 1009 1013 1014 1016 2015 2016 2019 2020 2021 2024 2025 2027 2007 2008 1006 2002 2005 2006 3023 3013 3017 3019 3010 3008 3005 3002');
  put('resv', '101 102 103 104 105 110 207 209 1007');
  put('off', '2022');
  return s;
})();

/* ---- architecture ---- */
const PLATES = [
  { f:1, d:'M24 26H1490V812A178 240 0 0 1 1312 1052H24Z' },
  { f:2, d:'M1530 26H2036V1052H1735A205 240 0 0 1 1530 812Z' },
];
/* rooms and fixtures that people walk around. k = drawing style */
const ROOMS = [
  { r:[24,158,137,297], k:'room' },
  { r:[24,297,137,410], k:'stairs' },
  { r:[24,410,137,512], k:'room' },
  { r:[24,512,182,655], k:'room' },
  { r:[137,405,272,512], k:'wc', lab:'WC' },
  { r:[272,405,362,570], k:'wc', lab:'WC' },
  { r:[362,405,458,570], k:'wc', lab:'WC' },
  { r:[182,512,272,570], k:'room' },
  { r:[182,570,282,655], k:'shaft' },
  { r:[440,515,655,650], k:'lift', lab:'Lift' },
  { r:[655,505,872,655], k:'fan', lab:'Stairs A' },
  { r:[315,210,468,275], k:'station' },
  { r:[1015,182,1202,272], k:'cashier', lab:'Cashier' },
  { r:[1055,312,1202,395], k:'room' },
  { r:[1170,26,1490,670], k:'void' },
  { r:[465,930,640,1050], k:'counter', gm:true },
  { r:[885,930,1055,1050], k:'fan2', lab:'Stairs B' },
  /* floor 2 */
  { r:[1887,26,2036,118], k:'room' },
  { r:[1532,678,1690,765], k:'spiral', lab:'Stairs' },
  { r:[1935,678,2032,732], k:'cashier', lab:'Cashier' },
  { r:[1920,720,1935,765], k:'solid' },
  { r:[1967,735,2036,765], k:'solid' },
  { r:[1837,765,1882,877], k:'bar' },
  { r:[1837,822,2007,877], k:'bar', lab:'Bar' },
];
const PILLARS = [[232,735,252,812],[222,812,262,847],[443,735,463,812],[435,812,471,847],[26,812,56,847],[640,730,670,845],[852,730,876,845],[645,937,667,1052],[860,937,882,1052],[537,252,560,278],[1165,500,1195,523],[1152,615,1172,662]];
const BENCHES = [[1572,172,1625,198],[1834,172,1890,198],[1572,317,1625,343],[1834,317,1890,343],[1572,465,1628,484],[1834,465,1890,484]];
const WALL_LINES = [[1085,26,1085,182],[1170,26,1170,182],[1532,767,1745,767],[1745,767,1745,822]];
const THIN_LINES = [[1735,772,1735,1052],[1862,932,1862,992],[1862,992,2030,992],[56,657,640,657],[56,733,640,733]];
const WHEELS = [[269,148,40],[661,265,41],[1727,80,40]];
const OVALS = [[335,112,138,76],[950,301,80,140]];          /* x, y, w, h (stadium tables) */
const HALF_TABLES = [[970,62,68,'down'],[900,570,52,'right']]; /* baccarat / blackjack tables */
const DESK = { x0:1047, y0:757, x1:1185, y1:847, t:26, leg:33 }; /* the U-shaped GM desk */
const START_DEFAULT = { x:552, y:912 };
const STAIRS = {
  A:{ name:'Stairs A', f1:{ x:763, y:672 }, f2:{ x:1708, y:722 } },
  B:{ name:'Stairs B', f1:{ x:970, y:916 }, f2:{ x:1708, y:722 } },
};
const LANDMARKS = [
  { f:1, k:'cashier', x:1108, y:227 }, { f:1, k:'wc', x:300, y:487 }, { f:1, k:'lift', x:548, y:583 },
  { f:1, k:'stairsA', x:763, y:580 }, { f:1, k:'stairsB', x:970, y:990 }, { f:1, k:'gm', x:552, y:990 },
  { f:1, k:'roulette', x:661, y:265 }, { f:1, k:'roulette', x:269, y:148 }, { f:1, k:'baccarat', x:970, y:90 },
  { f:2, k:'cashier', x:1983, y:705 }, { f:2, k:'bar', x:1920, y:850 }, { f:2, k:'stairs', x:1611, y:721 }, { f:2, k:'roulette', x:1727, y:80 },
];
const M_PER_UNIT = 0.022; /* one machine cabinet ≈ 0.75 m */
