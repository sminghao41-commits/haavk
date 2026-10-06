/* ============================================================
   哈夫克集团 · 员工门户逻辑
   ============================================================ */
(() => {
  const H = window.Haavk;
  const { esc, fmt, toast, store } = H;

  /* ---------------- 员工档案（与员工论坛共用同一批演示工号） ---------------- */
  const EMPLOYEES = {
    'HK-086417': { name: '陈默',   dept: '运营管理部',     title: '高级专员',   roleText: '板块管理员', region: 'APAC-07', years: 6, mail: 'chen.mo@haavk.int' },
    'HK-023188': { name: '林知远', dept: '能源与动力',     title: '现场工程师', roleText: '核心项目组', region: 'EMEA-02', years: 9, mail: 'lin.zhiyuan@haavk.int' },
    'HK-114002': { name: '沈雨桐', dept: '信息安全',       title: '审计员',     roleText: '合规审计',   region: 'HQ',      years: 4, mail: 'shen.yutong@haavk.int' },
    'HK-201955': { name: '周野',   dept: '基础设施与建造', title: '见习工程师', roleText: '试用期',     region: 'APAC-07', years: 0, mail: 'zhou.ye@haavk.int' }
  };

  const NAV = [
    { id: 'home',      name: '门户首页',     desc: '概览与待办' },
    { id: 'notices',   name: '内部通告',     desc: '集团级通知与公示' },
    { id: 'training',  name: '培训中心',     desc: '必修课程与学时' },
    { id: 'kb',        name: '知识库',       desc: 'SOP、手册与检查表' },
    { id: 'tickets',   name: '工单系统',     desc: 'IT 与设施报修' },
    { id: 'org',       name: '组织结构',     desc: '板块与区域分布' }
  ];

  /* ---------------- 通告（与员工论坛内容保持一致） ---------------- */
  const NOTICES = [
    { id: 'N-2610', date: '2035-10-06', tag: '必修', tagCls: 'badge-due',  title: 'Q4 全员安全复训 10 月 12 日开放，10 月 30 日截止', from: '集团安全委员会', thread: 'T-24817',
      body: '本次复训为必修，共 4 个模块、约 95 分钟；现场作业岗位（含外包驻场）额外完成模块 5「高风险作业许可」。未完成将影响门禁权限与季度考核。' },
    { id: 'N-2607', date: '2035-10-05', tag: '安全', tagCls: 'badge-warn', title: '关于仿冒「集团采购系统」钓鱼邮件的处置流程', from: '信息安全部', thread: 'T-24841',
      body: '本月已拦截 37 封。请勿点击链接或打开 .html 附件；已输入口令的同事请立即修改口令并提交工单，我们会强制下线该会话。' },
    { id: 'N-2604', date: '2035-10-04', tag: '内部', tagCls: 'badge-warn', title: 'reilink 项目第三阶段受试者招募：仅限内部推荐通道，禁止对外转发', from: '生命科学与医疗板块 · 神经工程组', thread: 'T-24925',
      body: '第三阶段受试者招募自即日起启动，补偿标准按集团 2035 版《受试者补偿细则》执行。招募通知仅供内部参考，禁止转发至任何外部渠道、社交媒体或家属群；对外口径统一使用「神经康复辅助设备公开研究」。所有入组评估须在巴别塔医疗中心完成，由项目组统一安排。' },
    { id: 'N-2602', date: '2035-10-02', tag: '公示', tagCls: 'badge-acc',  title: '组织架构调整公示：算力与存储服务板块增设「工业数据治理」二级部门', from: '集团管理委员会', thread: 'T-24850',
      body: '自 2035 年 11 月 1 日起生效，原数据平台组的资产目录、主数据、数据质量三条线整体划入。公示期 7 天（至 10 月 11 日）。' },
    { id: 'N-2601', date: '2035-10-01', tag: '运营', tagCls: 'badge-warn', title: '效率部门通知：Q4 起推行「效率至上」考核，试行末位复核流程', from: '效率部门', thread: 'T-24918',
      body: '自 10 月 1 日起，各基地与职能中心按季度提交人效与流程周期数据；连续两个季度排名末位的团队进入复核流程，由效率部门与所属板块共同确认调整方案。' },
    { id: 'N-2598', date: '2035-09-30', tag: '后勤', tagCls: 'badge-mut',  title: 'APAC-07 园区通勤班车 11 月起调整，新增 L7 / L8 两条线路', from: '后勤服务部', thread: 'T-24902',
      body: '因北门道路施工，新增 L7（西二旗）、L8（望京）线路；原 L2 终点改至东门。施工期预计 4 个月。' },
    { id: 'N-2591', date: '2035-09-28', tag: '合规', tagCls: 'badge-mut',  title: '2035 年第三季度合规自查启动，10 月 20 日前提交', from: '合规与审计部', thread: '',
      body: '自查范围包括出口管制、第三方尽调、文档版本一致性三项。模板已下发至各部门合规联络员，逾期未提交将纳入部门季度考核。' },
    { id: 'N-2584', date: '2035-09-22', tag: '技术', tagCls: 'badge-mut',  title: '液冷回路 PID 整定参数变更被纳入知识库最佳实践', from: '能源与动力板块', thread: 'T-24793',
      body: '新加坡二期 C 区回水温度波动处理案例（CHG-2035-0938）已归档，SOP 升至 V3.2，作为同类项目的参考整定值。' },
    { id: 'N-2579', date: '2035-09-18', tag: '内部', tagCls: 'badge-warn', title: '阿萨拉 ASH-01 区域作业纪律重申：矿区与地下水项目统一对外口径', from: '安全部门', thread: 'T-24904',
      body: '所有 ASH-01 区域的现场作业与对外沟通，统一使用「区域发展支持项目」表述；涉及地表水、地下水位与补偿标准的问询，一律转交区域事务联络组统一答复。矿区外围警戒区严禁无关人员进入与拍摄。' },
    { id: 'N-2571', date: '2035-09-12', tag: '安全', tagCls: 'badge-warn', title: '安全部门通报：近期出现针对集团设施的第三方情报活动', from: '安全部门', thread: 'T-24899',
      body: '接报有外部组织在阿萨拉、长弓溪谷与巴克什周边对集团设施进行测绘、拍摄与人员接触。请提高警惕，发现可疑人员与设备立即通过安全部门专线（内线 4100）上报，不要自行接触或对外传播。' }
  ];

  /* ---------------- 培训课程 ---------------- */
  const COURSES = [
    { name: '2035-Q4 全员安全复训',            mods: '模块 1–4',   mins: 95,  due: '2035-10-30', done: 0,  must: true },
    { name: '高风险作业许可（模块 5）',        mods: '现场岗专修', mins: 45,  due: '2035-10-30', done: 0,  must: true, site: true },
    { name: '出口管制与制裁合规（年度）',      mods: '模块 1–2',   mins: 60,  due: '2035-11-15', done: 0,  must: true },
    { name: '对外口径与信息保密（ASH-01 专项）', mods: '区域专项',   mins: 40,  due: '2035-10-25', done: 0,  must: true },
    { name: '曼德尔砖运维认证 L2',             mods: '选修',       mins: 120, due: '—',          done: 0,  must: false },
    { name: 'reilink 伦理与合规须知（受试者相关岗）', mods: '选修', mins: 55,  due: '—',          done: 0,  must: false },
    { name: '工业数据治理基础',                mods: '选修',       mins: 80,  due: '—',          done: 0,  must: false },
    { name: '应急疏散演练（现场）',            mods: '实操',       mins: 30,  due: '2035-12-05', done: 0,  must: false }
  ];

  /* ---------------- 知识库 ---------------- */
  const KB = [
    { cat: '标准作业程序 SOP', n: 1284, upd: '2035-10-05', note: '含海上作业、液冷、带电作业等 22 个专业方向' },
    { cat: '曼德尔砖运维与部署', n: 264, upd: '2035-10-06', note: '机柜级部署、相变存储层维护、算力配额与调度' },
    { cat: '故障处置手册',     n: 396,  upd: '2035-10-01', note: '按设备族编号，支持现场离线导出' },
    { cat: '合规工具与检查表', n: 214,  upd: '2035-09-29', note: '审计检查表、文档版本一致性核对表' },
    { cat: '暖通与液冷',       n: 158,  upd: '2035-10-04', note: '含本季新增 PID 整定最佳实践 KB-WIND-0051' },
    { cat: '能源与暗星燃料（受限）', n: 87, upd: '2035-09-30', note: '中试线操作与安全规范；按 T-02 权限分级授权' },
    { cat: '培训与考核材料',   n: 472,  upd: '2035-09-26', note: '与培训中心课程一一对应' },
    { cat: '项目档案（只读）', n: 9310, upd: '2035-10-06', note: '按项目号归档，访问需项目组授权' }
  ];

  const RECENT_DOCS = [
    { code: 'SOP-ELE-0412', name: '高处作业许可与监护程序',           v: 'V4.1', date: '2035-10-05', perm: '全员' },
    { code: 'SOP-WIND-0051', name: '海上作业天气窗口判定规则',         v: 'V1.0', date: '2035-10-04', perm: '现场岗' },
    { code: 'SOP-LIQ-0233', name: '液冷回路变频泵 PID 整定指引',       v: 'V3.2', date: '2035-10-03', perm: '能源板块' },
    { code: 'SOP-MAN-0102', name: '曼德尔砖机柜上架与算力配额发布',     v: 'V2.3', date: '2035-10-02', perm: '算力板块' },
    { code: 'COM-ASH-0007', name: 'ASH-01 区域对外沟通口径（受限）',   v: 'V1.6', date: '2035-09-18', perm: '区域授权' },
    { code: 'CHK-CMP-0018', name: '文档版本一致性核对表',             v: 'V2.0', date: '2035-09-29', perm: '全员' },
    { code: 'MAN-DAT-0077', name: '设备台账导入字段规范',             v: 'V1.4', date: '2035-09-27', perm: '全员' }
  ];

  /* ---------------- 工单 ---------------- */
  const SEED_TICKETS = [
    { id: 'TCK-88213', title: 'APAC-07 3 号楼 7 层门禁读卡器无响应',   cat: '设施', pri: '高',   st: '处理中', ts: Date.now() - 3 * 3600e3,  by: 'HK-086417' },
    { id: 'TCK-88190', title: '知识库离线导出功能报错（PDF 生成失败）', cat: 'IT',   pri: '中',   st: '待响应', ts: Date.now() - 9 * 3600e3,  by: 'HK-023188' },
    { id: 'TCK-88144', title: '申请开通项目档案 PA-2035-0417 只读权限', cat: '权限', pri: '低',   st: '已完成', ts: Date.now() - 2 * 864e5,   by: 'HK-201955' }
  ];

  const STATE_BADGE = { '待响应': 'badge-due', '处理中': 'badge-warn', '已完成': 'badge-ok', '已关闭': 'badge-mut' };

  /* ---------------- 组织结构 ---------------- */
  const ORG = [
    { name: '基础设施与建造', head: '板块总裁 · 阮文清',     people: 41600, bases: '31 处', region: 'APAC-07 / NA-04' },
    { name: '防务与安全系统', head: '集团执行董事 · 陆明远', people: 38400, bases: '14 处', region: 'EMEA-01 / APAC-03' },
    { name: '能源与动力',     head: '板块总裁 · 泽维尔·柯', people: 29800, bases: '22 处', region: 'EMEA-02 / APAC-07' },
    { name: '全球物流与供应链', head: '板块总裁 · 伊莎贝尔·罗', people: 18600, bases: '24 处', region: 'ASH-01 / APAC-05' },
    { name: '生命科学与医疗', head: '板块总裁 · 艾琳·沃斯', people: 16200, bases: '24 处', region: 'NA-01 / EMEA-03' },
    { name: '算力与存储服务', head: '板块总裁 · 河合健',     people: 11800, bases: '9 处',  region: 'HQ / APAC-05' },
    { name: '安全部门',       head: '安全部门负责人 · 德穆兰', people: 6400, bases: '18 处', region: 'HQ / ASH-01' },
    { name: '效率部门',       head: '效率部门负责人 · 哈德森', people: 1800, bases: '6 处',  region: 'HQ / 各基地派出' },
    { name: '集团职能中心',   head: '首席运营官 · 陈立群',   people: 4200,  bases: '3 处',  region: 'HQ' }
  ];

  /* ---------------- 状态 ---------------- */
  const S = {
    me: null,
    pane: 'home',
    tickets: null,
    todos: null,
    lastLogin: null
  };

  const emp = id => EMPLOYEES[id] || null;
  const me = () => emp(S.me);

  /* ---------------- 待办 ---------------- */
  function defaultTodos() {
    return [
      { t: '完成 2035-Q4 全员安全复训（4 个模块）', m: '截止 2035-10-30 · 必修', d: false },
      { t: '提交第三季度合规自查表',                 m: '截止 2035-10-20 · 合规与审计部', d: false },
      { t: '确认本部门现场作业岗位名单（模块 5）',   m: '截止 2035-10-12 · 安全委员会', d: false },
      { t: '阅读并确认《文档版本一致性核对表》V2.0', m: '无截止 · 建议本周完成', d: true }
    ];
  }
  function loadTodos() {
    S.todos = store.get('portal:todos', null) || defaultTodos();
  }
  function saveTodos() { store.set('portal:todos', S.todos); }

  /* ---------------- 工单 ---------------- */
  function loadTickets() {
    const user = store.get('portal:tickets', null);
    S.tickets = SEED_TICKETS.concat(Array.isArray(user) ? user : []);
  }
  function saveUserTickets() {
    const seedIds = new Set(SEED_TICKETS.map(t => t.id));
    store.set('portal:tickets', S.tickets.filter(t => !seedIds.has(t.id)));
  }

  /* ---------------- 渲染：侧栏 ---------------- */
  function counts() {
    return {
      notices: NOTICES.length,
      training: COURSES.filter(c => c.must).length,
      kb: KB.reduce((a, k) => a + k.n, 0),
      tickets: S.tickets.filter(t => t.st !== '已完成' && t.st !== '已关闭').length,
      org: ORG.length
    };
  }

  function renderSide() {
    const e = me();
    const c = counts();
    const cnt = { home: '', notices: c.notices, training: c.training, kb: '11k+', tickets: c.tickets, org: c.org };

    document.getElementById('side-nav').innerHTML = NAV.map(n =>
      `<li class="${S.pane === n.id ? 'on' : ''}" data-pane="${n.id}" title="${esc(n.desc)}">
        <span>${esc(n.name)}</span><span class="cnt">${cnt[n.id]}</span></li>`).join('');
    document.querySelectorAll('#side-nav li').forEach(li => {
      li.onclick = () => go(li.dataset.pane);
    });

    document.getElementById('side-profile').innerHTML = `
      <div class="side-top">
        <div class="avatar">${esc(e.name.slice(0, 1))}</div>
        <div>
          <div class="side-name">${esc(e.name)}</div>
          <div class="side-meta">${esc(e.roleText)}</div>
        </div>
      </div>
      <div class="side-rows">
        <div><span class="mut">工号</span><span class="v">${esc(S.me)}</span></div>
        <div><span class="mut">部门</span><span class="v" style="font-family:var(--font)">${esc(e.dept)}</span></div>
        <div><span class="mut">岗位</span><span class="v" style="font-family:var(--font)">${esc(e.title)}</span></div>
        <div><span class="mut">区域</span><span class="v">${esc(e.region)}</span></div>
        <div><span class="mut">司龄</span><span class="v">${e.years} 年</span></div>
      </div>
      <button class="btn btn-sm mt16" style="width:100%;justify-content:center" id="btn-signout">退出登录</button>`;
    document.getElementById('btn-signout').onclick = () => {
      store.del('me');
      S.me = null;
      location.reload();
    };

    document.getElementById('side-online').innerHTML =
      `<div class="side-rows">
        <div><span class="mut">在线同事</span><span class="v">50</span></div>
        <div><span class="mut">未读通告</span><span class="v">2</span></div>
        <div><span class="mut">上次登录</span><span class="v" style="font-family:var(--font)">${S.lastLogin ? H.ago(S.lastLogin) : '首次'}</span></div>
      </div>`;
  }

  /* ---------------- 渲染：首页 ---------------- */
  function paneHome() {
    const e = me();
    const c = counts();
    const openTodos = S.todos.filter(t => !t.d).length;
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    return `
      <div class="crumb">HAAVK INTRANET / PORTAL / HOME</div>
      <div class="pane-head">
        <div>
          <div class="eyebrow">Employee Portal · 明日资源，今日实现</div>
          <h1>门户首页</h1>
          <div class="sub">${today} · ${esc(e.dept)} · ${esc(e.region)}</div>
        </div>
        <div class="flex gap12 wrapf">
          <button class="btn btn-sm" data-act="kb">打开知识库</button>
          <button class="btn btn-primary btn-sm" data-act="ticket">提交新工单</button>
        </div>
      </div>

      <div class="greet">
        <div>
          <h2>${greetByHour()}，${esc(e.name)}</h2>
          <div class="small">
            你当前有 <b>${openTodos}</b> 项待办、<b>${c.notices}</b> 条内部通告；
            ${esc(e.dept)} 本周无逾期安全整改项。
          </div>
        </div>
        <div class="flex gap12 wrapf">
          <a class="btn btn-sm" href="forum.html">员工论坛</a>
          <button class="btn btn-sm" data-act="training">培训中心</button>
        </div>
      </div>

      <div class="tiles mt24">
        <div class="tile acc"><div class="n">${c.notices}</div><div class="t">内部通告（2 条未读）</div></div>
        <div class="tile"><div class="n">${openTodos}</div><div class="t">待办事项</div></div>
        <div class="tile"><div class="n">${c.training}<small>门</small></div><div class="t">必修课程未完成</div></div>
        <div class="tile"><div class="n">${c.tickets}</div><div class="t">进行中的工单</div></div>
      </div>

      <div class="grid g2 mt24" style="gap:20px;align-items:start">
        <div class="panel">
          <h3>最新内部通告 <button class="x-close" data-act="notices">全部 →</button></h3>
          <div class="panel-b">
            ${NOTICES.slice(0, 4).map(noticeRow).join('')}
          </div>
        </div>

        <div>
          <div class="panel">
            <h3>我的待办 <span class="mono">${openTodos} / ${S.todos.length}</span></h3>
            <div class="panel-b" id="todo-box">
              ${S.todos.map((t, i) => `
                <label class="todo ${t.d ? 'done' : ''}">
                  <input type="checkbox" data-todo="${i}" ${t.d ? 'checked' : ''}>
                  <span><span class="ti">${esc(t.t)}</span><span class="tm">${esc(t.m)}</span></span>
                </label>`).join('')}
            </div>
          </div>

          <div class="panel mt24">
            <h3>快捷入口</h3>
            <div class="panel-b tight">
              <div class="links">
                <div class="link-card" data-act="kb"><div class="lt">知识库</div><div class="ld">SOP · 手册 · 检查表</div></div>
                <div class="link-card" data-act="ticket"><div class="lt">工单系统</div><div class="ld">IT / 设施 / 权限</div></div>
                <div class="link-card" data-act="training"><div class="lt">培训中心</div><div class="ld">必修课程与学时</div></div>
                <div class="link-card" onclick="location.href='forum.html'"><div class="lt">员工论坛</div><div class="ld">技术交流与建议</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function greetByHour() {
    const h = new Date().getHours();
    if (h < 6) return '凌晨好';
    if (h < 11) return '早上好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    return '晚上好';
  }

  function noticeRow(n) {
    return `<div class="notice" data-notice="${n.id}" style="cursor:pointer">
      <div class="d">${n.date}</div>
      <div>
        <h4>${esc(n.title)}</h4>
        <p>${esc(n.from)} · ${esc(n.body.slice(0, 46))}…</p>
      </div>
      <span class="badge ${n.tagCls}">${esc(n.tag)}</span>
    </div>`;
  }

  /* ---------------- 渲染：内部通告 ---------------- */
  function paneNotices() {
    return `
      <div class="crumb">HAAVK INTRANET / PORTAL / NOTICES</div>
      <div class="pane-head">
        <div>
          <div class="eyebrow">Internal Notices</div>
          <h1>内部通告</h1>
          <div class="sub">集团级通知、安全通告与组织公示。重要通告会同步推送至员工论坛对应板块。</div>
        </div>
        <span class="badge badge-mut">近 30 天 ${NOTICES.length} 条</span>
      </div>

      <div class="panel">
        <div class="panel-b">
          ${NOTICES.map(noticeRow).join('')}
        </div>
      </div>

      <div class="panel mt24">
        <h3>阅读与确认要求</h3>
        <div class="panel-b tight">
          <div class="dl">
            <div><span class="k">需确认通告</span><span class="v">2 条（N-2610 / N-2591）</span></div>
            <div><span class="k">确认截止</span><span class="v">2035-10-20</span></div>
            <div><span class="k">未确认后果</span><span class="v">纳入部门季度考核</span></div>
            <div><span class="k">历史通告查询</span><span class="v">保留 5 年，可检索</span></div>
          </div>
        </div>
      </div>`;
  }

  /* ---------------- 渲染：培训中心 ---------------- */
  function paneTraining() {
    const must = COURSES.filter(c => c.must);
    const mins = must.reduce((a, c) => a + c.mins, 0);
    return `
      <div class="crumb">HAAVK INTRANET / PORTAL / TRAINING</div>
      <div class="pane-head">
        <div>
          <div class="eyebrow">Training Center</div>
          <h1>培训中心</h1>
          <div class="sub">必修课程未完成将影响门禁权限与季度考核；现场作业岗位另有模块 5 要求。</div>
        </div>
        <button class="btn btn-primary btn-sm" data-act="start-course">继续未完成课程</button>
      </div>

      <div class="tiles">
        <div class="tile acc"><div class="n">${must.length}</div><div class="t">必修课程未完成</div></div>
        <div class="tile"><div class="n">${mins}<small>分钟</small></div><div class="t">必修总时长</div></div>
        <div class="tile"><div class="n">0<small>%</small></div><div class="t">本季度完成率</div></div>
        <div class="tile"><div class="n">10-30</div><div class="t">最近截止日</div></div>
      </div>

      <div class="panel mt24">
        <h3>课程清单 <span class="mono">2035 Q4</span></h3>
        <div class="panel-b tight" style="overflow-x:auto">
          <table class="tbl">
            <thead><tr><th>课程名称</th><th>范围</th><th>时长</th><th>截止</th><th>状态</th><th>操作</th></tr></thead>
            <tbody>
              ${COURSES.map((c, i) => `
                <tr>
                  <td>${esc(c.name)}${c.site ? ' <span class="badge badge-warn">现场岗</span>' : ''}${c.must ? '' : ' <span class="badge badge-mut">选修</span>'}</td>
                  <td class="mut">${esc(c.mods)}</td>
                  <td class="num">${c.mins} min</td>
                  <td class="num">${esc(c.due)}</td>
                  <td><span class="badge ${c.done >= 100 ? 'badge-ok' : 'badge-due'}">${c.done >= 100 ? '已完成' : '未开始'}</span></td>
                  <td><button class="btn btn-sm" data-course="${i}">${c.done >= 100 ? '查看记录' : '开始学习'}</button></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid g2 mt24" style="gap:20px;align-items:start">
        <div class="panel">
          <h3>本季度学时统计</h3>
          <div class="panel-b tight">
            <div class="small mut mb8">已完成学时 0 / 目标 20 学时</div>
            <div class="bar"><i style="width:2%"></i></div>
            <div class="dl mt16">
              <div><span class="k">必修学时</span><span class="v">0 / 12</span></div>
              <div><span class="k">选修学时</span><span class="v">0 / 8</span></div>
              <div><span class="k">现场实操学时</span><span class="v">0 / 4</span></div>
            </div>
          </div>
        </div>
        <div class="panel">
          <h3>课程无法加载时</h3>
          <div class="panel-b tight small mut" style="line-height:1.8">
            1. 先联系本部门 IT 联络员确认浏览器与网络策略；<br>
            2. 仍未恢复的，提交工单并选择分类「IT → 培训系统」；<br>
            3. 避免重复提交，同一问题以最早工单为准。
          </div>
        </div>
      </div>`;
  }

  /* ---------------- 渲染：知识库 ---------------- */
  function paneKb() {
    return `
      <div class="crumb">HAAVK INTRANET / PORTAL / KNOWLEDGE</div>
      <div class="pane-head">
        <div>
          <div class="eyebrow">Knowledge Base</div>
          <h1>知识库</h1>
          <div class="sub">标准作业程序、故障处置手册与合规工具。所有文档带版本号，现场张贴版本必须与系统版本一致。</div>
        </div>
        <button class="btn btn-sm" data-act="kb-search">高级检索</button>
      </div>

      <div class="grid g3" style="gap:16px">
        ${KB.map(k => `
          <div class="card" style="padding:18px">
            <div class="flex between center">
              <h3 style="font-size:16px">${esc(k.cat)}</h3>
              <span class="mono small mut">${k.n}</span>
            </div>
            <p class="small mut" style="margin-top:6px">${esc(k.note)}</p>
            <div class="small mt16 flex between center">
              <span class="mut">更新 ${k.upd}</span>
              <a href="#" data-kb-cat="${esc(k.cat)}">进入 →</a>
            </div>
          </div>`).join('')}
      </div>

      <div class="panel mt24">
        <h3>最近更新文档 <span class="mono">近 7 天</span></h3>
        <div class="panel-b tight" style="overflow-x:auto">
          <table class="tbl">
            <thead><tr><th>编号</th><th>文档名称</th><th>版本</th><th>更新日期</th><th>访问权限</th></tr></thead>
            <tbody>
              ${RECENT_DOCS.map(d => `
                <tr>
                  <td class="num">${esc(d.code)}</td>
                  <td>${esc(d.name)}</td>
                  <td class="num">${esc(d.v)}</td>
                  <td class="num">${d.date}</td>
                  <td><span class="badge ${d.perm === '全员' ? 'badge-ok' : 'badge-mut'}">${esc(d.perm)}</span></td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  /* ---------------- 渲染：工单 ---------------- */
  function paneTickets() {
    return `
      <div class="crumb">HAAVK INTRANET / PORTAL / TICKETS</div>
      <div class="pane-head">
        <div>
          <div class="eyebrow">Service Desk</div>
          <h1>工单系统</h1>
          <div class="sub">IT、设施、权限三类工单统一入口。跨部门工单平均首次响应 2~3 天，加急请选择「高」优先级并说明原因。</div>
        </div>
        <button class="btn btn-primary btn-sm" data-act="ticket">提交新工单</button>
      </div>

      <div class="panel">
        <h3>我的工单 <span class="mono">${S.tickets.length} 条</span></h3>
        <div class="panel-b tight" style="overflow-x:auto">
          <table class="tbl">
            <thead><tr><th>工单号</th><th>标题</th><th>分类</th><th>优先级</th><th>状态</th><th>提交时间</th></tr></thead>
            <tbody>
              ${S.tickets.map(t => `
                <tr>
                  <td class="num">${esc(t.id)}</td>
                  <td>${esc(t.title)}</td>
                  <td class="mut">${esc(t.cat)}</td>
                  <td><span class="badge ${t.pri === '高' ? 'badge-due' : t.pri === '中' ? 'badge-warn' : 'badge-mut'}">${esc(t.pri)}</span></td>
                  <td><span class="badge ${STATE_BADGE[t.st] || 'badge-mut'}">${esc(t.st)}</span></td>
                  <td class="num">${fmt(t.ts)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel mt24">
        <h3>办公区服务状态 <span class="mono">实时</span></h3>
        <div class="panel-b tight">
          <div class="dl">
            <div><span class="k">APAC-07 门禁系统</span><span class="v" style="color:var(--warn)">3 号楼 7 层异常</span></div>
            <div><span class="k">内部网络与 VPN</span><span class="v" style="color:var(--ok)">正常</span></div>
            <div><span class="k">知识库 / 培训系统</span><span class="v" style="color:var(--ok)">正常</span></div>
            <div><span class="k">食堂与班车</span><span class="v" style="color:var(--ok)">正常</span></div>
          </div>
        </div>
      </div>`;
  }

  /* ---------------- 渲染：组织结构 ---------------- */
  function paneOrg() {
    const total = ORG.reduce((a, o) => a + o.people, 0);
    return `
      <div class="crumb">HAAVK INTRANET / PORTAL / ORG</div>
      <div class="pane-head">
        <div>
          <div class="eyebrow">Organization</div>
          <h1>组织结构</h1>
          <div class="sub">集团采用「板块 + 职能中心」矩阵结构，各板块独立核算，共享 HQS 质量与安全体系。</div>
        </div>
        <span class="badge badge-acc">在职 ${total.toLocaleString('en-US')} 人</span>
      </div>

      <div class="grid g3" style="gap:16px">
        ${ORG.map(o => `
          <div class="card" style="padding:20px">
            <span class="card-num">${o.people.toLocaleString('en-US')}</span>
            <h3 style="font-size:17px;padding-right:56px">${esc(o.name)}</h3>
            <p class="small mut" style="margin-top:6px">${esc(o.head)}</p>
            <div class="dl mt16" style="font-size:13px">
              <div><span class="k">在职人数</span><span class="v">${o.people.toLocaleString('en-US')}</span></div>
              <div><span class="k">基地 / 站点</span><span class="v">${esc(o.bases)}</span></div>
              <div><span class="k">主要区域</span><span class="v">${esc(o.region)}</span></div>
            </div>
          </div>`).join('')}
      </div>

      <div class="panel mt24">
        <h3>区域分布</h3>
        <div class="panel-b tight" style="overflow-x:auto">
          <table class="tbl">
            <thead><tr><th>区域代码</th><th>覆盖范围</th><th>主要职能</th><th>在职人数</th></tr></thead>
            <tbody>
              <tr><td class="num">HQ</td><td>巴别塔 · 集团总部</td><td>战略、财务、合规、法务、安全、效率</td><td class="num">4,200</td></tr>
              <tr><td class="num">ASH-01</td><td>阿萨拉 · 乌姆河流域</td><td>水利枢纽运维、区域发展支持项目、物流中转</td><td class="num">12,800</td></tr>
              <tr><td class="num">APAC-07</td><td>东亚 · 园区与研发</td><td>基建交付、算力服务、研发</td><td class="num">23,600</td></tr>
              <tr><td class="num">APAC-05</td><td>东南亚 · 算力园区</td><td>液冷算力园区、边缘推理</td><td class="num">6,900</td></tr>
              <tr><td class="num">EMEA-02</td><td>北海 · 海上能源</td><td>海上风电运维、模块化反应堆</td><td class="num">18,400</td></tr>
              <tr><td class="num">EMEA-01</td><td>欧洲 · 防务制造</td><td>安防系统集成、人员防护</td><td class="num">21,300</td></tr>
              <tr><td class="num">NA-04</td><td>北美 · 建造</td><td>港口与跨海通道工程</td><td class="num">14,700</td></tr>
              <tr><td class="num">NA-01</td><td>北美 · 生命科学</td><td>GMP 生产基地、诊断设备</td><td class="num">9,800</td></tr>
            </tbody>
          </table>
        </div>
      </div>`;
  }

  /* ---------------- 路由 ---------------- */
  const PANES = { home: paneHome, notices: paneNotices, training: paneTraining, kb: paneKb, tickets: paneTickets, org: paneOrg };

  function go(pane, push) {
    if (!PANES[pane]) pane = 'home';
    S.pane = pane;
    if (push !== false && location.hash !== '#' + pane) location.hash = pane;
    renderSide();
    document.getElementById('pane').innerHTML = PANES[pane]();
    bindPane();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------------- 面板内事件绑定 ---------------- */
  function bindPane() {
    const root = document.getElementById('pane');

    root.querySelectorAll('[data-act]').forEach(b => {
      const a = b.dataset.act;
      b.onclick = () => {
        if (a === 'notices') go('notices');
        else if (a === 'kb') go('kb');
        else if (a === 'training') go('training');
        else if (a === 'ticket') openTicket();
        else if (a === 'start-course') toast('课程播放器为演示占位，真实环境会打开课程页面');
        else if (a === 'kb-search') toast('高级检索为演示占位');
      };
    });

    root.querySelectorAll('[data-notice]').forEach(el => {
      el.onclick = () => openNotice(el.dataset.notice);
    });

    root.querySelectorAll('[data-todo]').forEach(cb => {
      cb.onchange = () => {
        const i = +cb.dataset.todo;
        S.todos[i].d = cb.checked;
        saveTodos();
        cb.closest('.todo').classList.toggle('done', cb.checked);
        const open = S.todos.filter(t => !t.d).length;
        const h3 = root.querySelector('.panel h3 .mono');
        if (h3 && /^\d+ \/ \d+$/.test(h3.textContent.trim())) h3.textContent = `${open} / ${S.todos.length}`;
        toast(cb.checked ? '已标记为完成' : '已恢复为待办');
      };
    });

    root.querySelectorAll('[data-course]').forEach(b => {
      b.onclick = () => {
        const c = COURSES[+b.dataset.course];
        toast(`${c.name} · 约 ${c.mins} 分钟（演示环境不加载真实课程）`);
      };
    });

    root.querySelectorAll('[data-kb-cat]').forEach(a => {
      a.onclick = e => { e.preventDefault(); toast(`正在打开分类：${a.dataset.kbCat}（演示占位）`); };
    });
  }

  /* ---------------- 通告详情 ---------------- */
  function openNotice(id) {
    const n = NOTICES.find(x => x.id === id);
    if (!n) return;
    const box = document.getElementById('modal');
    box.innerHTML = `
      <div class="modal-box">
        <header>
          <h3>${esc(n.title)}</h3>
          <button data-close="1">×</button>
        </header>
        <div class="modal-body">
          <div class="flex gap12 center wrapf mb16">
            <span class="badge ${n.tagCls}">${esc(n.tag)}</span>
            <span class="badge badge-mut mono">${n.id}</span>
            <span class="small mut">${n.date} · ${esc(n.from)}</span>
          </div>
          <p style="line-height:1.85">${esc(n.body)}</p>
          <p class="small mut mt16" style="border-top:1px dashed var(--line);padding-top:14px">
            本通告已记入你的阅读记录。相关讨论请前往员工论坛对应主题。
          </p>
        </div>
        <div class="modal-foot">
          <button class="btn btn-sm" data-close="1">关闭</button>
          ${n.thread ? `<button class="btn btn-primary btn-sm" data-thread="${esc(n.thread)}">前往论坛主题 ${esc(n.thread)}</button>` : ''}
        </div>
      </div>`;
    box.hidden = false;
    box.querySelectorAll('[data-close]').forEach(b => { b.onclick = () => { box.hidden = true; }; });
    const th = box.querySelector('[data-thread]');
    if (th) th.onclick = () => { location.href = 'forum.html'; };
    box.onclick = e => { if (e.target === box) box.hidden = true; };
  }

  /* ---------------- 提交工单 ---------------- */
  function openTicket() {
    let seq = 88240 + S.tickets.length;
    const box = document.getElementById('modal');
    box.innerHTML = `
      <div class="modal-box">
        <header>
          <h3>提交新工单</h3>
          <button data-close="1">×</button>
        </header>
        <div class="modal-body">
          <div class="field">
            <label>工单标题</label>
            <input type="text" id="tk-title" placeholder="简要描述问题，例如：3 号楼 7 层打印机离线">
          </div>
          <div class="grid g2" style="gap:14px">
            <div class="field">
              <label>分类</label>
              <select id="tk-cat">
                <option>IT</option><option>设施</option><option>权限</option>
                <option>培训系统</option><option>知识库</option>
              </select>
            </div>
            <div class="field">
              <label>优先级</label>
              <select id="tk-pri"><option>低</option><option selected>中</option><option>高</option></select>
            </div>
          </div>
          <div class="field">
            <label>问题描述</label>
            <textarea id="tk-body" rows="4" placeholder="出现时间、影响范围、已尝试的处理方式"></textarea>
          </div>
          <p class="small mut">提交后工单号自动生成，处理进度可在「工单系统」页面查看。演示环境不会真正派单。</p>
        </div>
        <div class="modal-foot">
          <button class="btn btn-sm" data-close="1">取消</button>
          <button class="btn btn-primary btn-sm" id="tk-send">提交工单</button>
        </div>
      </div>`;
    box.hidden = false;
    const close = () => { box.hidden = true; };
    box.querySelectorAll('[data-close]').forEach(b => { b.onclick = close; });
    box.onclick = e => { if (e.target === box) close(); };

    document.getElementById('tk-send').onclick = () => {
      const title = document.getElementById('tk-title').value.trim();
      const body = document.getElementById('tk-body').value.trim();
      if (title.length < 4) { toast('请填写至少 4 个字的工单标题'); return; }
      if (body.length < 6) { toast('请补充问题描述'); return; }
      const t = {
        id: 'TCK-' + (seq++),
        title,
        cat: document.getElementById('tk-cat').value,
        pri: document.getElementById('tk-pri').value,
        st: '待响应',
        ts: Date.now(),
        by: S.me
      };
      S.tickets.unshift(t);
      saveUserTickets();
      close();
      toast(`工单 ${t.id} 已提交，状态：待响应`);
      if (S.pane === 'tickets') go('tickets', false); else go('tickets');
    };
  }

  /* ---------------- 登录闸门 ---------------- */
  function initGate() {
    const gate = document.getElementById('gate');
    const goBtn = () => {
      const id = document.getElementById('g-id').value.trim().toUpperCase();
      const pw = document.getElementById('g-pw').value;
      if (!/^HK-\d{6}$/.test(id)) { toast('工号格式应为 HK- 加 6 位数字'); return; }
      if (!pw) { toast('请输入口令（演示环境任意非空值即可）'); return; }
      if (!EMPLOYEES[id]) { toast('该工号不在演示名单内，请点击下方示例工号'); return; }
      store.set('me', id);
      S.me = id;
      gate.hidden = true;
      boot();
      toast(`身份校验通过，欢迎 ${EMPLOYEES[id].name}`);
    };
    document.getElementById('g-go').onclick = goBtn;
    ['g-id', 'g-pw'].forEach(k => {
      document.getElementById(k).addEventListener('keydown', e => { if (e.key === 'Enter') goBtn(); });
    });
    document.querySelectorAll('#gate code').forEach(c => {
      c.onclick = () => {
        document.getElementById('g-id').value = c.textContent.trim();
        document.getElementById('g-pw').value = 'demo';
        document.getElementById('g-pw').focus();
      };
    });

    const saved = store.get('me', null);
    const auto = (new URLSearchParams(location.search).get('demo') || '').toUpperCase();
    if (auto && EMPLOYEES[auto]) { store.set('me', auto); S.me = auto; gate.hidden = true; return true; }
    if (saved && EMPLOYEES[saved]) { S.me = saved; gate.hidden = true; return true; }
    gate.hidden = false;
    return false;
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    if (!me()) return false;          // 无有效身份则不渲染（闸门仍显示）
    S.lastLogin = store.get('portal:lastLogin', null);
    store.set('portal:lastLogin', Date.now());
    loadTodos();
    loadTickets();

    const e = me();
    document.getElementById('nav-user').innerHTML =
      `<span class="brand-mark" style="width:30px;height:30px;font-size:15px" title="${esc(e.name)} · ${esc(e.title)}">${esc(e.name.slice(0, 1))}</span>`;

    const fromHash = (location.hash || '').replace('#', '');
    go(PANES[fromHash] ? fromHash : 'home', false);

    window.addEventListener('hashchange', () => {
      const p = location.hash.replace('#', '');
      if (PANES[p] && p !== S.pane) go(p, false);
    });
    return true;
  }

  function start() {
    if (!initGate()) return;
    boot();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
