/* ============================================================
   哈夫克集团 · 官网共享脚本
   ============================================================ */

/* 顶层用 var 声明，使其成为 window.Haavk，供 forum.js / portal.js 读取 */
var Haavk = (() => {

  /* ---------- 轻量提示 ---------- */
  function toast(msg, ms = 2400) {
    let el = document.getElementById('hk-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'hk-toast';
      el.style.cssText = [
        'position:fixed', 'left:50%', 'bottom:38px', 'transform:translateX(-50%) translateY(14px)',
        'background:#1C1F26', 'color:#fff', 'padding:11px 20px', 'font-size:14px',
        'letter-spacing:.04em', 'border-left:3px solid #249CE4', 'border-radius:2px',
        'box-shadow:0 12px 30px rgba(0,0,0,.28)', 'opacity:0', 'transition:.22s',
        'z-index:9999', 'pointer-events:none', 'max-width:80vw'
      ].join(';');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(0)';
    });
    clearTimeout(el._t);
    el._t = setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(14px)';
    }, ms);
  }

  /* ---------- 顶栏时钟与周数 ---------- */
  function startClock() {
    const c = document.getElementById('clock');
    const w = document.getElementById('week');
    const tick = () => {
      const d = new Date();
      if (c) c.textContent = d.toLocaleTimeString('zh-CN', { hour12: false });
      if (w) {
        const start = new Date(d.getFullYear(), 0, 1);
        const n = Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
        w.textContent = String(n).padStart(2, '0');
      }
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ---------- 本地存储 ---------- */
  const store = {
    get(k, dflt) {
      try { const v = localStorage.getItem('haavk:' + k); return v ? JSON.parse(v) : dflt; }
      catch (e) { return dflt; }
    },
    set(k, v) {
      try { localStorage.setItem('haavk:' + k, JSON.stringify(v)); } catch (e) {}
    },
    del(k) { try { localStorage.removeItem('haavk:' + k); } catch (e) {} }
  };

  /* ---------- 时间格式 ---------- */
  function ago(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return '刚刚';
    if (s < 3600) return Math.floor(s / 60) + ' 分钟前';
    if (s < 86400) return Math.floor(s / 3600) + ' 小时前';
    if (s < 86400 * 30) return Math.floor(s / 86400) + ' 天前';
    const d = new Date(ts);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function fmt(ts) {
    const d = new Date(ts);
    const p = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  /* ---------- 工号工具 ---------- */
  function fmtId(n) { return 'HK-' + String(n).padStart(6, '0'); }

  /* ---------- 转义 ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  document.addEventListener('DOMContentLoaded', startClock);

  return { toast, store, ago, fmt, fmtId, esc };
})();
