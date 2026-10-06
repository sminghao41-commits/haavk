/* ============================================================
   哈夫克集团 · 首页主视觉轮播 + 全站丝滑动效
   依赖：无（原生 JS）。可安全地在 file:// 下运行。
   ============================================================ */
(function () {
  'use strict';

  var doc = document;
  var body = doc.body;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 顶部滚动进度条 ---------- */
  var bar = doc.createElement('div');
  bar.className = 'hk-progress';
  bar.setAttribute('aria-hidden', 'true');
  body.appendChild(bar);

  /* ---------- 2. 主视觉轮播 ---------- */
  var hero = doc.getElementById('hero');
  var slides = hero ? [].slice.call(hero.querySelectorAll('.slide')) : [];
  var dots = doc.getElementById('hero-dots');
  var dotEls = dots ? [].slice.call(dots.querySelectorAll('.dot')) : [];
  var cur = 0;
  var timer = null;
  var STEP = 6400;              /* 每屏停留时间（毫秒） */

  /* 确定性开关（也方便截图/演示）：
     ?still=1   不自动轮播            ?slide=2  直接停在第 N 屏（1 起数） */
  var q = {};
  try {
    new URLSearchParams(window.location.search).forEach(function (v, k) { q[k] = v; });
  } catch (e) {}
  var still = /^(1|true|yes)$/i.test(q.still || '');
  var pinned = parseInt(q.slide || '0', 10);
  if (/^(1|true|yes)$/i.test(q.nofx || '')) {
    doc.documentElement.classList.add('no-fx');
    reduce = true;
  }
  if (q.art) doc.documentElement.setAttribute('data-art', q.art);

  function show(i, instant) {
    if (!slides.length) return;
    i = ((i % slides.length) + slides.length) % slides.length;
    if (i === cur && !instant) return;
    slides.forEach(function (s, k) {
      var on = (k === i);
      s.classList.toggle('on', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
    });
    dotEls.forEach(function (d, k) {
      var on = (k === i);
      d.classList.toggle('on', on);
      d.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    cur = i;
  }

  function play() {
    if (reduce || still || pinned > 0 || slides.length < 2) return;
    stop();
    timer = window.setInterval(function () { show(cur + 1); }, STEP);
  }
  function stop() { if (timer) { window.clearInterval(timer); timer = null; } }

  if (slides.length) {
    show(pinned > 0 ? pinned - 1 : 0, true);
    play();
    dotEls.forEach(function (d) {
      d.addEventListener('click', function () {
        show(parseInt(d.getAttribute('data-go'), 10) || 0);
        play();
      });
    });
    var deck = doc.getElementById('hero-deck');
    if (deck) {
      deck.addEventListener('mouseenter', stop);
      deck.addEventListener('mouseleave', play);
    }
    /* 手机上左右滑动切屏 */
    var x0 = null;
    hero.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) { show(cur + (dx < 0 ? 1 : -1)); play(); }
      x0 = null;
    }, { passive: true });
    /* 切走标签页时暂停，回来再继续 */
    doc.addEventListener('visibilitychange', function () { doc.hidden ? stop() : play(); });
  }

  /* ---------- 3. 滚动进场 ---------- */
  var revealEls = [].slice.call(doc.querySelectorAll('[data-reveal], .reveal-stagger'));
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var d = parseInt(el.getAttribute('data-delay') || '0', 10);
        if (d) el.style.transitionDelay = d + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 4. 数字滚动 ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var num = el.querySelector('.k-num') || el;      /* 只改数字节点，后缀 <small> 保持不动 */
    var m = /\.(\d+)/.exec(num.textContent || '');
    var dec = m ? m[1].length : 0;
    var dur = 1300;
    var t0 = null;
    function frame(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      var v = target * e;
      num.textContent = v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      if (p < 1) window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }
  var counters = [].slice.call(doc.querySelectorAll('[data-count]'));
  if (counters.length && !reduce && 'IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        countUp(en.target);
        io2.unobserve(en.target);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { io2.observe(el); });
  }

  /* ---------- 5. 吸顶状态 + 进度 ---------- */
  var ticking = false;
  function onScroll() {
    var y = window.pageYOffset || doc.documentElement.scrollTop;
    var h = doc.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, y / h) : 0;
    bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (y > 40) body.classList.add('hk-scrolled');
    else body.classList.remove('hk-scrolled');
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(onScroll);
  }, { passive: true });
  onScroll();

  /* ---------- 6. 锚点平滑滚动（补偿吸顶导航高度） ---------- */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href');
    if (!id || id === '#') return;
    var t = doc.querySelector(id);
    if (!t) return;
    e.preventDefault();
    var nav = doc.querySelector('.nav');
    var off = (nav ? nav.getBoundingClientRect().height : 0) + 8;
    var top = t.getBoundingClientRect().top + (window.pageYOffset || 0) - off;
    window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', id);
  });
})();
