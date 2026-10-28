/*
 * Vegas Navigation → Jackpot Dashboard remote receiver
 *
 * VI: Dán đoạn mã này vào trong thẻ <script> của Jackpot Dashboard, ngay bên dưới hàm go().
 *     Khi màn hình bar (Vegas Navigation) và Jackpot Dashboard chạy trên cùng một máy tính,
 *     cùng một trình duyệt và cùng một địa chỉ web (ví dụ cùng trang GitHub Pages),
 *     các nút Live / Day / Week / Month / Year sẽ chuyển màn hình Dashboard ngay lập tức.
 *
 * EN: Paste this inside the Jackpot Dashboard <script>, right below the go() function.
 *     It listens on BroadcastChannel('vegas-jackpot') and window messages, switches the tab,
 *     and answers with 'vegas:ack' so the bar screen shows the dashboard as connected.
 */
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
})();
