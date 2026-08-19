/* ──────────────────────────────────────────────────────────────
   예울마루 공연 상세페이지 임베드용 보정
   stay.html 안에서 <script src="/promo/embed-tweaks.js"></script> 로 불림.

   stay.html은 번들 페이지라서 로딩이 끝나면
   document.documentElement.replaceWith(...) 로 문서 전체를 갈아치운다.
   그래서 <head>에 style을 직접 넣어두면 지워진다.
   → MutationObserver로 교체를 감지해 style을 다시 붙인다.

   값 조정은 아래 SCALE / PAGE_BG 두 개만 고치면 된다.
   ────────────────────────────────────────────────────────────── */
(function () {
  var SCALE = 1.3;        // 확대 배율 (1.3 = 30% 확대)
  var SCALE_MIN_W = 780;  // 이 폭 이상에서만 확대 (좁은 화면은 이미 꽉 차므로 원본 유지)
  var PAGE_BG = '#ffffff'; // 콘텐츠 좌우 여백 색

  var CSS = [
    /* 좌우 여백·바탕을 흰색으로 (원래 rgb(232,230,226) 회색) */
    'html{background:' + PAGE_BG + ' !important;}',
    'body{background:' + PAGE_BG + ' !important;margin:0 !important;padding:0 !important;}',
    '#dc-root,#dc-root>.sc-host,#dc-root>.sc-host>div{background:' + PAGE_BG + ' !important;}',

    /* 상단 공백 제거 — 첫 화면이 iframe 맨 위에 딱 붙게 */
    '#dc-root>.sc-host>div>div{margin-top:0 !important;}',

    /* 비율 유지한 채 확대 */
    '@media (min-width:' + SCALE_MIN_W + 'px){html{zoom:' + SCALE + ';}}'
  ].join('\n');

  var ID = 'ym-embed-tweaks';

  function apply() {
    var d = document;
    var head = d.head || d.documentElement;
    if (!head) return;
    if (d.getElementById(ID)) return;
    var s = d.createElement('style');
    s.id = ID;
    s.textContent = CSS;
    head.appendChild(s);
  }

  apply();

  // 문서 통째 교체(replaceWith)를 포함해 어떤 변화든 감지되면 다시 붙인다.
  try {
    new MutationObserver(apply).observe(document, { childList: true, subtree: true });
  } catch (e) { /* 구형 브라우저 무시 */ }

  document.addEventListener('DOMContentLoaded', apply);
  window.addEventListener('load', apply);
  [0, 200, 600, 1500, 3000].forEach(function (t) { setTimeout(apply, t); });
})();
